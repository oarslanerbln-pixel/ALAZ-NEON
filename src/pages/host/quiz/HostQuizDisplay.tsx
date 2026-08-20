import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs, doc, writeBatch, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { ParticleBackground } from "../../../components/ParticleBackground";
import { SoundManager, sounds } from "../../../lib/audio";
import { getQuizQuestions } from "../../../lib/quizQuestions";
import { toMillis } from "../../../lib/timestamps";

import type { Answer } from "../../../types/database";

import { HostQuizIntro } from "./views/HostQuizIntro";
import { HostHeader } from "../components/HostHeader";
import { HostLobby } from "../views/HostLobby";
import { HostTutorial } from "../components/HostTutorial";

import type { Room, Player } from "../../../types/database";

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
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");

  const [timeLeft, setTimeLeft] = useState(room?.timer_setting || 30);
  const [roundEndTime, setRoundEndTime] = useState<number | null>(null);

  // Soru bitişi iki bağımsız tetikleyiciden gelebiliyor: sürenin dolması VE
  // "herkes cevapladı" dinleyicisi. İkisi aynı anda tetiklenirse endQuestion
  // iki kez çalışıp aynı soru için puanı iki kez dağıtabiliyordu. Bu ref
  // aynı soru için ikinci çağrıyı engelliyor; yeni soru başlarken sıfırlanır.
  const endingQuestionRef = useRef(false);

  // Derive game state directly from room.status — single source of truth, no sync bugs
  const rawStatus = room?.status || "quiz_lobby";
  const gameState =
    rawStatus === "lobby" ? "quiz_lobby" :
    rawStatus === "tutorial" ? "tutorial" :
    rawStatus.startsWith("quiz_") || rawStatus.startsWith("question_") || rawStatus === "finished"
      ? rawStatus
      : "quiz_lobby";

  const currentQuestion = room?.quiz_questions?.[room?.current_question_index ?? 0] ?? null;

  const startGame = async () => {
    if (!roomId || !room) return;
    
    // Temiz bir başlangıç için eski cevapları temizle
    try {
      const q = query(collection(db, "answers"), where("room_id", "==", roomId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.forEach(docSnap => batch.delete(docSnap.ref));
        await batch.commit();
      }
    } catch (e) {
      console.warn("Could not delete old answers (possibly missing permissions):", e);
    }

    const questions = getQuizQuestions(room.locale, room.total_rounds);

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
    
    await updateRoomStatus("question_active", {
      time_left: timeToAnswer
    });

    endingQuestionRef.current = false;
    setTimeLeft(timeToAnswer);
    setRoundEndTime(Date.now() + timeToAnswer * 1000);
  };

  const endQuestion = useCallback(async () => {
    if (!roomId || !room) return;
    // Reentrancy guard: timer expiry and the "everyone answered" listener can
    // both fire within the same tick. Without this, both branches would
    // fetch the same answers and award the same points twice.
    if (endingQuestionRef.current) return;
    if (room.status !== "question_active") return;
    endingQuestionRef.current = true;

    SoundManager.getInstance().stopSound(sounds.GAME_PULSE);
    SoundManager.getInstance().playSFX(sounds.SIREN);

    await updateRoomStatus("question_reveal");

    // Give players 1.5 seconds to auto-submit their final answers if they haven't
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Fetch answers
    // In quiz mode, round_letter is just the question index as string
    const questionIndexStr = room.current_question_index?.toString() || "0";
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
    
    // Calculate points
    const currentQ = room.quiz_questions?.[room.current_question_index || 0];
    if (!currentQ) return;
    
    const correctOption = currentQ.correctOption;
    
    // Sort answers by time to give speed bonus
    answers.sort((a, b) => toMillis(a.created_at) - toMillis(b.created_at));
    
    let speedBonusIndex = 0;
    const processedPlayers = new Set<string>();

    for (let i = 0; i < answers.length; i++) {
      const ans = answers[i];
      
      // Prevent double scoring if a player sent multiple answers somehow
      if (processedPlayers.has(ans.player_id)) continue;
      processedPlayers.add(ans.player_id);

      const playerSelected = ans.data.selectedOption;
      
      if (playerSelected === correctOption) {
        // Correct!
        // 1000 points base + speed bonus (500 for first, 300 for second, etc)
        let pts = 1000;
        if (speedBonusIndex === 0) pts += 500;
        else if (speedBonusIndex === 1) pts += 300;
        else if (speedBonusIndex === 2) pts += 100;
        
        speedBonusIndex++; // Only increment for correct answers!
        
        const playerInfo = players.find(p => p.id === ans.player_id);
        if (playerInfo) {
          await updatePlayerScore(ans.player_id, playerInfo.total_score + pts);
        }
      }
    }
  }, [roomId, room, players, updateRoomStatus, updatePlayerScore]);

  // Timer logic
  useEffect(() => {
    if (gameState === "question_active") {
      const interval = setInterval(() => {
        if (!roundEndTime) return;
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((roundEndTime - now) / 1000));
        setTimeLeft(remaining);

        if (remaining === 0) {
          clearInterval(interval);
          endQuestion();
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [gameState, roundEndTime, endQuestion]);

  // Listen for all players answering to end question early
  useEffect(() => {
    if (gameState === "question_active" && roomId && players.length > 0) {
      let hasEnded = false;
      const questionIndexStr = room.current_question_index?.toString() || "0";
      const q = query(
        collection(db, "answers"),
        where("room_id", "==", roomId),
        where("round_letter", "==", questionIndexStr)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!hasEnded && snapshot.size >= players.length) {
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
    if (nextIndex >= room.total_rounds) {
      await updateRoomStatus("finished");
    } else {
      await updateRoomStatus("question_intro", {
        current_question_index: nextIndex,
        current_round: nextIndex + 1
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

    // Delete all previous answers for this room
    const q = query(collection(db, "answers"), where("room_id", "==", roomId));
    const snapshot = await getDocs(q);
    snapshot.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
    await updateRoomStatus("quiz_lobby", { current_round: 0, current_question_index: 0 });
  };


  return (
    <div className="flex-1 flex flex-col p-8 h-screen overflow-hidden">
      <ParticleBackground speedMultiplier={gameState === "question_active" && timeLeft <= 5 ? 5 : 1} />
      
      {gameState === "question_active" && timeLeft <= 5 && (
        <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none z-0" />
      )}

      <HostHeader room={room} onEndGameEarly={() => updateRoomStatus("finished")} />

      <div className="flex-1 flex items-center justify-center relative w-full z-10 mt-10">
        <AnimatePresence mode="wait">
          
          {gameState === "quiz_lobby" && (
            <motion.div
              key="quiz_lobby"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="w-full flex flex-col items-center"
            >
              <h1 className="text-6xl font-black text-blue-500 tracking-widest uppercase mb-10 drop-shadow-[0_0_30px_rgba(59,130,246,0.8)]">
                HENGAME QUIZ
              </h1>
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

          {gameState === "tutorial" && (
            <HostTutorial room={room} onComplete={handleTutorialComplete} />
          )}

          {gameState === "quiz_intro" && (
            <HostQuizIntro onComplete={onIntroComplete} />
          )}

          {gameState === "question_intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center w-full max-w-5xl text-center"
            >
              <h2 className="text-2xl text-blue-400 font-black tracking-[0.3em] uppercase mb-10">
                SORU {room.current_round} / {room.total_rounds}
              </h2>
              {!currentQuestion ? (
                <div className="text-white/50 text-2xl animate-pulse">Yükleniyor...</div>
              ) : (
                <>
                  <div className="bg-black/60 border border-blue-500/30 p-16 w-full shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                      {currentQuestion.text}
                    </h1>
                  </div>
                  <button
                    onClick={startQuestionTimer}
                    className="mt-16 px-16 py-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl uppercase tracking-widest shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                  >
                    SÜREYİ BAŞLAT
                  </button>
                </>
              )}
            </motion.div>
          )}


          {gameState === "question_active" && currentQuestion && (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center w-full max-w-7xl"
            >
              {/* Question */}
              <div className="bg-black/80 border border-blue-500/50 p-12 w-full text-center mb-10 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                <h1 className="text-4xl font-black text-white">{currentQuestion.text}</h1>
              </div>

              {/* Timer */}
              <div className={`text-7xl font-black mb-10 tabular-nums ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-blue-400"}`}>
                {timeLeft}
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-8 w-full">
                {(["A", "B", "C", "D"] as const).map(opt => (
                  <div key={opt} className="bg-black/60 border border-white/10 p-8 flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600/20 border border-blue-500 flex items-center justify-center text-3xl font-black text-blue-400">
                      {opt}
                    </div>
                    <div className="text-3xl font-bold text-white text-left flex-1">
                      {currentQuestion.options[opt]}
                    </div>
                  </div>
                ))}
              </div>

              {/* Manual End Button */}
              <div className="mt-12">
                <button
                  onClick={endQuestion}
                  className="px-8 py-3 bg-red-950/80 hover:bg-red-900 border border-red-500/50 hover:border-red-500 text-red-500 font-bold uppercase tracking-widest text-sm transition-all duration-300 rounded-full flex items-center gap-3 group"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 group-hover:animate-ping" />
                  SÜREYİ BİTİR / CEVAPLARA GEÇ
                </button>
              </div>
            </motion.div>
          )}

          {gameState === "question_reveal" && currentQuestion && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center w-full max-w-7xl"
            >
              <h2 className="text-3xl text-white font-black tracking-widest uppercase mb-8">
                DOĞRU CEVAP
              </h2>
              
              <div className="grid grid-cols-2 gap-8 w-full mb-12">
                {(["A", "B", "C", "D"] as const).map(opt => {
                  const isCorrect = currentQuestion.correctOption === opt;
                  return (
                    <div 
                      key={opt} 
                      className={`p-8 flex items-center gap-6 border-2 transition-all duration-1000 ${
                        isCorrect 
                          ? "bg-green-500/20 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.6)] scale-105" 
                          : "bg-black/40 border-white/10 opacity-30"
                      }`}
                    >
                      <div className={`w-16 h-16 flex items-center justify-center text-3xl font-black ${isCorrect ? "bg-green-500 text-black" : "border border-white/20 text-gray-500"}`}>
                        {opt}
                      </div>
                      <div className={`text-3xl font-bold text-left flex-1 ${isCorrect ? "text-green-400" : "text-gray-500"}`}>
                        {currentQuestion.options[opt]}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={showLeaderboard}
                className="px-12 py-5 bg-white text-black hover:bg-gray-200 font-black text-xl uppercase tracking-widest"
              >
                SIRALAMAYI GÖR
              </button>
            </motion.div>
          )}

          {gameState === "quiz_leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center w-full max-w-4xl"
            >
              <h2 className="text-4xl text-alaz-orange font-black tracking-[0.2em] uppercase mb-10">
                GÜNCEL SIRALAMA
              </h2>
              <div className="w-full space-y-4 mb-10">
                {[...players].sort((a,b) => b.total_score - a.total_score).map((p, idx) => (
                  <div key={p.id} className="flex items-center bg-black/60 border border-white/10 p-6">
                    <div className="w-12 h-12 bg-white/10 flex items-center justify-center text-xl font-black text-gray-400 mr-6">
                      #{idx + 1}
                    </div>
                    <div className="text-2xl font-black text-white flex-1">{p.nickname}</div>
                    <div className="text-3xl font-black text-alaz-orange">{p.total_score} <span className="text-sm text-gray-500">PTS</span></div>
                  </div>
                ))}
              </div>
              <button
                onClick={nextQuestion}
                className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl uppercase tracking-widest shadow-[0_0_30px_rgba(59,130,246,0.6)]"
              >
                {room.current_round >= room.total_rounds ? "OYUNU BİTİR" : "SONRAKİ SORU"}
              </button>
            </motion.div>
          )}

          {gameState === "finished" && (
            <motion.div
              key="finished"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center w-full max-w-4xl text-center"
            >
              <h1 className="text-6xl font-black text-alaz-orange mb-4 uppercase drop-shadow-[0_0_30px_rgba(255,77,0,0.8)]">
                ŞAMPİYON
              </h1>
              
              {players.length > 0 && (() => {
                const sorted = [...players].sort((a,b) => b.total_score - a.total_score);
                const winner = sorted[0];
                return (
                  <div className="bg-gradient-to-b from-alaz-orange/20 to-black/60 border border-alaz-orange p-16 w-full mb-12 shadow-[0_0_100px_rgba(255,77,0,0.3)] mt-8">
                    <h2 className="text-7xl font-black text-white mb-6">{winner.nickname}</h2>
                    <div className="text-5xl font-black text-alaz-orange">{winner.total_score} PTS</div>
                  </div>
                );
              })()}

              <button
                onClick={resetGame}
                className="px-12 py-5 border-2 border-white/20 text-white hover:bg-white hover:text-black font-black text-xl uppercase tracking-widest transition-colors"
              >
                YENİ OYUN BAŞLAT
              </button>
            </motion.div>
          )}
          
        </AnimatePresence>
      </div>
    </div>
  );
}
