import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs, doc, writeBatch, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { ParticleBackground } from "../../../components/ParticleBackground";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { SoundManager, sounds } from "../../../lib/audio";
import { getQuizQuestions } from "../../../lib/quizQuestions";
import { toMillis } from "../../../lib/timestamps";
import { KineticSpark } from "../../../components/KineticSpark";

import type { Answer } from "../../../types/database";

import { HostQuizIntro } from "./views/HostQuizIntro";
import { HostHeader } from "../components/HostHeader";
import { HostLobby } from "../views/HostLobby";
import { HostTutorial } from "../components/HostTutorial";
import { useLocale } from "../../../hooks/useLocale";
import { grantGameRewards } from "../../../lib/rewards";
import { useVenue } from "../../../contexts/VenueContextCore";

import type { Room, Player } from "../../../types/database";

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

  const grantQuizRewards = () =>
    grantGameRewards("individual", players, venue).catch((err) =>
      console.error("[HostQuizDisplay] Ödül dağıtımı başarısız:", err),
    );

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

  // Reentrancy guard for ending question
  const endingQuestionRef = useRef(false);

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
    
    // Clear old answers
    try {
      const q = query(collection(db, "answers"), where("room_id", "==", roomId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.forEach(docSnap => batch.delete(docSnap.ref));
        await batch.commit();
      }
    } catch (e) {
      console.warn("Could not delete old answers:", e);
    }

    // Reset streaks
    streaksRef.current = {};
    setPlayerStreaks({});

    const questions = getQuizQuestions(room.locale || "tr", totalRounds);

    if (room.current_round === 0) {
      await updateRoomStatus("tutorial", {
        tutorial_step: 0,
        current_question_index: 0,
        quiz_questions: questions,
      });
    } else {
      await updateRoomStatus("quiz_intro", {
        current_question_index: 0,
        quiz_questions: questions,
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
    });
  };

  const endQuestion = useCallback(async () => {
    if (!roomId || !room) return;
    if (endingQuestionRef.current) return;
    if (room.status !== "question_active") return;
    endingQuestionRef.current = true;

    SoundManager.getInstance().stopSound(sounds.GAME_PULSE);
    SoundManager.getInstance().playSFX(sounds.SIREN);

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
    
    const currentQ = room.quiz_questions?.[room.current_question_index || 0];
    if (!currentQ) return;
    
    const correctOption = currentQ.correctOption;

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
    const batch = writeBatch(db);
    players.forEach(p => {
      const pRef = doc(db, "players", p.id);
      batch.update(pRef, { total_score: 0 });
    });

    const q = query(collection(db, "answers"), where("room_id", "==", roomId));
    const snapshot = await getDocs(q);
    snapshot.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
    streaksRef.current = {};
    setPlayerStreaks({});
    await updateRoomStatus("quiz_lobby", { current_round: 0, current_question_index: 0 });
  };

  // Color scheme mappings for options
  const optionStyles = {
    A: { border: "border-cyan-500", text: "text-cyan-400", bg: "bg-cyan-500/20", glow: "shadow-[0_0_25px_rgba(6,182,212,0.4)]" },
    B: { border: "border-pink-500", text: "text-pink-400", bg: "bg-pink-500/20", glow: "shadow-[0_0_25px_rgba(236,72,153,0.4)]" },
    C: { border: "border-amber-400", text: "text-amber-400", bg: "bg-amber-500/20", glow: "shadow-[0_0_25px_rgba(251,191,36,0.4)]" },
    D: { border: "border-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/20", glow: "shadow-[0_0_25px_rgba(16,185,129,0.4)]" },
  };

  return (
    <TVScaleFrame>
      <div 
        className="w-full h-full flex flex-col p-8 overflow-hidden bg-black text-white relative"
        data-tension={gameState === "question_active" && timeLeft <= 5 ? "high" : undefined}
      >
        <ParticleBackground speedMultiplier={gameState === "question_active" && timeLeft <= 5 ? 5 : 1} />
        
        {gameState === "question_active" && timeLeft <= 5 && (
          <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none z-0" />
        )}

        <HostHeader 
          room={room} 
          onEndGameEarly={() => { grantQuizRewards(); updateRoomStatus("finished"); }} 
          onReturnToLobby={() => updateRoomStatus("night_lobby", { active_game: "none" })}
        />

        <div className="flex-1 flex items-center justify-center relative w-full z-10 mt-6">
          <AnimatePresence mode="wait">
            
            {/* LOBBY */}
            {gameState === "quiz_lobby" && (
              <motion.div
                key="quiz_lobby"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -50 }}
                className="w-full flex flex-col items-center"
              >
                <div className="text-center mb-8">
                  <span className="px-6 py-2 rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-400 font-mono tracking-widest text-sm uppercase">
                    ⚡ {t("quiz.subtitle")} ⚡
                  </span>
                  <h1 className="text-6xl md:text-7xl font-black text-white tracking-widest uppercase mt-3 drop-shadow-[0_0_40px_rgba(59,130,246,0.9)]">
                    {t("quiz.title")}
                  </h1>
                </div>

                <div className="w-full h-full relative">
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

            {/* CYBER INTRO */}
            {gameState === "quiz_intro" && (
              <HostQuizIntro onComplete={onIntroComplete} />
            )}

            {/* QUESTION INTRO (Get Ready) */}
            {gameState === "question_intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center justify-center w-full max-w-5xl text-center"
              >
                {/* Round Badge */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="px-6 py-2 rounded-full bg-blue-600/30 border border-blue-500 text-blue-400 font-mono font-bold tracking-widest uppercase text-xl">
                    {t("quiz.questionCounter", currentRoundNum, totalRounds)}
                  </span>
                  {currentQuestion?.category && (
                    <span className="px-6 py-2 rounded-full bg-alaz-orange/20 border border-alaz-orange text-alaz-orange font-mono font-bold tracking-widest uppercase text-xl">
                      {currentQuestion.category}
                    </span>
                  )}
                  {isFinalRound && (
                    <span className="px-6 py-2 rounded-full bg-red-600/30 border border-red-500 text-red-400 font-black tracking-widest uppercase text-xl animate-pulse">
                      💥 2X FİNAL
                    </span>
                  )}
                </div>

                {!currentQuestion ? (
                  <div className="text-white/50 text-2xl animate-pulse">{t("quiz.loading")}</div>
                ) : (
                  <>
                    <div className="bg-black/80 border-2 border-blue-500/40 p-16 w-full rounded-2xl shadow-[0_0_60px_rgba(59,130,246,0.25)] relative overflow-hidden backdrop-blur-md">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500" />
                      <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                        {currentQuestion.text}
                      </h1>
                    </div>

                    <button
                      onClick={startQuestionTimer}
                      className="mt-12 px-16 py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-3xl uppercase tracking-widest rounded-xl shadow-[0_0_40px_rgba(59,130,246,0.7)] transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-4"
                    >
                      <span>⚡</span> {t("quiz.startTimer")}
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
                className="flex flex-col items-center justify-center w-full max-w-7xl"
              >
                {!currentQuestion ? (
                  <div className="text-white/50 text-2xl animate-pulse">{t("quiz.loading")}</div>
                ) : (
                  <>
                    {/* Top Bar: Category & Live Answered Counter */}
                    <div className="flex justify-between items-center w-full mb-6 px-4">
                      <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 rounded-md bg-white/10 border border-white/20 text-gray-300 font-mono text-lg uppercase font-bold">
                          {t("quiz.questionCounter", currentRoundNum, totalRounds)}
                        </span>
                        {currentQuestion.category && (
                          <span className="px-4 py-1.5 rounded-md bg-alaz-orange/20 border border-alaz-orange text-alaz-orange font-mono text-lg uppercase font-bold">
                            {currentQuestion.category}
                          </span>
                        )}
                      </div>

                      {/* Live Answered Tracker */}
                      <div className="flex items-center gap-3 bg-black/60 border border-cyan-500/40 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                        <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                        <span className="font-mono font-bold text-cyan-400 text-lg">
                          {t("quiz.liveAnswered", answeredCount, players.length)}
                        </span>
                      </div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-black/85 border border-blue-500/50 p-10 w-full text-center mb-8 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.35)] backdrop-blur-md">
                      <h1 className="text-3xl md:text-5xl font-black text-white leading-snug">{currentQuestion.text}</h1>
                    </div>

                    {/* Circular / Big Timer */}
                    <div className="flex items-center justify-center mb-8">
                      <div className={`text-8xl font-black tabular-nums tracking-tighter ${
                        timeLeft <= 5 ? "text-red-500 animate-bounce scale-110 drop-shadow-[0_0_30px_rgba(239,68,68,1)]" : "text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]"
                      }`}>
                        {timeLeft}
                      </div>
                    </div>

                    {/* 4 Options Grid */}
                    <div className="grid grid-cols-2 gap-6 w-full mb-6">
                      {(["A", "B", "C", "D"] as const).map(opt => {
                        const style = optionStyles[opt];
                        return (
                          <div 
                            key={opt} 
                            className={`bg-black/70 border-2 ${style.border} p-6 rounded-xl flex items-center gap-5 ${style.glow} backdrop-blur-sm`}
                          >
                            <div className={`w-14 h-14 ${style.bg} border-2 ${style.border} rounded-lg flex items-center justify-center text-3xl font-black ${style.text}`}>
                              {opt}
                            </div>
                            <div className="text-2xl md:text-3xl font-bold text-white text-left flex-1 leading-tight">
                              {currentQuestion.options[opt]}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Manual End Early Button */}
                    <div className="mt-4">
                      <button
                        onClick={endQuestion}
                        className="px-8 py-2.5 bg-red-950/60 hover:bg-red-900 border border-red-500/50 hover:border-red-500 text-red-400 font-bold uppercase tracking-widest text-sm transition-all rounded-full flex items-center gap-3"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        {t("quiz.endTimer")}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* QUESTION REVEAL (Vote breakdown + Correct Option + Speed Demon + Fun Fact) */}
            {gameState === "question_reveal" && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center w-full max-w-6xl"
              >
                {!currentQuestion ? (
                  <div className="text-white/50 text-2xl animate-pulse">{t("quiz.loading")}</div>
                ) : (
                  <>
                    <div className="flex items-center justify-between w-full mb-6">
                      <span className="text-2xl font-black text-green-400 uppercase tracking-widest flex items-center gap-2">
                        <span>🎯</span> {t("quiz.correctAnswer")}
                      </span>

                      {/* Speed Demon Spotlight */}
                      {fastestWinner && (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-yellow-500/20 border border-yellow-400 px-6 py-2 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(250,204,21,0.5)]"
                        >
                          <span className="text-xl">⚡</span>
                          <span className="text-yellow-400 font-black uppercase text-sm tracking-wider">
                            {t("quiz.fastestPlayer")}: <strong className="text-white font-bold">{fastestWinner.nickname}</strong> ({fastestWinner.timeTakenSec}s)
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {/* Options with Vote Breakdown Bars */}
                    <div className="grid grid-cols-2 gap-6 w-full mb-8">
                      {(["A", "B", "C", "D"] as const).map(opt => {
                        const isCorrect = currentQuestion.correctOption === opt;
                        const count = voteStats[opt] || 0;
                        const percentage = voteStats.total > 0 ? Math.round((count / voteStats.total) * 100) : 0;

                        return (
                          <div 
                            key={opt} 
                            className={`p-6 rounded-xl border-2 relative overflow-hidden flex flex-col justify-between transition-all duration-700 ${
                              isCorrect 
                                ? "bg-green-500/25 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.7)] scale-[1.02]" 
                                : "bg-black/50 border-white/10 opacity-40"
                            }`}
                          >
                            {/* Vote Percentage Fill Bar */}
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`absolute inset-y-0 left-0 ${isCorrect ? "bg-green-500/20" : "bg-white/5"} pointer-events-none`}
                            />

                            <div className="flex items-center gap-4 relative z-10">
                              <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-3xl font-black ${
                                isCorrect ? "bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.8)]" : "border border-white/20 text-gray-400"
                              }`}>
                                {opt}
                              </div>
                              <div className={`text-2xl font-bold flex-1 text-left ${isCorrect ? "text-green-300 font-black" : "text-gray-400"}`}>
                                {currentQuestion.options[opt]}
                              </div>
                            </div>

                            {/* Vote stats footer */}
                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10 relative z-10 text-sm font-mono">
                              <span className={isCorrect ? "text-green-400 font-bold" : "text-gray-500"}>
                                {count} Oyuncu
                              </span>
                              <span className={`font-black ${isCorrect ? "text-green-400 text-lg" : "text-gray-500"}`}>
                                %{percentage}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Fun Fact Card */}
                    {currentQuestion.funFact && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-blue-950/40 border border-blue-500/40 p-6 rounded-xl mb-8 flex items-start gap-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                      >
                        <span className="text-3xl">💡</span>
                        <div className="text-left">
                          <h4 className="text-cyan-400 font-black uppercase text-sm tracking-widest mb-1">
                            {t("quiz.funFactTitle")}
                          </h4>
                          <p className="text-gray-200 text-lg font-medium leading-relaxed">
                            {currentQuestion.funFact}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <button
                      onClick={showLeaderboard}
                      className="px-14 py-5 bg-white hover:bg-gray-100 text-black font-black text-2xl uppercase tracking-widest rounded-xl shadow-[0_0_40px_rgba(255,255,255,0.7)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-4"
                    >
                      {t("quiz.seeRanking")} <span>→</span>
                    </button>
                  </>
                )}
              </motion.div>
            )}

            {/* LEADERBOARD */}
            {gameState === "quiz_leaderboard" && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center w-full max-w-4xl"
              >
                <div className="text-center mb-8">
                  <h2 className="text-5xl font-black text-white tracking-[0.2em] uppercase drop-shadow-[0_0_30px_rgba(255,77,0,0.8)]">
                    {t("quiz.currentRanking")}
                  </h2>
                  {currentRoundNum + 1 === totalRounds && (
                    <p className="text-alaz-orange font-bold uppercase tracking-widest mt-2 animate-pulse text-lg">
                      {t("quiz.finalRoundDouble")}
                    </p>
                  )}
                </div>

                <div className="w-full space-y-3 mb-10 max-h-[50vh] overflow-y-auto pr-2">
                  {[...players].sort((a,b) => b.total_score - a.total_score).map((p, idx) => {
                    const streak = playerStreaks[p.id] || 0;
                    return (
                      <motion.div 
                        key={p.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex items-center p-5 rounded-xl border-2 transition-all ${
                          idx === 0 
                            ? "bg-amber-500/20 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)]" 
                            : idx === 1
                            ? "bg-slate-300/15 border-slate-300"
                            : idx === 2
                            ? "bg-amber-700/15 border-amber-700"
                            : "bg-black/60 border-white/10"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-black mr-5 ${
                          idx === 0 ? "bg-amber-400 text-black" : idx === 1 ? "bg-slate-300 text-black" : idx === 2 ? "bg-amber-700 text-white" : "bg-white/10 text-gray-400"
                        }`}>
                          #{idx + 1}
                        </div>

                        <div className="flex-1 flex items-center gap-3">
                          <span className="text-2xl md:text-3xl font-black text-white">{p.nickname}</span>
                          {streak >= 2 && (
                            <span className="px-3 py-1 rounded-full bg-red-600/30 border border-red-500 text-red-400 text-xs font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                              🔥 x{streak} {streak >= 3 ? "ALEV" : ""}
                            </span>
                          )}
                        </div>

                        <div className="text-3xl md:text-4xl font-black text-alaz-orange tabular-nums">
                          {p.total_score} <span className="text-sm font-normal text-gray-400">{t("quiz.pts")}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <button
                  onClick={nextQuestion}
                  className="px-14 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-2xl uppercase tracking-widest rounded-xl shadow-[0_0_40px_rgba(59,130,246,0.7)] transition-all transform hover:scale-105 active:scale-95"
                >
                  {currentRoundNum >= totalRounds ? t("quiz.finishGame") : t("quiz.nextQuestion")}
                </button>
              </motion.div>
            )}

            {/* GRAND FINALE — 3-TIER CYBERPUNK PODIUM */}
            {gameState === "finished" && (
              <motion.div
                key="finished"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center w-full max-w-5xl text-center"
              >
                <KineticSpark />
                
                <h1 className="text-6xl md:text-7xl font-black text-alaz-orange mb-4 uppercase drop-shadow-[0_0_40px_rgba(255,77,0,0.9)] tracking-widest">
                  {t("quiz.champion")}
                </h1>
                
                {players.length > 0 && (() => {
                  const sorted = [...players].sort((a,b) => b.total_score - a.total_score);
                  const first = sorted[0];
                  const second = sorted[1];
                  const third = sorted[2];

                  return (
                    <div className="w-full flex items-end justify-center gap-6 my-10 min-h-[300px]">
                      {/* 2nd Place */}
                      {second && (
                        <motion.div 
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex-1 max-w-xs bg-gradient-to-b from-slate-400/20 to-black/80 border-2 border-slate-300 p-6 rounded-2xl flex flex-col items-center shadow-[0_0_30px_rgba(203,213,225,0.3)]"
                        >
                          <div className="text-4xl mb-2">🥈</div>
                          <span className="text-xs font-mono uppercase text-slate-300 font-bold tracking-widest mb-1">
                            {t("quiz.podium2nd")}
                          </span>
                          <h3 className="text-2xl font-black text-white mb-2 truncate w-full">{second.nickname}</h3>
                          <div className="text-2xl font-black text-slate-300">{second.total_score} {t("quiz.pts")}</div>
                        </motion.div>
                      )}

                      {/* 1st Place (Champion) */}
                      {first && (
                        <motion.div 
                          initial={{ opacity: 0, y: 50, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1.08 }}
                          transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}
                          className="flex-1 max-w-sm bg-gradient-to-b from-amber-500/30 to-black/90 border-4 border-amber-400 p-8 rounded-2xl flex flex-col items-center shadow-[0_0_60px_rgba(251,191,36,0.6)] z-20"
                        >
                          <div className="text-6xl mb-2 animate-bounce">👑</div>
                          <span className="text-sm font-mono uppercase text-amber-400 font-black tracking-widest mb-1">
                            {t("quiz.podium1st")}
                          </span>
                          <h2 className="text-4xl font-black text-white mb-3 truncate w-full">{first.nickname}</h2>
                          <div className="text-4xl font-black text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]">
                            {first.total_score} {t("quiz.pts")}
                          </div>
                        </motion.div>
                      )}

                      {/* 3rd Place */}
                      {third && (
                        <motion.div 
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="flex-1 max-w-xs bg-gradient-to-b from-amber-900/20 to-black/80 border-2 border-amber-700 p-6 rounded-2xl flex flex-col items-center shadow-[0_0_30px_rgba(180,83,9,0.3)]"
                        >
                          <div className="text-4xl mb-2">🥉</div>
                          <span className="text-xs font-mono uppercase text-amber-600 font-bold tracking-widest mb-1">
                            {t("quiz.podium3rd")}
                          </span>
                          <h3 className="text-2xl font-black text-white mb-2 truncate w-full">{third.nickname}</h3>
                          <div className="text-2xl font-black text-amber-600">{third.total_score} {t("quiz.pts")}</div>
                        </motion.div>
                      )}
                    </div>
                  );
                })()}

                <button
                  onClick={resetGame}
                  className="px-14 py-5 border-2 border-white/40 text-white hover:bg-white hover:text-black font-black text-2xl uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                >
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
