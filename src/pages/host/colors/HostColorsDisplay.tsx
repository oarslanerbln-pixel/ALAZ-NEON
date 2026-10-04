import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player, RoomStatus } from "../../../types/database";
import { SoundManager, sounds } from "../../../lib/audio";
import { useLocale } from "../../../hooks/useLocale";
import { HostLobby } from "../views/HostLobby";
import { HostHeader } from "../components/HostHeader";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { grantRewardToPlayers } from "../../../lib/rewards";
import { assignColorsTeams, colorsOutcome, colorsTargetClicks } from "../../../lib/colorsTeams";
import { RULE_DEFAULTS } from "../../../lib/gameSettings";
import { useVenue } from "../../../contexts/VenueContextCore";
import { doc, writeBatch } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { KineticSpark } from "../../../components/KineticSpark";
import { createLogger } from "../../../lib/logger";

const log = createLogger("HostColorsDisplay");

interface Props {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: RoomStatus, extra?: Partial<Room>) => Promise<void>;
}

export function HostColorsDisplay({ room, players, updateRoomStatus }: Props) {
  const { t } = useLocale();
  const { venue } = useVenue();
  const hasGrantedReward = useRef(false);

  // Herkes oynar: can bomba oyununun alanı; orada elenen oyuncu önceden
  // burada takımsız kalıyordu.
  const activePlayers = players;

  const handleStartGame = async () => {
    if (activePlayers.length === 0) return;

    const assignments = assignColorsTeams(activePlayers.map((p) => p.id));

    try {
      SoundManager.getInstance().playSFX(sounds.START);
      
      const batch = writeBatch(db);
      activePlayers.forEach(p => {
        const pRef = doc(db, "players", p.id);
        batch.update(pRef, { colors_clicks: 0 });
      });
      await batch.commit();

      await updateRoomStatus("colors_intro", {
        colors_target_clicks: colorsTargetClicks(activePlayers.length),
        colors_team_assignments: assignments,
      });
    } catch (err) {
      log.error("Error starting Colors game:", err);
    }
  };

  const handleIntroComplete = async () => {
    SoundManager.getInstance().playMusic(sounds.GAME_PULSE, 0.6);
    // Süreli oyunda bitiş anı odaya yazılır; dominasyonda süre yok.
    const timed = room.colors_win_condition === "timed";
    await updateRoomStatus("colors_active", {
      colors_end_time: timed ? Date.now() + RULE_DEFAULTS.colorsTimedSeconds * 1000 : 0,
      colors_winner: null,
    });
  };

  let redScore = 0;
  let blueScore = 0;
  const redMembers: Player[] = [];
  const blueMembers: Player[] = [];
  
  players.forEach(p => {
    const fallbackTeam = p.id.charCodeAt(p.id.length - 1) % 2 === 0 ? "red" : "blue";
    const team = room.colors_team_assignments?.[p.id] || fallbackTeam;
    
    if (team === "red") {
      redScore += (p.colors_clicks || 0);
      redMembers.push(p);
    } else {
      blueScore += (p.colors_clicks || 0);
      blueMembers.push(p);
    }
  });

  redMembers.sort((a, b) => (b.colors_clicks || 0) - (a.colors_clicks || 0));
  blueMembers.sort((a, b) => (b.colors_clicks || 0) - (a.colors_clicks || 0));

  const targetScore = room.colors_target_clicks || 100;
  const scoreDiff = redScore - blueScore;
  let redPercentage = 50 + (scoreDiff / targetScore) * 50;
  redPercentage = Math.max(0, Math.min(100, redPercentage));

  // Süreli oyunun saati (ayar penceresindeki "45 sn süre düellosu").
  const endTime = room.colors_end_time ?? 0;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (room.status !== "colors_active" || endTime <= 0) return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [room.status, endTime]);
  const timeUp = endTime > 0 && now >= endTime;
  const secondsLeft = endTime > 0 ? Math.max(0, Math.ceil((endTime - now) / 1000)) : null;

  // Check for winner
  useEffect(() => {
    if (room.status === "colors_active" && !hasGrantedReward.current) {
      const outcome = colorsOutcome(redPercentage, room.colors_win_condition ?? "domination", timeUp);
      if (outcome) {
        hasGrantedReward.current = true;
        SoundManager.getInstance().playSFX(sounds.FANFARE);
        
        const assignments = room.colors_team_assignments || {};
        // Beraberlikte ödül ve puan yok.
        const winners = outcome === "draw" ? [] : activePlayers.filter(p => assignments[p.id] === outcome);
        
        if (winners.length > 0) {
          const rewardRecipients = winners
            .filter(p => p.uid)
            .map(p => ({ uid: p.uid!, nickname: p.nickname }));
          
          if (rewardRecipients.length > 0) {
            grantRewardToPlayers(room.id, rewardRecipients, venue).catch(err => 
              log.error("Error granting rewards to team:", err)
            );
          }

          const rewardBatch = writeBatch(db);
          winners.forEach(p => {
            const pRef = doc(db, "players", p.id);
            rewardBatch.update(pRef, { total_score: (p.total_score || 0) + 150 });
          });
          rewardBatch.commit().catch(err =>
            log.error("Error updating winner scores:", err)
          );
        }

        updateRoomStatus("colors_reveal", { colors_winner: outcome });
      }
    }
  }, [redPercentage, timeUp, room.status, room.id, room.colors_win_condition, room.colors_team_assignments, activePlayers, venue, updateRoomStatus]);

  // Eski odalarda sonuç alanı yok: çubuğun ucundan çıkarılır.
  const winner = room.colors_winner ?? (redPercentage >= 100 ? "red" : "blue");

  const handleEndGameEarly = () => {
    updateRoomStatus("lobby", { active_game: "none" });
  };

  const topRed = redMembers[0];
  const topBlue = blueMembers[0];

  return (
    <TVScaleFrame>
      <div className="w-full h-full overflow-hidden bg-black text-white flex flex-col p-4">
        <HostHeader 
          room={room} 
          onEndGameEarly={handleEndGameEarly} 
          onReturnToLobby={() => updateRoomStatus("night_lobby", { active_game: "none" })}
        />

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
                />
              </motion.div>
            )}

            {room.status === "colors_intro" && (
              <motion.div
                key="intro"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                className="text-center z-10 w-full max-w-5xl flex flex-col items-center"
              >
                <h1 className="text-6xl md:text-7xl font-black uppercase tracking-[0.2em] mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-blue-500 drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]">
                  {t("colors.title")}
                </h1>
                <p className="text-2xl text-gray-300 font-mono tracking-widest uppercase mb-10">
                  ⚡ {t("colors.hostHint")} ⚡
                </p>

                {/* Team Rosters Preview */}
                <div className="grid grid-cols-2 gap-8 w-full max-w-4xl mb-12">
                  {/* Red Team Preview */}
                  <div className="bg-red-950/60 border-2 border-red-500 p-6 rounded-3xl backdrop-blur-md shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                    <h2 className="text-3xl font-black text-red-500 uppercase tracking-widest mb-4">
                      {t("colors.redTeamCount", redMembers.length)}
                    </h2>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {redMembers.map(p => (
                        <span key={p.id} className="px-3.5 py-1.5 rounded-xl bg-red-600/30 border border-red-400 text-white font-bold text-sm">
                          {p.nickname}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Blue Team Preview */}
                  <div className="bg-blue-950/60 border-2 border-blue-500 p-6 rounded-3xl backdrop-blur-md shadow-[0_0_40px_rgba(59,130,246,0.4)]">
                    <h2 className="text-3xl font-black text-blue-400 uppercase tracking-widest mb-4">
                      {t("colors.blueTeamCount", blueMembers.length)}
                    </h2>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {blueMembers.map(p => (
                        <span key={p.id} className="px-3.5 py-1.5 rounded-xl bg-blue-600/30 border border-blue-400 text-white font-bold text-sm">
                          {p.nickname}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleIntroComplete}
                  className="px-14 py-6 bg-gradient-to-r from-red-600 via-amber-500 to-blue-600 text-white font-black text-3xl uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.6)] transform active:scale-95"
                >
                  {t("colors.startGame")} 🚀
                </button>
              </motion.div>
            )}

            {room.status === "colors_active" && (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full flex overflow-hidden"
              >
                {secondsLeft !== null && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 px-6 py-2 rounded-full bg-black/70 border border-white/30 font-mono font-black text-3xl text-white tabular-nums">
                    ⏱ {t("colors.timeLeft", secondsLeft)}
                  </div>
                )}
                {/* Red Half */}
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#990022] to-[#ff003c] flex flex-col items-center justify-between p-8 relative overflow-hidden"
                  animate={{ width: `${redPercentage}%` }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25" />
                  
                  <div className="z-10 text-center">
                    <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                      🔴 {t("colors.red")}
                    </h2>
                    {topRed && (
                      <span className="text-xs font-mono font-bold text-red-200 bg-black/40 px-4 py-1 rounded-full mt-2 inline-block border border-red-400/40">
                        ⚡ MVP: {topRed.nickname} ({topRed.colors_clicks || 0})
                      </span>
                    )}
                  </div>

                  <motion.div 
                    key={redScore}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="text-8xl md:text-9xl font-black text-white z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.9)]"
                  >
                    {redScore}
                  </motion.div>

                  <span className="text-xl font-black text-white/70 uppercase tracking-widest z-10">
                    %{Math.round(redPercentage)} {t("colors.dominance")}
                  </span>
                </motion.div>

                {/* Laser Collision Divider */}
                <div className="w-4 h-full bg-white shadow-[0_0_50px_rgba(255,255,255,1)] z-20 relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,1)] animate-ping absolute" />
                </div>

                {/* Blue Half */}
                <motion.div 
                  className="h-full bg-gradient-to-l from-[#004499] to-[#00aaff] flex flex-col items-center justify-between p-8 relative overflow-hidden"
                  animate={{ width: `${100 - redPercentage}%` }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25" />
                  
                  <div className="z-10 text-center">
                    <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                      🔵 {t("colors.blue")}
                    </h2>
                    {topBlue && (
                      <span className="text-xs font-mono font-bold text-blue-200 bg-black/40 px-4 py-1 rounded-full mt-2 inline-block border border-blue-400/40">
                        ⚡ MVP: {topBlue.nickname} ({topBlue.colors_clicks || 0})
                      </span>
                    )}
                  </div>

                  <motion.div 
                    key={blueScore}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="text-8xl md:text-9xl font-black text-white z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.9)]"
                  >
                    {blueScore}
                  </motion.div>

                  <span className="text-xl font-black text-white/70 uppercase tracking-widest z-10">
                    %{Math.round(100 - redPercentage)} {t("colors.dominance")}
                  </span>
                </motion.div>
              </motion.div>
            )}

            {room.status === "colors_reveal" && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center text-center p-8 ${
                  winner === "red"
                    ? 'bg-gradient-to-b from-[#80001a] to-[#ff003c]'
                    : winner === "blue"
                      ? 'bg-gradient-to-b from-[#002f66] to-[#00aaff]'
                      : 'bg-gradient-to-b from-[#3b0066] to-[#8a2be2]'
                }`}
              >
                <KineticSpark playAudio={false} />
                
                <span className="text-8xl mb-4 animate-bounce">🏆</span>
                <motion.h1 
                  className="text-7xl md:text-8xl font-black text-white uppercase tracking-wider drop-shadow-[0_0_50px_rgba(255,255,255,0.9)] mb-4"
                >
                  {winner === "draw" ? t("colors.draw") : t("colors.teamWins", winner === "red" ? t("colors.red") : t("colors.blue"))}
                </motion.h1>
                <p className="text-3xl text-white/90 font-bold uppercase tracking-widest mb-12">
                  {winner === "draw" ? "" : t("colors.championTeam")}
                </p>

                <button
                  onClick={handleEndGameEarly}
                  className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest text-xl rounded-2xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.7)]"
                >
                  {t("colors.endGame")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TVScaleFrame>
  );
}
