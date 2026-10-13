import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Tv } from "lucide-react";

import { useLocale } from "../../../hooks/useLocale";

export type StageTone = "orange" | "red" | "blue" | "cyan" | "amber" | "purple" | "emerald" | "yellow" | "pink";

/** Tailwind sınıfları derleme zamanında görünsün diye tam dize olarak yazıldı. */
const TONES: Record<StageTone, { text: string; ring: string; core: string; glow: string }> = {
  orange: { text: "text-alaz-orange", ring: "border-alaz-orange/40", core: "border-alaz-orange/50 bg-alaz-orange/10", glow: "255,85,0" },
  red: { text: "text-red-400", ring: "border-red-500/40", core: "border-red-500/50 bg-red-500/10", glow: "239,68,68" },
  blue: { text: "text-sky-400", ring: "border-sky-400/40", core: "border-sky-400/50 bg-sky-400/10", glow: "56,189,248" },
  cyan: { text: "text-cyan-300", ring: "border-cyan-300/40", core: "border-cyan-300/50 bg-cyan-300/10", glow: "34,211,238" },
  amber: { text: "text-amber-400", ring: "border-amber-400/40", core: "border-amber-400/50 bg-amber-400/10", glow: "251,191,36" },
  purple: { text: "text-purple-400", ring: "border-purple-400/40", core: "border-purple-400/50 bg-purple-400/10", glow: "192,132,252" },
  emerald: { text: "text-emerald-400", ring: "border-emerald-400/40", core: "border-emerald-400/50 bg-emerald-400/10", glow: "52,211,153" },
  yellow: { text: "text-yellow-300", ring: "border-yellow-300/40", core: "border-yellow-300/50 bg-yellow-300/10", glow: "253,224,71" },
  pink: { text: "text-pink-400", ring: "border-pink-400/40", core: "border-pink-400/50 bg-pink-400/10", glow: "244,114,182" },
};

/** Dönen ışığı 1.5 px'lik bir halkaya indiren maske. */
const RING_MASK = "radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1px))";

interface PlayerStageScreenProps {
  /** Halkanın ortasındaki simge — genellikle tek bir emoji. */
  icon: ReactNode;
  title: string;
  /** Başlığın üstündeki küçük satır: oyunun adı ya da "Soru 3/10". */
  eyebrow?: string;
  body?: string;
  tone?: StageTone;
  /**
   * Misafir bir şey beklerken halka nabız atar ve altta "ana ekranı takip
   * et" hapı görünür. Sonuç ekranlarında (oyun bitti, elendin) kapalı.
   */
  waiting?: boolean;
  /** Alt hap metni; verilmezse bekleme ekranında varsayılan metin, `null` gizler. */
  hint?: string | null;
  /** Skor gibi ekstra içerik — gövdenin altına gelir. */
  children?: ReactNode;
}

/**
 * Oyun kumandalarının ortak "bekle / hazırlan / bitti" ekranı.
 *
 * Eskiden her oyun kendi bekleme ekranını yazıyordu: kimi dönen çark, kimi
 * zıplayan emoji, kimi yanıp sönen büyük harf — yan yana konunca tek bir
 * ürün gibi görünmüyordu. Artık hepsi lobideki dille aynı: nabız atan halka,
 * net bir başlık, en fazla bir cümle ve misafire nereye bakacağını söyleyen
 * tek bir hap. Oyunun kimliği yalnızca renk tonundan ve simgeden geliyor.
 */
export function PlayerStageScreen({ icon, title, eyebrow, body, tone = "orange", waiting = false, hint, children }: PlayerStageScreenProps) {
  const { t } = useLocale();
  const c = TONES[tone];
  const hintText = hint === undefined ? (waiting ? t("common.followMainScreen") : null) : hint;

  return (
    <div
      className="relative flex-1 flex flex-col items-center justify-center gap-5 px-6 py-10 text-center overflow-hidden"
      style={{
        background: `radial-gradient(60% 42% at 50% 40%, rgba(${c.glow},0.16) 0%, transparent 100%), radial-gradient(120% 60% at 50% 110%, rgba(0,0,0,0.6) 0%, transparent 70%)`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="relative w-32 h-32 flex items-center justify-center"
        aria-hidden="true"
      >
        {/* Dış çizgi: beklerken üzerinde ince bir ışık yavaşça dolaşıyor. */}
        <span className={`absolute inset-0 rounded-full border ${waiting ? c.ring : "border-white/10"}`} />
        {waiting && (
          <span
            className="absolute -inset-px rounded-full motion-safe:animate-spin [animation-duration:3.2s]"
            style={{
              background: `conic-gradient(from 0deg, transparent 0 68%, rgba(${c.glow},0.95) 100%)`,
              WebkitMask: RING_MASK,
              mask: RING_MASK,
            }}
          />
        )}
        {/* Çekirdek: camsı derinlik — üstten ışık, içte renk. */}
        <span
          className={`absolute inset-3 rounded-full border ${c.core} bg-gradient-to-b from-white/[0.09] to-transparent backdrop-blur-sm`}
          style={{ boxShadow: `0 0 48px rgba(${c.glow},0.32), inset 0 1px 0 rgba(255,255,255,0.18)` }}
        />
        <span className="relative text-5xl leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">{icon}</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35, ease: "easeOut" }}
        className="flex flex-col items-center gap-2.5 max-w-xs"
      >
        {eyebrow && (
          <p className={`flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.28em] ${c.text}`}>
            <span className="h-px w-5 bg-current opacity-50" aria-hidden="true" />
            {eyebrow}
            <span className="h-px w-5 bg-current opacity-50" aria-hidden="true" />
          </p>
        )}
        {/* Çeviri metinleri karışık harfli; başlık tutarlı olsun diye CSS ile
            büyütülüyor (<html lang> sayesinde Türkçe i/İ doğru dönüşüyor). */}
        <h1 className="text-[2rem] font-black uppercase tracking-[0.03em] leading-[1.08] text-balance bg-gradient-to-b from-white to-white/75 bg-clip-text text-transparent [overflow-wrap:anywhere]">
          {title}
        </h1>
        {body && <p className="text-[15px] text-white/65 leading-relaxed text-balance">{body}</p>}
      </motion.div>

      {children}

      {hintText && (
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] font-semibold text-white/70 backdrop-blur-md">
          <Tv className="w-4 h-4 shrink-0" aria-hidden="true" />
          {hintText}
        </span>
      )}
    </div>
  );
}
