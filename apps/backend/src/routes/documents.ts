import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { summarizeReport } from '../lib/anthropic.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const MAX_TEXT_LENGTH = 20000;

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const documents = await prisma.document.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(documents);
}));

router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const { text } = req.body ?? {};

  if (typeof text !== 'string' || !text.trim()) {
    res.status(400).json({ error: 'Taranan rapor metni gerekli.' });
    return;
  }

  if (text.length > MAX_TEXT_LENGTH) {
    res.status(400).json({ error: 'Rapor metni çok uzun.' });
    return;
  }

  const summary = await summarizeReport(text);

  const document = await prisma.document.create({
    data: { originalText: text, summary, userId: req.userId as string },
  });
  res.status(201).json(document);
}));

export default router;
