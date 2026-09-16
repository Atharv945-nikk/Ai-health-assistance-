import {
  LLMProvider,
  EmbeddingProvider,
  VisionProvider,
  ChatPromptOptions,
  VisionAnalysisResult,
} from './base.js';
import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { HeuristicLLMProvider, HeuristicVisionProvider, HeuristicEmbeddingProvider } from './heuristic.js';

export class GeminiProvider implements LLMProvider, EmbeddingProvider, VisionProvider {
  public name = 'gemini';
  private fallbackLLM = new HeuristicLLMProvider();
  private fallbackVision = new HeuristicVisionProvider();
  private fallbackEmbedding = new HeuristicEmbeddingProvider();

  private get apiKey(): string {
    return config.geminiApiKey;
  }

  async generateChat(options: ChatPromptOptions): Promise<{ content: string; tokensUsed?: number }> {
    if (!this.apiKey) {
      logger.info('Gemini API key not configured; using heuristic fallback.');
      return this.fallbackLLM.generateChat(options);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.chatModel}:generateContent?key=${this.apiKey}`;
      
      const contents = options.messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const body: any = {
        contents,
        generationConfig: {
          temperature: options.temperature ?? 0.2,
          maxOutputTokens: options.maxTokens ?? 1500,
        }
      };

      if (options.systemPrompt) {
        body.systemInstruction = {
          parts: [{ text: options.systemPrompt }]
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        logger.error(`Gemini API error (${res.status}): ${errorText}. Falling back to heuristic.`);
        return this.fallbackLLM.generateChat(options);
      }

      const json = await res.json() as any;
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return {
        content: text,
        tokensUsed: json.usageMetadata?.totalTokenCount || text.split(/\s+/).length
      };
    } catch (err) {
      logger.error('Error invoking Gemini chat API:', err);
      return this.fallbackLLM.generateChat(options);
    }
  }

  async streamChat(options: ChatPromptOptions, onChunk: (chunk: string) => void): Promise<{ content: string }> {
    if (!this.apiKey) {
      return this.fallbackLLM.streamChat(options, onChunk);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.chatModel}:streamGenerateContent?alt=sse&key=${this.apiKey}`;
      
      const contents = options.messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const body: any = {
        contents,
        generationConfig: {
          temperature: options.temperature ?? 0.2,
          maxOutputTokens: options.maxTokens ?? 1500,
        }
      };

      if (options.systemPrompt) {
        body.systemInstruction = {
          parts: [{ text: options.systemPrompt }]
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        return this.fallbackLLM.streamChat(options, onChunk);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        return this.fallbackLLM.streamChat(options, onChunk);
      }

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const textChunk = decoder.decode(value);
        const lines = textChunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              const piece = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (piece) {
                fullContent += piece;
                onChunk(piece);
              }
            } catch {
              // Non-JSON SSE ping line
            }
          }
        }
      }

      return { content: fullContent };
    } catch (err) {
      logger.error('Error in Gemini streaming:', err);
      return this.fallbackLLM.streamChat(options, onChunk);
    }
  }

  async embedText(text: string): Promise<number[]> {
    if (!this.apiKey) {
      return this.fallbackEmbedding.embedText(text);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.embeddingModel}:embedContent?key=${this.apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text }] }
        }),
      });

      if (!res.ok) {
        return this.fallbackEmbedding.embedText(text);
      }

      const json = await res.json() as any;
      return json.embedding?.values || this.fallbackEmbedding.embedText(text);
    } catch (err) {
      logger.error('Gemini embedding failed, falling back:', err);
      return this.fallbackEmbedding.embedText(text);
    }
  }

  async analyzeMedicalImage(imageBuffer: Buffer, mimeType: string, userNotes?: string): Promise<VisionAnalysisResult> {
    if (!this.apiKey) {
      return this.fallbackVision.analyzeMedicalImage(imageBuffer, mimeType, userNotes);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.visionModel}:generateContent?key=${this.apiKey}`;
      const base64Data = imageBuffer.toString('base64');

      const prompt = `You are a medical imaging education assistant. Examine the provided medical image.
User notes: "${userNotes || 'None provided'}".
Provide an educational assessment with the following exact JSON schema:
{
  "modality": "xray" | "mri" | "ct" | "dermatology" | "ultrasound" | "other",
  "bodyPart": "string",
  "observations": ["string"],
  "possibleAbnormalities": ["string"],
  "confidenceScore": number (0.0 to 1.0),
  "limitations": ["string"],
  "recommendations": ["string"]
}
Remember: Emphasize that this is educational analysis, not a primary diagnostic interpretation.`;

      const body = {
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            }
          ]
        }]
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        return this.fallbackVision.analyzeMedicalImage(imageBuffer, mimeType, userNotes);
      }

      const json = await res.json() as any;
      const responseText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      logger.error('Gemini vision analysis failed, falling back:', err);
      return this.fallbackVision.analyzeMedicalImage(imageBuffer, mimeType, userNotes);
    }
  }
}
