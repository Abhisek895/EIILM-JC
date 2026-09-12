import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'eiilm-college-erp-jwt-secret-key-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'eiilm-college-erp-jwt-refresh-secret-key-2026';

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
  roleId?: number;
  tenantId?: number | null;
  permissions?: any;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function signRefreshToken(payload: { id: number; email: string }): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): { id: number; email: string } {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { id: number; email: string };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    const isBcryptMatch = await bcrypt.compare(password, hash);
    if (isBcryptMatch) return true;
  } catch {
    // Fall back to plain text comparison if legacy unhashed
  }
  return password === hash;
}

export function normalizeRoleName(roleName?: string): string {
  return (roleName || 'student')
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, '_');
}
