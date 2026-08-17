import { useSyncExternalStore } from "react";

import { motion } from "framer-motion";

/**
 * navigator.onLine tarayıcıya ait harici bir state. Bunu useEffect içinde
 * setState ile kopyalamak zincirleme render'a yol açıyordu; React'in bu iş
 * için tasarlanmış API'si useSyncExternalStore.
 */
function subscribeToNetwork(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

const getIsOnline = () => navigator.onLine;
const getIsOnlineServer = () => true;

export function DatabaseStatus() {
  const isOnline = useSyncExternalStore(
    subscribeToNetwork,
    getIsOnline,
    getIsOnlineServer,
  );

  const status = isOnline ? "connected" : "disconnected";

  return (
    <div className="fixed bottom-4 left-4 z-[100] flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm pointer-events-none">
      <motion.div
        animate={{
          scale: isOnline ? [1, 1.2, 1] : 1,
          opacity: isOnline ? [0.6, 1, 0.6] : 1,
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`w-2 h-2 rounded-full ${
          isOnline
            ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
            : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
        }`}
      />
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
        DB: {status}
      </span>
    </div>
  );
}
