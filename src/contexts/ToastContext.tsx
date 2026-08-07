import { useState, useCallback, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NeonIcon } from "../components/NeonIcon";
import { ToastContext, type Toast, type ToastType } from "./ToastContextCore";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 right-6 z-[2000] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center gap-4 p-4 rounded-2xl glass-panel-alaz shadow-2xl border-l-4 ${
                toast.type === "error"
                  ? "border-l-red-500 bg-red-500/10"
                  : toast.type === "success"
                    ? "border-l-green-500 bg-green-500/10"
                    : toast.type === "warning"
                      ? "border-l-alaz-orange bg-alaz-orange/10"
                      : "border-l-neon-blue bg-neon-blue/10"
              }`}
            >
              <div className="flex-shrink-0">
                <NeonIcon
                  type={
                    toast.type === "error"
                      ? "settings"
                      : toast.type === "success"
                        ? "crown"
                        : toast.type === "warning"
                          ? "lightbulb"
                          : "rocket"
                  }
                  color={
                    toast.type === "error"
                      ? "red"
                      : toast.type === "success"
                        ? "green"
                        : toast.type === "warning"
                          ? "orange"
                          : "blue"
                  }
                  className="w-6 h-6"
                />
              </div>
              <p className="text-sm font-bold text-white tracking-tight uppercase">
                {toast.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}


