import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { db } from "../../../lib/firebase";
import { doc, updateDoc, runTransaction } from "firebase/firestore";
import { useToast } from "../../../contexts/ToastContextCore";
import { NeonIcon } from "../../../components/NeonIcon";
import { useLocale } from "../../../hooks/useLocale";

interface Props {
  room: Room;
  player: Player;
}

export function PlayerSensorController({ room, player }: Props) {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const { t } = useLocale();

  useEffect(() => {
    if (room.status === "sensor_active") {
      setAnswer("");
      setIsSubmitting(false);
    }
  }, [room.status]);

  const handleBuzz = async () => {
    if (room.status !== "sensor_active" || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Optimistic UI vibration - Heavy impact
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    
    try {
      const roomRef = doc(db, "rooms", room.id);
      
      await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) throw new Error("Oda bulunamadı!");

        const data = roomDoc.data();
        if (data.status !== "sensor_active") {
          throw new Error("Geç kaldın!"); // Someone else buzzed first
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
      } else if (err instanceof Error && err.message === "Geç kaldın!") {
        // Light buzz to signify failure to be first
        if (navigator.vibrate) navigator.vibrate([50]);
      }
    } finally {
      setTimeout(() => setIsSubmitting(false), 500);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting) return;

    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (room.status === "lobby") {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10 relative"
        >
          <div className="bg-white/5 border border-white/10 p-12 rounded-3xl backdrop-blur-xl">
            <NeonIcon type="rocket" color="pink" className="w-24 h-24 mb-8 opacity-50 mx-auto" />
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-4 uppercase tracking-widest">
              {t("sensor.title" as never) || "SENSÖR"}
            </h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
              {t("sensor.watchMainScreen" as never) || "Ana Ekranı Takip Edin"}
            </p>
          </div>
        </motion.div>
      );
    }

    if (room.status === "sensor_intro") {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10 relative"
        >
          <NeonIcon type="rocket" color="pink" className="w-24 h-24 mb-8 animate-pulse mx-auto shadow-[0_0_50px_rgba(168,85,247,0.5)] rounded-full" />
          <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-[0.2em] drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">
            {t("sensor.getReady")}
          </h2>
          <p className="text-purple-300 font-bold uppercase tracking-widest text-lg">
            {t("sensor.beFirst")}
          </p>
        </motion.div>
      );
    }

    if (room.status === "sensor_active") {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative"
        >
          {/* Animated rings around the button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              className="absolute w-64 h-64 rounded-full border border-red-500/50"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9, backgroundColor: "#991b1b" }}
            onClick={handleBuzz}
            className="relative z-10 w-64 h-64 rounded-full bg-red-600 border-8 border-red-800 shadow-[0_0_100px_rgba(220,38,38,0.8)] flex flex-col items-center justify-center group overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="text-5xl font-black text-white uppercase tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
              {t("sensor.buzz")}
            </span>
          </motion.button>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md"
          >
            <p className="text-red-400 font-bold uppercase tracking-widest animate-pulse">
              {t("sensor.pressIfYouKnow")}
            </p>
          </motion.div>
        </motion.div>
      );
    }

    if (room.status === "sensor_buzzed") {
      const isMe = room.sensor_buzzer_player_id === player.id;

      if (isMe) {
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative w-full max-w-md mx-auto"
          >
            <div className="bg-green-500/10 border border-green-500/30 p-8 rounded-3xl w-full backdrop-blur-xl flex flex-col items-center">
              <h2 className="text-4xl font-black text-green-400 mb-4 uppercase tracking-[0.2em] drop-shadow-[0_0_15px_rgba(74,222,128,0.5)] text-center">
                {t("sensor.yourTurn")}
              </h2>
              <p className="text-green-100/70 font-bold uppercase tracking-widest text-sm mb-8 text-center">
                {t("sensor.writeAndSend")}
              </p>
              
              <form onSubmit={handleSubmitAnswer} className="w-full flex flex-col gap-6">
                <input 
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={t("sensor.answerPlaceholder")}
                  className="w-full bg-black/60 border-2 border-green-500/50 p-6 text-3xl font-black text-center text-white placeholder-white/20 focus:border-green-400 focus:shadow-[0_0_30px_rgba(74,222,128,0.3)] focus:outline-none rounded-2xl transition-all uppercase"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !answer.trim()}
                  className="w-full py-5 bg-green-500 text-black font-black uppercase tracking-[0.3em] rounded-xl hover:bg-green-400 disabled:opacity-30 disabled:hover:bg-green-500 transition-all active:scale-95 shadow-[0_0_20px_rgba(74,222,128,0.4)]"
                >
                  {t("sensor.send")}
                </button>
              </form>
            </div>
          </motion.div>
        );
      }

      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center p-8 z-10 relative text-center"
        >
          <div className="bg-red-500/10 border border-red-500/20 p-12 rounded-3xl backdrop-blur-xl">
            <NeonIcon type="settings" color="red" className="w-24 h-24 mb-8 opacity-80 mx-auto" />
            <h2 className="text-4xl font-black text-red-500 mb-4 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              {t("sensor.locked")}
            </h2>
            <p className="text-red-200/70 font-bold uppercase tracking-widest">
              {t("sensor.someoneElseBuzzed")}
            </p>
          </div>
        </motion.div>
      );
    }

    if (room.status === "sensor_reveal") {
      const isMe = room.sensor_buzzer_player_id === player.id;
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center p-8 z-10 relative text-center"
        >
          <div className="bg-white/5 border border-white/10 p-12 rounded-3xl backdrop-blur-xl w-full">
            {isMe ? (
              <>
                <NeonIcon type="crown" color="gold" className="w-28 h-28 mb-8 mx-auto shadow-[0_0_30px_rgba(250,204,21,0.5)] rounded-full" />
                <h2 className="text-5xl font-black text-yellow-400 mb-6 uppercase tracking-widest drop-shadow-md">
                  {t("sensor.congrats")}
                </h2>
                <div className="bg-yellow-500/20 py-3 px-6 rounded-full inline-block">
                  <p className="text-yellow-200 font-bold uppercase tracking-widest">
                    {t("sensor.correctWonPoints")}
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-widest">
                  {t("sensor.imageRevealed")}
                </h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest">
                  {t("sensor.getReadyNextRound")}
                </p>
              </>
            )}
          </div>
        </motion.div>
      );
    }

    if (room.status === "finished") {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center p-8 z-10 relative text-center"
        >
          <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-6 uppercase tracking-widest">
            {t("sensor.gameOver")}
          </h2>
          <div className="bg-white/10 px-8 py-4 rounded-full backdrop-blur-md">
            <p className="text-white font-bold uppercase tracking-widest">
              {t("sensor.resultsOnScreen", "Sonuçlar Ekranda!")}
            </p>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6 mx-auto" />
        <p className="text-gray-400 uppercase tracking-[0.3em] font-bold">{t("game.loading" as never) || "YÜKLENİYOR..."}</p>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 bg-black flex flex-col overflow-hidden">
      {/* Universal Background for Player Sensor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,rgba(0,0,0,1)_100%)]" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={room.status}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
