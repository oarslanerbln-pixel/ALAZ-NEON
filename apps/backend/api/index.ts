// Vercel serverless girişi. Vercel `/api` altındaki her dosyayı otomatik bir
// fonksiyon olarak algılar; ../vercel.json'daki rewrite kuralı tüm istekleri
// buraya yönlendirir, Express kendi içinde route'luyor. `app.listen()`
// ÇAĞRILMAZ — Vercel'in kendi HTTP runtime'ı isteği/yanıtı yönetiyor.
import app from '../src/app.js';

export default app;
