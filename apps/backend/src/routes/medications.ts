import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const medications = await prisma.medication.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'asc' },
  });
  res.json(medications);
}));

router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const { name, dosage, timeOfDay } = req.body ?? {};

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof dosage !== 'string' || !dosage.trim() ||
    typeof timeOfDay !== 'string' || !timeOfDay.trim()
  ) {
    res.status(400).json({ error: 'İlaç adı, dozu ve zamanı gerekli.' });
    return;
  }

  const medication = await prisma.medication.create({
    data: { name, dosage, timeOfDay, userId: req.userId as string },
  });
  res.status(201).json(medication);
}));

router.patch('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const existing = await prisma.medication.findFirst({
    where: { id, userId: req.userId },
  });

  if (!existing) {
    res.status(404).json({ error: 'İlaç bulunamadı.' });
    return;
  }

  const taken = typeof req.body?.taken === 'boolean' ? req.body.taken : !existing.taken;
  const medication = await prisma.medication.update({
    where: { id: existing.id },
    data: { taken, lastTakenAt: taken ? new Date() : existing.lastTakenAt },
  });
  res.json(medication);
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const existing = await prisma.medication.findFirst({
    where: { id, userId: req.userId },
  });

  if (!existing) {
    res.status(404).json({ error: 'İlaç bulunamadı.' });
    return;
  }

  await prisma.medication.delete({ where: { id: existing.id } });
  res.status(204).send();
}));

export default router;
