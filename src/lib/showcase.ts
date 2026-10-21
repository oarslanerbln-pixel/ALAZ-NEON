/**
 * TV tanıtım döngüsü (HostShowcase): gece lobisi bir süre boş kalınca TV'de
 * dönen marka videosu ve sahne görselleri, ardından mekanın kendi tanıtım
 * görselleri. Varlıklar `public/media/tanitim/` altında; Flow çıktılarına
 * gerçek logo, çalışan QR ve gerçek oyun ekranları bindirildi.
 */

/** Gece lobisinde bu kadar süre dokunulmazsa döngü kendiliğinden açılır. */
export const SHOWCASE_IDLE_MS = 90_000;
/** Bir görselin ekranda kaldığı süre. Video kendi sonunda geçer. */
export const SHOWCASE_IMAGE_MS = 7_000;

const BASE = "/media/tanitim";

export type ShowcaseSlide =
  | { kind: "video"; mp4: string; webm: string; poster: string }
  /** `contain`: mekanın görseli, oranı bilinmediği için kırpılmadan sığdırılır. */
  | { kind: "image"; src: string; contain?: boolean };

/** Markanın kendi sahneleri: önce video, sonra görseller. */
export const BRAND_SLIDES: readonly ShowcaseSlide[] = [
  {
    kind: "video",
    mp4: `${BASE}/hengame-tanitim-1080.mp4`,
    webm: `${BASE}/hengame-tanitim-720.webm`,
    poster: `${BASE}/video-poster.webp`,
  },
  ...[6, 4, 2, 5, 3, 1].map((n) => ({ kind: "image" as const, src: `${BASE}/sahne-${n}.webp` })),
];

/**
 * Döngünün slaytları. Hareketi azaltma tercihinde video otomatik oynamaz,
 * yerine aynı karenin durağan posteri gösterilir. Mekanın görselleri sona
 * eklenir; boş/yinelenen adresler atılır.
 */
export function buildShowcaseSlides(venuePromos: readonly string[] | undefined, reducedMotion: boolean): ShowcaseSlide[] {
  const brand = BRAND_SLIDES.map((s) => (reducedMotion && s.kind === "video" ? { kind: "image" as const, src: s.poster } : s));
  const seen = new Set<string>();
  const promos: ShowcaseSlide[] = [];
  for (const url of venuePromos ?? []) {
    const clean = url.trim();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    promos.push({ kind: "image", src: clean, contain: true });
  }
  return [...brand, ...promos];
}

/** Sıradaki slayt; son slayttan başa döner. */
export function nextShowcaseIndex(index: number, length: number): number {
  return length <= 0 ? 0 : (index + 1) % length;
}
