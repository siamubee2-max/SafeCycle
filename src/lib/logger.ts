const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const currentLevel: LogLevel = process.env.NODE_ENV === 'production' ? 'error' : 'debug';

function formatMessage(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  if (data !== undefined) {
    return `${prefix} ${message} ${JSON.stringify(data)}`;
  }
  return `${prefix} ${message}`;
}

export const logger = {
  error(message: string, data?: unknown): void {
    if (LOG_LEVELS.error <= LOG_LEVELS[currentLevel]) {
      console.error(formatMessage('error', message, data));
    }
  },
  warn(message: string, data?: unknown): void {
    if (LOG_LEVELS.warn <= LOG_LEVELS[currentLevel]) {
      console.warn(formatMessage('warn', message, data));
    }
  },
  info(message: string, data?: unknown): void {
    if (LOG_LEVELS.info <= LOG_LEVELS[currentLevel]) {
      console.info(formatMessage('info', message, data));
    }
  },
  debug(message: string, data?: unknown): void {
    if (LOG_LEVELS.debug <= LOG_LEVELS[currentLevel]) {
      console.debug(formatMessage('debug', message, data));
    }
  },
};