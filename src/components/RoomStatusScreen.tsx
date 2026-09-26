import { useNavigate } from "react-router-dom";
import { useLocale } from "../hooks/useLocale";
import type { TranslationKey } from "../lib/i18n";

type Kind = "loading" | "notfound" | "error" | "playerMissing";
type Audience = "host" | "player";

interface Props {
  kind: Kind;
  roomId?: string | null;
  detail?: string;
  /**
   * Ekranı kim görüyor. Host'a teknik ayrıntı (roomId, hata metni) ve "yeni
   * oda aç" gösteriliyor; misafire sade bir açıklama ve "odaya katıl".
   */
  audience?: Audience;
  /** Misafirin "odaya katıl" düğmesi bu kodla katılım formunu önden doldurur. */
  roomCode?: string;
}

interface Copy {
  color: string;
  title: TranslationKey;
  body: TranslationKey;
}

const COPY: Record<Audience, Record<Kind, Copy>> = {
  host: {
    loading: { color: "#00ff41", title: "roomStatus.loadingTitle", body: "roomStatus.loadingBody" },
    notfound: { color: "#fcee0a", title: "roomStatus.notfoundTitle", body: "roomStatus.notfoundBody" },
    error: { color: "#ff4d00", title: "roomStatus.errorTitle", body: "roomStatus.errorBody" },
    playerMissing: { color: "#fcee0a", title: "roomStatus.playerMissingTitle", body: "roomStatus.playerMissingBody" },
  },
  player: {
    loading: { color: "#00f3ff", title: "roomStatus.loadingTitle", body: "roomStatus.playerLoadingBody" },
    notfound: { color: "#fcee0a", title: "roomStatus.notfoundTitle", body: "roomStatus.playerNotfoundBody" },
    error: { color: "#ff4d00", title: "roomStatus.errorTitle", body: "roomStatus.playerErrorBody" },
    playerMissing: { color: "#fcee0a", title: "roomStatus.playerMissingTitle", body: "roomStatus.playerMissingBody" },
  },
};

/**
 * Oda yüklenemediğinde çıplak siyah ekran yerine ne olduğunu söyleyen ekran.
 * Eskiden HostDisplay `room === null` iken boş bir <div> döndürüyordu ve
 * hatalı roomId / silinmiş oda / Firestore kural reddi durumlarında
 * sonsuza kadar siyah ekranda kalınıyordu. Oyuncu tarafında da aynı boşluk
 * vardı: oda yoksa misafir sessizce sonsuz bir lobide bekliyordu.
 */
export function RoomStatusScreen({ kind, roomId, detail, audience = "host", roomCode }: Props) {
  const navigate = useNavigate();
  const { t } = useLocale();
  const copy = COPY[audience][kind];
  const isLoading = kind === "loading";
  const isHost = audience === "host";

  const primary = isHost
    ? { label: t("roomStatus.newRoom"), to: "/host/setup" }
    : { label: t("roomStatus.joinRoom"), to: roomCode ? `/join?code=${encodeURIComponent(roomCode)}` : "/join" };

  return (
    <div
      role={isLoading ? "status" : "alert"}
      aria-live={isLoading ? "polite" : "assertive"}
      className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center gap-6 px-6 py-8 font-mono text-center pb-[max(2rem,env(safe-area-inset-bottom))]"
    >
      {isLoading && (
        <div
          aria-hidden="true"
          className="w-16 h-16 rounded-full border-2 border-white/10 motion-safe:animate-spin"
          style={{ borderTopColor: copy.color, boxShadow: `0 0 24px ${copy.color}55` }}
        />
      )}

      <h1
        className="text-3xl md:text-6xl font-black uppercase tracking-widest break-words max-w-full"
        style={{ color: copy.color, textShadow: `0 0 40px ${copy.color}` }}
      >
        {isLoading ? <span className="motion-safe:animate-pulse">{t(copy.title)}</span> : t(copy.title)}
      </h1>

      <p className="text-gray-300 max-w-xl text-sm md:text-base leading-relaxed">{t(copy.body)}</p>

      {isHost && roomId && (
        <div className="text-xs text-gray-600 uppercase tracking-[0.3em] break-all">roomId: {roomId}</div>
      )}

      {isHost && detail && (
        <pre className="text-xs text-red-400/80 bg-red-950/20 border border-red-500/30 rounded-lg p-4 max-w-2xl overflow-auto whitespace-pre-wrap text-left">
          {detail}
        </pre>
      )}

      {!isLoading && (
        <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full max-w-xs sm:max-w-none sm:w-auto">
          <button
            type="button"
            onClick={() => navigate(primary.to)}
            className="min-h-12 px-6 py-3 bg-white text-black rounded-xl font-black uppercase text-xs tracking-widest hover:bg-alaz-orange hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all"
          >
            {primary.label}
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="min-h-12 px-6 py-3 bg-black border border-white/20 text-white/80 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all"
          >
            {t("roomStatus.retry")}
          </button>
        </div>
      )}
    </div>
  );
}
