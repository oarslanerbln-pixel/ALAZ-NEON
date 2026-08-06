import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import medicationsRouter from './routes/medications.js';
dotenv.config();
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET ortam değişkeni tanımlı değil. Bkz. .env.example');
}
const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'MediSade API is running' });
});
app.use('/auth', authRouter);
app.use('/medications', medicationsRouter);
app.use((err, req, res, next) => {
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
