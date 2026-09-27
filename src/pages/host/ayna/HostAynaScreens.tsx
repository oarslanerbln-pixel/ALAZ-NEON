import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";

import { useLocale } from "../../../hooks/useLocale";
import { layoutGuessDots, summarizeGuesses, topScorers, AYNA_EXACT_TOLERANCE } from "../../../lib/ayna";
import { AYNA_CATEGORY_KEY, formatAynaValue, type AynaQuestion } from "../../../lib/aynaQuestions";
import type { TranslationKey } from "../../../lib/i18n";
import type { Player } from "../../../types/database";

/*
 * AYNA'nın TV ekranları — 1920×1080 tuval (TVScaleFrame içinde).
 * Görsel dil: siyah zemin, cyan → mor "ayna parıltısı", yansımalı logo.
 * Tahminler açıklanana kadar HİÇBİR tahmin gösterilmiyor: salonun birbirini
 * etkilememesi oyunun özü.
 */

const SCALE_TICKS = [0, 25, 50, 75, 100];
const SCALE_WIDTH = 1600;
const DOT_SIZE = 28;
const DOT_BIN = 3;
const MAX_STACK = 8;

/** Etiketi skala kenarında taşırmadan çizginin üstüne hizalar. */
function labelShift(pct: number): string {
  return `translateX(${pct < 12 ? -10 : pct > 88 ? -90 : -50}%)`;
}

/**
 * Ortanca etiketi gerçek çizgisinden UZAK tarafa uzanır; ikisi yakınsa
 * (ör. %60 ve %64) etiket gerçek çizgisinin üstüne binmesin. Kenarda yer
 * yoksa taşmamak için diğer tarafa döner.
 */
function medianLabelShift(median: number, truth: number): string {
  const extendLeft = median <= truth ? median > 18 : median > 82;
  return extendLeft ? "translateX(calc(-100% - 12px))" : "translateX(12px)";
}

export function AynaBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-black text-white font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_10%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(ellipse_at_85%_90%,rgba(167,139,250,0.18),transparent_55%)]" />
      <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] bg-[size:80px_80px]" />
      <motion.div
        aria-hidden="true"
        className="absolute -inset-y-1/2 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
        animate={{ x: ["0%", "450%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}

/** Yansımalı logo — "ayna" fikrinin görsel karşılığı. */
export function AynaWordmark({ size = 200, align = "center" }: { size?: number; align?: "center" | "start" }) {
  const { t } = useLocale();
  const text = t("ayna.title");
  const style = { fontSize: size, lineHeight: 1 } as const;
  return (
    <div className={`flex flex-col select-none ${align === "start" ? "items-start" : "items-center"}`} aria-label={text}>
      <span
        style={style}
        className="font-black tracking-[0.12em] bg-gradient-to-r from-cyan-200 via-white to-violet-300 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(34,211,238,0.35)]"
      >
        {text}
      </span>
      <span
        aria-hidden="true"
        style={style}
        className="font-black tracking-[0.12em] -scale-y-100 -mt-[0.18em] bg-gradient-to-r from-cyan-200 via-white to-violet-300 bg-clip-text text-transparent opacity-25 [mask-image:linear-gradient(to_top,rgba(0,0,0,0.9),transparent_65%)]"
      >
        {text}
      </span>
    </div>
  );
}

export function AynaIntroScreen({ durationMs }: { durationMs: number }) {
  const { t } = useLocale();
  const steps: TranslationKey[] = ["ayna.step1", "ayna.step2", "ayna.step3"];
  return (
    <div className="h-full flex flex-col items-center justify-center gap-14 px-24">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <AynaWordmark size={220} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-5xl font-bold text-white/85 text-center"
      >
        {t("ayna.tagline")}
      </motion.p>
      <div className="grid grid-cols-3 gap-8 w-full max-w-[1500px]">
        {steps.map((key, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.25 }}
            className="flex items-center gap-6 rounded-3xl border border-white/10 bg-white/[0.04] px-8 py-7 backdrop-blur"
          >
            <span className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-black text-3xl font-black flex items-center justify-center">
              {i + 1}
            </span>
            <span className="text-3xl font-bold leading-tight">{t(key)}</span>
          </motion.div>
        ))}
      </div>
      <div className="w-[900px] h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 to-violet-400"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: durationMs / 1000, ease: "linear" }}
        />
      </div>
    </div>
  );
}

