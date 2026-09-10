import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Basic Route for testing
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'MediSade API Running', status: 'OK' });
});

// Auth Route
app.post('/api/auth', asyncHandler(async (req: Request, res: Response) => {
  // Skeleton for Magic Link Auth
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  // TODO: implement Magic Link logic
  res.json({ message: 'Magic link initiated' });
}));

// OCR/Report Generation Route
app.post('/api/ocr', asyncHandler(async (req: Request, res: Response) => {
  // Skeleton for handling OCR text and summarizing via LLM
  const { extractedText } = req.body;
  if (!extractedText) {
    res.status(400).json({ error: 'Extracted text is required' });
    return;
  }
  // TODO: implement LLM simplification and translation
  res.json({ message: 'Text received for simplification' });
}));

// Medication Routes
app.get('/api/medications', asyncHandler(async (req: Request, res: Response) => {
  // Skeleton for getting user medications
  // TODO: extract userId from auth token
  const medications = await prisma.medication.findMany();
  res.json({ medications });
}));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
