import { useSyncExternalStore } from "react";

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
    <div className="fixed bottom-4 left-4 z-[100] flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 pointer-events-none">
      <div
        className={`w-2 h-2 rounded-full ${
          isOnline ? "bg-ok" : "bg-bad"
        }`}
      />
      <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
        DB: {status}
      </span>
    </div>
  );
}