/** Gizli salon anketi sürerken TV: yalnızca kaç kişinin yanıtladığı görünür. */
export function AynaSurveyScreen({ answered, playerCount, secondsLeft }: { answered: number; playerCount: number; secondsLeft: number }) {
  const { t } = useLocale();
  const RADIUS = 150;
  const circumference = 2 * Math.PI * RADIUS;
  const ratio = playerCount > 0 ? Math.min(1, answered / playerCount) : 0;
  return (
    <div className="h-full flex items-center justify-center gap-28 px-24">
      <div className="max-w-[900px] flex flex-col gap-10">
        <AynaWordmark size={90} align="start" />
        <h2 className="text-7xl font-black tracking-[0.15em] -mt-4">{t("ayna.surveyTitle")}</h2>
        <p className="text-4xl font-bold leading-snug text-white/85">{t("ayna.surveyLead")}</p>
        <p className="flex items-center gap-4 text-2xl font-semibold text-cyan-100/90 rounded-2xl border border-cyan-300/30 bg-cyan-400/[0.06] px-6 py-4">
          <Lock className="w-8 h-8 shrink-0" aria-hidden="true" />
          {t("ayna.surveyPrivacy")}
        </p>
      </div>
      <div className="relative w-[380px] h-[380px] shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 380 380" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="190" cy="190" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="18" />
          <motion.circle
            cx="190"
            cy="190"
            r={RADIUS}
            fill="none"
            stroke="url(#ayna-survey-ring)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - ratio) }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="ayna-survey-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
        </svg>
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-8xl font-black tabular-nums">{answered}</span>
          <span className="text-2xl font-bold text-white/70">{t("ayna.surveyDone", answered, playerCount)}</span>
          <span className="mt-2 text-3xl font-black tabular-nums text-cyan-200">{secondsLeft}s</span>
        </div>
      </div>
    </div>
  );
}

function QuestionHeader({ question, index, total, compact }: { question: AynaQuestion; index: number; total: number; compact?: boolean }) {
  const { t, locale } = useLocale();
  return (
    <div className="flex flex-col items-center text-center gap-6">
      <div className="flex items-center gap-4 text-2xl font-black tracking-[0.3em]">
        <span className="px-5 py-2 rounded-full bg-white/10 border border-white/15">{t("ayna.questionOf", index + 1, total)}</span>
        <span className="px-5 py-2 rounded-full bg-cyan-400/10 border border-cyan-300/30 text-cyan-200">
          {t(AYNA_CATEGORY_KEY[question.category])}
        </span>
      </div>
      <h2 className={`${compact ? "text-5xl" : "text-7xl"} font-black leading-tight max-w-[1600px] text-balance`}>
        {question.text[locale]}
      </h2>
    </div>
  );
}

/** Boş (active) ya da dolu (reveal) tahmin skalası. */
function GuessScale({ question, children }: { question: AynaQuestion; children?: ReactNode }) {
  const { locale } = useLocale();
  return (
    <div className="relative mx-auto" style={{ width: SCALE_WIDTH }}>
      <div className="relative h-[330px]">{children}</div>
      <div className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400/70 via-white/60 to-violet-400/70" />
      <div className="relative h-12 mt-3">
        {SCALE_TICKS.map((tick) => (
          <span
            key={tick}
            className="absolute -translate-x-1/2 whitespace-nowrap text-2xl font-bold text-white/50 tabular-nums"
            style={{ left: `${tick}%` }}
          >
            {formatAynaValue(tick, question.unit, locale)}
          </span>
        ))}
      </div>
    </div>
  );
}

interface ActiveProps {
  question: AynaQuestion;
  index: number;
  total: number;
  secondsLeft: number;
  lockedPlayers: Player[];
  playerCount: number;
  onRevealNow: () => void;
}

