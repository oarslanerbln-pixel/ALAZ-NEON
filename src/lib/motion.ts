/**
 * ALAZ NEON — Motion Design System (tek doğruluk kaynağı)
 *
 * Neden var: 80'den fazla dosya framer-motion kullanıyor ve her biri kendi
 * süresini/easing'ini uyduruyordu (0.15s, 0.2s, 0.3s, 0.4s, 0.5s, 0.8s...).
 * Tutarsız zamanlama, "amatör" hissin bir numaralı sebebidir — göz, aynı tür
 * hareketin her seferinde farklı hızda olmasını "ucuz" olarak okur.
 *
 * Kaynaklar (endüstri standardı):
 *  - Material Design 3 Motion: "emphasized" easing cubic-bezier(0.2, 0, 0, 1),
 *    süre ölçeği 50–1000ms; kısa mesafe = kısa süre.
 *  - Apple HIG: fiziksel yay (spring) tabanlı, kesintiye uğrayabilir hareket;
 *    "Reduce Motion" tercihine saygı.
 *  - web.dev / Chrome DevRel: yalnızca `transform` ve `opacity` animasyonla —
 *    bunlar compositor'da çalışır; `width/height/top/filter/box-shadow`
 *    her karede layout/paint tetikler (TV kutularındaki zayıf GPU'da takılma).
 *  - WCAG 2.3.3 (Animation from Interactions): dekoratif hareket kapatılabilmeli.
 *
 * Kullanım kuralı: bir bileşende ham sayı yazmadan önce buradaki tokenlardan
 * birini seç. Token yetmiyorsa buraya yeni token ekle, bileşene sayı gömme.
 */
import type { Transition, Variants } from "framer-motion";

/** Bezier eğrileri. framer `ease` prop'una doğrudan verilebilir. */
export const EASE = {
  /** Expo-out: hızlı başla, yumuşakça dur. Ekrana GİREN her şey için varsayılan. */
  out: [0.16, 1, 0.3, 1],
  /** Material 3 "emphasized": büyük yer değiştirmeler, ekranlar arası geçiş. */
  emphasized: [0.2, 0, 0, 1],
  /** Simetrik in-out: sonsuz döngüler, salınımlar. */
  inOut: [0.65, 0, 0.35, 1],
  /** Hızlanarak kaybol: ekrandan ÇIKAN elemanlar (dikkat çekmemeli). */
  in: [0.7, 0, 0.84, 0],
  /** Geri çekilip fırla (anticipation): darbe/vuruş öncesi. */
  anticipate: [0.36, 0, 0.66, -0.56],
} as const satisfies Record<string, readonly [number, number, number, number]>;

/**
 * Süreler (saniye). Material ölçeği: kısa mesafe → kısa süre.
 *  instant  : durum değişimi (renk, opaklık) — algılanmaz, sadece "yumuşatır"
 *  fast     : küçük UI elemanı (rozet, chip, buton geri bildirimi)
 *  base     : kart/satır giriş-çıkışı
 *  slow     : ekranın büyük bölümünü kaplayan geçişler
 *  cinematic: intro / podyum gibi "sahne" anları
 */
export const DURATION = {
  instant: 0.12,
  fast: 0.2,
  base: 0.35,
  slow: 0.6,
  cinematic: 1.2,
} as const;

/**
 * Yay (spring) presetleri. Süre yerine fizik: kesintiye uğrasa bile doğal
 * görünür (Apple HIG). Parametreler damping oranına göre seçildi:
 *  snappy : ζ≈0.8  — UI geri bildirimi, sayaç, rakam kaydırma (aşım yok denecek kadar az)
 *  bouncy : ζ≈0.5  — kutlama, "+puan" chip'i, rozet (belirgin tek aşım)
 *  gentle : ζ≈0.9  — büyük paneller, arka plan öğeleri (ağır, yavaş oturur)
 *  stiff  : ζ≈0.75 — anlık dokunma tepkisi (whileTap)
 *  layout : ζ≈0.9  — liste yeniden sıralama (layout animasyonları)
 */
export const SPRING = {
  snappy: { type: "spring", stiffness: 500, damping: 32, mass: 0.8 },
  bouncy: { type: "spring", stiffness: 320, damping: 18, mass: 1 },
  gentle: { type: "spring", stiffness: 120, damping: 20, mass: 1 },
  stiff: { type: "spring", stiffness: 700, damping: 40, mass: 1 },
  layout: { type: "spring", stiffness: 260, damping: 30, mass: 1 },
} as const satisfies Record<string, Transition>;

/** Liste elemanları arasındaki gecikme (saniye). */
export const STAGGER = {
  tight: 0.04,
  base: 0.07,
  loose: 0.12,
} as const;

/** Sık kullanılan tween'ler — `transition={TWEEN.enter}` gibi. */
export const TWEEN = {
  enter: { duration: DURATION.base, ease: EASE.out },
  exit: { duration: DURATION.fast, ease: EASE.in },
  screen: { duration: DURATION.slow, ease: EASE.emphasized },
  cinematic: { duration: DURATION.cinematic, ease: EASE.out },
} as const satisfies Record<string, Transition>;

/* ────────────────────────────────────────────────────────────────────────
   Paylaşılan variants — yalnızca transform + opacity kullanır.
   ──────────────────────────────────────────────────────────────────────── */

/** Aşağıdan yukarı belirme (kart, satır, başlık). */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: TWEEN.enter },
  exit: { opacity: 0, y: -12, transition: TWEEN.exit },
};

/** Küçükten büyüyerek belirme (modal, rozet, ikon). */
export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: SPRING.snappy },
  exit: { opacity: 0, scale: 0.95, transition: TWEEN.exit },
};

/** Kutlama vurgusu: belirgin tek aşımla büyüme (+puan, sıra rozeti). */
export const popBouncy: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: SPRING.bouncy },
  exit: { opacity: 0, scale: 0.8, transition: TWEEN.exit },
};

/** Ekran düzeyi geçiş: hafif ölçek + opaklık (blur YOK — paint maliyeti). */
export const screen: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: TWEEN.screen },
  exit: { opacity: 0, scale: 1.02, transition: TWEEN.exit },
};

/**
 * Kademeli liste: kapsayıcıya `variants={listContainer}`, çocuklara
 * `variants={listItem}` ver; kapsayıcıdaki initial/animate çocuklara yayılır.
 */
export const listContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER.base, delayChildren: 0.1 } },
};

export const listItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: SPRING.snappy },
};

/* ────────────────────────────────────────────────────────────────────────
   Reduced motion
   ──────────────────────────────────────────────────────────────────────── */

/**
 * React dışı kod (canvas motorları, sınıflar) için senkron sorgu. Bileşenlerde
 * framer'ın `useReducedMotion()` kancasını kullan — o değişimi de dinler.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/**
 * Kare süresini 60fps birimine normalize eder (1.0 = 16.67ms). Sekme arka
 * plana alınıp geri geldiğinde dt devasa olur; tavan 3 kare — fizik
 * "patlamaz". Canvas motorları ve rAF döngüleri için.
 */
export function normalizeFrameDelta(elapsedMs: number, maxFrames = 3): number {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return 1;
  return Math.min(elapsedMs / (1000 / 60), maxFrames);
}
