import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { clearRoomAnswers, resetPlayersForNewGame } from "../../../lib/gameReset";
import { SoundManager, sounds } from "../../../lib/audio";
import { getQuizQuestions } from "../../../lib/quizQuestions";
import { recentQuestionIds, rememberQuestions } from "../../../lib/questionHistory";
import { toMillis } from "../../../lib/timestamps";

import type { Answer } from "../../../types/database";

import { HostQuizIntro } from "./views/HostQuizIntro";
import { QuizLeaderboard, type PreviousRanking } from "./QuizLeaderboard";
import { TimerRing } from "../../../components/TimerRing";
import { NumberTicker } from "../../../components/fx";
import { HostHeader } from "../components/HostHeader";
import { HostLobby } from "../views/HostLobby";
import { HostTutorial } from "../components/HostTutorial";
import { useLocale } from "../../../hooks/useLocale";
import { DURATION, EASE } from "../../../lib/motion";
import { grantGameRewards } from "../../../lib/rewards";
import { useVenue } from "../../../contexts/VenueContextCore";

import type { Room, Player, QuizOption } from "../../../types/database";
import { revealedOption, splitAnswerKey } from "../../../lib/quizReveal";
import { saveQuizAnswerKey, subscribeQuizAnswerKey } from "../../../lib/quizAnswerKey";
import { finishNightRound, NIGHT_ROUND_OPEN } from "../../../lib/nightAwards";
import { nightPointsForPlayers } from "../../../lib/nightLeague";

interface VoteStats {
  A: number;
  B: number;
  C: number;
  D: number;
  total: number;
}

interface FastestWinner {
  nickname: string;
  timeTakenSec: number;
  pointsEarned: number;
}

