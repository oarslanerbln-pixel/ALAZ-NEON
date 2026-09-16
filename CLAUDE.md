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
npm run build       # tsc --noEmit + vite build
npm run test:rules  # Firestore kural testleri (Java 21 + emulator gerekir)
```

Değişiklikten sonra en az `npm run typecheck && npm run lint && npm run test:run`
çalıştır. CI bunlara ek olarak `build` ve kural testlerini koşar, ayrıca
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
| `src/pages/host/HostDisplay.tsx` | TV durum makinesi yönlendiricisi |
| `src/pages/player/PlayerGame.tsx` | Telefon durum makinesi yönlendiricisi |
| `src/pages/{host,player}/<oyun>/` | Oyun başına ekran çiftleri (quiz, bomb, sensor, wheel, overload, echo, pulse, spectrum, colors, vault, unity, bar, kablo) |
| `src/pages/{host,player}/views/` | Oyun bağımsız ekranlar (lobby, playing, review, podium) |
| `src/hooks/` | `useHostRoom`, `useRoom`, `usePlayer`, `useAuth`, `useLocale`, `useSound` … |
| `src/lib/` | Saf mantık: `scoring`, `fuzzyMatch`, `wordValidation`, `league`, `retention`, `rewards`, `roomCodes`, `liveness` |
| `src/types/database.ts` | `RoomStatus`, `GameType`, tüm Firestore modelleri |
| `firestore.rules` + `test/firestore.rules.test.ts` | Güvenlik kuralları ve testleri |

## Büyük dosyalar — komple okuma

Bunları baştan sona okuma, hedefli `grep` ile gir:

- `src/lib/quizQuestions.ts` (~2100 satır) — quiz havuzu
- `src/lib/i18n.ts` (~1700 satır) — tr/de/en çeviri sözlüğü
- `src/pages/host/HostDisplay.tsx`, `src/pages/host/quiz/HostQuizDisplay.tsx` (~840'ar satır)

## Konvansiyonlar

- Kullanıcıya görünen her metin `useLocale().t("anahtar")` üzerinden; tr/de/en
  üçü birden doldurulur. `i18nKeys.test.ts` eksik anahtarı yakalar.
- Yeni bir `RoomStatus` eklediğinde hem `HostDisplay` hem `PlayerGame`
  tarafında ele al — karşılıksız status **siyah ekran** demektir.
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
