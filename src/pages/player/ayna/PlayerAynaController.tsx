import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { addDoc, collection, doc, getDocs, limit, query, setDoc, where } from "firebase/firestore";
import { Check, Lock, Minus, Plus } from "lucide-react";

import { useToast } from "../../../contexts/ToastContextCore";
import { useLocale } from "../../../hooks/useLocale";
import { auth, db } from "../../../lib/firebase";
import { haptics } from "../../../lib/haptics";
import { aynaGuessPayload, aynaSurveyPayload } from "../../../lib/clientWrites";
import { AYNA_MAX, AYNA_MIN, aynaRoundKey, parseGuess, topScorers } from "../../../lib/ayna";
import { AYNA_CATEGORY_KEY, aynaRoundQuestion, formatAynaDelta, formatAynaValue, type AynaQuestion } from "../../../lib/aynaQuestions";
import { salonQuestionById } from "../../../lib/aynaSalon";
import type { Player, Room } from "../../../types/database";

interface Props {
  room: Room;
  player: Player;
}

/**
 * AYNA oyuncu kumandası. Telefon yalnızca `answers`'a tahmin yazar; oda
 * durumuna dokunmaz (host tek yazar).
 */
export function PlayerAynaController({ room, player }: Props) {
  const { locale } = useLocale();
  const index = room.ayna_index ?? 0;
  const total = room.ayna_question_ids?.length ?? 0;
  const question = aynaRoundQuestion(room.ayna_question_ids?.[index], room, locale);

  let body: ReactNode;
  let key: string;
  if (room.status === "ayna_survey") {
    key = "survey";
    body = <SurveyCard room={room} player={player} />;
  } else if (room.status === "ayna_active" && question) {
    key = `active-${index}`;
    // `key` sayesinde her soruda tahmin/kilit durumu sıfırdan başlıyor.
    body = <ActiveRound key={key} room={room} player={player} question={question} index={index} total={total} />;
  } else if (room.status === "ayna_reveal" && question) {
    key = `reveal-${index}`;
    body = <RevealRound room={room} player={player} question={question} />;
  } else if (room.status === "ayna_final") {
    key = "final";
    body = <FinalCard room={room} player={player} />;
  } else {
    key = "intro";
    body = <IntroCard />;
  }

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(34,211,238,0.2),transparent_60%),radial-gradient(ellipse_at_90%_100%,rgba(167,139,250,0.18),transparent_60%)]"
      />
      <main className="relative z-10 flex-1 flex flex-col px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {body}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function Wordmark({ className = "text-2xl" }: { className?: string }) {
  const { t } = useLocale();
  return (
    <span className={`${className} font-black tracking-[0.2em] bg-gradient-to-r from-cyan-200 via-white to-violet-300 bg-clip-text text-transparent`}>
      {t("ayna.title")}
    </span>
  );
}

function IntroCard() {
  const { t } = useLocale();
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-8">
      <Wordmark className="text-6xl" />
      <p className="text-xl font-bold text-white/85">{t("ayna.tagline")}</p>
      <ol className="w-full max-w-sm flex flex-col gap-3 text-left">
        {(["ayna.step1", "ayna.step2", "ayna.step3"] as const).map((k, i) => (
          <li key={k} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
            <span className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-black font-black flex items-center justify-center">
              {i + 1}
            </span>
            <span className="font-bold">{t(k)}</span>
          </li>
        ))}
      </ol>
      <p className="text-sm text-cyan-200/80 motion-safe:animate-pulse">{t("ayna.watchTv")}</p>
    </div>
  );
}

/**
 * Gizli salon anketi. Cevaplar tek dokümanda, yalnızca host'un
 * okuyabildiği `ayna_survey` koleksiyonuna yazılıyor; doküman kimliği
 * oda + hesap, yani her misafir bir kez yanıtlayabiliyor (bkz.
 * firestore.rules). "Geç" her zaman serbest — kimse cevaba zorlanmıyor.
 */
