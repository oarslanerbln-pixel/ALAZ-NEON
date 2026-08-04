import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/prisma.js');

import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import authRouter from './auth.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);

describe('POST /auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('geçersiz e-posta için 400 döner', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
  });

  it('kısa şifre için 400 döner', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'user@example.com', password: 'short' });

    expect(res.status).toBe(400);
  });

  it('e-posta zaten kayıtlıysa 409 döner', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1', email: 'user@example.com' } as never);

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'user@example.com', password: 'password123' });

    expect(res.status).toBe(409);
  });

  it('geçerli girişte kullanıcı oluşturur ve httpOnly cookie olarak token döner', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({ id: '1', email: 'user@example.com' } as never);

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'User@Example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeUndefined(); // token JS'e görünür body'de olmamalı
    expect(res.body.user.email).toBe('user@example.com');
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies.some((c) => c.startsWith('token=') && c.includes('HttpOnly'))).toBe(true);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ email: 'user@example.com' }) }),
    );
  });
});

describe('POST /auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('kullanıcı bulunamazsa 401 döner', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });

    expect(res.status).toBe(401);
  });

  it('şifre yanlışsa 401 döner', async () => {
    const hashed = await bcrypt.hash('correct-password', 10);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1', email: 'user@example.com', password: hashed } as never);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'wrong-password' });

    expect(res.status).toBe(401);
  });

  it('doğru bilgilerle httpOnly cookie olarak token döner', async () => {
    const hashed = await bcrypt.hash('correct-password', 10);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1', email: 'user@example.com', password: hashed } as never);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'correct-password' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeUndefined();
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies.some((c) => c.startsWith('token=') && c.includes('HttpOnly'))).toBe(true);
  });
});

describe('POST /auth/logout', () => {
  it('cookie temizler ve 204 döner', async () => {
    const res = await request(app).post('/auth/logout');

    expect(res.status).toBe(204);
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies.some((c) => c.startsWith('token=;') || c.includes('Expires=Thu, 01 Jan 1970'))).toBe(true);
  });
});

describe('GET /auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cookie yoksa 401 döner', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('geçerli cookie ile kullanıcıyı döner', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1', email: 'user@example.com' } as never);

    const token = jwt.sign({ userId: '1' }, process.env.JWT_SECRET as string);
    const res = await request(app).get('/auth/me').set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('user@example.com');
  });
});
