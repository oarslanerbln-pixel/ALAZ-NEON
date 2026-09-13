import express, { type Request, type Response } from 'express';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('MediSade API Running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
