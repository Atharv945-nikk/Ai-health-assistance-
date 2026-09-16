import { v4 as uuidv4 } from 'uuid';
import { queryOne, queryAll, execute, runInTransaction } from '../database/connection.js';
import { AppError } from '../middlewares/errorHandler.js';
import { getLLMProvider } from '../ai/providers/index.js';
import { ragService } from '../ai/ragService.js';
import { evaluateEmergencyRules } from '../ai/emergencyRules.js';
import { assertNoPromptInjection } from '../ai/promptInjectionGuard.js';
import { buildSystemPrompt } from '../ai/promptTemplates.js';
import { profileService } from './profileService.js';
import { auditService } from './auditService.js';
import { Conversation, ChatMessage, Citation } from '../types/shared.js';

export class ChatService {
  private llmProvider = getLLMProvider();

  getConversations(userId: string): Conversation[] {
    const rows = queryAll<any>(
      `SELECT id, user_id as userId, title, created_at as createdAt, updated_at as updatedAt
       FROM conversations
       WHERE user_id = ?
       ORDER BY updated_at DESC`,
      [userId]
    );
    return rows;
  }

  createConversation(userId: string, title = 'New Health Consultation'): Conversation {
    const id = uuidv4();
    const now = new Date().toISOString();
    execute(
      `INSERT INTO conversations (id, user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [id, userId, title, now, now]
    );
    return { id, userId, title, createdAt: now, updatedAt: now, messages: [] };
  }

  getConversation(userId: string, conversationId: string): Conversation {
    const conv = queryOne<any>(
      `SELECT id, user_id as userId, title, created_at as createdAt, updated_at as updatedAt
       FROM conversations
       WHERE id = ? AND user_id = ?`,
      [conversationId, userId]
    );

    if (!conv) {
      throw new AppError('Conversation not found or access denied.', 404, 'NOT_FOUND');
    }

    const messageRows = queryAll<any>(
      `SELECT id, conversation_id as conversationId, sender, content, citations_json as citationsJson, created_at as createdAt
       FROM messages
       WHERE conversation_id = ?
       ORDER BY created_at ASC`,
      [conversationId]
    );

    const messages: ChatMessage[] = messageRows.map(m => ({
      id: m.id,
      conversationId: m.conversationId,
      sender: m.sender,
      content: m.content,
      citations: m.citationsJson ? JSON.parse(m.citationsJson) : undefined,
      createdAt: m.createdAt,
    }));

    return { ...conv, messages };
  }

  renameConversation(userId: string, conversationId: string, title: string): void {
    const res = execute(
      `UPDATE conversations SET title = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
      [title.trim(), new Date().toISOString(), conversationId, userId]
    );
    if (res.changes === 0) {
      throw new AppError('Conversation not found or access denied.', 404, 'NOT_FOUND');
    }
  }

  deleteConversation(userId: string, conversationId: string): void {
    const res = execute(
      `DELETE FROM conversations WHERE id = ? AND user_id = ?`,
      [conversationId, userId]
    );
    if (res.changes === 0) {
      throw new AppError('Conversation not found or access denied.', 404, 'NOT_FOUND');
    }
  }

  clearConversation(userId: string, conversationId: string): void {
    const conv = queryOne('SELECT id FROM conversations WHERE id = ? AND user_id = ?', [conversationId, userId]);
    if (!conv) throw new AppError('Conversation not found or access denied.', 404, 'NOT_FOUND');

    execute('DELETE FROM messages WHERE conversation_id = ?', [conversationId]);
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    content: string,
    onChunk?: (chunk: string) => void
  ): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
    const trimmed = content.trim();
    if (!trimmed) throw new AppError('Message content cannot be empty.', 400, 'EMPTY_MESSAGE');

    // 1. Verify Ownership
    const conv = queryOne<{ id: string; title: string }>(
      'SELECT id, title FROM conversations WHERE id = ? AND user_id = ?',
      [conversationId, userId]
    );
    if (!conv) {
      throw new AppError('Conversation not found or access denied.', 404, 'NOT_FOUND');
    }

    // 2. Safety: Scan for prompt injection
    assertNoPromptInjection(trimmed, 'Your query was rejected for security policy violation');

    const now = new Date().toISOString();
    const userMsgId = uuidv4();
    execute(
      `INSERT INTO messages (id, conversation_id, sender, content, created_at) VALUES (?, ?, 'user', ?, ?)`,
      [userMsgId, conversationId, trimmed, now]
    );