export function AynaActiveScreen({ question, index, total, secondsLeft, lockedPlayers, playerCount, onRevealNow }: ActiveProps) {
  const { t } = useLocale();
  const urgent = secondsLeft <= 5;
  const shown = lockedPlayers.slice(0, 14);
  return (
    <div className="h-full flex flex-col justify-between px-20 py-16">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <QuestionHeader question={question} index={index} total={total} />
        </div>
        <div
          className={`ml-10 w-40 h-40 shrink-0 rounded-full border-4 flex items-center justify-center text-7xl font-black tabular-nums transition-colors ${
            urgent ? "border-red-400 text-red-300 motion-safe:animate-pulse" : "border-cyan-300/60 text-white"
          }`}
          aria-live="off"
        >
          {secondsLeft}
        </div>
      </div>

      <GuessScale question={question}>
        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white/25 tracking-[0.3em]">
          ?
        </div>
      </GuessScale>

      <div className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-4 flex-wrap max-w-[1400px]">
          <span className="text-3xl font-black text-cyan-200 tabular-nums mr-2">
            {t("ayna.lockedCount", lockedPlayers.length, playerCount)}
          </span>
          {shown.map((p) => (
            <motion.span
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-2 rounded-full bg-cyan-400/15 border border-cyan-300/40 text-xl font-bold"
            >
              {p.nickname}
            </motion.span>
          ))}
          {lockedPlayers.length > shown.length && (
            <span className="text-xl font-bold text-white/60">+{lockedPlayers.length - shown.length}</span>
          )}
        </div>
        <HostButton onClick={onRevealNow}>{t("ayna.revealNow")}</HostButton>
      </div>
    </div>
  );
}

interface RevealProps {
  question: AynaQuestion;
  index: number;
  total: number;
  guesses: Record<string, number>;
  points: Record<string, number>;
  players: Player[];
  isLast: boolean;
  onNext: () => void;
}

