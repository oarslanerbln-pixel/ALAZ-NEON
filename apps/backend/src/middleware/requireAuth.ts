import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../auth.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;

  if (!token) {
    return res.status(401).json({ error: 'Oturum açmanız gerekiyor' });
  }

  try {
    req.userId = verifyToken(token).userId;
    next();
  } catch {
    res.status(401).json({ error: 'Geçersiz veya süresi dolmuş oturum' });
  }
}
