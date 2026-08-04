// Yerel geliştirme girişi — `pnpm dev`/`pnpm build && node dist/index.js` bunu
// çalıştırır. Vercel'de bunun yerine `api/index.ts` kullanılır (orada
// `app.listen()` çağrılmaz — Vercel'in kendi runtime'ı isteği yönlendirir).
import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
