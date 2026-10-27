# ALAZ NEON — Motion Design System

Tek doğruluk kaynağı: `src/lib/motion.ts`. Bu doküman, "neden böyle" sorusunun
cevabı ve yeni bir oyun modu/ekran yazarken uyulacak kontrol listesidir.

## 1. İlkeler (endüstri referanslarıyla)

| İlke | Kaynak | Uygulama |
|---|---|---|
| Yalnızca `transform` ve `opacity` animasyonla | web.dev "Animations guide", Chrome rendering pipeline | `width/height/top/left/filter/box-shadow/text-shadow/border-width` animasyonu **yasak**. Bunlar her karede layout veya paint tetikler; TV kutularının zayıf GPU'sunda takılma yaratır. |
| Kısa mesafe → kısa süre | Material Design 3 Motion | `DURATION` ölçeği: instant 120ms · fast 200ms · base 350ms · slow 600ms · cinematic 1.2s |
| Fizik tabanlı, kesintiye dayanıklı hareket | Apple HIG | `SPRING` presetleri (snappy / bouncy / gentle / stiff / layout). Damping oranı ζ 0.5–0.9 aralığında; test bunu doğrular. |
| Sarsıntı noktalama işaretidir, durum değil | Oyun "juice" pratiği (Vlambeer, Juice It or Lose It) | Ekran sarsıntısı yalnızca süre bittiği anda, tek seferlik. 10 saniye titreyen ekran kaldırıldı. |
| Dekoratif hareket kapatılabilmeli | WCAG 2.3.3, Apple "Reduce Motion" | `<MotionConfig reducedMotion="user">` (App.tsx) + `prefers-reduced-motion` CSS bloğu (index.css) + canvas motorları `prefersReducedMotion()` ile boş döner. |
| Canvas: DPR + delta-time | HTML5 canvas best practice | `canvas.width = css × devicePixelRatio (≤2)`; fizik `normalizeFrameDelta()` ile kare süresine ölçeklenir; `shadowBlur` kullanılmaz. |
| Rakamlar titremesin | Tipografi | Sayan/değişen her sayıya `tabular-nums`. |

## 2. Tokenlar

```ts
import { EASE, DURATION, SPRING, STAGGER, TWEEN, fadeUp, pop, popBouncy, screen, listContainer, listItem } from "@/lib/motion";

// Ekrana giren kart
<motion.div variants={fadeUp} initial="hidden" animate="visible" exit="exit" />

// Kutlama rozeti ("+20", "▲ 2")
<motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING.bouncy} />

// Liste reorder
<LayoutGroup>{rows.map(r => <motion.div key={r.id} layout transition={SPRING.layout} />)}</LayoutGroup>

// Dokunma tepkisi
<motion.button whileTap={{ scale: 0.94 }} transition={SPRING.stiff} />
```

> framer kuralı: bir `variants` içindeki `transition`, elemanın `transition`
> prop'unu **ezer**. Gecikme vermek istiyorsan ya variant'ı inline yaz ya da
> `initial/animate` nesneleriyle çalış.

## 3. Paylaşılan bileşenler

| Bileşen | Ne yapar | Nerede |
|---|---|---|
| `AnimatedNumber` | Eski değerden yeniye sayar, React'i her karede uyandırmaz | Skor, sıra, sayaçlar |
| `TimerRing` | SVG `pathLength` ile kesintisiz boşalan halka; ton: calm/warning/critical/over | HostPlaying; quiz/bomba için hazır |
| `ConfettiCanvas` / `ConfettiEngine` | DPR + dt fizik, 700 parçacık tavanı, sekme gizlenince durur | Standings, Podium, PlayerStandings |
| `HoldButton` | Dolum `scaleX` motion value ile — kare başına render yok | PlayerPlaying |
| `ExperienceBar` | `scaleX` dolum; `mode="linear"` geri sayım için | PlayerHeader |

## 4. Koreografi zamanları

**HostStandings** — satırlar önceki sırayla belirir → 0.9s puan sayacı → 1.6s
`layout` ile yeni sıraya kayış (+ ▲/▼ rozeti) → 2.3s konfeti.

**HostPodium** — 3. (0.4s) → 2. (1.2s) → 1. (2.2s, fanfar) → 2.45s konfeti;
3s ödül kartları.

**HostPlaying** — vurgu renginde halka · ≤5s kırmızı halka ve tik sesi ·
0s tek sarsıntı + "SÜRE BİTTİ".

## 5. Yeni ekran kontrol listesi