function SurveyCard({ room, player }: { room: Room; player: Player }) {
  const { t, locale } = useLocale();
  const ids = room.ayna_survey_ids ?? [];
  const storageKey = `ayna_survey_done_${room.id}`;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(() => {
    try {
      return sessionStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  });

  const finish = async (final: Record<string, boolean>) => {
    setSending(true);
    const uid = auth.currentUser?.uid;
    if (uid) {
      try {
        await setDoc(
          doc(db, "ayna_survey", `${room.id}_${uid}`),
          aynaSurveyPayload({
            roomId: room.id,
            hostUid: room.host_uid ?? "",
            playerId: player.id,
            answers: final,
          }),
        );
      } catch (err) {
        // Sayfa yenilenip ikinci kez gönderildiyse ya da anket az önce
        // kapandıysa kural yazmayı reddeder. İkisi de misafirin sorunu değil.
        console.warn("[AYNA] Anket kaydedilmedi:", err);
      }
    }
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // Depolama kapalıysa yalnızca yenilemede soru tekrar görünür.
    }
    haptics.success();
    setSending(false);
    setDone(true);
  };

  const respond = (value: boolean | null) => {
    if (sending) return;
    const id = ids[step];
    const next = value === null || !id ? answers : { ...answers, [id]: value };
    setAnswers(next);
    if (step + 1 >= ids.length) void finish(next);
    else setStep(step + 1);
  };

  if (done || ids.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6" role="status">
        <span className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-black flex items-center justify-center">
          <Check className="w-10 h-10" aria-hidden="true" />
        </span>
        <p className="text-xl font-bold max-w-xs">{t("ayna.surveyThanks")}</p>
        <p className="text-sm text-cyan-200/80 motion-safe:animate-pulse">{t("ayna.watchTv")}</p>
      </div>
    );
  }

  const current = salonQuestionById(ids[step]);
  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Wordmark />
        <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-black tracking-widest tabular-nums">
          {step + 1} / {ids.length}
        </span>
      </div>
      <span className="text-[11px] font-black tracking-[0.25em] text-cyan-200/80">{t("ayna.surveyTitle")}</span>

      <AnimatePresence mode="wait">
        <motion.h1
          key={ids[step]}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          className="flex-1 flex items-center text-3xl font-black leading-tight"
        >
          {current?.prompt[locale]}
        </motion.h1>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={sending}
          onClick={() => respond(true)}
          className="min-h-16 rounded-2xl bg-cyan-400 text-black text-xl font-black tracking-widest active:scale-[0.98] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {t("ayna.yes")}
        </button>
        <button
          type="button"
          disabled={sending}
          onClick={() => respond(false)}
          className="min-h-16 rounded-2xl bg-violet-400 text-black text-xl font-black tracking-widest active:scale-[0.98] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {t("ayna.no")}
        </button>
      </div>
      <button
        type="button"
        disabled={sending}
        onClick={() => respond(null)}
        className="self-center min-h-11 px-6 text-sm font-bold text-white/60 underline underline-offset-4 disabled:opacity-60"
      >
        {t("ayna.skip")}
      </button>
      <p className="flex items-start gap-2 text-xs text-white/60">
        <Lock className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
        {t("ayna.surveyPrivacy")}
      </p>
    </div>
  );
}

function QuestionTop({ question, index, total, secondsLeft }: { question: AynaQuestion; index: number; total: number; secondsLeft?: number }) {
  const { t, locale } = useLocale();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Wordmark />
        <div className="flex items-center gap-2 text-xs font-black tracking-widest">
          <span className="px-3 py-1.5 rounded-full bg-white/10">{t("ayna.questionOf", index + 1, total)}</span>
          {secondsLeft !== undefined && (
            <span
              className={`min-w-12 text-center px-3 py-1.5 rounded-full tabular-nums ${secondsLeft <= 5 ? "bg-red-500/30 text-red-200" : "bg-cyan-400/20 text-cyan-100"}`}
            >
              {secondsLeft}s
            </span>
          )}
        </div>
      </div>
      <span className="self-start text-[11px] font-black tracking-[0.25em] text-cyan-200/80">{t(AYNA_CATEGORY_KEY[question.category])}</span>
      <h1 className="text-xl font-bold leading-snug">{question.text[locale]}</h1>
    </div>
  );
}

