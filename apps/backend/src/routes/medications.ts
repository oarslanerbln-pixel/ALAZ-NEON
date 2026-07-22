import { Router } from 'express';
import { prisma } from '../prisma.js';
import { getDemoUserId } from '../demoUser.js';

export const medicationsRouter = Router();

medicationsRouter.get('/', async (req, res) => {
  const userId = await getDemoUserId();
  const medications = await prisma.medication.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  res.json(medications);
});

medicationsRouter.post('/', async (req, res) => {
  const { name, dosage, timeOfDay } = req.body;
  if (!name || !dosage || !timeOfDay) {
    return res.status(400).json({ error: 'name, dosage ve timeOfDay zorunludur' });
  }

  const userId = await getDemoUserId();
  const medication = await prisma.medication.create({
    data: { userId, name, dosage, timeOfDay },
  });
  res.status(201).json(medication);
});

medicationsRouter.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { taken, name, dosage, timeOfDay } = req.body;

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
  await prisma.medication.delete({ where: { id } });
  res.status(204).send();
});
