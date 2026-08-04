import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { setAuthCookie, clearAuthCookie } from '../lib/authCookie.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Geçerli bir e-posta adresi girin.').max(255),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı.').max(72, 'Şifre en fazla 72 karakter olabilir.'),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(255),
  password: z.string().max(72),
});

function signToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
}

router.post('/register', asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek.' });
    return;
  }
  const { email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Bu e-posta ile zaten bir hesap var.' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  const token = signToken(user.id);
  setAuthCookie(res, token);
  res.status(201).json({ user: { id: user.id, email: user.email } });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'E-posta ve şifre gerekli.' });
    return;
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
    return;
  }

  const token = signToken(user.id);
  setAuthCookie(res, token);
  res.json({ user: { id: user.id, email: user.email } });
}));

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.status(204).send();
});

router.get('/me', requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    res.status(401).json({ error: 'Geçersiz veya süresi dolmuş oturum.' });
    return;
  }
  res.json({ user: { id: user.id, email: user.email } });
}));

export default router;
