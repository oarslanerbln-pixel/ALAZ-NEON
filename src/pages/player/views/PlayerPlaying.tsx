import { useId, useState } from "react";
import { motion } from "framer-motion";
import { HoldButton } from "../../../components/HoldButton";
import { useLocale } from "../../../hooks/useLocale";
import { haptics } from "../../../lib/haptics";
import { SPRING, STAGGER, TWEEN } from "../../../lib/motion";
import { Sparkles } from "lucide-react";

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
 * Modern, sade ve klas Arena cevap kumandası.
 * Karmaşık hacker terminali renkleri yerine şık koyu cam (dark glass) kartlar,
 * anında odaklanan temiz inputlar ve sezgisel 2X Joker seçimi.
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
  const fieldIdPrefix = useId();

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
      className="space-y-3.5 max-w-md mx-auto"
    >
      {categories.map((cat, idx) => {
        const inputId = `${fieldIdPrefix}-answer-${idx}`;
        const isFocused = focusedCategory === cat;
        const isOthersFocused = focusedCategory !== null && !isFocused;
        const isJoker = jokerCategory === cat;
        const numStr = String(idx + 1).padStart(2, "0");

        return (
          <motion.div key={cat} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: SPRING.snappy } }}>
            <motion.div
              animate={{ opacity: isOthersFocused ? 0.45 : 1, scale: isOthersFocused ? 0.98 : 1 }}
              transition={SPRING.snappy}
              className={`rounded-2xl transition-all duration-300 p-4 border relative overflow-hidden backdrop-blur-xl ${
                isJoker
                  ? "bg-[#14120f]/95 border-amber-400/50 shadow-[0_0_25px_rgba(251,191,36,0.12)]"
                  : isFocused
                    ? "bg-[#121222]/95 border-alaz-orange/60 shadow-[0_0_25px_rgba(255,85,0,0.12)]"
                    : "bg-[#0c0c16]/85 border-white/[0.08] hover:border-white/15"
              }`}
            >
              {/* Category Header Row */}
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor={inputId}
                  className="text-xs font-bold uppercase tracking-[0.18em] text-white/80 flex items-center gap-2 cursor-pointer select-none"
                >
                  <span className="font-mono text-alaz-orange/70 text-[11px] font-black">{numStr}</span>
                  <span className="text-white font-black">{cat}</span>
                </label>

                {/* 2X Joker Button */}
                <button
                  type="button"
                  onClick={() => toggleJoker(cat)}
                  disabled={isLocked}
                  className={`touch-target px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase transition-all flex items-center gap-1.5 active:scale-95 border ${
                    isJoker
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                      : "bg-white/[0.04] text-white/40 hover:text-white/80 border-white/10 hover:border-white/20"
                  }`}
                >
                  <Sparkles className={`w-3 h-3 ${isJoker ? "text-black fill-black" : "text-amber-400/60"}`} />
                  <span>2X JOKER</span>
                </button>
              </div>

              {/* Clean Minimalist Input */}
              <div className="relative">
                <input
                  id={inputId}
                  type="text"
                  value={answers[cat] || ""}
                  onChange={(e) => onAnswerChange(cat, e.target.value)}
                  disabled={isLocked}
                  placeholder={`${activeLetter}...`}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className={`w-full bg-transparent border-0 border-b-2 py-2 text-xl font-bold font-sans transition-all duration-200 disabled:opacity-40 focus:outline-none ${
                    isJoker
                      ? "border-amber-400/60 text-amber-200 placeholder:text-amber-400/25 focus:border-amber-400"
                      : "border-white/10 text-white placeholder:text-white/20 focus:border-alaz-orange"
                  }`}
                  onFocus={(e) => {
                    setFocusedCategory(cat);
                    e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  onBlur={() => setFocusedCategory(null)}
                />
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* Early Submission */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: TWEEN.enter } }}
        className="pt-4 pb-8"
      >
        <HoldButton
          onComplete={onSubmitEarly}
          disabled={isLocked || Object.values(answers).every((a) => !a)}
          text={submitStatus === "submitting" ? t("game.submitting") : t("game.submitEarly")}
          holdText={t("game.submitting")}
        />
        <p className="text-[10px] text-center text-white/40 font-medium uppercase tracking-[0.2em] mt-3">
          {t("game.earlyHint")}
        </p>
      </motion.div>
    </motion.div>
  );
}
