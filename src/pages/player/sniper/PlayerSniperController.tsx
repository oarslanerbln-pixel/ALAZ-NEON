import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PlayerGameProps } from "../gameControllers";
import { AirPointerController } from "../../../components/gyro/AirPointerController";
import { db } from "../../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

const PLAYER_COLORS = ["cyan", "orange", "pink", "green"] as const;

/** Taslak — bkz. HostSniperDisplay; mod katalogda kilitli. */
export function PlayerSniperController({ room, player }: PlayerGameProps) {

  const colorIndex = Math.abs(player.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % PLAYER_COLORS.length;
  const assignedColor = PLAYER_COLORS[colorIndex];

  const currentStatus = room.status;

  const handleFire = useCallback(
    async (coords: { x: number; y: number }) => {
      if (currentStatus !== "sniper_active") return;
      try {
        const pRef = doc(db, "players", player.id);
        await updateDoc(pRef, {
          sniper_shot: {
            x: coords.x,
            y: coords.y,
            timestamp: Date.now(),
          },
        });
      } catch (err) {
        console.error("Shot sync failed:", err);
      }
    },
    [currentStatus, player.id],
  );

  return (
    <div className="relative w-full h-full min-h-[100dvh] bg-black text-white flex flex-col justify-between overflow-hidden">
      <AnimatePresence mode="wait">
        {currentStatus === "sniper_intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-4xl mb-6 shadow-[0_0_30px_#00f3ff]">
              🎯
            </div>
            <h1 className="text-3xl font-black text-white mb-2">SİBER NİŞANCI</h1>
            <p className="text-gray-400 text-sm max-w-xs mb-8">
              Telefonunu eline al ve TV ekranına doğrult. Oyun başlayınca ekrandaki hedeflere nişan alıp tetiğe bas!
            </p>
            <div className="px-5 py-2.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold animate-pulse">
              TV Ekranına Bakın — Başlıyor...
            </div>
          </motion.div>
        )}

        {currentStatus === "sniper_active" && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex-1"
          >
            <AirPointerController
              playerColor={assignedColor}
              playerNickname={player.nickname}
              onFire={handleFire}
              disabled={false}
            />
          </motion.div>
        )}

        {currentStatus === "sniper_reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-xs font-mono tracking-[0.3em] uppercase text-cyan-400 font-bold mb-1">
              TUR TAMAMLANDI
            </h2>
            <h1 className="text-3xl font-black text-white mb-6">HARİKA ATIŞLAR!</h1>
            <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 backdrop-blur-md mb-8">
              <div className="text-xs text-gray-400 uppercase font-mono mb-1">Toplam Puanın</div>
              <div className="text-4xl font-mono font-black text-cyan-300">{player.total_score || 0}</div>
            </div>
            <p className="text-xs text-gray-400 font-mono">
              Sonuçlar TV ekranında açıklanıyor.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
