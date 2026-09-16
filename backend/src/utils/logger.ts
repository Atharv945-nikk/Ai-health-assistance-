export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const currentLevel: LogLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;

function sanitize(msg: string): string {
  // Strip password, token, or SSN-like patterns from log messages to preserve privacy
  return msg
    .replace(/(password|token|secret|apiKey)["']?\s*[:=]\s*["']?[^"'\s,]+/gi, '$1="***REDACTED***"')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****');
}

export const logger = {
  debug: (message: string, context?: Record<string, any>) => {
    if (currentLevel <= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${sanitize(message)}`, context ? sanitize(JSON.stringify(context)) : '');
    }
  },
  info: (message: string, context?: Record<string, any>) => {
    if (currentLevel <= LogLevel.INFO) {
      console.log(`[INFO]  ${new Date().toISOString()} - ${sanitize(message)}`, context ? sanitize(JSON.stringify(context)) : '');
    }
  },
  warn: (message: string, context?: Record<string, any>) => {
    if (currentLevel <= LogLevel.WARN) {
      console.warn(`[WARN]  ${new Date().toISOString()} - ${sanitize(message)}`, context ? sanitize(JSON.stringify(context)) : '');
    }
  },
  error: (message: string, error?: any, context?: Record<string, any>) => {
    if (currentLevel <= LogLevel.ERROR) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${sanitize(message)}`, error?.message || error, context ? sanitize(JSON.stringify(context)) : '');
    }
  }
};
