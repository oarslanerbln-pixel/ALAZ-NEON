import { Router } from 'express';
import { prisma } from '../prisma.js';
import { hashPassword, verifyPassword, signToken } from '../auth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { CONSENT_VERSION } from '../consent.js';

export const authRouter = Router();

function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

authRouter.post('/register', async (req, res) => {
  const { email, password, consentAccepted } = req.body;

  if (!isValidEmail(email) || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Geçerli bir e-posta ve en az 8 karakterli şifre gerekli' });
  }
  if (consentAccepted !== true) {
    return res.status(400).json({ error: 'Devam etmek için KVKK Aydınlatma Metni\'ni onaylamanız gerekiyor' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'Bu e-posta ile zaten bir hesap var' });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, consentAcceptedAt: new Date(), consentVersion: CONSENT_VERSION },
  });

  res.status(201).json({ token: signToken(user.id), user: { id: user.id, email: user.email } });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!isValidEmail(email) || typeof password !== 'string') {
    return res.status(400).json({ error: 'E-posta ve şifre gerekli' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
  }

  res.json({ token: signToken(user.id), user: { id: user.id, email: user.email } });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  }
  res.json({ id: user.id, email: user.email, consentAcceptedAt: user.consentAcceptedAt });
});

authRouter.delete('/me', requireAuth, async (req, res) => {
  await prisma.user.delete({ where: { id: req.userId } });
  res.status(204).send();
});
