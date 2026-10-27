# HENGAME (alaz-neon) — Ajan Rehberi

Kafe/gece kulübü için çok ekranlı canlı parti oyunu. TV veya tablet **host**
ekranını, misafirler QR ile telefondan **player** ekranını açar. Backend yok
(Firebase Spark planı): tüm iş mantığı istemcide, senkronizasyon Firestore
`onSnapshot` ile, veri güvenliği `firestore.rules` ile sağlanır.

Yığın: React 19 + TypeScript + Vite 7 + Tailwind 4 + Firebase 12 + Framer Motion.

Oyun kataloğu bilerek dar: oynanabilir modlar HENGAME ARENA (`scattegories`),
QUIZ ve BOMB; YÖRÜNGE SAPANI (`slingshot`) kodda ama kilitli (`isComingSoon`).
Kaldırılan modlar ve gerekçesi: `docs/game-design-review.md` §1.

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
değiştirmez; tek istisna bomba paslama (`firestore.rules` → `isBombPass`).

Firestore koleksiyonları: `rooms` (durum makinesi), `players` (skorlar),
`answers` (cevaplar), `presence/{uid}` (oyuncu nabzı; yalnızca TV dinler —
nabzı `players`'a yazmak her telefonun listesine okuma düşürür), ayrıca
mekan/ödül/rapor koleksiyonları.

## Dosya haritası

| Yol | İçerik |
|---|---|
| `src/App.tsx` | Rotalar; Landing hariç hepsi `lazy` |
| `src/pages/host/HostDisplay.tsx` | TV durum makinesi yönlendiricisi |
| `src/pages/player/PlayerGame.tsx` | Telefon durum makinesi yönlendiricisi |
| `src/pages/{host,player}/<oyun>/` | Oyun başına ekran çiftleri (quiz, bomb, slingshot); Arena klasik akışta (`HostDisplay`/`PlayerGame` + `views/`) |
| `src/pages/{host,player}/views/` | Oyun bağımsız ekranlar (lobby, playing, review, podium) |
| `src/hooks/` | `useHostRoom`, `useRoom`, `usePlayer`, `useAuth`, `useLocale`, `useSound` … |
| `src/lib/` | Saf mantık: `scoring`, `fuzzyMatch`, `wordValidation`, `league`, `retention`, `rewards`, `roomCodes`, `liveness`, `gameRouting` |
| `src/types/database.ts` | `RoomStatus`, `GameType`, tüm Firestore modelleri |
| `firestore.rules` + `test/firestore.rules.test.ts` | Güvenlik kuralları ve testleri |

## Büyük dosyalar — komple okuma

Bunları baştan sona okuma, hedefli `grep` ile gir:

- `src/lib/quiz/questions.{tr,de,en}.ts` (560–820 satır) — quiz havuzu
- `src/lib/i18n.ts` (~1600 satır) — tr/de/en çeviri sözlüğü
- `src/pages/host/HostDisplay.tsx` (~710), `src/pages/host/quiz/HostQuizDisplay.tsx` (~950 satır)

## Konvansiyonlar

- Kullanıcıya görünen her metin `useLocale().t("anahtar")` üzerinden; tr/de/en
  üçü birden doldurulur. `i18nKeys.test.ts` eksik anahtarı yakalar.
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
- `firestore.rules` canlıya elle deploy edilmez: `main`'e girince
  `.github/workflows/rules.yml` test edip deploy eder, her sabah canlıyla
  karşılaştırır (kurulum: `docs/rules-deploy.md`).
- Commit mesajları Türkçe ve `tip(kapsam): özet` biçiminde (`feat(quiz): …`).

Ayrıntılı kodlama standartları: `docs/coding-standards.md`.
Görsel dil (tokenlar, tek vurgu rengi, TV'de min. 24 px, yasaklar): `docs/motion-system.md` §6.
Oyun kataloğu, gecelik skor ekonomisi ve yol haritası: `docs/game-design-review.md`.
Ödülü yalnızca personel oturumu yazar (`lib/rewards` → `canGrantRewards`); profil (`users`) yalnızca sahibine, cevaplar (`answers`) sahibine ve host'a okunur.
Oyun skorunu `lib/scoreWrites` ile yaz; gecelik lig (F1 sıra puanı) oyun bitişinde
`lib/nightAwards.finishNightRound` ile, yeni oyun başlarken `NIGHT_ROUND_OPEN`.
Mimari ve hata ayıklama derinliği için `.claude/skills/` altındaki iki yetenek
paketi gerektiğinde otomatik yüklenir.
