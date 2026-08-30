import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player, RoomStatus } from "../../../types/database";
import { SoundManager, sounds } from "../../../lib/audio";
import { HostLobby } from "../views/HostLobby";
import { HostHeader } from "../components/HostHeader";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { grantRewardToPlayers } from "../../../lib/rewards";
import { useVenue } from "../../../contexts/VenueContextCore";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

interface Props {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: RoomStatus, extra?: Partial<Room>) => Promise<void>;
}

export function HostColorsDisplay({ room, players, updateRoomStatus }: Props) {
  const { venue } = useVenue();
  const hasGrantedReward = useRef(false);

  // We only start the game if there are active players
  const activePlayers = useMemo(() => players.filter(p => (p.lives === undefined ? 3 : p.lives) > 0), [players]);

  const handleStartGame = async () => {
    if (activePlayers.length === 0) return;

    // Assign teams randomly
    const shuffled = [...activePlayers].sort(() => Math.random() - 0.5);
    const assignments: Record<string, "red" | "blue"> = {};
    
    shuffled.forEach((p, index) => {
      assignments[p.id] = index % 2 === 0 ? "red" : "blue";
    });

    try {
      SoundManager.getInstance().playSFX(sounds.START);
      
      // Reset all players' colors_clicks before starting (Batch Write)
      import("firebase/firestore").then(async ({ writeBatch }) => {
        const batch = writeBatch(db);
        activePlayers.forEach(p => {
          const pRef = doc(db, "players", p.id);
          batch.update(pRef, { colors_clicks: 0 });
        });
        await batch.commit();
      });

      await updateRoomStatus("colors_intro", {
        colors_target_clicks: activePlayers.length * 50, // 50 clicks per player average to win (can be tuned)
        colors_team_assignments: assignments,
      });
    } catch (err) {
      console.error("Error starting Colors game:", err);
    }
  };

  const handleIntroComplete = async () => {
    await updateRoomStatus("colors_active", {
      colors_end_time: 0, // Game starts now
    });
  };

  // Calculate scores continuously from connected players instead of single room document to avoid contention
  let redScore = 0;
  let blueScore = 0;
  
  players.forEach(p => {
    // Determine team (with fallback for late joiners)
    const fallbackTeam = p.id.charCodeAt(p.id.length - 1) % 2 === 0 ? "red" : "blue";
    const team = room.colors_team_assignments?.[p.id] || fallbackTeam;
    
    if (team === "red") {
      redScore += (p.colors_clicks || 0);
    } else {
      blueScore += (p.colors_clicks || 0);
    }
  });

  const targetScore = room.colors_target_clicks || 100;

  // Calculate percentage of the screen (tug-of-war)
  // If red is winning, red percentage goes up. Baseline is 50%.
  // Max difference needed to win is targetScore.
  const scoreDiff = redScore - blueScore;
  // Percentage ranges from 0% (Blue wins) to 100% (Red wins)
  let redPercentage = 50 + (scoreDiff / targetScore) * 50;
  redPercentage = Math.max(0, Math.min(100, redPercentage));

  // Check for winner
  useEffect(() => {
    if (room.status === "colors_active" && !hasGrantedReward.current) {
      if (redPercentage >= 100 || redPercentage <= 0) {
        hasGrantedReward.current = true;
        const winningTeam = redPercentage >= 100 ? "red" : "blue";
        SoundManager.getInstance().playSFX(sounds.SUCCESS); // or cinematic win
        
        // Grant rewards to the winning team
        const assignments = room.colors_team_assignments || {};
        const winners = activePlayers.filter(p => assignments[p.id] === winningTeam);
        
        if (winners.length > 0) {
          const rewardRecipients = winners
            .filter(p => p.uid)
            .map(p => ({ uid: p.uid!, nickname: p.nickname }));
          
          if (rewardRecipients.length > 0) {
            grantRewardToPlayers(rewardRecipients, venue).catch(err => 
              console.error("Error granting rewards to team:", err)
            );
          }

          // Update their total_score (bonus points)
          import("firebase/firestore").then(async ({ writeBatch }) => {
            const batch = writeBatch(db);
            winners.forEach(p => {
              const pRef = doc(db, "players", p.id);
              batch.update(pRef, { total_score: p.total_score + 100 });
            });
            await batch.commit();
          });
        }

        updateRoomStatus("colors_reveal");
      }
    }
  }, [redPercentage, room.status, room.colors_team_assignments, activePlayers, venue, updateRoomStatus]);

  const handleEndGameEarly = () => {
    updateRoomStatus("lobby", { active_game: "none" });
  };

  return (
    <TVScaleFrame>
      <div className="w-full h-full overflow-hidden bg-black text-white flex flex-col p-4">
        <HostHeader room={room} onEndGameEarly={handleEndGameEarly} />

        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            {room.status === "lobby" && (
              <motion.div
                key="lobby"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full absolute inset-0 z-50 bg-black/90 backdrop-blur-sm"
              >
                <HostLobby
                  room={room}
                  players={players}
                  onStartGame={handleStartGame}
                  onUpdateCategories={() => {}}
                />
              </motion.div>
            )}

            {room.status === "colors_intro" && (
              <motion.div
                key="intro"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="text-center z-10"
              >
                <h1 className="text-7xl font-black uppercase tracking-[0.3em] mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                  NEON SAVAŞLARI
                </h1>
                <p className="text-3xl text-gray-400 font-bold tracking-widest mb-12">
                  Takımlar Belirlendi. Hazır Olun!
                </p>
                <div className="flex justify-center gap-20">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-red-600 shadow-[0_0_50px_rgba(255,0,0,0.8)] mb-4 animate-pulse" />
                    <h2 className="text-2xl font-black text-red-500 uppercase tracking-widest">KIRMIZI</h2>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-blue-600 shadow-[0_0_50px_rgba(0,100,255,0.8)] mb-4 animate-pulse" style={{ animationDelay: "0.5s" }} />
                    <h2 className="text-2xl font-black text-blue-500 uppercase tracking-widest">MAVİ</h2>
                  </div>
                </div>
                
                <button
                  onClick={handleIntroComplete}
                  className="mt-16 px-12 py-6 bg-white text-black font-black text-3xl uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform"
                >
                  SAVAŞI BAŞLAT
                </button>
              </motion.div>
            )}

            {room.status === "colors_active" && (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full flex"
              >
                {/* Red Side */}
                <motion.div 
                  className="h-full bg-red-600 flex flex-col items-center justify-center relative overflow-hidden"
                  animate={{ width: `${redPercentage}%` }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
                  <h2 className="text-6xl font-black text-white mix-blend-overlay uppercase tracking-[0.5em] z-10 whitespace-nowrap">
                    KIRMIZI
                  </h2>
                  <div className="text-8xl font-black text-white/50 mt-4 z-10">{redScore}</div>
                </motion.div>

                {/* Central Dividing Line (Laser) */}
                <div className="w-4 h-full bg-white shadow-[0_0_50px_rgba(255,255,255,1)] z-20" />

                {/* Blue Side */}
                <motion.div 
                  className="h-full bg-blue-600 flex flex-col items-center justify-center relative overflow-hidden"
                  animate={{ width: `${100 - redPercentage}%` }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
                  <h2 className="text-6xl font-black text-white mix-blend-overlay uppercase tracking-[0.5em] z-10 whitespace-nowrap">
                    MAVİ
                  </h2>
                  <div className="text-8xl font-black text-white/50 mt-4 z-10">{blueScore}</div>
                </motion.div>
              </motion.div>
            )}

            {room.status === "colors_reveal" && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center ${redPercentage >= 100 ? 'bg-red-600' : 'bg-blue-600'}`}
              >
                <motion.h1 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="text-8xl font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_0_50px_rgba(255,255,255,0.8)] mb-8"
                >
                  {redPercentage >= 100 ? "KIRMIZI" : "MAVİ"} KAZANDI!
                </motion.h1>
                <p className="text-3xl text-white/80 font-bold uppercase tracking-widest mb-16">
                  Tebrikler Şampiyonlar!
                </p>

                <button
                  onClick={handleEndGameEarly}
                  className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-xl rounded-xl transition-transform hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                >
                  OYUNU BİTİR VE LOBİYE DÖN
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TVScaleFrame>
  );
}
