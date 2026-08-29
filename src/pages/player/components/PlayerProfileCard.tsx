import { motion } from "framer-motion";
import { useUserProfile } from "../../../hooks/useUserProfile";
import type { LeagueTier } from "../../../types/database";
import { auth } from "../../../lib/firebase";
import { useLocale } from "../../../hooks/useLocale";
import { getLeagueFromScore } from "../../../lib/league";

const TIER_COLORS: Record<LeagueTier, string> = {
  BRONZE: "#cd7f32",
  SILVER: "#c0c0c0",
  GOLD: "#ffd700",
  PLATINUM: "#e5e4e2",
  NEON: "#ff003c",
  LEGEND: "#9400d3"
};

/**
 * Lig adları artık modül seviyesinde sabit değil — çeviri anahtarına
 * eşleniyor, isim `t()` ile render sırasında çözülüyor (modül yüklenirken
 * çözseydik dil değişince güncellenmezdi).
 */
const TIER_KEYS = {
  BRONZE: "profile.tier.BRONZE",
  SILVER: "profile.tier.SILVER",
  GOLD: "profile.tier.GOLD",
  PLATINUM: "profile.tier.PLATINUM",
  NEON: "profile.tier.NEON",
  LEGEND: "profile.tier.LEGEND",
} as const satisfies Record<LeagueTier, string>;

export function PlayerProfileCard() {
  const { profile, loading } = useUserProfile();
  const { t } = useLocale();

  if (loading) {
    return (
      <div className="w-full p-4 flex justify-center">
        <div className="w-6 h-6 border-2 border-alaz-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  // profile.current_league profil oluşturulurken hep "BRONZE" olarak
  // sabitleniyor ve bir daha hiç güncellenmiyordu (bkz. useUserProfile.ts) —
  // ligi burada, gösterim anında, gerçek total_lifetime_score'dan CANLI
  // hesaplıyoruz ki puan arttıkça rozet de doğru şekilde yükselsin.
  const league = getLeagueFromScore(profile.total_lifetime_score).tier;
  const color = TIER_COLORS[league];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full relative overflow-hidden"
    >
      {/* Premium Glass Panel Card */}
      <div 
        className="relative p-6 border bg-black/40 backdrop-blur-md shadow-2xl flex flex-col gap-4"
        style={{ 
          borderColor: `${color}40`,
          boxShadow: `0 10px 40px ${color}20, inset 0 0 20px ${color}10` 
        }}
      >
        {/* Glow behind */}
        <div 
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: color }}
        />

        {/*
          `min-w-0` olmadan sol blok içeriğinin altına inemiyor ve uzun takma
          adlar ("PLAYER_AV3W") lig rozetinin üstüne binip kesiliyordu.
          Rozet ise `shrink-0` ile tam boyutunu koruyor.
        */}
        <div className="flex justify-between items-start gap-3 z-10">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-white/50 tracking-[0.3em] uppercase mb-1">{t("profile.idCard")}</p>
            <h2
              className="text-xl sm:text-2xl font-bold tracking-wide uppercase drop-shadow-md truncate"
              style={{ color: "#fff", textShadow: `0 0 10px ${color}` }}
            >
              {profile.nickname}
            </h2>
            <p className="text-xs tracking-wider opacity-70 mt-1 font-mono">
              {profile.phone_number.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4")}
            </p>
          </div>

          {/* Tier Badge */}
          <div className="flex flex-col items-center shrink-0">
            <div 
              className="w-12 h-12 flex items-center justify-center font-bold text-xl rounded shadow-lg border relative overflow-hidden group"
              style={{ 
                backgroundColor: `${color}20`, 
                borderColor: color,
                color: color,
                boxShadow: `0 0 15px ${color}40`
              }}
            >
              <div 
                className="absolute inset-0 opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity"
                style={{ 
                  background: `linear-gradient(45deg, transparent 0%, ${color}40 50%, transparent 100%)` 
                }} 
              />
              {league.charAt(0)}
            </div>
            <span
              className="text-[9px] font-bold tracking-[0.1em] mt-2 text-center whitespace-nowrap"
              style={{ color }}
            >
              {t(TIER_KEYS[league])}
            </span>
          </div>
        </div>

        <div className="mt-2 pt-4 border-t border-white/10 flex justify-between items-end z-10">
          <div>
            <p className="text-[10px] text-white/40 tracking-widest uppercase">{t("profile.totalScore")}</p>
            <p 
              className="text-3xl font-black tracking-wider"
              style={{ color: color, textShadow: `0 0 15px ${color}80` }}
            >
              {profile.total_lifetime_score.toLocaleString()}
            </p>
          </div>
          
          <button 
            onClick={() => auth.signOut()}
            className="text-[10px] uppercase tracking-widest border border-white/20 px-3 py-1 hover:bg-white/10 transition-colors"
          >
            {t("profile.logout")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
