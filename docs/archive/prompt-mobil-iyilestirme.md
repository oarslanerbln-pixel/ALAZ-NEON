<USER_REQUEST>
devam edelim - # 📱 Alaz Neon – Mobil İyileştirme Analizi

## 🔴 Kritik Sorunlar (Hemen Düzeltilmeli)

### 1. PlayerHeader – Çok Büyük ve Sıkışık
**Dosya:** `src/pages/player/components/PlayerHeader.tsx`

- `p-6` padding + `w-16 h-16` harf kutusu + `text-3xl` skor → küçük ekranlarda sıkışıyor
- Skor ve oyuncu adı aynı satırda, 320px ekranda taşıyor
- `mb-6` altındaki zaman çubuğu toplam header yüksekliğini çok artırıyor → oyun alanı küçülüyor

**Çözüm:** Header'ı kompakt moda getir (`p-3 md:p-6`, harf kutusu `w-12 h-12 md:w-16 md:w-16`)

---

### 2. PlayerPlaying – Input'lar Klavye Açılınca Kaybolur
**Dosya:** `src/pages/player/views/PlayerPlaying.tsx`

- `main` içinde `overflow-y-auto` var ama mobil klavye açıldığında `100dvh` küçülür → alt inputlar görünmez
- `pb-40` var ama bu EmojiToolbar için yetersiz kalabilir, klavye + toolbar üst üste binebilir
- Input font-size `text-lg` → iOS Safari'de 16px altındaki inputlar otomatik zoom yapar (bu zaten iyi), ama `text-lg` = 18px, güvenli

**Çözüm:** `pb-safe` + `env(safe-area-inset-bottom)` ekle, input'lar için `scroll-into-view` tetikle

---

### 3. EmojiToolbar – Safe Area Yok (iPhone Notch/Home Bar Sorunu)
**Dosya:** `src/pages/player/components/EmojiToolbar.tsx`

- `fixed bottom-0` ama `padding-bottom: env(safe-area-inset-bottom)` eksik
- iPhone'da Home Bar toolbar'ın üstüne çıkıyor, butonlara basmak zorlaşıyor
- `p-6` çok fazla dikey boşluk → küçük ekranlarda içerik alanı yiyor

**Çözüm:** `pb-[env(safe-area-inset-bottom)]` veya `pb-safe` + `viewport-fit=cover` meta tag

---

### 4. PlayerJoin – Klavye Açılınca Form Kaybolur
**Dosya:** `src/pages/player/PlayerJoin.tsx`

- `min-h-[100dvh]` + `justify-center` → klavye açılınca `dvh` küçülür, form yukarı sıkışır
- Özellikle Team Name input'u girilirken form tamamen görünmez olabilir
- Room Code input'u `text-2xl tracking-[0.3em]` → taşma riski var

**Çözüm:** Form scroll 
<truncated 1648 bytes>
nce diğer kategori inputları küçülsün (accordion efekti)
- Mobilde aynı anda 5-6 input görünce kafa karıştırıcı

### 11. Dark Mode Kontrast Kontrolü
- `text-[10px]` etiketler ve `text-[9px]` yazılar çok küçük → mobilde okunamaz
- Minimum `text-xs` (12px) kullanılmalı

---

## ✅ Öneri Sıralaması (Öncelik Sırasına Göre)

| # | İyileştirme | Etki | Süre |
|---|---|---|---|
| 1 | `index.html` viewport-fit=cover ekle | Kritik iPhone fix | 2dk |
| 2 | EmojiToolbar safe-area padding | iPhone home bar fix | 5dk |
| 3 | PlayerPlaying scrolling & pb-safe | Klavye çakışması | 10dk |
| 4 | PlayerJoin form scroll edilebilir | Klavye kaybetme | 10dk |
| 5 | PlayerHeader kompakt | Daha fazla yazma alanı | 15dk |
| 6 | JOKER buton touch target | Kullanılabilirlik | 5dk |
| 7 | PlayerStandings rank gösterimi | Deneyim iyileştirme | 20dk |
| 8 | PlayerLobby oyuncu sayısı & kurallar | Bekleme deneyimi | 30dk |

</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-08-10T11:00:32+02:00.

The user's current state is as follows:
Other open documents:
- c:\Users\oarsl\Desktop\desktop01\Yazilim - gelistirilenler\cafe nightlife game\src\hooks\useRoom.ts (LANGUAGE_TYPESCRIPT)
- c:\Users\oarsl\Desktop\desktop01\Yazilim - gelistirilenler\cafe nightlife game\src\pages\LandingPage.tsx (LANGUAGE_TSX)
- c:\Users\oarsl\Desktop\desktop01\Yazilim - gelistirilenler\cafe nightlife game\src\hooks\useEmojiPulse.ts (LANGUAGE_TYPESCRIPT)
- c:\Users\oarsl\Desktop\desktop01\Yazilim - gelistirilenler\cafe nightlife game\src\components\AttractMode.tsx (LANGUAGE_TSX)
- c:\Users\oarsl\Desktop\desktop01\Yazilim - gelistirilenler\cafe nightlife game\src\lib\audio.ts (LANGUAGE_TYPESCRIPT)
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from None to Claude Sonnet 4.6 (Thinking). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>