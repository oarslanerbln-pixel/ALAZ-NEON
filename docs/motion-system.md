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
| `ParticleBackground` | Sprite tabanlı parlama, hız çarpanı lerp ile değişir | HostDisplay, Quiz |
| `HoldButton` | Dolum `scaleX` motion value ile — kare başına render yok | PlayerPlaying |
| `ExperienceBar` | `scaleX` dolum; `mode="linear"` geri sayım için | PlayerHeader |

## 4. Koreografi zamanları

**HostStandings** — satırlar önceki sırayla belirir → 0.9s puan sayacı → 1.6s
`layout` ile yeni sıraya kayış (+ ▲/▼ rozeti) → 2.3s konfeti.

**HostPodium** — 3. (0.4s) → 2. (1.2s) → 1. (2.2s, fanfar) → 2.45s konfeti,
spot ışığı; 3.4s ödül kartları kademeli.

**HostPlaying** — >10s nötr · ≤10s amber halka + vinyet · ≤5s kırmızı halka,
kalp atışı, giriş flaşı · 0s tek sarsıntı + şok dalgası + "SÜRE BİTTİ".

## 5. Yeni ekran kontrol listesi

- [ ] Ham `duration`/`ease` yazmadım; `DURATION`/`EASE`/`SPRING` kullandım.
- [ ] `filter: blur()`, `box-shadow`, `text-shadow`, `width/height/top` animasyonu yok.
- [ ] Sonsuz döngüler yalnızca `transform`/`opacity` ve `aria-hidden`.
- [ ] Değişen sayılar `tabular-nums` (tercihen `AnimatedNumber`).
- [ ] Canvas varsa: DPR, `normalizeFrameDelta`, `visibilitychange`, `prefersReducedMotion`.
- [ ] Kısa süreli animasyonlu elemanlarda `will-change-transform`; kalıcı olanlarda **değil** (bellek).
- [ ] Mobil input'ta `whileFocus` ölçeği yok (iOS bulanık metin).
