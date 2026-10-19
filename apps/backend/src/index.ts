import express, { type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const port = process.env.PORT || 4000;
const prisma = new PrismaClient();

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
