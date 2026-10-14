import { motion, AnimatePresence } from "framer-motion";
import { ParticleBackground } from "../../../components/ParticleBackground";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { KineticSpark } from "../../../components/KineticSpark";
import { DURATION, EASE } from "../../../lib/motion";
import type { useHostRoom } from "../../../hooks/useHostRoom";
import type { RoomStatus } from "../../../types/database";
import { HostHeader } from "../components/HostHeader";
import { HostLobby } from "../views/HostLobby";
import { HostIntro } from "../views/HostIntro";
import { HostPlaying } from "../views/HostPlaying";
import { HostReview } from "../views/HostReview";
import { HostStandings } from "../views/HostStandings";
import { HostPodium } from "../views/HostPodium";
import { HostAdBreak } from "../views/HostAdBreak";
import { HostTutorial } from "../components/HostTutorial";
import { DatabaseStatus } from "../../../components/DatabaseStatus";
import { EmojiRain } from "../../../components/EmojiRain";
import { LetterSpinner } from "../../../components/LetterSpinner";
import { useClassicGame } from "./useClassicGame";

/**
 * Klasik harf oyunu (HENGAME ARENA) — TV ekranı. Durum ve akış
 * useClassicGame'de; bu bileşen yalnızca durum başına ekranı çizer
 * (docs/roadmap.md, 2.7).
 */
export function HostDisplayGame(props: { roomId: string | null } & ReturnType<typeof useHostRoom>) {
  const { roomId, room, players, submittedPlayerIds, updateRoomStatus } = props;
  const {
    awards,
    currentLetter,
    gameState,
    handleEndGameEarly,
    handleGameIntroComplete,
    handleSpinnerComplete,
    handleTutorialComplete,
    isAnalyzing,
    nextLetter,
    nextStep,
    playerStats,
    proceedFromStandings,
    resetGame,
    roundResults,
    setGameState,
    startGame,
    tensionRatio,
    timeLeft,
    toggleAnswerValidity,
  } = useClassicGame(props);

  return (
    <TVScaleFrame>
    <div
      // Not: eskiden son 10 saniye boyunca tüm TV `animate-shake` ile
      // titriyordu. Sarsıntı artık HostPlaying'de, yalnızca süre bittiği anda,
      // tek seferlik (oyun "juice" kuralı: sarsıntı noktalama işaretidir).
      className="w-full h-full flex flex-col p-8 overflow-hidden"
      data-tension={
        tensionRatio > 0.8 ? "high" : tensionRatio > 0.5 ? "medium" : "low"
      }
    >
      <ParticleBackground
        speedMultiplier={gameState === "playing" && timeLeft <= 10 ? 5 : 1}
      />
      {/* TV Cyberpunk Vignette & Scanlines */}
      <div className="tv-cyber-vignette fixed inset-0 z-40 pointer-events-none" />
      <div className="tv-scanlines fixed inset-0 z-40 pointer-events-none opacity-25" />
      {gameState !== "intro" && gameState !== "gameIntro" && gameState !== "ad_break" && (
        <HostHeader 
          room={room} 
          onEndGameEarly={handleEndGameEarly} 
          onReturnToLobby={() => updateRoomStatus("night_lobby", { active_game: "none" })}
          onTriggerAdBreak={() => {
            updateRoomStatus("ad_break", { ad_break_next_state: "lobby" }).then(() => setGameState("ad_break"));
          }}
        />
      )}

      <div className="flex-1 flex justify-center items-center relative w-full h-full min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {gameState === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              // Tam ekran bir elemanda blur(40px) çıkışı her karede
              // 1920×1080'lik yeniden boyama demekti; ölçek + opaklık aynı
              // "uzaklaşarak kaybolma" hissini compositor'da verir.
              exit={{ opacity: 0, scale: 1.08 }}
              transition={{ duration: DURATION.cinematic, ease: EASE.in }}
              className="bg-black fixed inset-0 z-[100] flex items-center justify-center overflow-hidden noise-suppression"
            >
              <div className="relative w-full max-w-7xl flex flex-col items-center justify-center">
                <KineticSpark delay={0.5} />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.1, 0.05, 0.15] }}
                  transition={{
                    delay: 2,
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "mirror",
                  }}
                  className="absolute inset-0 bg-alaz-orange/10 blur-[150px] -z-10 rounded-full"
                />
              </div>
            </motion.div>
          )}

          {gameState === "lobby" && (
            <HostLobby
              room={room}
              players={players}
              onStartGame={startGame}
              onUpdateCategories={(cats) =>
                updateRoomStatus("lobby", { categories: cats })
              }
            />
          )}

          {gameState === "tutorial" && (
            <HostTutorial room={room!} onComplete={handleTutorialComplete} />
          )}

          {gameState === "gameIntro" && (
            <HostIntro players={players} onComplete={handleGameIntroComplete} />
          )}

          {gameState === "countdown" && (
            <LetterSpinner
              targetLetter={nextLetter}
              onComplete={handleSpinnerComplete}
            />
          )}

          {gameState === "playing" && (
            <HostPlaying
              currentLetter={currentLetter}
              timeLeft={timeLeft}
              maxTime={room?.timer_setting}
              categories={room?.categories || []}
              submittedPlayerIds={submittedPlayerIds}
              playersCount={players.length}
              currentRound={room?.current_round}
            />
          )}

          {gameState === "review" && (
            <HostReview
              room={room}
              isAnalyzing={isAnalyzing}
              roundResults={roundResults}
              players={players}
              currentLetter={currentLetter}
              onToggleAnswer={toggleAnswerValidity}
              onNextStep={nextStep}
            />
          )}

          {gameState === "standings" && (
            <HostStandings
              room={room}
              players={players}
              roundResults={roundResults}
              onNextStep={proceedFromStandings}
            />
          )}

          {gameState === "finished" && (
            <HostPodium
              room={room}
              players={players}
              playerStats={playerStats}
              awards={awards}
              onResetGame={resetGame}
            />
          )}

          {gameState === "ad_break" && (
            <HostAdBreak 
              onComplete={() => {
                const next = room?.ad_break_next_state || "lobby";
                updateRoomStatus(next).then(() => setGameState(next as RoomStatus));
              }} 
            />
          )}
        </AnimatePresence>
      </div>

      {(gameState === "review" || gameState === "standings" || gameState === "finished") && roomId && (
        <EmojiRain roomId={roomId} />
      )}

      <DatabaseStatus />
    </div>
    </TVScaleFrame>
  );
}
