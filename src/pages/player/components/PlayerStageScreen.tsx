import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Tv } from "lucide-react";

import { useLocale } from "../../../hooks/useLocale";
import { DURATION, EASE } from "../../../lib/motion";

/**
 * Eski çağrılarla uyumluluk için duruyor; görsel dil tek vurgu rengine
 * indiği için ton artık yalnızca kırmızı (elendin/hata) ile vurguyu ayırır.
 */
export type StageTone = "orange" | "red" | "blue" | "cyan" | "amber" | "purple" | "emerald" | "yellow" | "pink";

interface PlayerStageScreenProps {
  /** Dairenin ortasındaki simge — genellikle tek bir emoji. */
  icon: ReactNode;
  title: string;
  /** Başlığın üstündeki küçük satır: oyunun adı ya da "Soru 3/10". */
  eyebrow?: string;
  body?: string;
  tone?: StageTone;
  /** Misafir bir şey beklerken altta "ana ekranı takip et" hapı görünür. */
  waiting?: boolean;
  /** Alt hap metni; verilmezse bekleme ekranında varsayılan metin, `null` gizler. */
  hint?: string | null;
  /** Skor gibi ekstra içerik — gövdenin altına gelir. */
  children?: ReactNode;
}

/**
 * Oyun kumandalarının ortak "bekle / hazırlan / bitti" ekranı: simge, net
 * bir başlık, en fazla bir cümle ve misafire nereye bakacağını söyleyen tek
 * bir hap. Dönen ışık ya da parlama yok.
 */
export function PlayerStageScreen({ icon, title, eyebrow, body, tone = "orange", waiting = false, hint, children }: PlayerStageScreenProps) {
  const { t } = useLocale();
  const hintText = hint === undefined ? (waiting ? t("common.followMainScreen") : null) : hint;
  const danger = tone === "red";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.base, ease: EASE.out }}
      className="relative flex-1 flex flex-col items-center justify-center gap-5 px-6 py-10 text-center"
    >
      <span
        aria-hidden="true"
        className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl leading-none border ${
          danger ? "bg-bad/10 border-bad/40" : "bg-surface border-line"
        }`}
      >
        {icon}
      </span>

      <div className="flex flex-col items-center gap-2 max-w-xs">
        {eyebrow && <p className={`text-base font-semibold ${danger ? "text-bad" : "text-accent"}`}>{eyebrow}</p>}
        <h1 className="text-3xl font-extrabold leading-tight text-ink text-balance [overflow-wrap:anywhere]">{title}</h1>
        {body && <p className="text-base text-ink-2 leading-relaxed text-balance">{body}</p>}
      </div>

      {children}

      {hintText && (
        <span className="inline-flex items-center gap-2 rounded-full bg-surface border border-line px-4 py-2 text-sm text-ink-2">
          <Tv className="w-4 h-4 shrink-0" aria-hidden="true" />
          {hintText}
        </span>
      )}
    </motion.div>
  );
}
