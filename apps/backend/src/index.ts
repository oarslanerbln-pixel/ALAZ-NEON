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

// CORS_ORIGIN unset (local dev) falls back to allowing any origin.
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors(corsOrigin ? { origin: corsOrigin } : {}));
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
