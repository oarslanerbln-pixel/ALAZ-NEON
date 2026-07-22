import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { medicationsRouter } from './routes/medications.js';
import { documentsRouter } from './routes/documents.js';
import { pushRouter } from './routes/push.js';
import { startReminderScheduler } from './reminderScheduler.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MediSade API is running' });
});

app.use('/auth', authRouter);
app.use('/medications', medicationsRouter);
app.use('/documents', documentsRouter);
app.use('/push', pushRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startReminderScheduler();
});