export function HostQuizDisplay({
  room,
  players,
  updateRoomStatus,
  updatePlayerScore,
}: {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], extra?: Partial<Room>) => Promise<void>;
  updatePlayerScore: (playerId: string, score: number) => Promise<void>;
}) {
  const { t } = useLocale();
  const { venue } = useVenue();

  const grantQuizRewards = () => {
    grantGameRewards("individual", players, venue).catch((err) =>
      console.error("[HostQuizDisplay] Ödül dağıtımı başarısız:", err),
    );
    finishNightRound(room.id, nightPointsForPlayers("individual", players));
  };

  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");

  const [timeLeft, setTimeLeft] = useState(room?.timer_setting || 30);
  const roundEndTime = room?.round_end_time ?? null;

  const [answeredCount, setAnsweredCount] = useState(0);
  const [voteStats, setVoteStats] = useState<VoteStats>({ A: 0, B: 0, C: 0, D: 0, total: 0 });
  const [fastestWinner, setFastestWinner] = useState<FastestWinner | null>(null);
  
  // Track streaks per player (consecutive correct answers)
  const streaksRef = useRef<Record<string, number>>({});
  const [playerStreaks, setPlayerStreaks] = useState<Record<string, number>>({});
  // Bir önceki ara sıralama: yeni sıralama ekranı buradan başlayıp kayıyor.
  const [lastRanking, setLastRanking] = useState<PreviousRanking>({ order: [], scores: {} });

  // Reentrancy guard for ending question
  const endingQuestionRef = useRef(false);

  // Cevap anahtarı odada değil, host'a özel dokümanda (lib/quizReveal).
  // Canlı dinleniyor: TV oyunun ortasında yenilense de puanlama sürüyor.
  const answerKeyRef = useRef<QuizOption[]>([]);
  useEffect(() => {
    if (!roomId) return;
    return subscribeQuizAnswerKey(roomId, (key) => {
      answerKeyRef.current = key;
    });
  }, [roomId]);

  // Derive game state directly from room.status — single source of truth
  const rawStatus = room?.status || "quiz_lobby";
  const gameState =
    rawStatus === "lobby" ? "quiz_lobby" :
    rawStatus === "tutorial" ? "tutorial" :
    rawStatus.startsWith("quiz_") || rawStatus.startsWith("question_") || rawStatus === "finished"
      ? rawStatus
      : "quiz_lobby";

  const currentQIndex = room?.current_question_index ?? 0;
  const currentQuestion = room?.quiz_questions?.[currentQIndex] ?? null;
  const totalRounds = room?.total_rounds || 5;
  const currentRoundNum = room?.current_round || currentQIndex + 1;
  const isFinalRound = currentRoundNum >= totalRounds;

  const startGame = async () => {
    if (!roomId || !room) return;
    
    // Eski cevaplar: tek writeBatch 500 işlemi aşınca (gece yarısına doğru
    // olağan) commit düşüyor ve eski cevaplar kalıyordu; parça parça siliniyor.
    try {
      await clearRoomAnswers(roomId);
    } catch (e) {
      console.warn("Could not delete old answers:", e);
    }

    // Reset streaks
    streaksRef.current = {};
    setPlayerStreaks({});

    // Ikinci tur da ayni secim ve hafizayi kullanmali: aksi halde host'un
    // kategori secimi yalnizca ilk turda gecerli olur ve tekrar hafizasi
    // gece icinde delinirdi.
    const questions = getQuizQuestions(room.locale || "tr", totalRounds, {
      topics: room.quiz_topics,
      recentIds: recentQuestionIds(),
    });
    rememberQuestions(questions.map((q) => q.id));

    // Anahtar soru odaya düşmeden önce yazılıyor. Yazma başarısız olsa da
    // yerel kopya bu oturumda puanlamayı taşır; yalnızca TV yenilenirse kaybolur.
    const { questions: publicQuestions, answerKey } = splitAnswerKey(questions);
    answerKeyRef.current = answerKey;
    try {
      await saveQuizAnswerKey(roomId, answerKey);
    } catch (err) {
      console.error("[HostQuizDisplay] Cevap anahtarı kaydedilemedi:", err);
    }

    if (room.current_round === 0) {
      await updateRoomStatus("tutorial", {
        tutorial_step: 0,
        current_question_index: 0,
        quiz_questions: publicQuestions,
        quiz_reveal: null,
      });
    } else {
      await updateRoomStatus("quiz_intro", {
        current_question_index: 0,
        quiz_questions: publicQuestions,
        quiz_reveal: null,
      });
    }
  };

  const handleTutorialComplete = async () => {
    if (!roomId) return;
    await updateRoomStatus("quiz_intro");
  };

  const onIntroComplete = useCallback(async () => {
    await updateRoomStatus("question_intro");
  }, [updateRoomStatus]);

  const startQuestionTimer = async () => {
    if (!roomId || !room) return;
    
    SoundManager.getInstance().playMusic(sounds.GAME_PULSE, 0.4);
    const timeToAnswer = room.timer_setting || 30;
    const endTime = Date.now() + timeToAnswer * 1000;
    
    endingQuestionRef.current = false;
    setTimeLeft(timeToAnswer);
    setAnsweredCount(0);
    setFastestWinner(null);

    await updateRoomStatus("question_active", {
      time_left: timeToAnswer,
      round_end_time: endTime,
      quiz_reveal: null,
    });
  };

  const endQuestion = useCallback(async () => {
    if (!roomId || !room) return;
    if (endingQuestionRef.current) return;
    if (room.status !== "question_active") return;
    endingQuestionRef.current = true;

    SoundManager.getInstance().stopSound(sounds.GAME_PULSE);
    // Siren her 30 sn'de bir kafede alarm gibi çalıyordu; açıklama vuruşu yeter.
    SoundManager.getInstance().playSFX(sounds.CINEMATIC_BOOM, 0.6);

    await updateRoomStatus("question_reveal");

    // Give players a brief grace period to resolve in-flight answers
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Fetch answers for the current question
    const questionIndexStr = (room.current_question_index ?? 0).toString();
    const q = query(
      collection(db, "answers"),
      where("room_id", "==", roomId),
      where("round_letter", "==", questionIndexStr)
    );
    
    const querySnapshot = await getDocs(q);
    const answers: Answer[] = [];
    querySnapshot.forEach((docSnap) => {
      answers.push({ id: docSnap.id, ...docSnap.data() } as Answer);
    });
    
    // Cevaplar okundu, küme kilitli: bundan sonra gelen cevap sayılmıyor.
    // Doğru şık ancak şimdi odaya (telefonlara ve TV'ye) açıklanıyor.
    const questionIndex = room.current_question_index ?? 0;
    const correctOption = answerKeyRef.current[questionIndex];
    if (!correctOption) {
      console.error("[HostQuizDisplay] Cevap anahtarı yok, soru puanlanamadı:", questionIndex);
      return;
    }
    await updateRoomStatus("question_reveal", {
      quiz_reveal: { index: questionIndex, option: correctOption },
    });

    // Calculate vote distribution
    const stats: VoteStats = { A: 0, B: 0, C: 0, D: 0, total: 0 };
    const playerAnswerMap = new Map<string, Answer>();

    // Sort answers by creation time for accurate speed ranking
    answers.sort((a, b) => toMillis(a.created_at) - toMillis(b.created_at));

    answers.forEach((ans) => {
      if (!playerAnswerMap.has(ans.player_id)) {
        playerAnswerMap.set(ans.player_id, ans);
        const opt = ans.data?.selectedOption as "A" | "B" | "C" | "D";
        if (opt && stats[opt] !== undefined) {
          stats[opt]++;
          stats.total++;
        }
      }
    });
    setVoteStats(stats);

    // Calculate points, speed bonuses, and streak multipliers
    let speedRank = 0;
    let localFastest: FastestWinner | null = null;
    const questionStartTime = (room.round_end_time || Date.now()) - (room.timer_setting || 30) * 1000;

    for (const [playerId, ans] of playerAnswerMap.entries()) {
      const playerInfo = players.find(p => p.id === playerId);
      if (!playerInfo) continue;

      const playerSelected = ans.data?.selectedOption;
      const isCorrect = playerSelected === correctOption;

      if (isCorrect) {
        // Base points (Double if final round)
        const basePts = isFinalRound ? 2000 : 1000;

        // Speed Bonus: 1st: +500, 2nd: +350, 3rd: +200, others: +100
        let speedBonus = 0;
        if (speedRank === 0) speedBonus = 500;
        else if (speedRank === 1) speedBonus = 350;
        else if (speedRank === 2) speedBonus = 200;
        else speedBonus = 100;

        // Streak Multiplier:
        const currentStreak = (streaksRef.current[playerId] || 0) + 1;
        streaksRef.current[playerId] = currentStreak;

        let multiplier = 1.0;
        if (currentStreak >= 3) multiplier = 1.5; // 50% streak bonus
        else if (currentStreak === 2) multiplier = 1.2; // 20% streak bonus

        const totalEarned = Math.round((basePts + speedBonus) * multiplier);

        // Record fastest correct responder for spotlight
        if (speedRank === 0) {
          const ansTime = toMillis(ans.created_at);
          const elapsedSec = Math.max(0.5, ((ansTime - questionStartTime) / 1000)).toFixed(1);
          localFastest = {
            nickname: playerInfo.nickname,
            timeTakenSec: parseFloat(elapsedSec),
            pointsEarned: totalEarned,
          };
        }

        speedRank++;
        await updatePlayerScore(playerId, playerInfo.total_score + totalEarned);
      } else {
        // Wrong answer breaks streak
        streaksRef.current[playerId] = 0;
      }
    }

    setPlayerStreaks({ ...streaksRef.current });
    setFastestWinner(localFastest);

    // Play reveal chime
    SoundManager.getInstance().playSFX(sounds.SUCCESS);
  }, [roomId, room, players, isFinalRound, updateRoomStatus, updatePlayerScore]);

  // Timer logic
  useEffect(() => {
    if (gameState !== "question_active" || !roundEndTime) return;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((roundEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 5 && remaining > 0) {
        SoundManager.getInstance().playSFX(sounds.TICK_URGENT);
      }
      return remaining;
    };

    if (tick() === 0) {
      const t = setTimeout(endQuestion, 0);
      return () => clearTimeout(t);
    }

    const interval = setInterval(() => {
      if (tick() === 0) {
        clearInterval(interval);
        endQuestion();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [gameState, roundEndTime, endQuestion]);

  // Real-time listener for player answers during question_active
  useEffect(() => {
    if (gameState === "question_active" && roomId && players.length > 0) {
      let hasEnded = false;
      const questionIndexStr = (room.current_question_index ?? 0).toString();
      const q = query(
        collection(db, "answers"),
        where("room_id", "==", roomId),
        where("round_letter", "==", questionIndexStr)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const distinctPlayers = new Set(snapshot.docs.map((d) => d.data().player_id));
        setAnsweredCount(distinctPlayers.size);

        // If everyone answered, end question immediately
        if (!hasEnded && distinctPlayers.size >= players.length) {
          hasEnded = true;
          endQuestion();
        }
      });
      
      return () => unsubscribe();
    }
  }, [gameState, roomId, room.current_question_index, players.length, endQuestion]);

  const showLeaderboard = async () => {
    await updateRoomStatus("quiz_leaderboard");
  };

  const nextQuestion = async () => {
    if (!roomId || !room) return;
    
    const nextIndex = (room.current_question_index || 0) + 1;
    if (nextIndex >= totalRounds) {
      grantQuizRewards();
      SoundManager.getInstance().playSFX(sounds.FANFARE);
      await updateRoomStatus("finished");
    } else {
      await updateRoomStatus("question_intro", {
        current_question_index: nextIndex,
        current_round: nextIndex + 1,
      });
    }
  };

  const resetGame = async () => {
    if (!roomId) return;
    // Eskiden tek writeBatch: oyuncu + cevap sayısı 500'ü geçince commit
    // düşüyor, yakalanmadığı için "YENİ OYUN BAŞLAT" sessizce hiçbir şey yapmıyordu.
    try {
      await Promise.all([resetPlayersForNewGame(players.map((p) => p.id)), clearRoomAnswers(roomId)]);
    } catch (err) {
      console.error("[HostQuizDisplay] Yeni oyun sıfırlaması başarısız:", err);
    }
    streaksRef.current = {};
    setPlayerStreaks({});
    await updateRoomStatus("quiz_lobby", { current_round: 0, current_question_index: 0, ...NIGHT_ROUND_OPEN });
  };

  const critical = gameState === "question_active" && timeLeft <= 5;

  return (
    <TVScaleFrame>
      <div className="w-full h-full flex flex-col px-24 py-12 overflow-hidden relative">
        <HostHeader
          room={room}
          onEndGameEarly={() => { grantQuizRewards(); updateRoomStatus("finished"); }}
          onReturnToLobby={() => updateRoomStatus("night_lobby", { active_game: "none" })}
        />

        <div className="flex-1 flex items-center justify-center relative w-full min-h-0">
          <AnimatePresence mode="wait">

            {/* LOBBY */}
            {gameState === "quiz_lobby" && (
              <motion.div
                key="quiz_lobby"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.base }}
                className="w-full h-full flex flex-col items-center"
              >
                <div className="text-center mb-8">
                  <p className="text-2xl text-ink-2">{t("quiz.subtitle")}</p>
                  <h1 className="text-7xl font-extrabold text-ink tracking-tight mt-2">{t("quiz.title")}</h1>
                </div>
                <div className="w-full flex-1 min-h-0 relative">
                  <HostLobby
                    room={room}
                    players={players}
                    onStartGame={startGame}
                    onUpdateCategories={() => {}}
                  />
                </div>
              </motion.div>
            )}

            {/* TUTORIAL */}
            {gameState === "tutorial" && (
              <HostTutorial room={room} onComplete={handleTutorialComplete} />
            )}

            {/* INTRO */}
            {gameState === "quiz_intro" && (
              <HostQuizIntro onComplete={onIntroComplete} />
            )}

            {/* QUESTION INTRO (Get Ready) */}
            {gameState === "question_intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.base, ease: EASE.out }}
                className="flex flex-col items-center justify-center w-full text-center"
              >
                <QuestionMeta
                  counter={t("quiz.questionCounter", currentRoundNum, totalRounds)}
                  category={currentQuestion?.category}
                  finalLabel={isFinalRound ? t("quiz.finalDouble") : undefined}
                />

                {!currentQuestion ? (
                  <div className="text-ink-2 text-3xl mt-10">{t("quiz.loading")}</div>
                ) : (
                  <>
                    <h1 className="mt-8 max-w-[1500px] text-[68px] font-extrabold text-ink leading-[1.15] tracking-tight text-balance">
                      {currentQuestion.text}
                    </h1>
                    <button
                      onClick={startQuestionTimer}
                      className="btn-primary mt-16 px-16 h-24 text-3xl uppercase tracking-wide"
                    >
                      {t("quiz.startTimer")}
                    </button>
                  </>
                )}
              </motion.div>
            )}

            {/* ACTIVE QUESTION */}
            {gameState === "question_active" && (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.base }}
                className="flex flex-col w-full h-full"
              >
                {!currentQuestion ? (
                  <div className="m-auto text-ink-2 text-3xl">{t("quiz.loading")}</div>
                ) : (
                  <>
                    {/* Soru bilgisi · süre halkası (ekranın tek odak animasyonu). */}
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full">
                      <QuestionMeta
                        align="left"
                        counter={t("quiz.questionCounter", currentRoundNum, totalRounds)}
                        category={currentQuestion.category}
                        finalLabel={isFinalRound ? t("quiz.finalDouble") : undefined}
                      />
                      <TimerRing
                        timeLeft={timeLeft}
                        maxTime={room.timer_setting || 30}
                        tone={critical ? "critical" : "calm"}
                        size={144}
                        strokeWidth={5}
                      >
                        <span className={`text-6xl font-extrabold tabular-nums ${critical ? "text-bad" : "text-ink"}`}>
                          {timeLeft}
                        </span>
                      </TimerRing>
                      <div />
                    </div>

                    <h1 className="mt-8 mx-auto max-w-[1500px] text-center text-[68px] font-extrabold text-ink leading-[1.15] tracking-tight text-balance">
                      {currentQuestion.text}
                    </h1>

                    <div className="grid grid-cols-2 gap-6 w-full mt-auto">
                      {(["A", "B", "C", "D"] as const).map((opt) => (
                        <div key={opt} className="surface rounded-3xl px-8 py-7 flex items-center gap-7 min-w-0">
                          <OptionLetter letter={opt} />
                          <span className="text-[44px] font-semibold text-ink leading-tight min-w-0">
                            {currentQuestion.options[opt]}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Cevap ilerlemesi + personelin süreyi erken bitirmesi */}
                    <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center">
                      <div />
                      <div className="flex items-center gap-6">
                        <div className="w-80 h-3 rounded-full bg-surface-2 overflow-hidden">
                          <motion.div
                            className="h-full bg-accent origin-left"
                            initial={false}
                            animate={{ scaleX: players.length ? answeredCount / players.length : 0 }}
                            transition={{ duration: DURATION.base, ease: EASE.out }}
                          />
                        </div>
                        <span className="text-3xl text-ink-2 tabular-nums">
                          {t("quiz.liveAnswered", answeredCount, players.length)}
                        </span>
                      </div>
                      <button
                        onClick={endQuestion}
                        className="justify-self-end px-6 h-14 rounded-2xl text-2xl font-semibold text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors"
                      >
                        {t("quiz.endTimer")}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* QUESTION REVEAL (oy dağılımı + doğru şık + en hızlı + bilgi notu) */}
            {gameState === "question_reveal" && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.base }}
                className="flex flex-col w-full h-full"
              >
                {!currentQuestion ? (
                  <div className="m-auto text-ink-2 text-3xl">{t("quiz.loading")}</div>
                ) : (
                  <>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-3xl font-extrabold text-ok">{t("quiz.correctAnswer")}</span>
                      {fastestWinner && (
                        <motion.span
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: DURATION.base, ease: EASE.out }}
                          className="text-2xl text-ink-2"
                        >
                          {t("quiz.fastestPlayer")}: <strong className="text-ink font-semibold">{fastestWinner.nickname}</strong>{" "}
                          <span className="tabular-nums">({fastestWinner.timeTakenSec}s)</span>
                        </motion.span>
                      )}
                    </div>

                    <h2 className="mt-6 text-center text-5xl font-extrabold text-ink leading-tight text-balance">
                      {currentQuestion.text}
                    </h2>

                    <div className="grid grid-cols-2 gap-6 w-full mt-auto">
                      {(["A", "B", "C", "D"] as const).map((opt) => {
                        const revealed = revealedOption(room, currentQIndex);
                        const isCorrect = revealed === opt;
                        const isDimmed = revealed !== null && !isCorrect;
                        const count = voteStats[opt] || 0;
                        const percentage = voteStats.total > 0 ? Math.round((count / voteStats.total) * 100) : 0;

                        return (
                          <motion.div
                            key={opt}
                            animate={{ opacity: isDimmed ? 0.45 : 1 }}
                            transition={{ duration: DURATION.base, ease: EASE.out }}
                            className={`relative overflow-hidden rounded-3xl px-8 py-6 border-2 ${
                              isCorrect ? "bg-ok/10 border-ok" : "bg-surface border-line"
                            }`}
                          >
                            {/* Oy yüzdesi dolgusu */}
                            <motion.div
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: percentage / 100 }}
                              transition={{ duration: 0.6, ease: EASE.out }}
                              className={`absolute inset-0 origin-left pointer-events-none ${isCorrect ? "bg-ok/15" : "bg-white/[0.04]"}`}
                            />
                            <div className="relative flex items-center gap-7">
                              <OptionLetter letter={opt} state={isCorrect ? "correct" : "idle"} />
                              <span className={`flex-1 min-w-0 text-[44px] font-semibold leading-tight ${isCorrect ? "text-ink" : "text-ink-2"}`}>
                                {currentQuestion.options[opt]}
                              </span>
                              <span className="text-right shrink-0">
                                <span className={`block text-4xl font-extrabold tabular-nums ${isCorrect ? "text-ok" : "text-ink-2"}`}>
                                  {percentage}%
                                </span>
                                <span className="block text-2xl text-ink-3 tabular-nums">{t("quiz.voteCount", count)}</span>
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="mt-8 flex items-center gap-8">
                      {currentQuestion.funFact ? (
                        <p className="flex-1 text-2xl text-ink-2 leading-snug">
                          <span className="font-semibold text-ink">{t("quiz.funFactTitle")}</span> {currentQuestion.funFact}
                        </p>
                      ) : (
                        <div className="flex-1" />
                      )}
                      {/* Puanlama bitip doğru şık odaya yazılmadan basılırsa TV
                          sıralamaya geçip endQuestion'ın son yazımıyla cevap
                          ekranına geri zıplıyordu: düğme o zamana kadar kapalı. */}
                      <button
                        onClick={showLeaderboard}
                        disabled={revealedOption(room, currentQIndex) === null}
                        className="btn-primary shrink-0 px-12 h-20 text-3xl uppercase tracking-wide"
                      >
                        {t("quiz.seeRanking")}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* LEADERBOARD */}
            {gameState === "quiz_leaderboard" && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.base, ease: EASE.out }}
                className="flex flex-col items-center justify-center w-full max-w-5xl"
              >
                <div className="text-center mb-8">
                  <h2 className="text-6xl font-extrabold text-ink tracking-tight">{t("quiz.currentRanking")}</h2>
                  {currentRoundNum + 1 === totalRounds && (
                    <p className="text-accent font-semibold mt-3 text-3xl">{t("quiz.finalRoundDouble")}</p>
                  )}
                </div>

                <QuizLeaderboard
                  players={players}
                  streaks={playerStreaks}
                  previous={lastRanking}
                  onSettled={setLastRanking}
                />

                <button onClick={nextQuestion} className="btn-primary mt-10 px-14 h-20 text-3xl uppercase tracking-wide">
                  {currentRoundNum >= totalRounds ? t("quiz.finishGame") : t("quiz.nextQuestion")}
                </button>
              </motion.div>
            )}

            {/* FİNAL — ilk üç */}
            {gameState === "finished" && (
              <motion.div
                key="finished"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: DURATION.base }}
                className="flex flex-col items-center justify-center w-full max-w-6xl text-center"
              >
                <h1 className="text-7xl font-extrabold text-accent tracking-tight">{t("quiz.champion")}</h1>

                {players.length > 0 && (() => {
                  const [first, second, third] = [...players].sort((a, b) => b.total_score - a.total_score);
                  return (
                    <div className="w-full grid grid-cols-3 items-end gap-8 my-14">
                      <PodiumCard player={second} label={t("quiz.podium2nd")} pts={t("quiz.pts")} delay={0.2} height="h-[300px]" />
                      <PodiumCard player={first} label={t("quiz.podium1st")} pts={t("quiz.pts")} delay={0.5} height="h-[380px]" winner />
                      <PodiumCard player={third} label={t("quiz.podium3rd")} pts={t("quiz.pts")} delay={0} height="h-[260px]" />
                    </div>
                  );
                })()}

                <button onClick={resetGame} className="btn-secondary px-12 h-20 text-3xl uppercase tracking-wide">
                  {t("quiz.newGame")}
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </TVScaleFrame>
  );
}

