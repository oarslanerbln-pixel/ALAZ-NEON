import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { summarizeReport } from '../lib/anthropic.js';

const router = Router();

router.use(requireAuth);

const createDocumentSchema = z.object({
  originalText: z.string().trim().min(1, 'Taranan metin boş olamaz.').max(20000, 'Metin çok uzun.'),
  language: z.string().trim().min(2).max(10).optional(),
});

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const documents = await prisma.document.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(documents);
}));

router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const parsed = createDocumentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek.' });
    return;
  }
  const { originalText, language } = parsed.data;

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: 'Özetleme servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.' });
    return;
  }

  let summary: string;
  try {
    summary = await summarizeReport(originalText);
  } catch (err) {
    console.error('Rapor özetleme başarısız:', err);
    res.status(502).json({ error: 'Rapor özetlenirken bir hata oluştu. Lütfen tekrar deneyin.' });
    return;
  }

  const document = await prisma.document.create({
    data: { originalText, summary, language: language ?? 'tr', userId: req.userId as string },
  });
  res.status(201).json(document);
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const existing = await prisma.document.findFirst({
    where: { id, userId: req.userId },
  });

  if (!existing) {
    res.status(404).json({ error: 'Rapor bulunamadı.' });
    return;
  }

  await prisma.document.delete({ where: { id: existing.id } });
  res.status(204).send();
}));

export default router;
