import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Check } from "lucide-react";
import { db } from "../../../lib/firebase";
import { useLocale } from "../../../hooks/useLocale";
import { PlayerBackground } from "../../../components/PlayerBackground";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import type { Room } from "../../../types/database";

interface PlayerLobbyProps {
  room: Room | null;
  roomId: string | null;
}

/**
 * İpuçları çeviri anahtarı olarak tutuluyor, düz metin değil — metin `t()`
 * ile render sırasında çözülüyor ki dil değişince ekrandaki ipucu da
 * anında o dile geçsin.
 */
const TIPS = [
  { icon: "⚡", key: "tips.early" },
  { icon: "🎯", key: "tips.uniqueBonus" },
  { icon: "🃏", key: "tips.joker" },
  { icon: "🏆", key: "tips.ranking" },
  { icon: "💡", key: "tips.validLetter" },
] as const;

/**
 * Misafirin katıldıktan sonra gördüğü bekleme ekranı.
 *
 * Sade tutuldu: misafirin bilmesi gereken üç şey var — bağlandı mı, kaç kişi
 * var, sırada ne var. Eski tasarımdaki "ID_AUTH_01", barkod, "SYNCING /
 * ETA: --:--" ve "RND/TMR" gibi süsler hiçbir şey anlatmıyordu; üstelik
 * dil seçici `absolute` olduğu için başlığın üstüne biniyordu.
 */
export function PlayerLobby({ room, roomId }: PlayerLobbyProps) {
  const { t } = useLocale();
  const [playerCount, setPlayerCount] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);

  // Canlı oyuncu sayısı
  useEffect(() => {
    if (!roomId) return;
    const q = query(collection(db, "players"), where("room_id", "==", roomId));
    const unsub = onSnapshot(q, (snap) => setPlayerCount(snap.size));
    return () => unsub();
  }, [roomId]);

  // İpucu her 4 sn'de bir değişir
  useEffect(() => {
    const timer = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  // Kategoriler ve tur bilgisi yalnızca klasik oyun seçiliyken anlamlı; gece
  // lobisinde (oyun henüz seçilmemişken) göstermek kafa karıştırıyordu.
  const isClassic = room?.active_game === "scattegories";
  const categories = isClassic ? room?.categories ?? [] : [];

  return (
    <motion.div
      key="lobby"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex flex-col min-h-[calc(100dvh-8rem)] text-center overflow-hidden"
    >
      <PlayerBackground />
      <div className="absolute inset-0 bg-black/80 pointer-events-none" />

      <div className="relative z-10 flex justify-end">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-5 py-8">
        <div className="relative w-28 h-28 flex items-center justify-center" aria-hidden="true">
          <span className="absolute inset-0 rounded-full border border-alaz-orange/40 motion-safe:animate-ping [animation-duration:2.4s]" />
          <span className="absolute inset-2 rounded-full bg-alaz-orange/10 border border-alaz-orange/50 shadow-[0_0_40px_rgba(255,85,0,0.35)]" />
          <Check className="relative w-12 h-12 text-alaz-orange" strokeWidth={2.5} />
        </div>

        <h1 className="text-4xl font-black text-white tracking-wide">{t("lobby.readyTitle")}</h1>
        <p className="text-base text-white/70 max-w-xs leading-relaxed">{t("lobby.readyBody")}</p>

        <span
          className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300"
          role="status"
          aria-live="polite"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 motion-safe:animate-pulse" aria-hidden="true" />
          {t("waitingRoom.playersConnected", playerCount)}
        </span>
      </div>

      <div className="relative z-10 flex flex-col gap-3 pb-2">
        {isClassic && room && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50 mb-3">
              {t("waitingRoom.categoriesTitle")}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <span key={cat} className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-white">
                  {cat}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm font-semibold text-white/60">
              {t("waitingRoom.roundsLabel", String(room.total_rounds))} · {t("waitingRoom.timerLabel", String(room.timer_setting))}
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 min-h-16 flex items-center backdrop-blur-md">
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="w-full text-sm text-white/85 leading-snug text-left flex gap-3"
            >
              <span className="text-lg leading-none" aria-hidden="true">{TIPS[tipIdx].icon}</span>
              <span>{t(TIPS[tipIdx].key)}</span>
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