interface ActiveProps {
  room: Room;
  player: Player;
  question: AynaQuestion;
  index: number;
  total: number;
}

function ActiveRound({ room, player, question, index, total }: ActiveProps) {
  const { t, locale } = useLocale();
  const { showToast } = useToast();
  const [guess, setGuess] = useState(50);
  const [touched, setTouched] = useState(false);
  const [lockedValue, setLockedValue] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  // Sayfa yenilendiyse bu soruya verilmiş tahmini geri yükle (çift cevap olmasın).
  useEffect(() => {
    let cancelled = false;
    getDocs(
      query(
        collection(db, "answers"),
        where("room_id", "==", room.id),
        where("player_id", "==", player.id),
        where("round_letter", "==", aynaRoundKey(index)),
        limit(1),
      ),
    )
      .then((snap) => {
        if (cancelled || snap.empty) return;
        const previous = parseGuess(snap.docs[0].data().data?.guess);
        submittedRef.current = true;
        setLockedValue(previous ?? 0);
      })
      .catch(() => {
        // Okuma başarısızsa oyuncu yine kilitleyebilsin; host ilk cevabı sayar.
      });
    return () => {
      cancelled = true;
    };
  }, [room.id, player.id, index]);

  // Süre yalnızca GÖSTERİM: telefonun saati TV'ninkinden sapabilir. Kilit
  // hakkını host belirliyor (açıklama anında cevapları okuyor), bu yüzden
  // saati ileride olan bir telefon hakkını erken kaybetmesin diye düğme
  // yerel saate göre kapanmıyor. Gösterilen değer skalaya kırpılıyor.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, []);
  const limitSec = room.timer_setting || 25;
  const secondsLeft = Math.min(limitSec, Math.max(0, Math.ceil(((room.round_end_time ?? 0) - now) / 1000)));

  const submit = async (value: number) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      await addDoc(
        collection(db, "answers"),
        aynaGuessPayload({
          roomId: room.id,
          playerId: player.id,
          roundKey: aynaRoundKey(index),
          roundIndex: index,
          value,
        }),
      );
      setLockedValue(value);
      haptics.success();
    } catch (err) {
      console.error("[AYNA] Tahmin gönderilemedi:", err);
      submittedRef.current = false;
      showToast(t("game.submitError"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Süre biterken dokunulmuş ama kilitlenmemiş tahmini kaybetme. Hiç
  // dokunulmamış varsayılan 50 GÖNDERİLMİYOR: masada unutulmuş telefon
  // bedava puan toplamasın.
  const shouldAutoSubmit = secondsLeft <= 1 && touched && lockedValue === null;
  // Tetikleyici yalnızca eşik anı; gönderilecek değer her zaman en güncel
  // tahmin olsun diye çağrı bir ref üzerinden yapılıyor.
  const autoSubmit = useRef<() => void>(() => {});
  useEffect(() => {
    autoSubmit.current = () => void submit(guess);
  });
  useEffect(() => {
    if (shouldAutoSubmit) autoSubmit.current();
  }, [shouldAutoSubmit]);

  const change = (next: number) => {
    setTouched(true);
    setGuess(Math.min(AYNA_MAX, Math.max(AYNA_MIN, Math.round(next))));
  };

  const shown = formatAynaValue(lockedValue ?? guess, question.unit, locale);

  return (
    <div className="flex-1 flex flex-col gap-6">
      <QuestionTop question={question} index={index} total={total} secondsLeft={secondsLeft} />

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <output
          aria-live="polite"
          className="text-7xl font-black tabular-nums bg-gradient-to-r from-cyan-200 via-white to-violet-300 bg-clip-text text-transparent"
        >
          {shown}
        </output>

        {lockedValue === null ? (
          <>
            <div className="w-full flex items-center gap-3">
              <StepButton label={t("ayna.decrease")} onClick={() => change(guess - 1)} disabled={submitting}>
                <Minus className="w-6 h-6" aria-hidden="true" />
              </StepButton>
              <input
                type="range"
                min={AYNA_MIN}
                max={AYNA_MAX}
                step={1}
                value={guess}
                disabled={submitting}
                onChange={(e) => change(Number(e.target.value))}
                aria-label={t("ayna.sliderLabel")}
                aria-valuetext={shown}
                className="ayna-range flex-1"
              />
              <StepButton label={t("ayna.increase")} onClick={() => change(guess + 1)} disabled={submitting}>
                <Plus className="w-6 h-6" aria-hidden="true" />
              </StepButton>
            </div>
            <div className="w-full flex justify-between text-xs font-bold text-white/40 tabular-nums px-14">
              <span>{formatAynaValue(AYNA_MIN, question.unit, locale)}</span>
              <span>{formatAynaValue(AYNA_MAX, question.unit, locale)}</span>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full rounded-2xl border border-cyan-300/40 bg-cyan-400/10 px-5 py-4 flex items-center gap-3"
            role="status"
          >
            <Lock className="w-6 h-6 text-cyan-200 shrink-0" aria-hidden="true" />
            <span className="font-bold">{t("ayna.lockedWait")}</span>
          </motion.div>
        )}
      </div>

      {lockedValue === null && (
        <button
          type="button"
          onClick={() => void submit(guess)}
          disabled={submitting}
          className="min-h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 text-black text-lg font-black tracking-widest shadow-[0_0_30px_rgba(34,211,238,0.35)] active:scale-[0.98] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-transform"
        >
          {t("ayna.lockIn")}
        </button>
      )}
    </div>
  );
}

function StepButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="w-12 h-12 shrink-0 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center active:scale-95 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
    >
      {children}
    </button>
  );
}

