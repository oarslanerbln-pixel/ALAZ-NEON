# HENGAME (alaz-neon) — Ajan Rehberi

Kafe/gece kulübü için çok ekranlı canlı parti oyunu. TV veya tablet **host**
ekranını, misafirler QR ile telefondan **player** ekranını açar. Backend yok
(Firebase Spark planı): tüm iş mantığı istemcide, senkronizasyon Firestore
`onSnapshot` ile, veri güvenliği `firestore.rules` ile sağlanır.

Yığın: React 19 + TypeScript + Vite 7 + Tailwind 4 + Firebase 12 + Framer Motion.

## Komutlar

```bash
npm run dev         # vite --host (telefondan test için --host şart)
npm run typecheck   # tsc -b + test tsconfig
npm run lint        # eslint
npm run test:run    # vitest tek sefer
npm run test:coverage  # vitest + src/lib kapsama eşiği (CI bunu koşar)
npm run check:bundle   # build sonrası paket bütçesi (gzip)
npm run check:audit    # üretim bağımlılıklarında high+ açık
npm run build       # tsc --noEmit + vite build
npm run test:rules  # Firestore kural testleri (Java 21 + emulator gerekir)
npm run test:e2e    # Uçtan uca: TV + telefonlar, Firestore/Auth emulator (Java 21 + Chromium)
```

Değişiklikten sonra en az `npm run typecheck && npm run lint && npm run test:run`
çalıştır. CI bunlara ek olarak kapsama eşiğini, `build`, paket bütçesini,
audit kapısını, kural testlerini ve uçtan uca testleri koşar, ayrıca
`src/`–`test/` ağacına derleme çıktısı (`*.js`, `*.d.ts`) sızmadığını denetler.

## Mimari — tek cümlelik kural

**Host tek yazardır, player aptal terminaldir.** Host `rooms/{id}.status` ve
`active_game` alanlarını güncelleyerek oyunu ilerletir; player yalnızca bu
alanları dinler ve `answers` koleksiyonuna yazar. Player asla oda state'ini
değiştirmez (buzz gibi yarışlı işlemler `runTransaction` ile).

Firestore koleksiyonları: `rooms` (durum makinesi), `players` (skorlar),
`answers` (cevaplar), ayrıca mekan/ödül/rapor koleksiyonları.

## Dosya haritası

| Yol | İçerik |
|---|---|
| `src/App.tsx` | Rotalar; Landing hariç hepsi `lazy` |
| `src/pages/host/HostDisplay.tsx` | TV yönlendiricisi (oda durumu → pano / oyun ekranı) |
| `src/pages/host/classic/` | Klasik harf oyunu: `useClassicGame` (akış) + `HostDisplayGame` (çizim) |
| `src/pages/player/PlayerGame.tsx` | Telefon durum makinesi yönlendiricisi |
| `src/pages/{host,player}/<oyun>/` | Oyun başına ekran çiftleri (quiz, bomb, sensor, wheel, overload, echo, pulse, spectrum, colors, vault, unity, bar, kablo, ayna) |
| `src/pages/{host,player}/views/` | Oyun bağımsız ekranlar (lobby, playing, review, podium) |
| `src/hooks/` | `useHostRoom`, `useRoom`, `usePlayer`, `useAuth`, `useLocale`, `useSound` … |
| `src/lib/` | Saf mantık: `scoring`, `fuzzyMatch`, `wordValidation`, `league`, `retention`, `rewards`, `roomCodes`, `liveness`, `gameRouting` |
| `src/types/database.ts` | `RoomStatus`, `GameType`, tüm Firestore modelleri |
| `firestore.rules` + `test/firestore.rules.test.ts` | Güvenlik kuralları ve testleri |

## Büyük dosyalar — komple okuma

Bunları baştan sona okuma, hedefli `grep` ile gir:

- `src/lib/quizQuestions.ts` (~2100 satır) — quiz havuzu
- `src/lib/i18n/{de,tr,en}.ts` (~940'ar satır) — dil başına çeviri sözlüğü
  (`de` kaynak ve girişte; `tr`/`en` seçilince tembel iner, bkz. `lib/i18n.ts`)

## Konvansiyonlar

- Kullanıcıya görünen her metin `useLocale().t("anahtar")` üzerinden; tr/de/en
  üçü birden doldurulur: anahtar önce `i18n/de.ts`'e, sonra aynı türle
  `tr.ts`/`en.ts`'e. Eksik ya da fazla anahtar derleme hatasıdır
  (`satisfies Dictionary`); `i18nKeys.test.ts` tanımsız `t()` çağrısını yakalar.
- Günlük için `console.*` değil `createLogger("Kapsam")` (`lib/logger.ts`;
  ESLint `no-console`). `log.error` geçici ağ hataları dışında Sentry'ye gider.
  `@sentry/react`'i doğrudan içe aktarma; `lib/monitoring.ts` kullan — SDK
  giriş paketinde değil, boşta iner.
- Yeni bir `RoomStatus` eklediğinde hem `HostDisplay` hem `PlayerGame`
  tarafında ele al — karşılıksız status **siyah ekran** demektir.
- Yeni oyun modu: `GameType` + `gameCatalog.ts` kartı + `host/gameDisplays.ts`
  + `player/gameControllers.ts`. Hangi oyunun oynandığını yalnızca
  `lib/gameRouting.ts` çözer; eksik kayıt derleme hatası verir.
- Oyun mantığını `src/lib/` içinde saf fonksiyon olarak yaz ve birim testle;
  bileşenlerin içine gömme.
- Firebase v9+ modüler SDK; `firebase/compat` yasak. Çok dokümanlı güncellemede
  `writeBatch` / `runTransaction`.
- Framer Motion geçişlerinde `<AnimatePresence mode="wait">` + benzersiz `key`.
- Skor yazan her yol için `firestore.rules` tarafını da güncelle; istemci
  kurcalanabilir kabul edilir.
- Commit mesajları Türkçe ve `tip(kapsam): özet` biçiminde (`feat(quiz): …`).

Ayrıntılı kodlama standartları: `docs/coding-standards.md`.
Mimari ve hata ayıklama derinliği için `.claude/skills/` altındaki iki yetenek
paketi gerektiğinde otomatik yüklenir.