/** "Frage 2 / 5 · Nachtleben" — sayı vurgu renginde, gerisi ikincil. */
function QuestionMeta({
  counter,
  category,
  finalLabel,
  align = "center",
}: {
  counter: string;
  category?: string;
  finalLabel?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`flex items-center gap-4 text-3xl text-ink-2 ${align === "left" ? "" : "justify-center"}`}>
      <span className="font-semibold tabular-nums">{counter}</span>
      {category && <span>· {category}</span>}
      {finalLabel && <span className="ml-2 px-4 py-1 rounded-xl bg-accent text-bg text-2xl font-extrabold">{finalLabel}</span>}
    </div>
  );
}

function OptionLetter({ letter, state = "idle" }: { letter: QuizOption; state?: "idle" | "correct" }) {
  return (
    <span
      className={`w-20 h-20 shrink-0 rounded-2xl border-2 flex items-center justify-center text-4xl font-extrabold ${
        state === "correct" ? "bg-ok border-ok text-bg" : "border-accent/60 text-accent"
      }`}
    >
      {letter}
    </span>
  );
}

function PodiumCard({
  player,
  label,
  pts,
  delay,
  height,
  winner = false,
}: {
  player?: Player;
  label: string;
  pts: string;
  delay: number;
  height: string;
  winner?: boolean;
}) {
  if (!player) return <div />;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: DURATION.base, ease: EASE.out }}
      className={`${height} rounded-3xl flex flex-col items-center justify-end p-8 ${
        winner ? "bg-accent/10 border-2 border-accent" : "surface"
      }`}
    >
      <span className={`text-2xl font-semibold ${winner ? "text-accent" : "text-ink-2"}`}>{label}</span>
      <span className={`mt-3 font-extrabold text-ink truncate w-full ${winner ? "text-6xl" : "text-4xl"}`}>{player.nickname}</span>
      <span className={`mt-2 font-extrabold tabular-nums ${winner ? "text-5xl text-accent" : "text-3xl text-ink-2"}`}>
        <NumberTicker value={player.total_score} delay={delay + 0.3} /> {pts}
      </span>
    </motion.div>
  );
}
