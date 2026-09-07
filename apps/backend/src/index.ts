import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('MediSade API Running');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
