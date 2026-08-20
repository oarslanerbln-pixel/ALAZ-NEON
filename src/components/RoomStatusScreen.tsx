import { useNavigate } from "react-router-dom";
import { useLocale } from "../hooks/useLocale";

type Kind = "loading" | "notfound" | "error";

interface Props {
  kind: Kind;
  roomId?: string | null;
  detail?: string;
}

/**
 * Oda yüklenemediğinde çıplak siyah ekran yerine ne olduğunu söyleyen ekran.
 * Eskiden HostDisplay `room === null` iken boş bir <div> döndürüyordu ve
 * hatalı roomId / silinmiş oda / Firestore kural reddi durumlarında
 * sonsuza kadar siyah ekranda kalınıyordu.
 */
export function RoomStatusScreen({ kind, roomId, detail }: Props) {
  const navigate = useNavigate();
  const { t } = useLocale();

  const config = {
    loading: {
      color: "#00ff41",
      title: t("roomStatus.loadingTitle"),
      body: t("roomStatus.loadingBody"),
    },
    notfound: {
      color: "#fcee0a",
      title: t("roomStatus.notfoundTitle"),
      body: t("roomStatus.notfoundBody"),
    },
    error: {
      color: "#ff4d00",
      title: t("roomStatus.errorTitle"),
      body: t("roomStatus.errorBody"),
    },
  }[kind];

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center gap-6 p-8 font-mono text-center">
      <div
        className="text-4xl md:text-6xl font-black uppercase tracking-widest"
        style={{ color: config.color, textShadow: `0 0 40px ${config.color}` }}
      >
        {kind === "loading" ? (
          <span className="animate-pulse">{config.title}</span>
        ) : (
          config.title
        )}
      </div>

      <p className="text-gray-400 max-w-xl text-sm md:text-base leading-relaxed">
        {config.body}
      </p>

      {roomId && (
        <div className="text-xs text-gray-600 uppercase tracking-[0.3em]">
          roomId: {roomId}
        </div>
      )}

      {detail && (
        <pre className="text-xs text-red-400/80 bg-red-950/20 border border-red-500/30 rounded-lg p-4 max-w-2xl overflow-auto whitespace-pre-wrap text-left">
          {detail}
        </pre>
      )}

      {kind !== "loading" && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => navigate("/host/setup")}
            className="px-6 py-3 bg-white text-black rounded-xl font-black uppercase text-xs tracking-widest hover:bg-alaz-orange hover:text-white transition-all"
          >
            {t("roomStatus.newRoom")}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-black border border-white/20 text-white/80 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all"
          >
            {t("roomStatus.retry")}
          </button>
        </div>
      )}
    </div>
  );
}
