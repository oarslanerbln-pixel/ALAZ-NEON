import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { db } from "../../../lib/firebase";
import { doc, updateDoc, runTransaction } from "firebase/firestore";
import { useToast } from "../../../contexts/ToastContextCore";
import { useLocale } from "../../../hooks/useLocale";
import { haptics } from "../../../lib/haptics";
import { SoundManager, sounds } from "../../../lib/audio";

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
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10">
          <div className="text-7xl mb-4 animate-bounce">👁️</div>
          <h2 className="text-3xl font-black text-purple-400 mb-2 uppercase tracking-widest">
            SENSÖR
          </h2>
          <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">
            {t("sensor.watchMainScreen" as never) || "Ana Ekranı Takip Edin"}
          </p>
        </div>
      );
    }

    if (room.status === "sensor_intro") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10">
          <div className="text-7xl mb-4 animate-pulse">⚡</div>
          <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-wider">
            {t("sensor.getReady")}
          </h2>
          <p className="text-purple-300 font-mono text-sm uppercase tracking-widest">
            {t("sensor.beFirst")}
          </p>
        </div>
      );
    }

    if (room.status === "sensor_active") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-sm mx-auto">
          {/* Animated Pulsating Neon Buzzer */}
          <div className="relative flex items-center justify-center my-6">
            <motion.div
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              className="absolute -inset-10 rounded-full border-2 border-red-500/60 pointer-events-none"
            />
            
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleBuzz}
              className="w-64 h-64 rounded-full bg-gradient-to-b from-red-500 to-red-800 border-4 border-red-400 shadow-[0_0_60px_rgba(239,68,68,0.8)] flex flex-col items-center justify-center active:brightness-125 transition-all"
            >
              <span className="text-5xl mb-2">🚨</span>
              <span className="text-4xl font-black text-white uppercase tracking-widest drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                BUZZER!
              </span>
            </motion.button>
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
                  className="w-full bg-black/80 border-2 border-emerald-400/80 p-4 text-2xl font-black text-center text-white placeholder-white/20 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 rounded-2xl uppercase"
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
            <span className="text-6xl mb-4 block animate-spin">🔒</span>
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
                <span className="text-7xl mb-4 block">👑</span>
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
        <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 text-center">
          <span className="text-7xl mb-4 block">🏆</span>
          <h2 className="text-3xl font-black text-purple-400 mb-2 uppercase tracking-wider">
            {t("sensor.gameOver")}
          </h2>
          <p className="text-gray-400 font-mono text-xs">
            {t("sensor.resultsOnScreen", "Sonuçlar Ekranda!")}
          </p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 text-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">{t("game.loading" as never) || "YÜKLENİYOR..."}</p>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 bg-[#080010] flex flex-col overflow-hidden text-white">
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
