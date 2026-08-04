import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

router.use(requireAuth);

const createMedicationSchema = z.object({
  name: z.string().trim().min(1, 'İlaç adı, dozu ve zamanı gerekli.').max(200),
  dosage: z.string().trim().min(1, 'İlaç adı, dozu ve zamanı gerekli.').max(100),
  timeOfDay: z.string().trim().min(1, 'İlaç adı, dozu ve zamanı gerekli.').max(50),
});

const updateMedicationSchema = z.object({
  taken: z.boolean().optional(),
});

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const medications = await prisma.medication.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'asc' },
  });
  res.json(medications);
}));

router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const parsed = createMedicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek.' });
    return;
  }
  const { name, dosage, timeOfDay } = parsed.data;

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

  const parsed = updateMedicationSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: 'Geçersiz istek.' });
    return;
  }
  const taken = parsed.data.taken ?? !existing.taken;
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
