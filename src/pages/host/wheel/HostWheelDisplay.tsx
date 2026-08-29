import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { SoundManager, sounds } from "../../../lib/audio";
import { HostHeader } from "../components/HostHeader";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { HostLobby } from "../views/HostLobby";
import { useVenue } from "../../../contexts/VenueContextCore";
import { DEFAULT_VENUE_CONFIG, type Room, type Player, type RoomStatus } from "../../../types/database";

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

  // If status is wheel_spinning and we haven't animated yet
  useEffect(() => {
    if (room.status === "wheel_spinning" && room.wheel_result_index !== null && room.wheel_result_index !== undefined && !hasSpunRef.current) {
      hasSpunRef.current = true;
      SoundManager.getInstance().playSFX(sounds.GAME_PULSE); // Needs a ticking sound in reality
      
      const sliceAngle = 360 / slices.length;
      // The target rotation to land exactly in the center of the winning slice
      // Arrow is at the top (0 degrees).
      // So the winning slice needs to be rotated to 270 (or 0 depending on drawing).
      // Let's assume standard math: index 0 is at 0 degrees.
      // Arrow is at top (-90 degrees). 
      // Rotation needed = 360 * 5 (spins) - (index * sliceAngle)
      
      const spins = 5;
      const targetRotation = (spins * 360) - (room.wheel_result_index! * sliceAngle);

      controls.start({
        rotate: targetRotation,
        transition: { duration: 5, ease: [0.2, 0.8, 0.2, 1] }
      }).then(() => {
        SoundManager.getInstance().playSFX(sounds.SUCCESS);
        setTimeout(() => {
          updateRoomStatus("wheel_result");
        }, 1000);
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
    controls.set({ rotate: 0 }); // Reset rotation
  };

  const resetWheel = async () => {
    await updateRoomStatus("wheel_active", {
      wheel_spinner_id: null,
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
      <div className="w-full h-full overflow-hidden bg-black text-white flex flex-col p-4 relative">
        <HostHeader room={room} onEndGameEarly={handleEndGameEarly} />
        
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.1),transparent_70%)] pointer-events-none" />

        <div className="flex-1 flex items-center justify-center relative">
          
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

          {/* Wheel Container */}
          <div className="relative flex items-center justify-center w-[600px] h-[600px]">
            {/* The Arrow */}
            <div className="absolute -top-8 z-50 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
              <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
                <path d="M30 80L0 0H60L30 80Z" fill="#ff003c" stroke="white" strokeWidth="4" />
              </svg>
            </div>

            {/* The SVG Wheel */}
            <motion.div
              animate={controls}
              className="w-full h-full rounded-full border-8 border-white/20 shadow-[0_0_50px_rgba(255,215,0,0.3)] relative overflow-hidden"
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

                  // Large arc flag
                  const largeArc = angle > 180 ? 1 : 0;
                  
                  // Path for the slice
                  const pathData = `M 0 0 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`;
                  
                  // Text placement
                  const textAngle = startAngle + angle / 2;
                  const textRad = (Math.PI * textAngle) / 180;
                  const textX = Math.cos(textRad) * 65;
                  const textY = Math.sin(textRad) * 65;

                  return (
                    <g key={slice.id}>
                      <path d={pathData} fill={slice.color} stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
                      <text
                        x={textX}
                        y={textY}
                        fill="white"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                        style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.9)" }}
                      >
                        {slice.text}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </motion.div>
          </div>

          {/* Overlays / UI */}
          <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-6">
            <AnimatePresence mode="wait">
              {room.status === "wheel_active" && !room.wheel_spinner_id && (
                <motion.div
                  key="select-spinner"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <button
                    onClick={selectRandomSpinner}
                    className="px-10 py-5 bg-gradient-to-r from-cyber-yellow to-alaz-orange text-black font-black text-2xl uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.5)] hover:scale-105 transition-transform"
                  >
                    ŞANSLI MÜŞTERİYİ SEÇ
                  </button>
                </motion.div>
              )}

              {room.status === "wheel_active" && room.wheel_spinner_id && activeSpinner && (
                <motion.div
                  key="waiting-spin"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="bg-black/80 backdrop-blur-md border border-white/20 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                >
                  <div className="text-white/60 font-bold uppercase tracking-widest text-sm mb-2">ÇARK ÇEVİRME SIRASI:</div>
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-alaz-orange to-cyber-yellow uppercase tracking-tighter">
                    {activeSpinner.nickname}
                  </div>
                  <div className="text-white/80 mt-4 text-lg font-mono animate-pulse">Lütfen telefonunuzdan ÇEVİR butonuna basın!</div>
                </motion.div>
              )}

              {room.status === "wheel_result" && room.wheel_result_index !== null && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-black/90 backdrop-blur-xl border-2 border-cyber-yellow p-10 rounded-3xl text-center shadow-[0_0_100px_rgba(255,215,0,0.4)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-cyber-yellow/10 animate-pulse pointer-events-none" />
                  <div className="relative z-10">
                    <div className="text-white font-black uppercase tracking-[0.3em] text-sm mb-4">KAZANAN ÖDÜL</div>
                    <div className="text-6xl font-black text-cyber-yellow uppercase tracking-tighter drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                      {room.wheel_result_index !== null && room.wheel_result_index !== undefined ? slices[room.wheel_result_index].text : ""}
                    </div>
                    <div className="text-white/50 mt-4 font-mono text-lg">{activeSpinner?.nickname} kazandı!</div>
                    <div className="mt-8 flex gap-4 justify-center">
                      <button
                        onClick={resetWheel}
                        className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold uppercase tracking-widest rounded-xl transition-all"
                      >
                        Yeniden Çevir
                      </button>
                      <button
                        onClick={handleEndGameEarly}
                        className="px-8 py-4 bg-cyber-yellow hover:bg-yellow-400 text-black font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        Çarkı Kapat
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </TVScaleFrame>
  );
}