export function AynaRevealScreen({ question, index, total, guesses, points, players, isLast, onNext }: RevealProps) {
  const { t, locale } = useLocale();
  const values = Object.values(guesses);
  const summary = summarizeGuesses(values, question.answer);
  const dots = layoutGuessDots(guesses, DOT_BIN);
  const names = new Map(players.map((p) => [p.id, p.nickname]));
  const top = topScorers(points, 3);
  const truthPct = question.answer;
  const truthDelay = 0.6 + Math.min(dots.length, 40) * 0.03;

  const verdict =
    summary.verdict === "under"
      ? t("ayna.verdictUnder", summary.underPct)
      : summary.verdict === "over"
        ? t("ayna.verdictOver", summary.overPct)
        : summary.verdict === "split"
          ? t("ayna.verdictSplit")
          : t("ayna.noGuess");

  return (
    <div className="h-full flex flex-col px-20 py-12 gap-6">
      <QuestionHeader question={question} index={index} total={total} compact />

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: truthDelay + 0.8 }}
        className="text-center text-4xl font-black text-violet-200"
      >
        {verdict}
      </motion.p>

      <GuessScale question={question}>
        {dots.map((dot, i) => {
          const exact = Math.abs(dot.value - truthPct) <= AYNA_EXACT_TOLERANCE;
          return (
            <motion.span
              key={dot.playerId}
              title={names.get(dot.playerId)}
              initial={{ opacity: 0, y: -60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.03, type: "spring", stiffness: 260, damping: 18 }}
              className={`absolute rounded-full ${exact ? "bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.9)]" : "bg-cyan-300/80 shadow-[0_0_10px_rgba(34,211,238,0.6)]"}`}
              style={{
                width: DOT_SIZE,
                height: DOT_SIZE,
                left: `calc(${dot.value}% - ${DOT_SIZE / 2}px)`,
                bottom: 6 + Math.min(dot.stack, MAX_STACK) * (DOT_SIZE + 4),
              }}
            />
          );
        })}

        {summary.median !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: truthDelay + 0.4 }}
            className="absolute bottom-0 h-[62%] border-l-2 border-dashed border-violet-300/70"
            style={{ left: `${summary.median}%` }}
          >
            <span
              className="absolute top-0 whitespace-nowrap pb-1 text-xl font-bold text-violet-200"
              style={{ transform: `${medianLabelShift(summary.median, truthPct)} translateY(-100%)` }}
            >
              {t("ayna.roomMedian", formatAynaValue(summary.median, question.unit, locale))}
            </span>
          </motion.div>
        )}

        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: truthDelay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ left: `${truthPct}%`, transformOrigin: "bottom" }}
          className="absolute bottom-0 top-[76px] -translate-x-1/2 w-1.5 bg-white shadow-[0_0_30px_rgba(255,255,255,0.9)]"
        />
        {/* Konumlandırma dış kapta (transform), animasyon içte: framer-motion
            kendi transform'unu yazdığı için ikisi aynı elemanda çakışırdı. */}
        <div className="absolute top-0" style={{ left: `${truthPct}%`, transform: labelShift(truthPct) }}>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: truthDelay + 0.3 }}
            className="block whitespace-nowrap px-5 py-2 rounded-2xl bg-white text-black text-4xl font-black shadow-[0_0_40px_rgba(255,255,255,0.6)]"
          >
            {t("ayna.truth")} {formatAynaValue(truthPct, question.unit, locale)}
          </motion.span>
        </div>
      </GuessScale>

      <div className="flex gap-10 items-stretch mt-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: truthDelay + 1.2 }}
          className="flex-[3] rounded-3xl border border-white/10 bg-white/[0.04] px-10 py-7 flex flex-col justify-between gap-4"
        >
          <p className="text-3xl font-semibold leading-snug text-white/90">{question.insight[locale]}</p>
          <p className="text-xl text-white/45">
            {t("ayna.source", question.year ? `${question.source} · ${question.year}` : question.source)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: truthDelay + 1.4 }}
          className="flex-[2] rounded-3xl border border-cyan-300/20 bg-cyan-400/[0.05] px-8 py-6 flex flex-col gap-3"
        >
          <span className="text-xl font-black tracking-[0.3em] text-cyan-200">{t("ayna.closest")}</span>
          {top.length === 0 && <span className="text-2xl text-white/50">{t("ayna.noGuess")}</span>}
          {top.map((row, i) => {
            const exact = Math.abs((guesses[row.playerId] ?? -99) - truthPct) <= AYNA_EXACT_TOLERANCE;
            return (
              <div key={row.playerId} className="flex items-center gap-4 text-2xl">
                <span className="w-8 font-black text-white/50">{i + 1}</span>
                <span className="flex-1 font-bold truncate">{names.get(row.playerId) ?? "—"}</span>
                {exact && <span className="text-sm font-black px-2 py-1 rounded bg-amber-300 text-black">{t("ayna.exact")}</span>}
                <span className="font-black tabular-nums text-cyan-200">+{row.points}</span>
              </div>
            );
          })}
          <div className="mt-auto self-end">
            <HostButton onClick={onNext}>{isLast ? t("ayna.seeResults") : t("ayna.next")}</HostButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function AynaFinalScreen({ totals, players, onBackToLobby }: { totals: Record<string, number>; players: Player[]; onBackToLobby: () => void }) {
  const { t } = useLocale();
  const names = new Map(players.map((p) => [p.id, p.nickname]));
  const ranking = topScorers(totals, 5);
  const best = ranking[0]?.points || 1;
  return (
    <div className="h-full flex flex-col items-center justify-center gap-8 px-24">
      <AynaWordmark size={80} />
      <h2 className="text-5xl font-black tracking-[0.2em] -mt-6">{t("ayna.finalTitle")}</h2>
      <div className="w-full max-w-[1300px] flex flex-col gap-4">
        {ranking.length === 0 && <p className="text-center text-3xl text-white/50">{t("ayna.noGuess")}</p>}
        {ranking.map((row, i) => (
          <motion.div
            key={row.playerId}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + (ranking.length - i) * 0.35 }}
            className={`relative flex items-center gap-8 rounded-3xl px-10 py-5 border overflow-hidden ${
              i === 0 ? "border-amber-300/60 bg-amber-300/10" : "border-white/10 bg-white/[0.04]"
            }`}
          >
            <motion.div
              aria-hidden="true"
              className={`absolute inset-y-0 left-0 ${i === 0 ? "bg-amber-300/15" : "bg-cyan-400/10"}`}
              initial={{ width: 0 }}
              animate={{ width: `${(row.points / best) * 100}%` }}
              transition={{ delay: 0.5 + (ranking.length - i) * 0.35, duration: 0.9 }}
            />
            <span className="relative text-5xl font-black w-16 text-white/60">{i + 1}</span>
            <span className="relative flex-1 text-4xl font-black truncate">
              {names.get(row.playerId) ?? "—"}
              {i === 0 && <span className="block text-xl font-bold text-amber-200 mt-1">👑 {t("ayna.bestReader")}</span>}
            </span>
            <span className="relative text-4xl font-black tabular-nums text-cyan-200">{row.points}</span>
          </motion.div>
        ))}
      </div>
      <HostButton onClick={onBackToLobby}>{t("ayna.backToLobby")}</HostButton>
    </div>
  );
}

function HostButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-8 py-4 rounded-2xl bg-white text-black text-2xl font-black tracking-widest hover:bg-cyan-200 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 transition-colors"
    >
      {children}
    </button>
  );
}
