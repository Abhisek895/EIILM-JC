import fs from 'fs';
import path from 'path';

const logDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export const logger = {
  info: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] INFO: ${message} ${data ? JSON.stringify(data) : ''}\n`;
    console.log(log);
    fs.appendFileSync(path.join(logDir, 'app.log'), log);
  },

  error: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] ERROR: ${message} ${data ? JSON.stringify(data) : ''}\n`;
    console.error(log);
    fs.appendFileSync(path.join(logDir, 'error.log'), log);
  },

  warn: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] WARN: ${message} ${data ? JSON.stringify(data) : ''}\n`;
    console.warn(log);
    fs.appendFileSync(path.join(logDir, 'app.log'), log);
  },

  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const log = `[${timestamp}] DEBUG: ${message} ${data ? JSON.stringify(data) : ''}\n`;
      console.log(log);
    }
  },
};
