import { useState } from "react";
import { motion } from "framer-motion";
import { HoldButton } from "../../../components/HoldButton";
import { useLocale } from "../../../hooks/useLocale";
import { haptics } from "../../../lib/haptics";
import { SPRING, STAGGER, TWEEN } from "../../../lib/motion";

interface PlayerPlayingProps {
  categories: string[];
  answers: Record<string, string>;
  onAnswerChange: (category: string, value: string) => void;
  jokerCategory: string | null;
  onJokerChange: (category: string | null) => void;
  isLocked: boolean;
  activeLetter: string;
  onSubmitEarly: () => void;
  submitStatus: string;
}

/**
 * Cevap ekranı (mobil). Süre işlerken ekran ANINDA kullanılabilir olmalı:
 * giriş kademesi çok kısa (40ms), odaklanmayan kategoriler yalnızca
 * opaklık/ölçekle sönüyor (grayscale filtresi kaldırıldı — her kare paint).
 * Input'ta `whileFocus` ölçeği yok: iOS Safari ölçeklenen input'un metnini
 * klavye açılırken bulanık rasterize ediyordu.
 */
export function PlayerPlaying({
  categories,
  answers,
  onAnswerChange,
  jokerCategory,
  onJokerChange,
  isLocked,
  activeLetter,
  onSubmitEarly,
  submitStatus,
}: PlayerPlayingProps) {
  const { t } = useLocale();
  const [focusedCategory, setFocusedCategory] = useState<string | null>(null);

  const toggleJoker = (cat: string) => {
    if (isLocked) return;
    haptics.tap();
    if (jokerCategory === cat) onJokerChange(null);
    else onJokerChange(cat);
  };

  return (
    <motion.div
      key="playing"
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: STAGGER.tight } } }}
      className="space-y-4"
    >
      {categories.map((cat, idx) => {
        const isFocused = focusedCategory === cat;
        const isOthersFocused = focusedCategory !== null && !isFocused;
        const isJoker = jokerCategory === cat;

        return (
          <motion.div key={cat} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: SPRING.snappy } }}>
            <motion.div
              animate={{ opacity: isOthersFocused ? 0.35 : 1, scale: isOthersFocused ? 0.97 : 1 }}
              transition={SPRING.snappy}
              className="space-y-3 origin-top"
            >
              <div className="flex items-center justify-between ml-2 mb-2">
                <label className="text-xs text-hacker-green/80 font-black font-mono uppercase tracking-[0.3em]">
                  &gt; {idx + 1}. {cat}
                </label>
                <motion.button
                  type="button"
                  onClick={() => toggleJoker(cat)}
                  disabled={isLocked}
                  whileTap={{ scale: 0.94 }}
                  transition={SPRING.stiff}
                  className={`touch-target px-3 py-2 min-h-[44px] text-[10px] font-black tracking-widest uppercase transition-colors flex items-center gap-1 border-l-2
                    ${
                      isJoker
                        ? "bg-alaz-orange/20 text-alaz-orange border-alaz-orange shadow-[0_0_10px_rgba(255,77,0,0.3)]"
                        : "bg-white/5 text-gray-500 border-transparent hover:text-white"
                    }
                  `}
                >
                  <div className={`w-2 h-2 ${isJoker ? "bg-alaz-orange animate-pulse" : "bg-gray-600"}`} />
                  {t("game.jokerLabel")}
                </motion.button>
              </div>
              <div className="relative group">
                <input
                  type="text"
                  value={answers[cat] || ""}
                  onChange={(e) => onAnswerChange(cat, e.target.value)}
                  disabled={isLocked}
                  placeholder={t("game.inputPlaceholder", activeLetter)}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className={`w-full bg-black/80 border-2 rounded-sm px-4 py-3.5 md:px-8 md:py-5 font-mono font-bold transition-[border-color,box-shadow,opacity] duration-200 disabled:opacity-50 text-lg md:text-xl cyber-panel focus:outline-none
                    ${
                      isJoker
                        ? "border-alaz-orange/60 text-white focus:border-alaz-orange focus:shadow-[0_0_20px_rgba(255,77,0,0.3)] placeholder:text-alaz-orange/30"
                        : "border-hacker-green/30 text-cyber-yellow placeholder:text-hacker-green/30 focus:border-hacker-green focus:shadow-[0_0_20px_rgba(0,255,65,0.2)]"
                    }
                  `}
                  onFocus={(e) => {
                    setFocusedCategory(cat);
                    e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  onBlur={() => setFocusedCategory(null)}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                  <div className={`w-3 h-3 animate-flicker ${isJoker ? "bg-alaz-orange shadow-[0_0_15px_#ff4d00]" : "bg-cyber-yellow shadow-[0_0_15px_#fcee0a]"}`} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: TWEEN.enter } }}
        className="pt-6 pb-8"
      >
        <HoldButton
          onComplete={onSubmitEarly}
          disabled={isLocked || Object.values(answers).every((a) => !a)}
          text={submitStatus === "submitting" ? t("game.submitting") : t("game.submitEarly")}
          holdText={t("game.submitting")}
        />
        <p className="text-[10px] text-center text-gray-600 font-bold uppercase tracking-[0.3em] mt-4">
          {t("game.earlyHint")}
        </p>
      </motion.div>
    </motion.div>
  );
}
