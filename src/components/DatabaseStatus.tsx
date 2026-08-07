import { useState, useEffect } from "react";

import { motion } from "framer-motion";

export function DatabaseStatus() {
  const [status, setStatus] = useState<
    "connected" | "reconnecting" | "disconnected"
  >("connected");

  useEffect(() => {
    const handleOnline = () => setStatus("connected");
    const handleOffline = () => setStatus("disconnected");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setStatus(navigator.onLine ? "connected" : "disconnected");

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-[100] flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm pointer-events-none">
      <motion.div
        animate={{
          scale: status === "connected" ? [1, 1.2, 1] : 1,
          opacity: status === "connected" ? [0.6, 1, 0.6] : 1,
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`w-2 h-2 rounded-full ${
          status === "connected"
            ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
            : status === "reconnecting"
              ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"
              : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
        }`}
      />
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
        DB: {status}
      </span>
    </div>
  );
}
