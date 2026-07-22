import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const medicationsRouter = Router();
medicationsRouter.use(requireAuth);

medicationsRouter.get('/', async (req, res) => {
  const medications = await prisma.medication.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'asc' },
  });
  res.json(medications);
});

medicationsRouter.post('/', async (req, res) => {
  const { name, dosage, timeOfDay } = req.body;
  if (!name || !dosage || !timeOfDay) {
    return res.status(400).json({ error: 'name, dosage ve timeOfDay zorunludur' });
  }

  const medication = await prisma.medication.create({
    data: { userId: req.userId!, name, dosage, timeOfDay },
  });
  res.status(201).json(medication);
});

medicationsRouter.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { taken, name, dosage, timeOfDay } = req.body;

  const owned = await prisma.medication.findFirst({ where: { id, userId: req.userId } });
  if (!owned) {
    return res.status(404).json({ error: 'İlaç bulunamadı' });
  }

  const medication = await prisma.medication.update({
    where: { id },
    data: {
      ...(typeof taken === 'boolean' ? { taken, lastTakenAt: taken ? new Date() : null } : {}),
      ...(name ? { name } : {}),
      ...(dosage ? { dosage } : {}),
      ...(timeOfDay ? { timeOfDay } : {}),
    },
  });
  res.json(medication);
});

medicationsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const owned = await prisma.medication.findFirst({ where: { id, userId: req.userId } });
  if (!owned) {
    return res.status(404).json({ error: 'İlaç bulunamadı' });
  }

  await prisma.medication.delete({ where: { id } });
  res.status(204).send();
});
