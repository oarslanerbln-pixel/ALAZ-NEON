import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET tanımlı değil. apps/backend/.env dosyasına ekleyin.');
  }
  return secret;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: '30d' });
}

export function verifyToken(token: string): { userId: string } {
  const payload = jwt.verify(token, getJwtSecret());
  if (typeof payload === 'string' || typeof payload.sub !== 'string') {
    throw new Error('Geçersiz token');
  }
  return { userId: payload.sub };
}
