import { useState } from "react";
import { motion } from "framer-motion";
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

  const handleBuzz = async () => {
    if (room.status !== "sensor_active" || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Optimistic UI vibration
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    
    try {
      const roomRef = doc(db, "rooms", room.id);
      
      await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) {
          throw new Error("Oda bulunamadı!");
        }

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
      }
    } finally {
      // Small cooldown before allowing another click if transaction failed
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

  if (room.status === "sensor_intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 relative">
        <NeonIcon type="rocket" color="pink" className="w-20 h-20 mb-6 animate-pulse" />
        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">
          {t("sensor.getReady")}
        </h2>
        <p className="text-gray-400 font-medium">
          {t("sensor.beFirst")}
        </p>
      </div>
    );
  }

  if (room.status === "sensor_active") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleBuzz}
          className="w-64 h-64 rounded-full bg-red-600 border-8 border-red-800 shadow-[0_0_100px_rgba(220,38,38,0.8)] flex items-center justify-center"
        >
          <span className="text-4xl font-black text-white uppercase tracking-widest drop-shadow-md">
            {t("sensor.buzz")}
          </span>
        </motion.button>
        <p className="mt-12 text-gray-400 font-bold uppercase tracking-widest animate-pulse">
          {t("sensor.pressIfYouKnow")}
        </p>
      </div>
    );
  }

  if (room.status === "sensor_buzzed") {
    const isMe = room.sensor_buzzer_player_id === player.id;

    if (isMe) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative">
          <h2 className="text-3xl font-black text-green-500 mb-2 uppercase tracking-widest">
            {t("sensor.yourTurn")}
          </h2>
          <p className="text-gray-400 font-medium mb-8">
            {t("sensor.writeAndSend")}
          </p>
          
          <form onSubmit={handleSubmitAnswer} className="w-full max-w-sm flex flex-col gap-4">
            <input 
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t("sensor.answerPlaceholder")}
              className="w-full bg-black/60 border-2 border-green-500/50 p-6 text-2xl text-center text-white focus:border-green-500 focus:outline-none rounded-xl"
              autoFocus
            />
            <button
              type="submit"
              disabled={isSubmitting || !answer.trim()}
              className="w-full py-4 bg-green-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-green-500 disabled:opacity-50"
            >
              {t("sensor.send")}
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative text-center">
        <NeonIcon type="settings" color="pink" className="w-20 h-20 mb-6 opacity-50" />
        <h2 className="text-3xl font-black text-red-500 mb-2 uppercase tracking-widest">
          {t("sensor.locked")}
        </h2>
        <p className="text-gray-400 font-medium">
          {t("sensor.someoneElseBuzzed")}
        </p>
      </div>
    );
  }

  if (room.status === "sensor_reveal") {
    const isMe = room.sensor_buzzer_player_id === player.id;
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative text-center">
        {isMe ? (
          <>
            <NeonIcon type="crown" color="gold" className="w-20 h-20 mb-6" />
            <h2 className="text-4xl font-black text-yellow-500 mb-2 uppercase tracking-widest">
              {t("sensor.congrats")}
            </h2>
            <p className="text-gray-400 font-medium">
              {t("sensor.correctWonPoints")}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">
              {t("sensor.imageRevealed")}
            </h2>
            <p className="text-gray-400 font-medium">
              {t("sensor.getReadyNextRound")}
            </p>
          </>
        )}
      </div>
    );
  }

  return null;
}
