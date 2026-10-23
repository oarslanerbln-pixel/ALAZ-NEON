import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HostGameProps } from "../gameDisplays";
import type { PlayerCrosshair } from "../../../components/gyro/CyberTargetArena";
import { CyberTargetArena } from "../../../components/gyro/CyberTargetArena";
import { SoundManager, sounds } from "../../../lib/audio";
import { useLocale } from "../../../hooks/useLocale";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { finishNightRound } from "../../../lib/nightAwards";
import { placementPointsByScore } from "../../../lib/nightLeague";
import { ShimmerButton } from "../../../components/fx";

const ROUND_DURATION_SEC = 30;

const PLAYER_COLORS = ["#00f3ff", "#ff5500", "#f43f5e", "#10b981", "#a855f7", "#eab308"];

export function HostSniperDisplay({
  room,
  players,
  updateRoomStatus,
  updatePlayerScore,
}: HostGameProps) {
  const { t } = useLocale();
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_SEC);
  const processedShotsRef = useRef<Record<string, number>>({});
  const latestPlayers = useRef(players);
  latestPlayers.current = players;

  const currentStatus = room.status;

  // Lobi veya ilk açılışta intro durumunu başlat
  useEffect(() => {
    if (currentStatus === "lobby" || (room.active_game === "sniper" && !currentStatus.startsWith("sniper_"))) {
      updateRoomStatus("sniper_intro");
    }
  }, [currentStatus, room.active_game, updateRoomStatus]);

  // Intro -> Active geçişi
  useEffect(() => {
    if (currentStatus === "sniper_intro") {
      SoundManager.getInstance().playSFX(sounds.START);
      const timer = setTimeout(() => {
        const endTime = Date.now() + ROUND_DURATION_SEC * 1000;
        updateRoomStatus("sniper_active", { sniper_end_time: endTime });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentStatus, updateRoomStatus]);

  // Aktif oyun sayacı
  useEffect(() => {
    if (currentStatus !== "sniper_active") return;
    SoundManager.getInstance().playMusic(sounds.GAME_PULSE, 0.5);

    const interval = setInterval(() => {
      const endTime = room.sniper_end_time || Date.now() + ROUND_DURATION_SEC * 1000;
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        updateRoomStatus("sniper_reveal");
      }
    }, 250);

    return () => clearInterval(interval);
  }, [currentStatus, room.sniper_end_time, updateRoomStatus]);

  // Sonuç ekranına geçildiğinde gecelik lig puanlarını dağıt
  useEffect(() => {
    if (currentStatus !== "sniper_reveal") return;
    SoundManager.getInstance().playSFX(sounds.FANFARE, 0.7);

    const scores = latestPlayers.current.map((p) => ({
      id: p.id,
      score: p.sniper_score || p.total_score || 0,
    }));
    finishNightRound(room.id, placementPointsByScore(scores));
  }, [currentStatus, room.id]);

  // Oyuncuların canlı nişangahları (crosshairs)
  const crosshairs: PlayerCrosshair[] = useMemo(() => {
    return players.map((p, idx) => {
      const shot = p.sniper_shot;
      return {
        id: p.id,
        nickname: p.nickname,
        color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
        x: shot?.x ?? (idx % 2 === 0 ? -0.3 : 0.3),
        y: shot?.y ?? (idx > 1 ? 0.2 : -0.2),
        score: p.sniper_score ?? 0,
        lastShotTime: shot?.timestamp,
      };
    });
  }, [players]);

  // Hedef vurulma olayı
  const handleTargetHit = useCallback(
    (playerId: string, targetId: string, points: number) => {
      const targetPlayer = latestPlayers.current.find((p) => p.id === playerId);
      if (!targetPlayer) return;

      SoundManager.getInstance().playSFX(sounds.SUCCESS, 0.7);
      const newTotal = (targetPlayer.total_score || 0) + points;
      updatePlayerScore(playerId, newTotal);
    },
    [updatePlayerScore],
  );

  const handleReturnToLobby = () => {
    updateRoomStatus("lobby", { active_game: "none" });
  };

  const handleRestart = () => {
    updateRoomStatus("sniper_intro");
  };

  return (
    <TVScaleFrame>
      <div className="relative w-full h-full min-h-[1080px] flex flex-col justify-between overflow-hidden bg-black text-white font-inter">
        <AnimatePresence mode="wait">
          {/* 1. İNTRO BRİFİNGİ */}
          {currentStatus === "sniper_intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center p-12 bg-black/90 backdrop-blur-xl"
            >
              <div className="w-24 h-24 mb-6 rounded-3xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-5xl shadow-[0_0_50px_#00f3ff]">
                🎯
              </div>
              <h2 className="text-xl font-mono tracking-[0.4em] uppercase text-cyan-400 font-black mb-2">
                HENGAME YENİ NESİL MOD
              </h2>
              <h1 className="text-6xl font-black text-white tracking-tight mb-6 drop-shadow-[0_0_30px_rgba(0,243,255,0.6)]">
                SİBER NİŞANCI
              </h1>
              <p className="text-2xl text-gray-300 max-w-2xl text-center font-light leading-relaxed mb-8">
                Telefonunuzu havada TV ekranına doğru çevirerek <span className="text-cyan-400 font-bold">jiroskopla</span> nişan alın. Uçuşan hedefleri en hızlı vurup puanları toplayın!
              </p>
              <div className="flex items-center gap-4 text-cyan-300 font-mono text-lg animate-pulse">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f3ff]" />
                <span>Sensörler kalibre ediliyor... HAZIR OLUN!</span>
              </div>
            </motion.div>
          )}

          {/* 2. AKTİF ARENA */}
          {(currentStatus === "sniper_active" || currentStatus === "playing") && (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full flex-1"
            >
              <CyberTargetArena
                players={crosshairs}
                timeLeft={timeLeft}
                onTargetHit={handleTargetHit}
                onRoundComplete={() => updateRoomStatus("sniper_reveal")}
              />
            </motion.div>
          )}

          {/* 3. SONUÇ PODYUMU */}
          {currentStatus === "sniper_reveal" && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center p-12 bg-black/95 backdrop-blur-2xl"
            >
              <div className="text-sm font-mono tracking-[0.4em] uppercase text-cyan-400 font-bold mb-2">
                MAÇ SONU RAPORU
              </div>
              <h1 className="text-5xl font-black text-white tracking-tight mb-8 drop-shadow-[0_0_25px_rgba(0,243,255,0.5)]">
                KESKİN NİŞANCILAR SIRALAMASI
              </h1>

              {/* Podyum Kartları */}
              <div className="flex items-end justify-center gap-6 w-full max-w-4xl mb-12">
                {players
                  .slice()
                  .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
                  .slice(0, 3)
                  .map((p, rank) => (
                    <motion.div
                      key={p.id}
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: rank * 0.15 }}
                      className={`flex flex-col items-center p-6 rounded-3xl border backdrop-blur-md ${
                        rank === 0
                          ? "bg-cyan-500/15 border-cyan-400/60 shadow-[0_0_40px_rgba(0,243,255,0.4)] scale-110 z-10"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="text-3xl mb-2">{rank === 0 ? "🥇" : rank === 1 ? "🥈" : "🥉"}</div>
                      <div className="text-xl font-bold text-white mb-1">{p.nickname}</div>
                      <div className="font-mono text-2xl font-black text-cyan-300">
                        {p.total_score || 0} Puan
                      </div>
                    </motion.div>
                  ))}
              </div>

              {/* Kontrol Butonları */}
              <div className="flex items-center gap-4">
                <ShimmerButton
                  onClick={handleRestart}
                  className="px-8 py-4 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold text-lg hover:bg-cyan-500/30 transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)]"
                >
                  🔄 Yeniden Oyna
                </ShimmerButton>
                <button
                  onClick={handleReturnToLobby}
                  className="px-8 py-4 rounded-2xl bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-all border border-white/15"
                >
                  🏠 Lobiye Dön
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TVScaleFrame>
  );
}