function RevealRound({ room, player, question }: { room: Room; player: Player; question: AynaQuestion }) {
  const { t, locale } = useLocale();
  const myGuess = room.ayna_round_guesses?.[player.id];
  const myPoints = room.ayna_round_points?.[player.id] ?? 0;
  const fmt = (v: number) => formatAynaValue(v, question.unit, locale);

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
      <Wordmark />
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-black tracking-[0.3em] text-white/60">{t("ayna.truth")}</span>
        <span className="text-7xl font-black tabular-nums">{fmt(question.answer)}</span>
      </div>

      {myGuess === undefined ? (
        <p className="text-white/60 font-bold">{t("ayna.noGuess")}</p>
      ) : (
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-[0.2em] text-white/60">{t("ayna.yourGuess")}</span>
            <span className="text-2xl font-black tabular-nums text-cyan-200">{fmt(myGuess)}</span>
          </div>
          <p className="text-sm text-white/60 text-left">{t("ayna.diff", formatAynaDelta(Math.round(Math.abs(myGuess - question.answer) * 10) / 10, question.unit, locale))}</p>
          {myPoints > 0 ? (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="text-4xl font-black text-amber-300 tabular-nums"
            >
              +{myPoints}
            </motion.span>
          ) : (
            <span className="font-bold text-white/70">{t("ayna.noPoints")}</span>
          )}
        </div>
      )}

      <p className="text-base leading-relaxed text-white/85 max-w-sm">{question.insight[locale]}</p>
    </div>
  );
}

function FinalCard({ room, player }: { room: Room; player: Player }) {
  const { t } = useLocale();
  const totals = room.ayna_totals ?? {};
  const mine = totals[player.id] ?? 0;
  const ranking = topScorers(totals, Number.MAX_SAFE_INTEGER);
  const rank = ranking.findIndex((r) => r.playerId === player.id) + 1;

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
      <Wordmark className="text-5xl" />
      <h1 className="text-2xl font-black tracking-[0.15em]">{t("ayna.finalTitle")}</h1>
      <span className="text-6xl font-black tabular-nums text-cyan-200">{t("ayna.totalPoints", mine)}</span>
      {rank > 0 ? (
        <p className="text-lg font-bold">
          {rank === 1 && "👑 "}
          {t("ayna.yourRank", rank, ranking.length)}
        </p>
      ) : (
        <p className="text-white/60 font-bold">{t("ayna.noPoints")}</p>
      )}
      <p className="text-sm text-white/50">{t("ayna.watchTv")}</p>
    </div>
  );
}
