import { v4 as uuidv4 } from 'uuid';
import { queryAll, execute, runInTransaction } from '../database/connection.js';
import { getEmbeddingProvider } from './providers/index.js';
import { cosineSimilarity, calculateKeywordScore } from '../utils/vectorUtils.js';
import { Citation } from '../types/shared.js';

export interface RetrievedChunk {
  chunkId: string;
  sourceType: 'global' | 'user_report';
  title: string;
  organization: string;
  sourceUrl?: string;
  publicationDate?: string;
  evidenceLevel: 'A' | 'B' | 'C';
  text: string;
  score: number;
}

export class RAGService {
  private embeddingProvider = getEmbeddingProvider();

  /**
   * Hybrid retrieval across global medical documents and, optionally, user-private reports
   */
  async retrieveRelevantContext(
    query: string,
    userId?: string,
    options: { topK?: number; minScore?: number; includeUserReports?: boolean } = {}
  ): Promise<{ chunks: RetrievedChunk[]; citations: Citation[] }> {
    const topK = options.topK || 4;
    const minScore = options.minScore || 0.15;
    const queryVector = await this.embeddingProvider.embedText(query);

    const candidates: RetrievedChunk[] = [];

    // 1. Search Global Authoritative Medical Knowledge Base
    const globalChunks = queryAll<{
      chunk_id: string;
      title: string;
      source_organization: string;
      source_url?: string;
      publication_date?: string;
      evidence_level: 'A' | 'B' | 'C';
      chunk_text: string;
      embedding_json?: string;
      keywords?: string;
    }>(`
      SELECT 
        rc.id as chunk_id,
        rd.title,
        rd.source_organization,
        rd.source_url,
        rd.publication_date,
        rd.evidence_level,
        rc.chunk_text,
        rc.embedding_json,
        rc.keywords
      FROM rag_chunks rc
      JOIN rag_documents rd ON rc.document_id = rd.id
    `);

    for (const row of globalChunks) {
      let vectorScore = 0;
      if (row.embedding_json) {
        try {
          const emb = JSON.parse(row.embedding_json);
          vectorScore = cosineSimilarity(queryVector, emb);
        } catch {
          // ignore corrupted vector
        }
      } else {
        // Compute embedding on the fly if not cached
        const emb = await this.embeddingProvider.embedText(row.chunk_text);
        vectorScore = cosineSimilarity(queryVector, emb);
      }

      const kwScore = calculateKeywordScore(query, `${row.title} ${row.chunk_text} ${row.keywords || ''}`);
      // Hybrid weighted score
      const hybridScore = 0.65 * vectorScore + 0.35 * kwScore;

      if (hybridScore >= minScore) {
        candidates.push({
          chunkId: row.chunk_id,
          sourceType: 'global',
          title: row.title,
          organization: row.source_organization,
          sourceUrl: row.source_url,
          publicationDate: row.publication_date,
          evidenceLevel: row.evidence_level,
          text: row.chunk_text,
          score: hybridScore,
        });
      }
    }

    // 2. Search Private User Medical Reports (Strictly Scoped to authenticated userId)
    if (userId && options.includeUserReports) {
      const userReportChunks = queryAll<{
        chunk_id: string;
        filename: string;
        chunk_text: string;
        embedding_json?: string;
      }>(`
        SELECT 
          rc.id as chunk_id,
          mr.filename,
          rc.chunk_text,
          rc.embedding_json
        FROM report_chunks rc
        JOIN medical_reports mr ON rc.report_id = mr.id
        WHERE rc.user_id = ?
      `, [userId]);

      for (const row of userReportChunks) {
        let vectorScore = 0;
        if (row.embedding_json) {
          try {
            const emb = JSON.parse(row.embedding_json);
            vectorScore = cosineSimilarity(queryVector, emb);
          } catch {
            // ignore
          }
        } else {
          const emb = await this.embeddingProvider.embedText(row.chunk_text);
          vectorScore = cosineSimilarity(queryVector, emb);
        }

        const kwScore = calculateKeywordScore(query, row.chunk_text);
        const hybridScore = 0.7 * vectorScore + 0.3 * kwScore;

        if (hybridScore >= minScore) {
          candidates.push({
            chunkId: row.chunk_id,
            sourceType: 'user_report',
            title: `Patient Medical Report: ${row.filename}`,
            organization: 'Personal Health Records Vault',
            evidenceLevel: 'C',
            text: row.chunk_text,
            score: hybridScore,
          });
        }
      }
    }

    // Sort by descending hybrid score and select topK
    candidates.sort((a, b) => b.score - a.score);
    const selected = candidates.slice(0, topK);

    // Format citations
    const citations: Citation[] = selected.map(c => ({
      id: c.chunkId,
      title: c.title,
      organization: c.organization,
      sourceUrl: c.sourceUrl,
      publicationDate: c.publicationDate,
      evidenceLevel: c.evidenceLevel,
      snippet: c.text.length > 200 ? c.text.slice(0, 197) + '...' : c.text,
    }));

    return { chunks: selected, citations };
  }

  /**
   * Ingest and index text chunks from an uploaded user medical report
   */
  async indexUserReport(reportId: string, userId: string, fullText: string): Promise<number> {
    // Recursive chunking: split by paragraphs and sentences with window ~500 chars
    const chunks = this.chunkText(fullText, 600, 100);
    
    runInTransaction(() => {
      // Clear any prior chunks for this report
      execute('DELETE FROM report_chunks WHERE report_id = ? AND user_id = ?', [reportId, userId]);

      for (let i = 0; i < chunks.length; i++) {
        const chunkId = uuidv4();
        const chunkText = chunks[i];
        execute(
          `INSERT INTO report_chunks (id, report_id, user_id, chunk_index, chunk_text, embedding_json) VALUES (?, ?, ?, ?, ?, ?)`,
          [chunkId, reportId, userId, i, chunkText, null]
        );
      }
    });

    return chunks.length;
  }

  private chunkText(text: string, chunkSize = 600, overlap = 100): string[] {
    const clean = text.trim();
    if (clean.length <= chunkSize) {
      return [clean];
    }

    const chunks: string[] = [];
    let start = 0;
    while (start < clean.length) {
      let end = start + chunkSize;
      if (end < clean.length) {
        // Try to break at a period, newline, or space
        const lastPeriod = clean.lastIndexOf('.', end);
        const lastNewline = clean.lastIndexOf('\n', end);
        const breakPoint = Math.max(lastPeriod, lastNewline);
        if (breakPoint > start + 200) {
          end = breakPoint + 1;
        }
      }
      const chunk = clean.slice(start, end).trim();
      if (chunk.length > 20) {
        chunks.push(chunk);
      }
      start = end - overlap;
      if (start >= clean.length) break;
    }
    return chunks;
  }
}

export const ragService = new RAGService();
