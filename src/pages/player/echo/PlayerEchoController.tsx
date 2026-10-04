import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { db } from "../../../lib/firebase";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useToast } from "../../../contexts/ToastContextCore";
import { useLocale } from "../../../hooks/useLocale";
import { echoQuestionText } from "../../../lib/echoQuestions";
import { isPlayerActive } from "../../../lib/liveness";
import { isInputForRound } from "../../../lib/roomInputs";
import { echoInputPayload } from "../../../lib/clientWrites";
import { useOwnRoomInput } from "../../../hooks/useRoomInputs";

interface Props {
  room: Room;
  player: Player;
}

export function PlayerEchoController({ room, player }: Props) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playersLoaded, setPlayersLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const { showToast } = useToast();
  const { t } = useLocale();

  // Oy artık oda dokümanına değil oyuncunun kendi giriş kaydına yazılıyor
  // (bkz. lib/roomInputs.ts). "Oy verdin" durumu o kayıttan geliyor: telefon
  // yenilense de bu turda ikinci kez oy düğmesi açılmıyor.
  const ownInput = useOwnRoomInput(room.id, player.id);
  const hasVoted = isInputForRound(ownInput, room.input_round);

  // Reset local state when round changes
  useEffect(() => {
    if (room.status === "echo_intro" || room.status === "echo_active") {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [room.status]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const q = query(collection(db, "players"), where("room_id", "==", room.id));
        const snap = await getDocs(q);
        // Kimlik belgenin ADI, alanlarında yok. Eskiden `d.data()` ile her
        // oyuncunun id'si undefined kalıyordu: misafir kendini de listede
        // görüyor, verdiği her oy `echo_votes.<ben> = undefined` yazmaya
        // çalışıp Firestore'dan reddediliyordu — oylama hiç çalışmıyordu.
        const pList = snap.docs.map(d => ({ ...d.data(), id: d.id }) as Player);
        
        const now = Date.now();
        setPlayers(pList.filter(p => 
          p.id !== player.id &&
          isPlayerActive(p, now)
        )); // Exclude self and ghosts
      } catch (err) {
        console.error("Error fetching players:", err);
      } finally {
        setPlayersLoaded(true);
      }
    };
    fetchPlayers();
  }, [room.id, player.id]);

  const handleVote = async (targetId: string) => {
    if (hasVoted || isSubmittingRef.current || room.status !== "echo_active") return;
    const round = room.input_round;
    if (typeof round !== "number") return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    try {
      await setDoc(doc(db, "rooms", room.id, "inputs", player.id), echoInputPayload(round, targetId));
    } catch (err) {
      console.error(err);
      showToast(t("echo.voteFailed"), "error");
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (room.status === "echo_intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-widest">
          {t("echo.questionComing")}
        </h2>
        <p className="text-gray-400 uppercase tracking-widest font-bold animate-pulse">
          {t("common.followMainScreen")}
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
            {t("echo.voteSaved")}
          </h2>
          <p className="text-gray-400 font-medium">
            {t("echo.waitingOthers")}
          </p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-start pt-6 pb-24 px-4 relative z-10 w-full max-w-lg mx-auto">
        {room.echo_question && (
          <h2 className="text-2xl font-black text-white leading-snug text-center mb-4">
            {echoQuestionText(room.echo_question)}
          </h2>
        )}
        <h3 className="text-xs text-alaz-orange uppercase tracking-[0.3em] font-bold mb-6 text-center w-full">
          {t("echo.pickSomeone")}
        </h3>

        {!playersLoaded && (
          <div className="w-full flex flex-col gap-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/[0.04] border border-white/5 motion-safe:animate-pulse" />
            ))}
          </div>
        )}
        {playersLoaded && players.length === 0 && (
          <p className="text-gray-400 font-medium text-center" role="status">{t("echo.noOthers")}</p>
        )}

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
          {t("echo.resultsOnScreen")}
        </h2>
        <p className="text-alaz-orange font-bold uppercase tracking-widest">
          {t("echo.lookUp")}
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
