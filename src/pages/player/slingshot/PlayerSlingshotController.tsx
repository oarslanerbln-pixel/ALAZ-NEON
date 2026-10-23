import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PlayerGameProps } from "../gameControllers";
import { SlingshotController, type SlingshotLaunchData } from "../../../components/slingshot/SlingshotController";
import { db } from "../../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useLocale } from "../../../hooks/useLocale";

export function PlayerSlingshotController({ room, player }: PlayerGameProps) {
  const { t } = useLocale();
  const currentStatus = room.status;

  const handleLaunch = useCallback(
    async (data: SlingshotLaunchData) => {
      if (currentStatus !== "slingshot_active") return;
      try {
        const pRef = doc(db, "players", player.id);
        await updateDoc(pRef, {
          slingshot_shot: {
            power: data.power,
            angle: data.angle,
            curve: data.curve,
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
        {currentStatus === "slingshot_intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-4xl mb-6 shadow-[0_0_30px_#10b981]">
              ⚽
            </div>
            <h1 className="text-3xl font-black text-white mb-2">YÖRÜNGE SAPANI</h1>
            <p className="text-gray-400 text-sm max-w-xs mb-8">
              Ekrana dokun, sapanı geriye doğru çek ve falsoyu vererek TV kalesine fırlat!
            </p>
            <div className="px-5 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-bold animate-pulse">
              TV Ekranına Bakın — Maç Başlıyor...
            </div>
          </motion.div>
        )}

        {currentStatus === "slingshot_active" && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex-1"
          >
            <SlingshotController
              onLaunch={handleLaunch}
              disabled={false}
              roundHint="PENALTI ŞUTU"
            />
          </motion.div>
        )}

        {currentStatus === "slingshot_reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-xs font-mono tracking-[0.3em] uppercase text-emerald-400 font-bold mb-1">
              PENALTI DÜELLOSU BİTTİ
            </h2>
            <h1 className="text-3xl font-black text-white mb-6">MÜKEMMEL ŞUTLAR!</h1>
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 backdrop-blur-md mb-8">
              <div className="text-xs text-gray-400 uppercase font-mono mb-1">Toplam Puanın</div>
              <div className="text-4xl font-mono font-black text-emerald-300">{player.total_score || 0}</div>
            </div>
            <p className="text-xs text-gray-400 font-mono">
              Sıralama TV ekranında gösteriliyor.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
