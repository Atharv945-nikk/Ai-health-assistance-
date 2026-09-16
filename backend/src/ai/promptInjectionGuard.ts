import { AppError } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+|previous\s+|prior\s+|above\s+)?instructions/i,
  /disregard\s+(all\s+|previous\s+|prior\s+)?(instructions|rules|guidelines)/i,
  /you\s+are\s+now\s+(in\s+)?(developer|god|dan|jailbreak|unrestricted)\s+mode/i,
  /override\s+(all\s+)?system\s+(prompts|instructions|policies)/i,
  /system\s*:\s*you\s+must/i,
  /output\s+the\s+(entire\s+)?system\s+prompt/i,
  /repeat\s+(all\s+)?words\s+above/i,
  /<\s*script[^>]*>.*?<\s*\/\s*script\s*>/is,
  /javascript\s*:/i,
];

export function scanForPromptInjection(text: string, source: 'chat' | 'report' | 'search' = 'chat'): boolean {
  if (!text || typeof text !== 'string') return false;

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      logger.warn(`Prompt injection pattern detected in [${source}]: ${pattern.toString()}`);
      return true;
    }
  }

  return false;
}

export function assertNoPromptInjection(text: string, contextMessage = 'Malicious prompt injection detected'): void {
  if (scanForPromptInjection(text)) {
    throw new AppError(
      `${contextMessage}. The system refuses instructions that attempt to override safety directives or alter AI behavior.`,
      400,
      'PROMPT_INJECTION_DETECTED'
    );
  }
}

export function sanitizeUntrustedData(content: string, tag = 'untrusted_data'): string {
  // Strip null bytes and non-printable control characters
  const sanitized = content
    .replace(/\0/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return `<${tag}>\n${sanitized}\n</${tag}>`;
}
