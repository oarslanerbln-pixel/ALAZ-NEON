import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../lib/prisma.js');
vi.mock('../lib/anthropic.js', () => ({
  summarizeReport: vi.fn(),
}));

import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { summarizeReport } from '../lib/anthropic.js';
import documentsRouter from './documents.js';

const app = express();
app.use(express.json());
app.use('/documents', documentsRouter);

function tokenFor(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string);
}

describe('GET /documents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('token yoksa 401 döner', async () => {
    const res = await request(app).get('/documents');
    expect(res.status).toBe(401);
  });

  it('geçerli tokenla yalnızca kullanıcının raporlarını döner', async () => {
    vi.mocked(prisma.document.findMany).mockResolvedValue([{ id: 'd1', userId: 'u1' }] as never);

    const res = await request(app)
      .get('/documents')
      .set('Authorization', `Bearer ${tokenFor('u1')}`);

    expect(res.status).toBe(200);
    expect(prisma.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1' } }),
    );
  });
});

describe('POST /documents', () => {
  const originalApiKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'test-key';
  });

  afterEach(() => {
    process.env.ANTHROPIC_API_KEY = originalApiKey;
  });

  it('boş metinde 400 döner', async () => {
    const res = await request(app)
      .post('/documents')
      .set('Authorization', `Bearer ${tokenFor('u1')}`)
      .send({ originalText: '' });

    expect(res.status).toBe(400);
    expect(summarizeReport).not.toHaveBeenCalled();
  });

  it('ANTHROPIC_API_KEY tanımlı değilse 503 döner', async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const res = await request(app)
      .post('/documents')
      .set('Authorization', `Bearer ${tokenFor('u1')}`)
      .send({ originalText: 'Test rapor metni.' });

    expect(res.status).toBe(503);
    expect(summarizeReport).not.toHaveBeenCalled();
  });

  it('özetleme başarısız olursa 502 döner, kayıt oluşturulmaz', async () => {
    vi.mocked(summarizeReport).mockRejectedValue(new Error('API error'));

    const res = await request(app)
      .post('/documents')
      .set('Authorization', `Bearer ${tokenFor('u1')}`)
      .send({ originalText: 'Test rapor metni.' });

    expect(res.status).toBe(502);
    expect(prisma.document.create).not.toHaveBeenCalled();
  });

  it('geçerli veriyle rapor oluşturur ve özetler', async () => {
    vi.mocked(summarizeReport).mockResolvedValue('Sadeleştirilmiş özet.');
    vi.mocked(prisma.document.create).mockResolvedValue({ id: 'd1' } as never);

    const res = await request(app)
      .post('/documents')
      .set('Authorization', `Bearer ${tokenFor('u1')}`)
      .send({ originalText: 'Test rapor metni.' });

    expect(res.status).toBe(201);
    expect(prisma.document.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'u1', summary: 'Sadeleştirilmiş özet.', language: 'tr' }),
      }),
    );
  });
});

describe('DELETE /documents/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('başka kullanıcıya ait rapor için 404 döner (IDOR koruması)', async () => {
    vi.mocked(prisma.document.findFirst).mockResolvedValue(null);

    const res = await request(app)
      .delete('/documents/d1')
      .set('Authorization', `Bearer ${tokenFor('u1')}`);

    expect(res.status).toBe(404);
    expect(prisma.document.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'd1', userId: 'u1' } }),
    );
  });
});
