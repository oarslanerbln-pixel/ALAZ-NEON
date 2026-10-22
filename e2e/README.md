# Uçtan uca kafe testleri (Playwright + Firebase Emulator)

Gerçek bir oyun gecesini taklit eder: bir TV (1920×1080) ve iPhone/Android
emülasyonlu telefonlar. Üretim verisine ve ücretli servislere dokunmaz.

```bash
npm run test:e2e            # kafe senaryoları (emülatörü kendisi açar/kapatır)
npm run test:e2e:measure    # ölçüm turu → e2e-results/metrics.json
E2E_PHONES=30 npm run test:e2e   # tam salon (varsayılan 10)
```

İlk kurulum: `npx playwright install chromium` ve Java 21 (Firestore emülatörü).
C: diski doluysa tarayıcıları ve emülatör jar'ını başka diske alın:
`PLAYWRIGHT_BROWSERS_PATH=D:\pw-browsers`, `FIREBASE_EMULATORS_PATH=D:\firebase-emulators`.

## Nasıl çalışır

| Parça | Ne yapar |
|---|---|
| `firebase emulators:exec --only auth,firestore --project demo-hurrem-e2e` | Auth (9099) ve Firestore (8080) emülatörü; `demo-` projesi gerçek bir projeye hiç bağlanmaz |
| `e2e/support/firestore-meter.mjs` (8081) | Emülatörün önünde sayaçlı vekil: faturalanan okuma/yazmaları sayar |
| `npm run build:e2e` + `vite preview` (4173) | Üretim paketi, `VITE_FIREBASE_EMULATOR_HOST` ile emülatöre bağlı (`src/lib/firebase.ts`, yalnız `demo-` projede açılır) |
| `e2e/support/devices.ts` | Telefon/TV bağlamları; localhost dışına giden her isteği engeller (üretim Firebase, TTS, CDN) |
| `e2e/support/qr.ts` | TV'deki QR'ı **ekran görüntüsünden** jsQR ile çözer |
| `e2e/support/emulator.ts` | Kurulum/doğrulama için emülatör REST (kuralları atlayan `Bearer owner`) |

## Senaryolar

- `cafe-night.spec.ts` — QR → lobi → quiz → kazanan TV'de → gece lobisi →
  QR'sız aynı profille sonraki oyun.
- `game-modes.spec.ts` — açık her mod bir tur (Arena, Quiz, Bomb), aynı gece
  ikinci quiz, kilitli modların başlatılamaması.
- `resilience.spec.ts` — wifi kopması, sayfa yenileme, geç katılım, aynı
  takma ad, telefon kilidi (CDP ile sayfa dondurma).
- `staff-venue.spec.ts` — personel girişi, `/admin/venue`, ödül kodu.
- `measure.spec.ts` — 20/40 oyuncuda Firestore yükü ve gecikme, TV kare hızı.

## Bilinen sınırlar

- Telefonlar Chromium'da cihaz emülasyonuyla koşar; gerçek Safari (WebKit)
  motoru bu pakette yok.
- Emülatör yerel: ölçülen gecikmeler ağ gidiş-dönüşünü içermez.
- Kare hızı geliştirme makinesinin GPU'suyla ölçülür; TV kutusu için 4× CPU
  kısıtlı ölçüm de alınır ama gerçek cihazın yerini tutmaz.
