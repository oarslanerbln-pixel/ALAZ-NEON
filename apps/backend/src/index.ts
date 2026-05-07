import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('MediSade Backend is running');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
