import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { db } from "../../../lib/firebase";
import { doc, increment, updateDoc } from "firebase/firestore";
import { haptics } from "../../../lib/haptics";
import { useLocale } from "../../../hooks/useLocale";
import { CardSpotlight, NumberTicker } from "../../../components/fx";

interface Props {
  room: Room;
  player: Player;
}

interface Floater {
  id: number;
  x: number;
  y: number;
  label: string;
}

export function PlayerColorsController({ room, player }: Props) {
  const { t } = useLocale();
  const [localClicks, setLocalClicks] = useState(0);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const pendingClicksRef = useRef(0);
  const isFlushingRef = useRef(false);
  const floaterIdRef = useRef(0);
  
  const fallbackTeam = player.id.charCodeAt(player.id.length - 1) % 2 === 0 ? "red" : "blue";
  const team = room.colors_team_assignments?.[player.id] || fallbackTeam;

  const handleClick = (e: React.TouchEvent | React.MouseEvent) => {
    if (room.status !== "colors_active" || !team) return;
    
    // Tap haptics
    haptics.tap();
    
    const count = 'touches' in e && e.touches.length > 1 ? e.touches.length : 1;
    setLocalClicks(prev => prev + count);
    pendingClicksRef.current += count;

    // Spawn floating tap counter
    let clientX = window.innerWidth / 2;
    let clientY = window.innerHeight / 2;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const id = ++floaterIdRef.current;
    setFloaters(prev => [...prev.slice(-5), { id, x: clientX, y: clientY, label: `+${count}` }]);
    setTimeout(() => {
      setFloaters(prev => prev.filter(f => f.id !== id));
    }, 500);
  };

  // Batch updates to Firestore
  useEffect(() => {
    if (room.status !== "colors_active" || !team) return;

    const interval = setInterval(() => {
      const clicksToFlush = pendingClicksRef.current;
      if (clicksToFlush > 0 && !isFlushingRef.current) {
        isFlushingRef.current = true;
        pendingClicksRef.current = 0;
        
        const playerRef = doc(db, "players", player.id);
        
        updateDoc(playerRef, {
          colors_clicks: increment(clicksToFlush)
        }).catch(err => {
          console.error("Failed to flush clicks to Firestore:", err);
          pendingClicksRef.current += clicksToFlush;
        }).finally(() => {
          isFlushingRef.current = false;
        });
      }
    }, 600);

    return () => clearInterval(interval);
  }, [room.status, player.id, team]);

  const bgClass = team === "red" 
    ? "bg-gradient-to-b from-[#b30027] to-[#ff003c]" 
    : (team === "blue" ? "bg-gradient-to-b from-[#004bb3] to-[#00aaff]" : "bg-black");

  return (
    <div className={`w-full h-[100dvh] flex flex-col font-sans overflow-hidden transition-colors duration-500 ${bgClass} text-white`}>
      {/* Floating Click Particles */}
      {floaters.map(f => (
        <motion.div
          key={f.id}
          initial={{ scale: 0.8, opacity: 1, y: 0 }}
          animate={{ scale: 1.4, opacity: 0, y: -50 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{ left: f.x, top: f.y }}
          className="fixed pointer-events-none -translate-x-1/2 -translate-y-1/2 text-4xl font-black text-amber-300 drop-shadow-[0_0_15px_rgba(255,230,0,0.9)] z-50 font-mono select-none"
        >
          {f.label}
        </motion.div>
      ))}

      <AnimatePresence mode="wait">
        {room.status === "colors_intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          >
            <CardSpotlight
              tone={team === "red" ? "pink" : "blue"}
              ambient={true}
              className="p-8 rounded-3xl bg-black/60 border border-white/20 backdrop-blur-xl max-w-sm w-full"
            >
              <span className="text-7xl mb-4 block animate-bounce">{team === "red" ? "🔴" : "🔵"}</span>
              <h2 className="text-white/80 font-mono text-sm uppercase tracking-widest mb-2">
                {t("colors.teamAssigned")}
              </h2>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                <div className="text-5xl md:text-6xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.9)] mb-4">
                  {team === "red" ? t("team.red") : t("team.blue")}
                </div>
                <p className="text-white/90 font-mono text-xs uppercase tracking-widest bg-black/40 px-6 py-2 rounded-full border border-white/20 inline-block shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  {t("colors.tapFast")}
                </p>
              </motion.div>
            </CardSpotlight>
          </motion.div>
        )}

        {room.status === "colors_active" && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 w-full h-full relative"
          >
            {/* Turbo Click Pad with tactile feedback */}
            <button
              onClick={handleClick}
              onTouchStart={handleClick}
              className="w-full h-full flex flex-col items-center justify-center active:scale-[0.98] transition-transform select-none p-6"
              style={{ touchAction: "manipulation" }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25 pointer-events-none" />
              
              <span className="text-8xl mb-2 animate-pulse pointer-events-none">⚡</span>
              
              <h1 className="text-white font-black text-6xl md:text-7xl uppercase tracking-wider drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-none">
                HIZLA BAS!
              </h1>
              
              <div className="mt-6 bg-black/50 border border-white/20 px-8 py-3 rounded-3xl backdrop-blur-md pointer-events-none shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <span className="text-xs font-mono text-white/70 uppercase tracking-widest block text-center">
                  {t("colors.yourTapCount")}
                </span>
                <span className="text-5xl font-black text-white block text-center mt-1">
                  <NumberTicker value={localClicks} />
                </span>
              </div>
            </button>
          </motion.div>
        )}

        {room.status === "colors_reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          >
            <CardSpotlight
              tone={team === "red" ? "pink" : "blue"}
              ambient={true}
              className="p-8 rounded-3xl bg-black/60 border border-white/20 backdrop-blur-xl max-w-sm w-full"
            >
              <span className="text-8xl mb-4 block animate-bounce">🏁</span>
              <h2 className="text-4xl font-black text-white uppercase tracking-wider mb-2">
                {t("colors.battleOver")}
              </h2>
              <p className="text-white/80 font-mono text-sm uppercase tracking-widest mb-8">
                {t("colors.resultsOnTV")}
              </p>
              <div className="bg-black/50 border border-white/20 p-6 rounded-2xl backdrop-blur-md">
                <span className="text-xs font-mono text-gray-300 uppercase block mb-1">TOPLAM KATKIN:</span>
                <span className="text-5xl font-black text-white flex items-center justify-center gap-2">
                  <NumberTicker value={localClicks} /> TIK
                </span>
              </div>
            </CardSpotlight>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
