import { useId, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HoldButton } from "../../../components/HoldButton";
import { useLocale } from "../../../hooks/useLocale";
import { haptics } from "../../../lib/haptics";
import { SoundManager, sounds } from "../../../lib/audio";
import { SPRING, STAGGER, TWEEN } from "../../../lib/motion";
import { Sparkles, Check, AlertCircle, Zap } from "lucide-react";

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
 * Türkçe ve Almanca harflere duyarlı ilk harf kontrolü (örn. i/İ, ı/I, ü/Ü, ö/Ö)
 */
function checkStartsWithLetter(val: string, letter: string): boolean | null {
  const cleanVal = val.trim();
  if (!cleanVal || !letter) return null;
  const firstChar = cleanVal.charAt(0).toLocaleLowerCase("tr");
  const targetChar = letter.trim().charAt(0).toLocaleLowerCase("tr");
  return firstChar === targetChar;
}

/**
 * Hengame Arena — Klas & Viral Mobil Kumanda (PlayerPlaying)
 *
 * 4 Uzmanlık Disiplini ile Tasarlandı:
 * 1. Blender Eevee: Derin koyu cam fasetler, metalik mikro-kenarlar, 24K altın Joker aurası
 * 2. Unity URP & Game Feel: Anında ilk harf doğrulama geribildirimi, vuruş hissi, yay fizikleri
 * 3. Godot Shaders & Micro-VFX: 60 FPS APU-dostu neon akış hatları ve haptik tetikleyiciler
 * 4. Viral Party Game UX: Sıvı ilerleme çubuğu, akıllı klavye sekmesi (Enter -> Sonraki Soru),
 *    ve dopamin yüklü Turbo Erken Kilitleme butonu.
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
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // İlerleme Hesaplaması
  const filledCount = categories.filter((cat) => (answers[cat] || "").trim().length > 0).length;
  const totalCount = categories.length;
  const allFilled = filledCount === totalCount && totalCount > 0;

  const toggleJoker = (cat: string) => {
    if (isLocked) return;
    if (jokerCategory === cat) {
      haptics.tap();
      SoundManager.getInstance().playSFX(sounds.CLICK, 0.3);
      onJokerChange(null);
    } else {
      haptics.success();
      SoundManager.getInstance().playSFX(sounds.SUCCESS, 0.45);
      onJokerChange(cat);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (idx < categories.length - 1) {
        inputRefs.current[idx + 1]?.focus();
      } else {
        inputRefs.current[idx]?.blur();
      }
    }
  };

  return (
    <motion.div
      key="playing"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: STAGGER.tight } },
      }}
      className="space-y-3.5 max-w-md mx-auto relative select-none"
    >
      {/* ═══════════════════════════════════════════════════════════════
          CANLI DİNAMİK İLERLEME ÇUBUĞU (LIQUID NEON PROGRESS HUD)
          ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={TWEEN.enter}
        className="sticky top-14 z-20 -mx-2 px-2 py-2 backdrop-blur-xl bg-[#090912]/85 border-b border-white/[0.06] rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.4)]"
      >
        <div className="flex items-center justify-between gap-3 mb-1.5">
          {/* Hedef Harf Rozeti */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.05] border border-alaz-orange/40 shadow-[0_0_15px_rgba(255,85,0,0.15)]">
            <Zap className="w-3.5 h-3.5 text-alaz-orange animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-white/50 uppercase tracking-widest">
              HARF
            </span>
            <span className="text-base font-black font-mono text-alaz-orange leading-none">
              {activeLetter}
            </span>
          </div>

          {/* İlerleme Puanları / Sayaç */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {categories.map((cat, i) => {
                const isCatFilled = (answers[cat] || "").trim().length > 0;
                return (
                  <motion.div
                    key={cat}
                    animate={{
                      scale: isCatFilled ? [1, 1.3, 1] : 1,
                      backgroundColor: isCatFilled ? "#10b981" : "rgba(255,255,255,0.1)",
                    }}
                    transition={{ duration: 0.25 }}
                    className={`w-3.5 h-1.5 rounded-full ${
                      isCatFilled
                        ? "shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                        : "border border-white/10"
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-[11px] font-mono font-bold text-white/70 tabular-nums">
              {filledCount}/{totalCount}
            </span>
          </div>
        </div>

        {/* Doluluk Durumu Bannerı */}
        <AnimatePresence>
          {allFilled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={SPRING.snappy}
              className="flex items-center justify-center gap-1.5 py-1 px-3 mt-1 rounded-lg bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              <span>{t("arena.allReady")} {t("arena.speedBonusActive")}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          KATEGORİ KARTLARI (3D PBR FASETLİ KOYU CAM PANELLER)
          ═══════════════════════════════════════════════════════════════ */}
      {categories.map((cat, idx) => {
        const inputId = `${fieldIdPrefix}-answer-${idx}`;
        const isFocused = focusedCategory === cat;
        const isOthersFocused = focusedCategory !== null && !isFocused;
        const isJoker = jokerCategory === cat;
        const numStr = String(idx + 1).padStart(2, "0");
        const val = answers[cat] || "";
        const matchState = checkStartsWithLetter(val, activeLetter);

        return (
          <motion.div
            key={cat}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: SPRING.snappy },
            }}
          >
            <motion.div
              animate={{
                opacity: isOthersFocused ? 0.45 : 1,
                scale: isOthersFocused ? 0.98 : isFocused ? 1.01 : 1,
                y: isFocused ? -2 : 0,
              }}
              transition={SPRING.snappy}
              className={`rounded-2xl transition-all duration-300 p-4 border relative overflow-hidden backdrop-blur-2xl ${
                isJoker
                  ? "bg-gradient-to-br from-[#1a1608]/95 via-[#120f05]/95 to-[#0d0b04]/95 border-amber-400/70 shadow-[0_0_35px_rgba(251,191,36,0.25)]"
                  : isFocused
                  ? "bg-[#121224]/95 border-alaz-orange/70 shadow-[0_10px_30px_rgba(255,85,0,0.18)]"
                  : "bg-[#0b0b14]/85 border-white/[0.08] hover:border-white/15"
              }`}
            >
              {/* 24K Joker Altın Işıltı Efekti */}
              {isJoker && (
                <div
                  aria-hidden="true"
                  className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none"
                />
              )}

              {/* Kategori Başlık Satırı */}
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor={inputId}
                  className="text-xs font-bold uppercase tracking-[0.18em] text-white/80 flex items-center gap-2 cursor-pointer select-none"
                >
                  <span
                    className={`font-mono text-[11px] font-black ${
                      isJoker ? "text-amber-400" : "text-alaz-orange/80"
                    }`}
                  >
                    {numStr}
                  </span>
                  <span className="text-white font-black">{cat}</span>
                </label>

                {/* 2X Joker Süper Butonu */}
                <button
                  type="button"
                  onClick={() => toggleJoker(cat)}
                  disabled={isLocked}
                  className={`touch-target px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase transition-all flex items-center gap-1.5 active:scale-95 border ${
                    isJoker
                      ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black border-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.6)]"
                      : "bg-white/[0.04] text-white/40 hover:text-white/80 border-white/10 hover:border-white/20"
                  }`}
                >
                  <Sparkles
                    className={`w-3 h-3 ${
                      isJoker ? "text-black fill-black animate-spin-slow" : "text-amber-400/60"
                    }`}
                  />
                  <span>2X JOKER</span>
                </button>
              </div>

              {/* Akıllı İnput ve Canlı İlk Harf Doğrulama Bildirimi */}
              <div className="relative flex items-center">
                <input
                  id={inputId}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  value={val}
                  onChange={(e) => onAnswerChange(cat, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  disabled={isLocked}
                  placeholder={`${activeLetter}...`}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className={`w-full bg-transparent border-0 border-b-2 py-2 pr-24 text-xl font-bold font-sans transition-all duration-200 disabled:opacity-40 focus:outline-none ${
                    isJoker
                      ? "border-amber-400/70 text-amber-100 placeholder:text-amber-400/25 focus:border-amber-300"
                      : "border-white/15 text-white placeholder:text-white/20 focus:border-alaz-orange"
                  }`}
                  onFocus={(e) => {
                    setFocusedCategory(cat);
                    e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  onBlur={() => setFocusedCategory(null)}
                />

                {/* Sağ Taraf: Anında Harf Doğrulama Rozeti */}
                <div className="absolute right-0 flex items-center gap-1.5 pointer-events-none">
                  {matchState === true && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-mono font-bold"
                    >
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>{activeLetter}</span>
                    </motion.div>
                  )}
                  {matchState === false && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-400/50 text-rose-300 text-[10px] font-mono font-bold"
                    >
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                      <span>{activeLetter}...</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Alt Bilgi: Hata veya Joker Durumu */}
              {matchState === false && (
                <p className="text-[10px] text-rose-400/90 font-mono mt-1.5 flex items-center gap-1">
                  <span>⚠️ {t("arena.letterMismatch", activeLetter)}</span>
                </p>
              )}
            </motion.div>
          </motion.div>
        );
      })}

      {/* ═══════════════════════════════════════════════════════════════
          TURBO ERKEN KİLİTLEME BUTONU (SUBMIT EARLY PUNCH)
          ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 15 },
          visible: { opacity: 1, y: 0, transition: TWEEN.enter },
        }}
        className="pt-3 pb-8"
      >
        <div
          className={`rounded-3xl transition-all duration-300 p-[1.5px] ${
            allFilled
              ? "bg-gradient-to-r from-emerald-400 via-cyan-400 to-alaz-orange shadow-[0_0_30px_rgba(16,185,129,0.35)]"
              : ""
          }`}
        >
          <HoldButton
            onComplete={onSubmitEarly}
            disabled={isLocked || Object.values(answers).every((a) => !a)}
            text={
              submitStatus === "submitting"
                ? t("game.submitting")
                : allFilled
                ? `🚀 ${t("game.submitEarly")} (+5)`
                : t("game.submitEarly")
            }
            holdText={t("game.submitting")}
          />
        </div>
        <p className="text-[10px] text-center text-white/45 font-medium uppercase tracking-[0.2em] mt-3">
          {t("game.earlyHint")}
        </p>
      </motion.div>
    </motion.div>
  );
}