- [ ] Ham `duration`/`ease` yazmadım; `DURATION`/`EASE`/`SPRING` kullandım.
- [ ] `filter: blur()`, `box-shadow`, `text-shadow`, `width/height/top` animasyonu yok.
- [ ] Sonsuz döngüler yalnızca `transform`/`opacity` ve `aria-hidden`.
- [ ] Değişen sayılar `tabular-nums` (tercihen `AnimatedNumber`).
- [ ] Canvas varsa: DPR, `normalizeFrameDelta`, `visibilitychange`, `prefersReducedMotion`.
- [ ] Kısa süreli animasyonlu elemanlarda `will-change-transform`; kalıcı olanlarda **değil** (bellek).
- [ ] Mobil input'ta `whileFocus` ölçeği yok (iOS bulanık metin).
- [ ] Saniyede 3'ten fazla parlama/yanıp sönme yok (WCAG 2.3.1 — kalabalık mekânda ışığa duyarlı epilepsi riski).
- [ ] Siren, "sistem çöktü / hacklendi" gibi alarm dili yok: misafir bunu gerçek bir arıza sanıyor.
- [ ] Telefonda bekleme/hazırlan/bitti ekranı için `PlayerStageScreen`; TV açılışı için `GameIntroCinematic` kullandım.

## 6. Görsel dil v3 — sade, tek vurgu (27.10.2026)

Hedef: **sade ama premium.** v2'deki fx katmanı (BeamBorder, AuroraBackdrop,
GridPattern, ShimmerButton, CardSpotlight, KineticText) ve "AAA" süsleri
(volumetrik ışık, 3D harf monoliti, lazer köşeler, tarama çizgileri)
kaldırıldı: okunurluğu düşürüyor, GPU'suz TV'de kare hızını 13 fps'e
çekiyordu. "Wow" yalnızca gecenin birkaç anında, önceden render edilmiş
varlıklarla gelir (Blender; bkz. `docs/game-design-review.md`).

### Tokenlar (`src/index.css` → `@theme`)

| Token | Değer | Kullanım |
|---|---|---|
| `bg` / `surface` / `surface-2` | #0B0B10 / #15151C / #1E1E27 | zemin, kart, kart içi öğe |
| `line` | beyaz %8 | ince kenar |
| `ink` / `ink-2` / `ink-3` | #F5F5F7 / #A1A1AA / #71717A | metin kademeleri |
| `accent` | mekânın rengi (varsayılan amber #F5A524) | **tek vurgu**; `VenueContext` ezer |
| `ok` / `bad` | yeşil / kırmızı | yalnızca doğru/yanlış, can |

Eski neon adları (`neon-blue`, `alaz-orange`…) ve Tailwind'in renkli
aileleri (cyan, purple, pink, amber…) `accent`'e bağlıdır; yeni kodda
doğrudan `accent`/`ink`/`surface` yaz. Hazır sınıflar: `.surface`,
`.surface-2`, `.btn-primary`, `.btn-secondary`.

### Kurallar

- **Yazı:** tek aile Inter (uygulamayla gelir, 400/600/800). `font-mono`
  yalnızca oda kodunda; sayılar `tabular-nums`. TV tuvalinde (`.tv-canvas`)
  `text-xs`/`text-sm` 24 px'e çekilir — **TV'de en küçük 24 px**, telefonda
  14 px (`text-xs` = 14 px).
- **Izgara:** 8 px katları; TV'de `px-24 py-12` güvenli kenar.
- **Yüzey:** düz kart, ince kenar, hafif gölge. `backdrop-blur`, parlama
  gölgesi (`shadow-[0_0_…]`), gradyan metin yok.
- **Hareket:** durum geçişleri ≤250 ms (`DURATION.base/slow`); ekran başına
  tek odak animasyonu (süre halkası, puan sayacı, bomba). Sonsuz döngü yok
  (yükleme çarkı hariç). `DURATION.cinematic` yalnızca wow anları için.
- **TV üst çubuğu (`HostHeader`):** marka + oda kodu. Personel kontrolleri
  (lobiye dön, reklam arası, erken bitir, ses, spiker, dil, çıkış) tek "⋯"
  menüsünde (`role="menu"`).

### Ortak ekranlar

- **Telefon — `PlayerStageScreen`:** bekle / hazırlan / bitti. Simge, tek
  başlık, en fazla bir cümle ve "ana ekranı takip et" hapı. `tone` yalnızca
  `red` (elendin/hata) ile vurguyu ayırır.
- **Telefon arka planı — `PlayerBackground`:** tek nötr webp (18 KB) + koyu
  katman. Telefonda video/Three.js yok.
- **TV — `GameIntroCinematic`:** başlık → nasıl oynanır → 3-2-1.
- **Süre gösterimi:** telefonda kalan süre `lib/countdown` ile hesaplanır
  (telefonun soruyu gördüğü an; TV ile saat farkından etkilenmez).
