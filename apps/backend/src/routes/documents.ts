import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { summarizeReport, extractMedicationCandidates } from '../summarize.js';

export const documentsRouter = Router();
documentsRouter.use(requireAuth);

documentsRouter.get('/', async (req, res) => {
  const documents = await prisma.document.findMany({
    where: { userId: req.userId },
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

  // Suggestions are best-effort: a failure here shouldn't block the summary the user actually asked for.
  const suggestedMedications = await extractMedicationCandidates(originalText).catch(() => []);

  const document = await prisma.document.create({
    data: { userId: req.userId!, originalText, summary, language: language ?? 'tr' },
  });
  res.status(201).json({ ...document, suggestedMedications });
});
