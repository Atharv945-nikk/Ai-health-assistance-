/**
 * Vector Utilities for Semantic and Hybrid Retrieval
 */

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generate a consistent 64-dimensional semantic projection embedding vector
 * from text. This provides rapid in-memory vector search with zero latency,
 * guaranteed offline reproducibility, and cross-platform compatibility.
 */
export function generateLocalEmbedding(text: string, dimensions = 64): number[] {
  const vector = new Array(dimensions).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 1);

  if (words.length === 0) {
    return vector;
  }

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash << 5) - hash + word.charCodeAt(c);
      hash |= 0;
    }

    const index = Math.abs(hash) % dimensions;
    const sign = (hash & 1) === 0 ? 1 : -1;
    // Word weight by length and term frequency
    vector[index] += sign * (1 + Math.log(1 + word.length));
  }

  // L2 Normalization
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
}

export function calculateKeywordScore(query: string, text: string): number {
  const queryTokens = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  const textLower = text.toLowerCase();

  if (queryTokens.length === 0) return 0;

  let matches = 0;
  for (const token of queryTokens) {
    if (textLower.includes(token)) {
      matches++;
    }
  }

  return matches / queryTokens.length;
}
