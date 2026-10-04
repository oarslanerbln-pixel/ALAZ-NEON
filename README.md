# MediSade

Sağlık okuryazarlığı düşük, yaşlı veya yabancı uyruklu bireylerin karmaşık tıbbi raporlarını anlaşılır bir dile çeviren ve ilaç takibini kolaylaştıran bir mobil web uygulaması (PWA).

## Özellikler

- **Şifresiz Giriş:** JWT tabanlı, magic link ile e-posta onaylı giriş. (Eklenecek)
- **Kamera & OCR Modülü:** Kullanıcının tıbbi evrak fotoğrafını çekip/yükleyip metne dönüştürebileceği modül.
- **Akıllı Özet:** Karmaşık tıbbi raporları 70 yaşındaki birinin anlayacağı sadeliğe (3 temel başlıkta) indirger.
- **Çoklu Dil (i18n):** Sağlık turizmi ve mülteciler için sonuçların Türkçe, İngilizce ve Arapça versiyonları. (Eklenecek)
- **İlaç Dashboard'u:** Günlük ilaçların büyük butonlarla "Alındı" olarak işaretlenebildiği temiz arayüz.

## Teknolojiler

- **Frontend:** Next.js (React), TailwindCSS, Framer Motion, Lucide React
- **Backend:** Node.js (Express.js), PostgreSQL, Prisma ORM
- **Yapay Zeka & Görüntü İşleme:** Tesseract.js (İstemci tarafı), LLM API (Özet)

## Erişilebilirlik ve Güvenlik

- WCAG 2.1 AA standartlarına uygun "Yüksek Kontrast Modu" varsayılan arayüz teması.
- Minimum 16px font boyutu, gizli ve karmaşık açılır menü (dropdown) kullanımı yok.
- Uygulamanın her sayfasında kalıcı "Tıbbi Sorumluluk Reddi" ibaresi.
- HIPAA/KVKK standartları: Tıbbi evraklar sunucuda saklanmaz (ephemeral processing) ve veritabanı AES-256 ile şifrelenir.
