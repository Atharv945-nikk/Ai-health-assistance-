export interface ChatMessageParam {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatPromptOptions {
  messages: ChatMessageParam[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProvider {
  name: string;
  generateChat(options: ChatPromptOptions): Promise<{ content: string; tokensUsed?: number }>;
  streamChat(options: ChatPromptOptions, onChunk: (chunk: string) => void): Promise<{ content: string }>;
}

export interface EmbeddingProvider {
  name: string;
  embedText(text: string): Promise<number[]>;
}

export interface VisionAnalysisResult {
  modality: 'xray' | 'mri' | 'ct' | 'dermatology' | 'ultrasound' | 'other';
  bodyPart: string;
  observations: string[];
  possibleAbnormalities: string[];
  confidenceScore: number;
  limitations: string[];
  recommendations: string[];
}

export interface VisionProvider {
  name: string;
  analyzeMedicalImage(imageBuffer: Buffer, mimeType: string, userNotes?: string): Promise<VisionAnalysisResult>;
}
