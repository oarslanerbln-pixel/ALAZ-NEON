import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { db } from "../../../lib/firebase";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useToast } from "../../../contexts/ToastContextCore";
import { useLocale } from "../../../hooks/useLocale";

interface Props {
  room: Room;
  player: Player;
}

export function PlayerEchoController({ room, player }: Props) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const { showToast } = useToast();
  const { t } = useLocale();
  

  // Reset local state when round changes
  useEffect(() => {
    if (room.status === "echo_intro" || room.status === "echo_active") {
      const myVote = room.echo_votes?.[player.id];
      setHasVoted(!!myVote);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [room.status, room.echo_votes, player.id]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const q = query(collection(db, "players"), where("room_id", "==", room.id));
        const snap = await getDocs(q);
        const pList = snap.docs.map(d => d.data() as Player);
        
        const now = Date.now();
        setPlayers(pList.filter(p => 
          p.id !== player.id &&
          (p.last_active ? (now - p.last_active < 30000) : true)
        )); // Exclude self and ghosts
      } catch (err) {
        console.error("Error fetching players:", err);
      }
    };
    fetchPlayers();
  }, [room.id, player.id]);

  const handleVote = async (targetId: string) => {
    if (hasVoted || isSubmittingRef.current || room.status !== "echo_active") return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    try {
      const roomRef = doc(db, "rooms", room.id);
      await updateDoc(roomRef, {
        [`echo_votes.${player.id}`]: targetId
      });
      setHasVoted(true);
    } catch (err) {
      console.error(err);
      showToast(t("game.submitError", "Oy gönderilemedi!"), "error");
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (room.status === "echo_intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-widest">
          Soru Geliyor
        </h2>
        <p className="text-gray-400 uppercase tracking-widest font-bold animate-pulse">
          Ana Ekranı Takip Et
        </p>
      </div>
    );
  }

  if (room.status === "echo_active") {
    if (hasVoted) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mb-6"
          >
            <span className="text-4xl">✓</span>
          </motion.div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">
            Oy Kaydedildi
          </h2>
          <p className="text-gray-400 font-medium">
            Diğerlerinin oyları bekleniyor...
          </p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-start pt-6 pb-24 px-4 relative z-10 w-full max-w-lg mx-auto">
        <h3 className="text-xs text-alaz-orange uppercase tracking-[0.3em] font-bold mb-6 text-center w-full">
          Birini Seç
        </h3>
        
        <div className="w-full flex flex-col gap-3">
          <AnimatePresence>
            {players.map((p, i) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleVote(p.id)}
                disabled={isSubmitting}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-center justify-between backdrop-blur-md hover:bg-white/[0.08] hover:border-white/30 active:scale-95 transition-all group overflow-hidden relative"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#ff003c] to-alaz-orange opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-white font-bold tracking-widest uppercase ml-2">
                  {p.nickname}
                </span>
                <span className="w-6 h-6 rounded-full border border-white/20 group-hover:border-alaz-orange/50 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-alaz-orange opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (room.status === "echo_reveal") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-[0.3em]">
          Sonuçlar Ekranda
        </h2>
        <p className="text-alaz-orange font-bold uppercase tracking-widest">
          Yukarıya Bak!
        </p>
      </div>
    );
  }

  // Fallback for transitional states (e.g., lobby)
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-black p-6 text-center">
      <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin mx-auto mb-4" />
      <p className="text-white/50 font-bold uppercase tracking-widest">{t("common.loading", "Yükleniyor...")}</p>
    </div>
  );
}
