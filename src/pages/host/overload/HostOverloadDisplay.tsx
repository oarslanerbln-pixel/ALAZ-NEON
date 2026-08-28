import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { SoundManager, sounds } from "../../../lib/audio";
import { HostHeader } from "../components/HostHeader";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { grantRewardToPlayers } from "../../../lib/rewards";
import { useVenue } from "../../../contexts/VenueContextCore";

interface HostOverloadDisplayProps {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], updates?: Partial<Room>) => Promise<void>;
}

export function HostOverloadDisplay({ room, players, updateRoomStatus }: HostOverloadDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<number>(room.overload_time_allowed || 10);
  const [isExploding, setIsExploding] = useState(false);
  const { venue } = useVenue();
  // Overload; Klasik/Quiz/Sensör/Bomba'nın hepsi kazanana grantRewardToPlayers
  // ile venue ödülü veriyordu, Overload hiç vermiyordu — şampiyon başka hiçbir
  // şey kazanmıyordu. hasGrantedReward, "aktif oyuncu sayısı 1'e düştü" durumu
  // birkaç render boyunca sabit kalırken (aşağıdaki 5sn'lik standings geçişi
  // sırasında) ödülün BİRDEN FAZLA kez verilmesini engelliyor.
  const hasGrantedReward = useRef(false);

  // Active players (not eliminated)
  const activePlayers = useMemo(() => {
    return players.filter(p => !(room.overload_eliminated_ids || []).includes(p.id));
  }, [players, room.overload_eliminated_ids]);

  const targetPlayer = useMemo(() => {
    return players.find(p => p.id === room.overload_target_id);
  }, [players, room.overload_target_id]);

  // Host Logic (Server Authoritative)
  useEffect(() => {
    // Oyun BAŞTAN 1 oyuncuyla başlatılırsa (HostLobby genel bir bileşen ve
    // burada özel bir minimum oyuncu şartı koymuyor) eski kod şuna
    // takılıyordu: tek oyuncu her seferinde kendi kendine "hedef" seçiliyor,
    // süresi dolup elendiğinde activePlayers 0'a düşüyor, "kazanan" kontrolü
    // (eskiden yalnızca tam olarak ===1 VE en az bir eleme olmuşsa tetiklenen)
    // hiç çalışmıyordu — oyun sonsuza dek "boş hedef" ekranında donuyordu ve
    // (aşağıda eklenen HostHeader'dan önce) çıkış için hiçbir buton da yoktu.
    // Kazanma/bitiş kontrolünü EN BAŞA aldık ve <= 1 (0 dahil) yaptık, böylece
    // hem normal çok oyunculu bitiş hem de bu marjinal tek oyunculu durum
    // güvenle sonuçlanıyor.
    if (activePlayers.length <= 1) {
      setTimeout(() => {
        updateRoomStatus("standings", { active_game: "none" });
      }, activePlayers.length === 1 ? 5000 : 0);
      return;
    }

    // If there is no target, or the target has left/disconnected, pick one randomly (only the host should do this to avoid race conditions, but since host is rendering this, it's fine)
    if (!room.overload_target_id || !activePlayers.find(p => p.id === room.overload_target_id)) {
      const nextTarget = activePlayers[Math.floor(Math.random() * activePlayers.length)];
      updateRoomStatus("playing", {
        overload_target_id: nextTarget.id,
        overload_start_time: Date.now()
      });
      return;
    }

    // Timer Logic
    const interval = setInterval(() => {
      if (!room.overload_start_time || isExploding) return;

      const now = Date.now();
      const allowedMs = (room.overload_time_allowed || 10) * 1000;
      const elapsed = now - room.overload_start_time;
      const remaining = Math.max(0, allowedMs - elapsed);

      setTimeLeft(Math.ceil(remaining / 1000));

      // Boom! Time's up!
      if (remaining === 0) {
        setIsExploding(true);
        SoundManager.getInstance().playSFX(sounds.FAILURE); // Or specific explosion
        
        // Eliminate player
        const newEliminated: string[] = [...(room.overload_eliminated_ids || []), room.overload_target_id as string];
        
        setTimeout(() => {
          updateRoomStatus("playing", {
            overload_target_id: null, // Clear target to pick a new one
            overload_eliminated_ids: newEliminated,
            overload_time_allowed: 10, // Reset to 10s for the next round
            overload_start_time: 0
          });
          setIsExploding(false);
        }, 3000); // Wait 3s for explosion animation
      }
    }, 100);

    return () => clearInterval(interval);
  }, [room.overload_target_id, room.overload_start_time, room.overload_time_allowed, activePlayers, isExploding, updateRoomStatus, room.overload_eliminated_ids]);


  // Şampiyona venue ödülünü ver (bkz. yukarıdaki hasGrantedReward yorumu).
  useEffect(() => {
    if (activePlayers.length !== 1 || hasGrantedReward.current) return;
    const champion = activePlayers[0];
    if (!champion?.uid) return;
    hasGrantedReward.current = true;
    grantRewardToPlayers(
      [{ uid: champion.uid, nickname: champion.nickname }],
      venue,
    ).catch((err) =>
      console.error("[HostOverloadDisplay] Ödül dağıtımı başarısız:", err),
    );
  }, [activePlayers, venue]);

  // Sound for target change
  useEffect(() => {
    if (room.overload_target_id && !isExploding) {
      SoundManager.getInstance().playSFX(sounds.CLICK);
    }
  }, [room.overload_target_id, isExploding]);

  const handleEndGameEarly = () => {
    updateRoomStatus("standings", { active_game: "none" }).catch((err) =>
      console.error("[HostOverloadDisplay] Erken bitirme başarısız:", err),
    );
  };

  // activePlayers.length <= 1 kapsıyor: normal çok-oyunculu bitişte tam 1
  // hayatta kalan olur (şampiyon gösterilir); tek-oyuncuyla başlatılmış
  // marjinal durumda 0'a da düşebilir — orada "şampiyon" göstermek yerine
  // nötr bir bitiş mesajı veriyoruz, activePlayers[0] burada olmayabilir.
  if (activePlayers.length <= 1) {
    const champion = activePlayers[0];
    return (
      <TVScaleFrame>
        <div className="w-full h-full flex flex-col p-4 bg-[#050505]">
          <HostHeader room={room} onEndGameEarly={handleEndGameEarly} />
          <div className="flex-1 flex flex-col items-center justify-center">
            <h1 className="text-6xl text-cyan-400 font-black uppercase tracking-widest animate-pulse">
              {champion ? "ŞAMPİYON" : "OYUN BİTTİ"}
            </h1>
            {champion && (
              <h2 className="text-8xl text-white font-black mt-4 uppercase">{champion.nickname}</h2>
            )}
          </div>
        </div>
      </TVScaleFrame>
    );
  }

  return (
    <TVScaleFrame>
    <div className="relative w-full h-full bg-[#050505] overflow-hidden flex flex-col p-4 font-sans">
      <HostHeader room={room} onEndGameEarly={handleEndGameEarly} />
      <div className="relative flex-1 overflow-hidden flex flex-col items-center justify-center">
      {/* Strategy 5: Neon Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[linear-gradient(rgba(0,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.2)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(1000px)_rotateX(60deg)_translateY(-100px)_translateZ(-200px)]" />
      <div className="absolute top-0 w-full h-full bg-gradient-to-t from-transparent via-[#050505]/80 to-[#050505] pointer-events-none" />

      {/* Header Info */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-20">
        <div className="text-cyan-400 font-black tracking-[0.3em] uppercase text-xl">
          NEON OVERLOAD
        </div>
        <div className="flex gap-2">
          {players.map(p => {
            const isEliminated = (room.overload_eliminated_ids || []).includes(p.id);
            return (
              <div 
                key={p.id} 
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border ${isEliminated ? 'border-red-500/30 text-red-500/50 line-through' : 'border-cyan-400 text-cyan-400 bg-cyan-400/10'}`}
              >
                {p.nickname}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isExploding ? (
          <motion.div
            key="explosion"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 2, 3], opacity: [1, 1, 0] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="w-[800px] h-[800px] bg-red-500 rounded-full blur-[100px]" />
            <h1 className="absolute text-[150px] font-black text-white mix-blend-overlay tracking-tighter">
              ELENDİ!
            </h1>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center justify-center"
          >
            {/* The Target Name */}
            {targetPlayer && (
              <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute -top-40 flex flex-col items-center w-[80vw] text-center"
              >
                <div className="text-red-500 text-2xl font-bold tracking-[0.5em] mb-2 animate-pulse">HEDEF</div>
                <h1 className="text-7xl md:text-[140px] font-black text-white uppercase tracking-widest drop-shadow-[0_0_30px_rgba(255,0,0,0.8)] leading-none truncate max-w-full">
                  {targetPlayer.nickname}
                </h1>
              </motion.div>
            )}

            {/* The Energy Core (Timer) */}
            <div className="relative w-64 h-64 md:w-96 md:h-96 mt-20 flex items-center justify-center">
              {/* Outer pulsing ring */}
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 0.5 + (timeLeft / 20) }}
                className="absolute inset-0 rounded-full border-[10px] shadow-[0_0_50px_rgba(255,0,255,0.6)]"
                style={{ borderColor: timeLeft <= 3 ? '#ff0000' : '#ff00ff' }}
              />
              
              {/* Inner core */}
              <div className="absolute w-3/4 h-3/4 rounded-full bg-[#ff00ff]/20 blur-[20px]" />
              
              {/* Countdown Number */}
              <div className="relative z-10 text-[120px] font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                {timeLeft}
              </div>
            </div>
            
            <div className="mt-20 text-white/50 font-medium tracking-[0.2em] uppercase text-xl">
              HIZ: {room.overload_time_allowed}S
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
    </TVScaleFrame>
  );
}
