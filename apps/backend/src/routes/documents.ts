import { Router } from 'express';
import { prisma } from '../prisma.js';
import { getDemoUserId } from '../demoUser.js';
import { summarizeReport } from '../summarize.js';

export const documentsRouter = Router();

documentsRouter.get('/', async (req, res) => {
  const userId = await getDemoUserId();
  const documents = await prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(documents);
});

documentsRouter.post('/', async (req, res) => {
  const { originalText, language } = req.body;
  if (!originalText) {
    return res.status(400).json({ error: 'originalText zorunludur' });
  }

  let summary: string;
  try {
    summary = await summarizeReport(originalText);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Özetleme başarısız oldu';
    return res.status(502).json({ error: message });
  }

  const userId = await getDemoUserId();
  const document = await prisma.document.create({
    data: { userId, originalText, summary, language: language ?? 'tr' },
  });
  res.status(201).json(document);
});
