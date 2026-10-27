import { useState, useEffect, useCallback, useRef } from "react";
import { collection, addDoc, query, where, getDocs, limit, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { retentionExpiry } from "../../../lib/retention";
import { isAlreadyExists } from "../../../lib/errors";
import { AnimatePresence, motion } from "framer-motion";
import { SoundManager, sounds } from "../../../lib/audio";
import { haptics } from "../../../lib/haptics";
import type { Room, Player } from "../../../types/database";
import { revealedOption } from "../../../lib/quizReveal";
import { useLocale } from "../../../hooks/useLocale";
import { gameTitle } from "../../../lib/gameCatalog";
import { PlayerStageScreen } from "../components/PlayerStageScreen";
import { PlayerIntroVideo } from "../components/PlayerIntroVideo";
import { QuizTimerBar } from "./QuizTimerBar";
import { NumberTicker } from "../../../components/fx";
import { DURATION, EASE } from "../../../lib/motion";

/** Telefon ekranları arasında kısa, sade geçiş (≤250 ms). */
const FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATION.base },
} as const;


interface PlayerQuizControllerProps {
  room: Room;
  player: Player;
}

export function PlayerQuizController({ room, player }: PlayerQuizControllerProps) {
  const { t } = useLocale();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [gameState, setGameState] = useState(room.status);
  const [responseSec, setResponseSec] = useState<string | null>(null);
  const questionStartTimeRef = useRef(0);
  const [urgent, setUrgent] = useState(false);
  void urgent;
  const [joinedMidQuestion] = useState(() => (room.status === "question_active" ? room.current_question_index ?? 0 : null));

  // Synchronous double-tap submission lock
  const hasSubmittedRef = useRef(false);

  // Soru değişince seçim sıfırlanır. Yalnızca durum geçişine bakmak yetmiyor:
  // telefon kilitliyken (ya da wifi koparken) ara durumlar tek bir snapshot'ta
  // birleşiyor; 1. sorunun "question_active"inden doğrudan 2. sorunun
  // "question_active"ine uyanan telefon eski cevabıyla kilitli kalıyordu.
  const questionIndex = room.current_question_index ?? 0;
  const [seenQuestionIndex, setSeenQuestionIndex] = useState(questionIndex);
  if (questionIndex !== seenQuestionIndex) {
    setSeenQuestionIndex(questionIndex);
    setSelectedOption(null);
    setHasSubmitted(false);
    setResponseSec(null);
  }

  // Synchronize game state during render
  if (room.status !== gameState) {
    if (
      (room.status === "question_intro" || room.status === "question_active") &&
      gameState !== "question_active" &&
      gameState !== "question_intro"
    ) {
      setSelectedOption(null);
      setHasSubmitted(false);
    }
    setGameState(room.status);
  }

  useEffect(() => {
    hasSubmittedRef.current = hasSubmitted;
  }, [hasSubmitted]);

  // Check if player already submitted for this question
  useEffect(() => {
    const checkSubmission = async () => {
      if (room.status === "question_active" && !hasSubmitted) {
        const questionIndexStr = (room.current_question_index ?? 0).toString();
        const q = query(
          collection(db, "answers"),
          where("room_id", "==", room.id),
          where("player_id", "==", player.id),
          where("round_letter", "==", questionIndexStr),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          hasSubmittedRef.current = true;
          setHasSubmitted(true);
          setSelectedOption(snapshot.docs[0].data().data?.selectedOption);
        }
      }
    };
    checkSubmission();
  }, [room.status, room.id, player.id, room.current_question_index, hasSubmitted]);

  // Reset timer on question_active
  useEffect(() => {
    if (gameState === "question_active") {
      questionStartTimeRef.current = Date.now();
      setResponseSec(null);
    }
  }, [gameState, questionIndex]);

  const handleSubmit = useCallback(async (option: string) => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const elapsed = Math.max(0.2, (Date.now() - questionStartTimeRef.current) / 1000).toFixed(1);
    setResponseSec(elapsed);

    haptics.impact();
    SoundManager.getInstance().playSFX(sounds.CLICK);
    setSelectedOption(option);
    setHasSubmitted(true);

    try {
      const questionIndexStr = (room.current_question_index ?? 0).toString();
      await addDoc(collection(db, "answers"), {
        room_id: room.id,
        player_id: player.id,
        round_letter: questionIndexStr,
        data: {
          selectedOption: option,
          responseTimeSec: Number(elapsed),
        },
        created_at: serverTimestamp(),
        expires_at: retentionExpiry(),
      });
      haptics.success();
    } catch (err) {
      // Onay yolda kaybolup SDK yeniden gönderince "zaten var": cevap kayıtlı.
      // Eskiden şıklar açılıp seçim siliniyordu; o arada basılan ikinci şık
      // telefonda görünürken TV ilkini puanlıyordu.
      if (isAlreadyExists(err)) {
        haptics.success();
        return;
      }
      console.error("Failed to submit quiz answer", err);
      hasSubmittedRef.current = false;
      setHasSubmitted(false);
      setSelectedOption(null);
    }
  }, [room.id, room.current_question_index, player.id]);

  // Auto-submit on time up
  useEffect(() => {
    if (room.status === "question_reveal" && !hasSubmitted && selectedOption) {
      const timer = setTimeout(() => handleSubmit(selectedOption), 0);
      return () => clearTimeout(timer);
    }
  }, [room.status, hasSubmitted, selectedOption, handleSubmit]);

  const currentQ = room.quiz_questions?.[room.current_question_index || 0];
  const currentRound = room.current_round || (room.current_question_index ?? 0) + 1;
  const totalRounds = room.total_rounds || 5;

  return (
    <div className="flex-1 flex flex-col items-center justify-between min-h-[100dvh] bg-bg text-ink relative overflow-hidden select-none pt-[env(safe-area-inset-top)] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {gameState === "question_active" && (
        <QuizTimerBar
          key={room.current_question_index ?? 0}
          durationSec={room.timer_setting || 30}
          roundEndTime={room.round_end_time}
          live={joinedMidQuestion !== (room.current_question_index ?? 0)}
          onUrgentChange={setUrgent}
        />
      )}

      {/* Oyuncu ve puan */}
      <header className="w-full max-w-md mx-auto px-5 pt-9 pb-2 flex justify-between items-center gap-3 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 shrink-0 rounded-full bg-surface-2 flex items-center justify-center text-base font-extrabold text-accent">
            {player.nickname.trim().charAt(0).toUpperCase()}
          </span>
          <span className="text-lg font-semibold text-ink truncate">{player.nickname}</span>
        </div>
        <span className="shrink-0 text-lg">
          <NumberTicker value={player.total_score} initial={player.total_score} className="font-extrabold tabular-nums text-ink" />{" "}
          <span className="text-ink-2">{t("quiz.pts")}</span>
        </span>
      </header>

      <div className="relative z-10 w-full max-w-md px-5 flex-1 flex flex-col justify-center min-h-0">
        {/* Soru numarasıyla anahtarlı: host ekranları hızlı geçerken yavaş
            telefonda bir çıkış animasyonu hiç bitmeyebiliyor ve "wait" kipi
            yeni ekranı sonsuza dek bekletiyordu (telefon önceki sorunun
            açıklamasında kalıp yeni soruyu kaçırıyordu). Yeni soru ağacı
            baştan kurar. */}
        <AnimatePresence mode="wait" key={questionIndex}>

          {/* LOBBY */}
          {(gameState === "lobby" || gameState === "quiz_lobby") && (
            <motion.div key="lobby" {...FADE}>
              <PlayerStageScreen icon="💡" tone="blue" eyebrow={gameTitle("quiz")} title={t("lobby.readyTitle")} body={t("quiz.watchMainScreen")} waiting hint={null} />
            </motion.div>
          )}

          {/* INTRO VIDEO / GET READY */}
          {(gameState === "quiz_intro" || (gameState === "question_intro" && questionIndex === 0)) ? (
            <PlayerIntroVideo
              gameTitle="HENGAME QUIZ"
              currentRound={currentRound}
              totalRounds={totalRounds}
            />
          ) : gameState === "question_intro" ? (
            <motion.div key={`intro-${questionIndex}`} {...FADE}>
              <PlayerStageScreen
                icon="🧠"
                tone="blue"
                eyebrow={t("quiz.questionCounter", currentRound, totalRounds)}
                title={t("quiz.getReady")}
                body={t("quiz.waitingForTimer")}
                waiting
                hint={null}
              />
            </motion.div>
          ) : null}

          {/* SORU: başlık üstte, şıklar başparmak bölgesinde */}
          {gameState === "question_active" && currentQ && (
            <motion.div key="active" {...FADE} className="w-full flex-1 flex flex-col py-2">
              <p className="text-base text-ink-2">
                <span className="font-semibold tabular-nums">{t("quiz.questionCounter", currentRound, totalRounds)}</span>
                {currentQ.category && <> · {currentQ.category}</>}
              </p>
              <h3 className="mt-2 text-[26px] font-extrabold text-ink leading-tight text-balance">{currentQ.text}</h3>

              <div className="mt-auto pt-6 flex flex-col gap-3 w-full">
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const isSelected = selectedOption === opt;
                  return (
                    <motion.button
                      key={opt}
                      data-testid={`quiz-option-${opt}`}
                      animate={{ opacity: hasSubmitted && !isSelected ? 0.35 : 1 }}
                      transition={{ duration: DURATION.fast }}
                      whileTap={hasSubmitted ? undefined : { scale: 0.98 }}
                      onClick={() => !hasSubmitted && handleSubmit(opt)}
                      disabled={hasSubmitted}
                      className={`w-full min-h-[72px] px-4 rounded-3xl border flex items-center gap-4 text-left select-none touch-manipulation transition-colors ${
                        isSelected ? "bg-accent border-accent text-bg" : "bg-surface border-line text-ink active:bg-surface-2"
                      }`}
                    >
                      <span
                        className={`w-12 h-12 shrink-0 rounded-2xl border-2 flex items-center justify-center text-xl font-extrabold ${
                          isSelected ? "border-bg/40 text-bg" : "border-accent/60 text-accent"
                        }`}
                      >
                        {opt}
                      </span>
                      <span className="flex-1 text-xl font-semibold leading-snug line-clamp-2">{currentQ.options[opt]}</span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-4 min-h-[28px] text-center text-base">
                {hasSubmitted ? (
                  <span className="text-ink">
                    {t("quiz.answerSaved")}
                    {responseSec && <span className="ml-2 text-ink-2 tabular-nums">{responseSec}s</span>}
                  </span>
                ) : (
                  <span className="text-ink-2">{t("quiz.tapHint")}</span>
                )}
              </div>
            </motion.div>
          )}

          {/* CEVAP AÇIKLANDI */}
          {gameState === "question_reveal" && currentQ && (() => {
            const revealed = revealedOption(room, room.current_question_index ?? 0);
            if (!revealed) {
              return (
                <motion.div key="reveal-pending" {...FADE} className="text-center w-full py-10">
                  <p className="text-ink-2 text-lg">{t("quiz.revealPending")}</p>
                </motion.div>
              );
            }
            const isCorrect = selectedOption === revealed;
            return (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={isCorrect ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, x: [0, -6, 6, 0] }}
                transition={{ duration: DURATION.slow, ease: EASE.out }}
                exit={{ opacity: 0 }}
                className="text-center w-full"
              >
                <div className={`rounded-3xl border-2 p-7 mb-4 ${isCorrect ? "bg-ok/10 border-ok" : "bg-bad/10 border-bad/60"}`}>
                  <h2 className={`text-3xl font-extrabold ${isCorrect ? "text-ok" : "text-bad"}`}>
                    {isCorrect ? t("quiz.playerCorrect") : t("quiz.playerWrong")}
                  </h2>
                  <p className="mt-3 text-lg text-ink-2">
                    {t("quiz.correctAnswer")}: <strong className="text-ink font-semibold">{revealed} — {currentQ.options[revealed]}</strong>
                  </p>
                </div>
                <p className="text-ink-2 text-base">{t("quiz.followRankingOnScreen")}</p>
              </motion.div>
            );
          })()}

          {/* LEADERBOARD ON MOBILE */}
          {gameState === "quiz_leaderboard" && (
            <motion.div key="leaderboard" {...FADE}>
              <PlayerStageScreen icon="🏆" tone="orange" eyebrow={gameTitle("quiz")} title={t("quiz.ranking")} body={t("quiz.followRankingOnScreen")} hint={null}>
                <ScoreTile label={t("quiz.yourScore")} score={player.total_score} />
              </PlayerStageScreen>
            </motion.div>
          )}

          {/* GAME OVER FINISHED */}
          {gameState === "finished" && (
            <motion.div key="finished" {...FADE}>
              <PlayerStageScreen icon="👑" tone="orange" eyebrow={gameTitle("quiz")} title={t("quiz.gameOver")} hint={t("common.followMainScreen")}>
                <ScoreTile label={t("quiz.finalScore")} score={player.total_score} />
              </PlayerStageScreen>
            </motion.div>
          )}

          {/* FALLBACK LOADING */}
          {!["lobby", "quiz_lobby", "question_intro", "quiz_intro", "question_active", "question_reveal", "quiz_leaderboard", "finished"].includes(gameState) && (
            <motion.div key="fallback" {...FADE}>
              <PlayerStageScreen icon="💡" tone="blue" eyebrow={gameTitle("quiz")} title={t("quiz.loading")} waiting hint={null} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

function ScoreTile({ label, score }: { label: string; score: number }) {
  return (
    <div className="w-full max-w-xs surface rounded-2xl px-5 py-4 flex items-center justify-between">
      <span className="text-base text-ink-2">{label}</span>
      <NumberTicker value={score} className="text-3xl font-extrabold text-accent tabular-nums" />
    </div>
  );
}
