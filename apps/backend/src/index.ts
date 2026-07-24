import './env.js';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import medicationsRouter from './routes/medications.js';
import documentsRouter from './routes/documents.js';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET ortam değişkeni tanımlı değil. Bkz. .env.example');
}

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY ortam değişkeni tanımlı değil. Bkz. .env.example');
}

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MediSade API is running' });
});

app.use('/auth', authRouter);
app.use('/medications', medicationsRouter);
app.use('/documents', documentsRouter);

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  if (res.headersSent) {
    next(err);
    return;
  }
  res.status(500).json({ error: 'Sunucuda beklenmeyen bir hata oluştu.' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
