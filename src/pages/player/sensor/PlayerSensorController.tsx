import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { db } from "../../../lib/firebase";
import { doc, updateDoc, runTransaction } from "firebase/firestore";
import { useToast } from "../../../contexts/ToastContextCore";
import { useLocale } from "../../../hooks/useLocale";
import { haptics } from "../../../lib/haptics";
import { SoundManager, sounds } from "../../../lib/audio";
import { gameTitle } from "../../../lib/gameCatalog";
import { PlayerStageScreen } from "../components/PlayerStageScreen";
import { SPRING } from "../../../lib/motion";

interface Props {
  room: Room;
  player: Player;
}

export function PlayerSensorController({ room, player }: Props) {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const { showToast } = useToast();
  const { t } = useLocale();

  useEffect(() => {
    if (room.status === "sensor_active") {
      setAnswer("");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [room.status]);

  const handleBuzz = async () => {
    if (room.status !== "sensor_active" || isSubmittingRef.current) return;
    
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    haptics.impact();
    SoundManager.getInstance().playSFX(sounds.SIREN);
    
    try {
      const roomRef = doc(db, "rooms", room.id);
      
      await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) throw new Error("Oda bulunamadı!");

        const data = roomDoc.data();
        if (data.status !== "sensor_active") {
          throw new Error("Geç kaldın!");
        }

        transaction.update(roomRef, {
          status: "sensor_buzzed",
          sensor_buzzer_player_id: player.id,
          sensor_buzzer_timestamp: Date.now()
        });
      });
    } catch (err) {
      console.error(err);
      if (err instanceof Error && err.message !== "Geç kaldın!") {
        showToast(t("sensor.toastError"), "error");
      } else {
        haptics.tap();
      }
    } finally {
      setTimeout(() => {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }, 400);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    haptics.tap();
    SoundManager.getInstance().playSFX(sounds.SUCCESS);

    try {
      const roomRef = doc(db, "rooms", room.id);
      await updateDoc(roomRef, {
        sensor_player_answer: answer.trim()
      });
      setAnswer("");
    } catch (err) {
      console.error(err);
      showToast(t("sensor.toastSubmitFailed"), "error");
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (room.status === "lobby") {
      return (
        <PlayerStageScreen icon="👁️" tone="purple" eyebrow={gameTitle("sensor")} title={t("lobby.readyTitle")} waiting />
      );
    }

    if (room.status === "sensor_intro") {
      return (
        <PlayerStageScreen icon="⚡" tone="purple" eyebrow={gameTitle("sensor")} title={t("sensor.getReady")} body={t("sensor.beFirst")} waiting />
      );
    }

    if (room.status === "sensor_active") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-sm mx-auto">
          {/* Top Status Header */}
          <div className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/40 bg-purple-950/40 text-purple-300 font-mono tracking-widest text-xs uppercase font-bold shadow-lg">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span>HENGAME SENSÖR</span>
          </div>

          {/* 3D Physical Arcade Dome Buzzer Button */}
          <div className="relative flex items-center justify-center my-4">
            {/* Concentric Radar Waves */}
            <motion.div
              animate={{ scale: [1, 1.35], opacity: [0.65, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              className="absolute -inset-8 rounded-full border-2 border-red-500/60 pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1, 1.55], opacity: [0.4, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              className="absolute -inset-14 rounded-full border border-red-400/40 pointer-events-none"
            />

            {/* Outer Knurled Metal Bezel Base */}
            <div className="w-64 h-64 max-w-[72vw] max-h-[72vw] rounded-full p-3.5 bg-gradient-to-b from-neutral-700 via-neutral-900 to-black shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_50px_rgba(239,68,68,0.4)] border-4 border-neutral-600 flex items-center justify-center">
              {/* Inset Housing Rim */}
              <div className="w-full h-full rounded-full p-2 bg-gradient-to-t from-neutral-800 to-neutral-950 shadow-inner flex items-center justify-center">
                {/* 3D Convex Dome Button */}
                <motion.button
                  whileTap={{ scale: 0.93, y: 6 }}
                  onClick={handleBuzz}
                  transition={SPRING.stiff}
                  className="w-full h-full rounded-full relative overflow-hidden flex flex-col items-center justify-center shadow-[inset_0_-8px_16px_rgba(0,0,0,0.6),0_8px_25px_rgba(239,68,68,0.7)] active:brightness-110 select-none border-2 border-red-400/80"
                  style={{
                    background: "radial-gradient(circle at 50% 30%, #ff4d4d 0%, #dc2626 55%, #7f1d1d 100%)",
                  }}
                >
                  {/* Glossy Top Specular Highlight Crescent */}
                  <div
                    className="absolute top-2 inset-x-8 h-1/3 rounded-full opacity-50 pointer-events-none"
                    style={{
                      background: "linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 100%)",
                    }}
                  />

                  <span className="text-4xl md:text-5xl mb-1 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">🚨</span>
                  <span className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                    BUZZER!
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
          
          <p className="text-red-400 text-xs font-mono font-bold uppercase tracking-widest text-center mt-6 animate-pulse">
            {t("sensor.pressIfYouKnow")}
          </p>
        </div>
      );
    }

    if (room.status === "sensor_buzzed") {
      const isMe = room.sensor_buzzer_player_id === player.id;

      if (isMe) {
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-sm mx-auto">
            <div className="bg-emerald-950/80 border-2 border-emerald-500 p-6 rounded-3xl w-full backdrop-blur-xl flex flex-col items-center shadow-[0_0_40px_rgba(16,185,129,0.4)]">
              <span className="text-5xl mb-2">🎯</span>
              <h2 className="text-2xl font-black text-emerald-400 mb-1 uppercase tracking-wider text-center">
                {t("sensor.yourTurn")}
              </h2>
              <p className="text-emerald-200/80 font-mono text-xs uppercase tracking-widest mb-6 text-center">
                {t("sensor.writeAndSend")}
              </p>
              
              <form onSubmit={handleSubmitAnswer} className="w-full flex flex-col gap-4">
                <input 
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={t("sensor.answerPlaceholder")}
                  // Yer tutucu 2xl büyük harfle 375px'te kesiliyordu ("WAS IST DEINE ANT…").
                  className="w-full bg-black/80 border-2 border-emerald-400/80 p-4 text-2xl placeholder:text-base placeholder:font-bold font-black text-center text-white placeholder-white/30 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 rounded-2xl uppercase"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !answer.trim()}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-wider text-lg rounded-xl disabled:opacity-40 transition-all active:scale-95 shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                >
                  {t("sensor.send")}
                </button>
              </form>
            </div>
          </div>
        );
      }

      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 text-center">
          <div className="bg-red-950/40 border border-red-500/30 p-8 rounded-3xl backdrop-blur-xl max-w-xs w-full">
            {/* Eskiden kilit sonsuza dek dönüyordu; artık kapanıyormuş gibi
                bir kez sallanıp duruyor. */}
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, rotate: [0, -14, 12, -6, 0] }}
              transition={{ ...SPRING.bouncy, rotate: { duration: 0.5, delay: 0.1 } }}
              className="text-6xl mb-4 block"
              aria-hidden="true"
            >
              🔒
            </motion.span>
            <h2 className="text-2xl font-black text-red-500 mb-2 uppercase tracking-wider">
              {t("sensor.locked")}
            </h2>
            <p className="text-gray-300 font-mono text-xs">
              {t("sensor.someoneElseBuzzed")}
            </p>
          </div>
        </div>
      );
    }

    if (room.status === "sensor_reveal") {
      const isMe = room.sensor_buzzer_player_id === player.id;
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 text-center">
          <div className="bg-white/5 border border-white/15 p-8 rounded-3xl backdrop-blur-xl w-full max-w-xs">
            {isMe ? (
              <>
                <motion.span
                  initial={{ scale: 0.3, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={SPRING.bouncy}
                  className="text-7xl mb-4 block"
                  aria-hidden="true"
                >
                  👑
                </motion.span>
                <h2 className="text-3xl font-black text-amber-400 mb-2 uppercase tracking-wider">
                  {t("sensor.congrats")}
                </h2>
                <span className="text-xs font-mono text-amber-200 uppercase tracking-widest bg-amber-500/20 px-4 py-1.5 rounded-full inline-block">
                  {t("sensor.correctWonPoints")}
                </span>
              </>
            ) : (
              <>
                <span className="text-6xl mb-4 block">🖼️</span>
                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">
                  {t("sensor.imageRevealed")}
                </h2>
                <p className="text-gray-400 font-mono text-xs">
                  {t("sensor.getReadyNextRound")}
                </p>
              </>
            )}
          </div>
        </div>
      );
    }

    if (room.status === "finished") {
      return (
        <PlayerStageScreen icon="🏆" tone="amber" eyebrow={gameTitle("sensor")} title={t("sensor.gameOver")} hint={t("sensor.resultsOnScreen")} />
      );
    }

    return (
      <PlayerStageScreen icon="👁️" tone="purple" eyebrow={gameTitle("sensor")} title={t("common.loadingDots")} waiting hint={null} />
    );
  };

  return (
    <div className="absolute inset-0 bg-[#080010] flex flex-col overflow-hidden text-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,transparent_70%)] pointer-events-none" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={room.status}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
