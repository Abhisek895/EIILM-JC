import fs from 'fs';
import path from 'path';

const logDir = path.join(__dirname, '../../logs');

// Create async write streams to avoid blocking the Node.js event loop
let appLogStream: fs.WriteStream | null = null;
let errorLogStream: fs.WriteStream | null = null;

try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  appLogStream = fs.createWriteStream(path.join(logDir, 'app.log'), { flags: 'a' });
  errorLogStream = fs.createWriteStream(path.join(logDir, 'error.log'), { flags: 'a' });
} catch (err) {
  // If filesystem logging is not permitted (e.g. read-only container), fallback to stdout
  console.warn('Filesystem logging unavailable, falling back to stdout/stderr only:', err);
}

// Helper to sanitize sensitive fields before logging
const sanitizeData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeData);

  const SENSITIVE_KEYS = new Set([
    'password',
    'token',
    'refreshtoken',
    'authorization',
    'secret',
    'otpcode',
    'newpassword',
    'cookie',
  ]);

  const sanitized: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) {
      sanitized[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      sanitized[k] = sanitizeData(v);
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
};

const formatLog = (level: string, message: string, data?: any): string => {
  const timestamp = new Date().toISOString();
  const safeData = data ? ` ${JSON.stringify(sanitizeData(data))}` : '';
  return `[${timestamp}] ${level}: ${message}${safeData}\n`;
};

export const logger = {
  info: (message: string, data?: any) => {
    const log = formatLog('INFO', message, data);
    process.stdout.write(log);
    if (appLogStream && !appLogStream.destroyed) {
      appLogStream.write(log);
    }
  },

  error: (message: string, data?: any) => {
    const log = formatLog('ERROR', message, data);
    process.stderr.write(log);
    if (errorLogStream && !errorLogStream.destroyed) {
      errorLogStream.write(log);
    }
    if (appLogStream && !appLogStream.destroyed) {
      appLogStream.write(log);
    }
  },

  warn: (message: string, data?: any) => {
    const log = formatLog('WARN', message, data);
    process.stdout.write(log);
    if (appLogStream && !appLogStream.destroyed) {
      appLogStream.write(log);
    }
  },

  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const log = formatLog('DEBUG', message, data);
      process.stdout.write(log);
    }
  },
};
