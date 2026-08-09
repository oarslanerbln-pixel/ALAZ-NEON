import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/document/process', (req, res) => {
  res.json({
    summary: {
      heading1: "1. Durumunuz Nedir?",
      text1: "Genel sağlık durumunuz stabil, ancak bazı değerleriniz yüksek.",
      heading2: "2. Doktorunuz Ne Demek İstiyor?",
      text2: "Doktorunuz, tansiyonunuzu kontrol altında tutmanız gerektiğini söylüyor.",
      heading3: "3. Dikkat Etmeniz Gerekenler",
      text3: "Tuz tüketimini azaltın ve düzenli yürüyüş yapın."
    }
  });
});

const meds = [{ id: '1', name: 'Tansiyon İlacı', dosage: 'Sabah 1 Tok', taken: false }];

app.get('/api/medications', (req, res) => res.json(meds));

app.post('/api/medications/toggle', (req, res) => {
  const { id } = req.body;
  const med = meds.find(m => m.id === id);
  if (med) med.taken = !med.taken;
  res.json({ success: true, med });
});

app.listen(3001, () => console.log('Backend running on 3001'));
