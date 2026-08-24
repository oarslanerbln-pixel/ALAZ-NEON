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
    <header className="flex justify-between items-center mb-8 relative z-20 bg-black/40 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
      <h1 className="text-3xl font-black italic tracking-widest bg-gradient-to-r from-alaz-orange to-cyber-yellow bg-clip-text text-transparent">
        {room.venue_name || "HENGAME"}
      </h1>
      {(room.status === "playing" ||
        room.status === "review" ||
        room.status === "standings" ||
        room.status === "finished") && (
        <div className="flex items-center gap-2 px-4 py-2 border border-alaz-orange/30 rounded-xl bg-alaz-orange/10">
          <NeonIcon
            type="history"
            color="orange"
            className="w-5 h-5 animate-spin-slow"
          />
          <span className="text-alaz-orange font-black text-lg tracking-widest">
            {t("hostHeader.roundLabel", room.current_round, room.total_rounds)}
          </span>
        </div>
      )}
      <div className="flex items-center gap-4">
        {onTriggerAdBreak && (
          <button
            onClick={onTriggerAdBreak}
            className="text-[10px] text-cyber-yellow hover:text-black border border-cyber-yellow/30 hover:bg-cyber-yellow px-3 py-1.5 rounded-lg uppercase tracking-widest font-black transition-colors"
          >
            Reklam Arası
          </button>
        )}
        <LanguageSwitcher />
        {onEndGameEarly && (
          <button
            onClick={onEndGameEarly}
            className="text-[10px] text-red-500 hover:text-white border border-red-500/30 hover:bg-red-500/20 px-3 py-1.5 rounded-lg uppercase tracking-widest font-black transition-colors"
          >
            {t("hostHeader.endEarly")}
          </button>
        )}
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">
          {t("hostHeader.roomCode")}
        </span>
        <span className="text-2xl font-mono font-black text-white bg-white/10 px-4 py-1.5 rounded-lg border border-white/20">
          {room.code || "..."}
        </span>
      </div>
    </header>
  );
}
