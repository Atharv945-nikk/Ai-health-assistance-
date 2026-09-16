import { LLMProvider, EmbeddingProvider, VisionProvider } from './base.js';
import { HeuristicLLMProvider, HeuristicEmbeddingProvider, HeuristicVisionProvider } from './heuristic.js';
import { GeminiProvider } from './gemini.js';
import { config } from '../../config/env.js';

let activeLLM: LLMProvider;
let activeEmbedding: EmbeddingProvider;
let activeVision: VisionProvider;

if (config.aiProvider === 'gemini' && config.geminiApiKey) {
  const gemini = new GeminiProvider();
  activeLLM = gemini;
  activeEmbedding = gemini;
  activeVision = gemini;
} else {
  activeLLM = new HeuristicLLMProvider();
  activeEmbedding = new HeuristicEmbeddingProvider();
  activeVision = new HeuristicVisionProvider();
}

export function getLLMProvider(): LLMProvider {
  return activeLLM;
}

export function getEmbeddingProvider(): EmbeddingProvider {
  return activeEmbedding;
}

export function getVisionProvider(): VisionProvider {
  return activeVision;
}
