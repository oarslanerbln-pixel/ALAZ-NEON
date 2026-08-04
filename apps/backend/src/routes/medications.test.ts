import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/prisma.js');

import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import medicationsRouter from './medications.js';

const app = express();
app.use(express.json());
app.use('/medications', medicationsRouter);

function tokenFor(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string);
}

describe('GET /medications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('token yoksa 401 döner', async () => {
    const res = await request(app).get('/medications');
    expect(res.status).toBe(401);
  });

  it('geçerli tokenla yalnızca kullanıcının ilaçlarını döner', async () => {
    vi.mocked(prisma.medication.findMany).mockResolvedValue([{ id: 'm1', userId: 'u1' }] as never);

    const res = await request(app)
      .get('/medications')
      .set('Authorization', `Bearer ${tokenFor('u1')}`);

    expect(res.status).toBe(200);
    expect(prisma.medication.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1' } }),
    );
  });
});

describe('POST /medications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('eksik alanlarda 400 döner', async () => {
    const res = await request(app)
      .post('/medications')
      .set('Authorization', `Bearer ${tokenFor('u1')}`)
      .send({ name: '' });

    expect(res.status).toBe(400);
  });

  it('geçerli veriyle ilaç oluşturur', async () => {
    vi.mocked(prisma.medication.create).mockResolvedValue({ id: 'm1' } as never);

    const res = await request(app)
      .post('/medications')
      .set('Authorization', `Bearer ${tokenFor('u1')}`)
      .send({ name: 'Parol', dosage: '500mg', timeOfDay: 'sabah' });

    expect(res.status).toBe(201);
    expect(prisma.medication.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'u1' }) }),
    );
  });
});

describe('DELETE /medications/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('başka kullanıcıya ait ilaç için 404 döner (IDOR koruması)', async () => {
    vi.mocked(prisma.medication.findFirst).mockResolvedValue(null);

    const res = await request(app)
      .delete('/medications/m1')
      .set('Authorization', `Bearer ${tokenFor('u1')}`);

    expect(res.status).toBe(404);
    expect(prisma.medication.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'm1', userId: 'u1' } }),
    );
  });
});
