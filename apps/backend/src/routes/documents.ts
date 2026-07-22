import { Router } from 'express';
import { prisma } from '../prisma.js';
import { getDemoUserId } from '../demoUser.js';

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
  const { originalText, summary, language } = req.body;
  if (!originalText || !summary) {
    return res.status(400).json({ error: 'originalText ve summary zorunludur' });
  }

  const userId = await getDemoUserId();
  const document = await prisma.document.create({
    data: { userId, originalText, summary, language: language ?? 'tr' },
  });
  res.status(201).json(document);
});
