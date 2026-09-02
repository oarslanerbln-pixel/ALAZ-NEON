import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { SoundManager, sounds } from "../../../lib/audio";
import { HostHeader } from "../components/HostHeader";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { HostLobby } from "../views/HostLobby";
import { useVenue } from "../../../contexts/VenueContextCore";
import { DEFAULT_VENUE_CONFIG, type Room, type Player, type RoomStatus } from "../../../types/database";
import { KineticSpark } from "../../../components/KineticSpark";

interface Props {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: RoomStatus, extra?: Partial<Room>) => Promise<void>;
}

export function HostWheelDisplay({ room, players, updateRoomStatus }: Props) {
  const { venue } = useVenue();
  const slices = venue.wheel_slices?.length ? venue.wheel_slices : DEFAULT_VENUE_CONFIG.wheel_slices!;
  const controls = useAnimation();
  const hasSpunRef = useRef(false);

  const activeSpinner = players.find(p => p.id === room.wheel_spinner_id);
  const winningSlice = room.wheel_result_index !== null && room.wheel_result_index !== undefined
    ? slices[room.wheel_result_index]
    : null;

  useEffect(() => {
    if (room.status === "wheel_spinning" && room.wheel_result_index !== null && room.wheel_result_index !== undefined && !hasSpunRef.current) {
      hasSpunRef.current = true;
      SoundManager.getInstance().playSFX(sounds.START);
      
      const sliceAngle = 360 / slices.length;
      const spins = 5;
      const targetRotation = (spins * 360) - (room.wheel_result_index! * sliceAngle);

      controls.start({
        rotate: targetRotation,
        transition: { duration: 5.5, ease: [0.2, 0.8, 0.2, 1] }
      }).then(() => {
        SoundManager.getInstance().playSFX(sounds.FANFARE);
        setTimeout(() => {
          updateRoomStatus("wheel_result");
        }, 1200);
      });
    }
  }, [room.status, room.wheel_result_index, slices.length, controls, updateRoomStatus]);

  const selectRandomSpinner = async () => {
    if (players.length === 0) return;
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    await updateRoomStatus("wheel_active", {
      wheel_spinner_id: randomPlayer.id,
      wheel_result_index: null
    });
    hasSpunRef.current = false;
    controls.set({ rotate: 0 });
  };

  const handleEndGameEarly = () => {
    updateRoomStatus("lobby", { active_game: "none" });
  };

  return (
    <TVScaleFrame>
      <div className="w-full h-full overflow-hidden bg-[#0a0800] text-white flex flex-col p-4 relative font-sans">
        <HostHeader 
          room={room} 
          onEndGameEarly={handleEndGameEarly} 
          onReturnToLobby={() => updateRoomStatus("night_lobby", { active_game: "none" })}
        />
        
        {/* Golden ambient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.15),transparent_70%)] pointer-events-none" />

        <div className="flex-1 flex flex-col items-center justify-center relative">
          
          <AnimatePresence>
            {room.status === "lobby" && (
              <motion.div
                key="lobby"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm"
              >
                <HostLobby
                  room={room}
                  players={players}
                  onStartGame={async () => {
                    await updateRoomStatus("wheel_active", {
                      wheel_spinner_id: null,
                      wheel_result_index: null
                    });
                  }}
                  onUpdateCategories={async () => {}}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* TOP BANNER: Status & Selected Spinner */}
          <div className="z-20 text-center mb-6">
            <span className="px-6 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 font-mono tracking-widest text-xs uppercase font-bold mb-2 inline-block">
              🎰 ŞANS ÇARKI • GECE ÖDÜLLERİ 🎰
            </span>

            {activeSpinner ? (
              <motion.h2 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]"
              >
                ŞANSLI OYUNCU: <span className="text-amber-400">{activeSpinner.nickname}</span>
              </motion.h2>
            ) : (
              <h2 className="text-2xl text-gray-400 font-mono uppercase tracking-widest">
                Şanslı masa seçilmeyi bekliyor...
              </h2>
            )}
          </div>

          {/* Main Wheel Area */}
          <div className="relative flex items-center justify-center w-[540px] h-[540px] my-2">
            {/* Top Indicator Arrow */}
            <div className="absolute -top-6 z-40 drop-shadow-[0_0_25px_rgba(255,0,60,0.9)] animate-bounce">
              <svg width="50" height="70" viewBox="0 0 50 70" fill="none">
                <path d="M25 70L0 0H50L25 70Z" fill="#ff003c" stroke="white" strokeWidth="4" />
              </svg>
            </div>

            {/* Rotating SVG Wheel */}
            <motion.div
              animate={controls}
              className="w-full h-full rounded-full border-8 border-amber-400/40 shadow-[0_0_60px_rgba(255,215,0,0.4)] relative overflow-hidden"
              style={{ transformOrigin: "center center" }}
            >
              <svg viewBox="-100 -100 200 200" className="w-full h-full transform -rotate-90">
                {slices.map((slice, i) => {
                  const angle = 360 / slices.length;
                  const startAngle = i * angle;
                  const endAngle = (i + 1) * angle;
                  
                  const startRad = (Math.PI * startAngle) / 180;
                  const endRad = (Math.PI * endAngle) / 180;
                  
                  const x1 = Math.cos(startRad) * 100;
                  const y1 = Math.sin(startRad) * 100;
                  const x2 = Math.cos(endRad) * 100;
                  const y2 = Math.sin(endRad) * 100;

                  const largeArc = angle > 180 ? 1 : 0;
                  const pathData = `M 0 0 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`;

                  const midAngle = startAngle + angle / 2;
                  const midRad = (Math.PI * midAngle) / 180;
                  const textX = Math.cos(midRad) * 65;
                  const textY = Math.sin(midRad) * 65;

                  return (
                    <g key={i}>
                      <path
                        d={pathData}
                        fill={slice.color || (i % 2 === 0 ? "#111" : "#222")}
                        stroke="#ffffff33"
                        strokeWidth="1"
                      />
                      <text
                        x={textX}
                        y={textY}
                        fill="white"
                        fontSize="7"
                        fontWeight="900"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                        className="uppercase tracking-widest font-sans drop-shadow-md"
                      >
                        {slice.text}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </motion.div>

            {/* Wheel Center Cap */}
            <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 border-4 border-white shadow-[0_0_30px_rgba(255,215,0,0.8)] z-30 flex items-center justify-center">
              <span className="text-2xl">🎰</span>
            </div>
          </div>

          {/* Winner Announcement or Action Buttons */}
          <div className="z-20 mt-4 text-center">
            {room.status === "wheel_result" && winningSlice ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-black/80 border-2 border-amber-400 p-6 rounded-3xl shadow-[0_0_40px_rgba(255,215,0,0.6)] backdrop-blur-xl"
              >
                <KineticSpark playAudio={false} />
                <span className="text-xs font-mono text-amber-300 uppercase tracking-widest block mb-1">KAZANILAN ÖDÜL</span>
                <h1 className="text-5xl font-black text-white uppercase drop-shadow-lg">
                  {winningSlice.text}
                </h1>
              </motion.div>
            ) : (
              !activeSpinner && (
                <button
                  onClick={selectRandomSpinner}
                  className="px-10 py-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-black uppercase tracking-widest text-lg rounded-2xl transition-all shadow-[0_0_30px_rgba(255,215,0,0.5)] transform active:scale-95"
                >
                  🎲 RASTGELE ŞANSLI SEÇ
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </TVScaleFrame>
  );
}
