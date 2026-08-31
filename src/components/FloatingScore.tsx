import { motion, AnimatePresence } from "framer-motion";

export interface ScoreItem {
  id: string | number;
  points: number | string;
  prefix?: string;
  color?: string;
}

interface Props {
  items: ScoreItem[];
  className?: string;
}

export function FloatingScore({ items, className = "" }: Props) {
  return (
    <div className={`pointer-events-none absolute inset-0 z-50 overflow-hidden flex items-center justify-center ${className}`}>
      <AnimatePresence>
        {items.map((item) => {
          const isPositive = typeof item.points === "number" ? item.points >= 0 : !item.points.startsWith("-");
          const defaultColor = isPositive ? "#00ff2a" : "#ff0055"; // Green or Red
          const color = item.color || defaultColor;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10, scale: 0.5 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                y: -60,
                scale: [0.5, 1.4, 1.2, 0.9]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute font-black text-3xl font-premium tracking-wider select-none drop-shadow-[0_0_15px_currentColor]"
              style={{ color }}
            >
              {item.prefix ?? (isPositive ? "+" : "")}
              {item.points}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