    // Auto-title conversation if default
    if (conv.title === 'New Health Consultation') {
      const summaryTitle = trimmed.slice(0, 32) + (trimmed.length > 32 ? '...' : '');
      execute('UPDATE conversations SET title = ? WHERE id = ?', [summaryTitle, conversationId]);
    }

    // 3. Clinical Safety: Deterministic Emergency Evaluation
    const emergencyEval = evaluateEmergencyRules(trimmed);

    let assistantContent = '';
    let citations: Citation[] = [];

    if (emergencyEval.isEmergency) {
      auditService.log({
        userId,
        action: 'EMERGENCY_TRIGGERED',
        resourceType: 'conversation',
        resourceId: conversationId,
        details: { matchedCategory: emergencyEval.matchedCategory, rule: emergencyEval.matchedRule },
      });

      assistantContent = `🚨 **CRITICAL MEDICAL EMERGENCY ALERT**

The symptoms described indicate a potentially life-threatening medical situation: **${emergencyEval.matchedCategory}**.

### Immediate Actions to Take NOW:
${emergencyEval.immediateActions.map(action => `1. **${action}**`).join('\n')}

> **DO NOT DELAY:** Call your local emergency medical service immediately (Dial **911** in US/Canada, **112** in Europe/India, or proceed directly to the nearest hospital Emergency Department).
>
> *AI Healthcare Assistant is an educational system and cannot provide emergency medical dispatch or intervention.*`;

      if (onChunk) onChunk(assistantContent);
    } else {
      // 4. Retrieve context & RAG evidence
      const { profile, healthProfile } = profileService.getFullProfile(userId);
      const ragResults = await ragService.retrieveRelevantContext(trimmed, userId, {
        topK: 3,
        includeUserReports: true,
      });
      citations = ragResults.citations;

      const systemPrompt = buildSystemPrompt({
        userLanguage: profile.preferredLanguage,
        healthProfile: {
          bloodType: healthProfile.bloodType,
          conditions: healthProfile.conditions.map((c: any) => c.conditionName),
          allergies: healthProfile.allergies.map((a: any) => a.allergen),
          medications: healthProfile.medications.map((m: any) => m.medicineName),
        },
        evidenceSnippets: ragResults.chunks.map(c => ({
          title: c.title,
          organization: c.organization,
          text: c.text,
        })),
      });

      // Load recent conversation history (last 8 messages)
      const recentMessages = queryAll<any>(
        `SELECT sender, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 8`,
        [conversationId]
      ).map(m => ({
        role: (m.sender === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: m.content,
      }));

      if (onChunk) {
        const streamResult = await this.llmProvider.streamChat(
          { messages: recentMessages, systemPrompt },
          onChunk
        );
        assistantContent = streamResult.content;
      } else {
        const genResult = await this.llmProvider.generateChat({
          messages: recentMessages,
          systemPrompt,
        });
        assistantContent = genResult.content;
      }

      // 5. Contextual Memory Extraction
      this.extractAndStoreMemoryIfRelevant(userId, trimmed);
    }

    const assistantMsgId = uuidv4();
    const assistantTimestamp = new Date().toISOString();
    execute(
      `INSERT INTO messages (id, conversation_id, sender, content, citations_json, created_at) VALUES (?, ?, 'assistant', ?, ?, ?)`,
      [assistantMsgId, conversationId, assistantContent, citations.length > 0 ? JSON.stringify(citations) : null, assistantTimestamp]
    );

    execute('UPDATE conversations SET updated_at = ? WHERE id = ?', [assistantTimestamp, conversationId]);

    const userMessage: ChatMessage = {
      id: userMsgId,
      conversationId,
      sender: 'user',
      content: trimmed,
      createdAt: now,
    };

    const assistantMessage: ChatMessage = {
      id: assistantMsgId,
      conversationId,
      sender: 'assistant',
      content: assistantContent,
      citations: citations.length > 0 ? citations : undefined,
      createdAt: assistantTimestamp,
    };

    return { userMessage, assistantMessage };
  }

  private extractAndStoreMemoryIfRelevant(userId: string, userText: string): void {
    const lower = userText.toLowerCase();
    // Check for explicit health updates
    if (lower.includes('diagnosed with') || lower.includes('my doctor said i have')) {
      const match = userText.match(/(?:diagnosed with|doctor said i have)\s+([^.,;]+)/i);
      if (match && match[1]) {
        execute(
          `INSERT INTO health_memories (id, user_id, category, memory_text, source_reference, is_active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)`,
          [uuidv4(), userId, 'clinical_note', `User noted diagnosis: ${match[1].trim()}`, 'chat_consultation', new Date().toISOString()]
        );
      }
    }
  }
}

export const chatService = new ChatService();
