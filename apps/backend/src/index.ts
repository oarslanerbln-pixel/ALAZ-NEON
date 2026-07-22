import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { medicationsRouter } from './routes/medications.js';
import { documentsRouter } from './routes/documents.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MediSade API is running' });
});

app.use('/medications', medicationsRouter);
app.use('/documents', documentsRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
