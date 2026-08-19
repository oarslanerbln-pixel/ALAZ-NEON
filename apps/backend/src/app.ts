import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmetModule from 'helmet';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import medicationsRouter from './routes/medications.js';
import documentsRouter from './routes/documents.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET ortam değişkeni tanımlı değil. Bkz. .env.example');
}

const app = express();

// Vercel's edge network sits in front of every request as a reverse proxy and
// sets X-Forwarded-For/Forwarded headers; Express's default `trust proxy: false`
// makes express-rate-limit reject those headers as spoofable (logged as
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR/ERR_ERL_FORWARDED_HEADER in production).
// `1` trusts exactly one hop — Vercel's own proxy — which is correct here since
// this app is never deployed behind any other proxy.
app.set('trust proxy', 1);

const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim());

// helmetModule's shape differs between local tsc (plain callable) and Vercel's
// build sandbox (wrapped in a `.default`, a CJS/ESM interop gap in helmet's own
// package.json `exports` map under Node16 resolution — verified not reproducible
// outside Vercel's build container). Runtime fallback handles both.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const helmet = (helmetModule as any).default || helmetModule;
app.use(helmet());
// credentials: true is required so the browser sends/accepts the httpOnly auth
// cookie cross-origin (frontend and backend run on different ports/origins in
// dev); CORS forbids origin: '*' together with credentials, so this only works
// because `allowedOrigins` is always an explicit allowlist, never a wildcard.
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.' },
});

// Separate, tighter limiter for /documents — each POST triggers a paid Claude
// API call, so this also functions as basic cost-abuse protection.
const documentsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.' },
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MediSade API is running' });
});

app.use('/auth', authLimiter, authRouter);
app.use('/medications', medicationsRouter);
app.use('/documents', documentsLimiter, documentsRouter);

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  if (res.headersSent) {
    next(err);
    return;
  }
  res.status(500).json({ error: 'Sunucuda beklenmeyen bir hata oluştu.' });
});

export default app;
