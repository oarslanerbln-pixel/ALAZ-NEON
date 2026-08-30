import { NeonIcon } from "../../../components/NeonIcon";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import { useLocale } from "../../../hooks/useLocale";

interface HostHeaderProps {
  room: {
    code: string;
    current_round: number;
    total_rounds: number;
    status: string;
    venue_name?: string;
  } | null;
  onEndGameEarly?: () => void;
  onTriggerAdBreak?: () => void;
}

export function HostHeader({ room, onEndGameEarly, onTriggerAdBreak }: HostHeaderProps) {
  // Hook, erken `return null`'dan ÖNCE çağrılmak zorunda — koşullu hook
  // çağrısı React'in hook sırası kuralını bozardı.
  const { t } = useLocale();

  if (!room) return null;

  return (
    <header className="flex justify-between items-center mb-8 relative z-20 bg-white/[0.03] p-5 rounded-3xl border border-white/10 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
      <h1 className="text-3xl font-light tracking-[0.2em] uppercase text-white/90 drop-shadow-sm">
        {room.venue_name || "HENGAME"}
      </h1>
      {(room.status === "playing" ||
        room.status === "review" ||
        room.status === "standings" ||
        room.status === "finished") && (
        <div className="flex items-center gap-3 px-5 py-2 border border-white/10 rounded-full bg-white/[0.05] shadow-[0_0_15px_rgba(255,255,255,0.02)]">
          <NeonIcon
            type="history"
            color="white"
            className="w-5 h-5 animate-spin-slow opacity-80"
          />
          <span className="text-white/90 font-medium text-sm tracking-[0.2em] uppercase">
            {t("hostHeader.roundLabel", room.current_round, room.total_rounds)}
          </span>
        </div>
      )}
      <div className="flex items-center gap-5">
        {onTriggerAdBreak && (
          <button
            onClick={onTriggerAdBreak}
            className="text-[10px] text-white/70 hover:text-white border border-white/20 hover:bg-white/10 px-4 py-2 rounded-full uppercase tracking-[0.2em] font-medium transition-all"
          >
            {t("hostHeader.adBreak")}
          </button>
        )}
        <LanguageSwitcher />
        {onEndGameEarly && (
          <button
            onClick={onEndGameEarly}
            className="text-[10px] text-red-400/80 hover:text-red-400 border border-red-500/20 hover:bg-red-500/10 px-4 py-2 rounded-full uppercase tracking-[0.2em] font-medium transition-all"
          >
            {t("hostHeader.endEarly")}
          </button>
        )}
        <div className="flex items-center gap-3 bg-white/[0.03] p-1.5 pr-5 rounded-full border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
          <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-medium pl-3">
            {t("hostHeader.roomCode")}
          </span>
          <span className="text-xl font-light tracking-widest text-white">
            {room.code || "..."}
          </span>
        </div>
      </div>
    </header>
  );
}
