import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { db } from "../../../lib/firebase";
import { doc, increment, updateDoc } from "firebase/firestore";
import { haptics } from "../../../lib/haptics";
import { useLocale } from "../../../hooks/useLocale";
import { Check } from "lucide-react";

interface Props {
  room: Room;
  player: Player;
}

type Shape = "straight" | "corner" | "t-shape";

interface CellDef {
  shape: Shape;
  valid: number[]; // e.g. [0, 180] for straight horizontal
}

// 3x3 Puzzle Templates
const PUZZLES: CellDef[][] = [
  // Puzzle 1: A loop with a cross/T
  [
    { shape: "corner", valid: [90] },      // right-down
    { shape: "straight", valid: [0, 180] },// horizontal
    { shape: "corner", valid: [180] },     // left-down
    { shape: "straight", valid: [90, 270] },// vertical
    { shape: "t-shape", valid: [90] },     // T-shape pointing right (top, bottom, right)
    { shape: "straight", valid: [90, 270] },// vertical
    { shape: "corner", valid: [0] },       // up-right
    { shape: "straight", valid: [0, 180] },// horizontal
    { shape: "corner", valid: [270] }      // up-left
  ],
  // Puzzle 2: S-curve
  [
    { shape: "corner", valid: [90] },      // right-down
    { shape: "corner", valid: [270] },     // left-up
    { shape: "straight", valid: [90, 270] },// vertical (distraction)
    { shape: "straight", valid: [90, 270] },// vertical
    { shape: "corner", valid: [90] },      // right-down
    { shape: "corner", valid: [270] },     // left-up
    { shape: "corner", valid: [0] },       // up-right
    { shape: "straight", valid: [0, 180] },// horizontal
    { shape: "corner", valid: [270] }      // up-left
  ]
];

interface CellState {
  shape: Shape;
  rotation: number;
  valid: number[];
}

export function PlayerKabloController({ room, player }: Props) {
  const { t } = useLocale();
  const [grid, setGrid] = useState<CellState[]>([]);
  const [status, setStatus] = useState<"playing" | "success">("playing");

  // Generate a random puzzle
  const generatePuzzle = useCallback(() => {
    const template = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
    const newGrid = template.map(cell => ({
      ...cell,
      rotation: [0, 90, 180, 270][Math.floor(Math.random() * 4)] // random initial rotation
    }));
    setGrid(newGrid);
    setStatus("playing");
  }, []);

  // Initialize puzzle when room enters kablo_active. This IS a legitimate
  // use of setState inside an effect: we're synchronizing local state with
  // an external system change (Firestore room status transition).
  useEffect(() => {
    if (room.status === "kablo_active" && grid.length === 0) {
      generatePuzzle(); // eslint-disable-line react-hooks/set-state-in-effect -- syncing with external Firestore state
    }
  }, [room.status, grid.length, generatePuzzle]);

  const rotateCell = (index: number) => {
    if (status !== "playing") return;
    haptics.tap();

    // Immutable update — spread only does a shallow copy, so mutating
    // newGrid[index].rotation was modifying the original state in-place.
    const newGrid = grid.map((cell, i) =>
      i === index ? { ...cell, rotation: (cell.rotation + 90) % 360 } : cell
    );
    setGrid(newGrid);

    // Check win condition
    const isWin = newGrid.every(cell => cell.valid.includes(cell.rotation));
    if (isWin) {
      haptics.success();
      setStatus("success");
      
      const playerRef = doc(db, "players", player.id);
      updateDoc(playerRef, {
        kablo_score: increment(1)
      }).catch(console.error);

      setTimeout(() => {
        if (room.status === "kablo_active") {
          generatePuzzle();
        }
      }, 1000);
    }
  };

  const renderPipe = (shape: Shape) => {
    // We draw pipes assuming rotation = 0.
    // straight: horizontal line (left to right)
    // corner: top to right
    // t-shape: top, bottom, right
    
    if (shape === "straight") {
      return <div className="absolute top-1/2 left-0 right-0 h-4 -mt-2 bg-yellow-400 shadow-[0_0_10px_rgba(255,200,0,0.8)] rounded-full" />;
    }
    if (shape === "corner") {
      return (
        <>
          <div className="absolute top-0 bottom-1/2 left-1/2 w-4 -ml-2 bg-yellow-400 shadow-[0_0_10px_rgba(255,200,0,0.8)] rounded-t-full" />
          <div className="absolute top-1/2 bottom-0 left-1/2 right-0 h-4 -mt-2 bg-yellow-400 shadow-[0_0_10px_rgba(255,200,0,0.8)] rounded-r-full" />
          <div className="absolute top-1/2 left-1/2 w-4 h-4 -ml-2 -mt-2 bg-yellow-400 rounded-full" />
        </>
      );
    }
    if (shape === "t-shape") {
      return (
        <>
          <div className="absolute top-0 bottom-0 left-1/2 w-4 -ml-2 bg-yellow-400 shadow-[0_0_10px_rgba(255,200,0,0.8)] rounded-full" />
          <div className="absolute top-1/2 left-1/2 right-0 h-4 -mt-2 bg-yellow-400 shadow-[0_0_10px_rgba(255,200,0,0.8)] rounded-r-full" />
        </>
      );
    }
    return null;
  };

  if (room.status !== "kablo_active") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-black text-yellow-400 font-mono tracking-widest uppercase mb-4 drop-shadow-[0_0_15px_rgba(255,200,0,0.5)]">
          {t("player.kabloTitle")}
        </h1>
        <p className="text-white/60">
          {t("kablo.lookAtTV")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden relative">
      <h2 className="text-2xl font-black text-yellow-400 mb-12 font-mono tracking-widest drop-shadow-[0_0_10px_rgba(255,200,0,0.5)]">
        {t("kablo.connectCircuit")}
      </h2>

      <div className="grid grid-cols-3 gap-2 p-4 bg-white/5 border-2 border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        {grid.map((cell, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            onClick={() => rotateCell(i)}
            className="w-20 h-20 bg-black/50 rounded-xl relative overflow-hidden border border-white/5 flex items-center justify-center"
          >
            {/* The wrapper that rotates */}
            <motion.div 
              className="absolute inset-0"
              animate={{ rotate: cell.rotation }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {renderPipe(cell.shape)}
            </motion.div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {status === "success" && (
          <motion.div
            key="success"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-green-500/20 backdrop-blur-sm pointer-events-none"
          >
            <div className="text-center">
              <Check className="w-32 h-32 text-green-500 drop-shadow-[0_0_20px_rgba(0,255,0,0.8)] mx-auto mb-4" />
              <div className="text-2xl font-black text-green-400 font-mono tracking-widest">
                {t("kablo.powerTransferred")}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 text-white/50 text-sm font-mono">
        {t("kablo.totalSolved")} <span className="text-yellow-400 text-xl ml-2">{player.kablo_score || 0}</span>
      </div>
    </div>
  );
}
