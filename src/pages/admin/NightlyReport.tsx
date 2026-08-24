import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import type { Room, Reward, GameType } from "../../types/database";
import { errorMessage } from "../../lib/errors";

type RangePreset = "today" | "week" | "month";

const GAME_LABEL: Record<GameType, string> = {
  scattegories: "Hengame Arena",
  quiz: "Hengame Quiz",
  bomb: "Hengame Bomb",
  sensor: "Hengame Sensör",
  wheel: "Hengame Çark"
};

function rangeFor(preset: RangePreset): { start: number; end: number } {
  const now = new Date();
  const end = now.getTime();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (preset === "week") {
    // Pazartesi başlangıçlı hafta — getDay() Pazar=0 döndürüyor, ona göre kaydırıyoruz.
    const day = start.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diffToMonday);
  } else if (preset === "month") {
    start.setDate(1);
  }
  return { start: start.getTime(), end };
}

interface HourlyBucket {
  hourLabel: string;
  count: number;
}

interface ReportData {
  roomCount: number;
  finishedCount: number;
  playerCount: number;
  avgPlayersPerRoom: number;
  modeBreakdown: Record<string, number>;
  hourlyBreakdown: HourlyBucket[];
  rewardsGranted: number;
  rewardsClaimed: number;
}

export function NightlyReport() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState<User | null | undefined>(undefined);
  const [preset, setPreset] = useState<RangePreset>("today");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setAuthUser);
  }, []);

  const isPasswordAuthed =
    !!authUser && authUser.providerData.some((p) => p.providerId === "password");

  const loadReport = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { start, end } = rangeFor(preset);

      const roomsQ = query(
        collection(db, "rooms"),
        where("created_at", ">=", start),
        where("created_at", "<=", end),
      );
      const playersQ = query(
        collection(db, "players"),
        where("created_at", ">=", start),
        where("created_at", "<=", end),
      );
      const rewardsQ = query(
        collection(db, "rewards"),
        where("earned_at", ">=", start),
        where("earned_at", "<=", end),
      );

      const [roomsSnap, playersSnap, rewardsSnap] = await Promise.all([
        getDocs(roomsQ),
        getDocs(playersQ),
        getDocs(rewardsQ),
      ]);

      const rooms = roomsSnap.docs.map((d) => d.data() as Room & { created_at?: number });
      const rewards = rewardsSnap.docs.map((d) => d.data() as Reward);

      const modeBreakdown: Record<string, number> = {};
      const hourlyMap: Record<number, number> = {};
      let finishedCount = 0;

      for (const r of rooms) {
        const mode = (r.active_game && r.active_game !== "none" ? r.active_game : r.game_type) || "scattegories";
        const label = GAME_LABEL[mode as GameType] || mode;
        modeBreakdown[label] = (modeBreakdown[label] || 0) + 1;
        if (r.status === "finished") finishedCount++;

        if (r.created_at) {
          const hour = new Date(r.created_at).getHours();
          hourlyMap[hour] = (hourlyMap[hour] || 0) + 1;
        }
      }

      // Generate sorted hourly buckets for relevant hours
      const hourlyBreakdown: HourlyBucket[] = Object.keys(hourlyMap)
        .map(Number)
        .sort((a, b) => a - b)
        .map((hour) => ({
          hourLabel: `${String(hour).padStart(2, "0")}:00 - ${String((hour + 1) % 24).padStart(2, "0")}:00`,
          count: hourlyMap[hour],
        }));

      const playerCount = playersSnap.size;
      const avgPlayersPerRoom = rooms.length > 0 ? Math.round((playerCount / rooms.length) * 10) / 10 : 0;

      setData({
        roomCount: rooms.length,
        finishedCount,
        playerCount,
        avgPlayersPerRoom,
        modeBreakdown,
        hourlyBreakdown,
        rewardsGranted: rewards.length,
        rewardsClaimed: rewards.filter((r) => r.status === "claimed").length,
      });
    } catch (err) {
      setErrorMsg(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [preset]);

  useEffect(() => {
    if (isPasswordAuthed) loadReport();
  }, [isPasswordAuthed, preset, loadReport]);

  const copySummary = () => {
    if (!data) return;
    const summary = `📊 HEGAME Gece Analitiği (${preset.toUpperCase()})\n` +
      `🕹️ Toplam Oyun: ${data.roomCount} (${data.finishedCount} tamamlandı)\n` +
      `👥 Toplam Oyuncu: ${data.playerCount} (Oda başına ortalama: ${data.avgPlayersPerRoom})\n` +
      `🎁 Dağıtılan İkram: ${data.rewardsGranted} (Kullanılan: ${data.rewardsClaimed})\n` +
      `⚡ En Çok Oynanan Modlar: ` +
      Object.entries(data.modeBreakdown).map(([k, v]) => `${k} (${v})`).join(", ");

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authUser === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/50 font-mono text-sm uppercase tracking-widest">
        Yükleniyor...
      </div>
    );
  }

  if (!isPasswordAuthed) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center gap-6">
        <h1 className="text-2xl font-black uppercase tracking-widest text-alaz-orange">
          Gecelik Rapor
        </h1>
        <p className="text-white/50 max-w-sm">
          Bu ekran yalnızca işletme hesabıyla giriş yapıldığında açılır.
        </p>
        <Link
          to="/login"
          className="px-8 py-3 bg-alaz-orange text-black font-black uppercase tracking-widest rounded-xl"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  const redemptionRate =
    data && data.rewardsGranted > 0
      ? Math.round((data.rewardsClaimed / data.rewardsGranted) * 100)
      : null;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-inter">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-alaz-orange/20 text-alaz-orange font-bold uppercase tracking-widest border border-alaz-orange/30">HEGAME B2B</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-white mt-1">
              İşletme Analytics
            </h1>
            <p className="text-white/40 text-xs mt-1">{authUser.email}</p>
          </div>
          <button
            onClick={() => signOut(auth).then(() => navigate("/"))}
            className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white border border-white/10 px-3 py-2 rounded-lg transition-colors shrink-0"
          >
            Çıkış Yap
          </button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-3">
            <Link
              to="/admin/venue"
              className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white"
            >
              ← Mekan Ayarları
            </Link>
            <Link
              to="/admin/rewards"
              className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white"
            >
              Ödül Doğrula →
            </Link>
          </div>
          {data && (
            <button
              onClick={copySummary}
              className="text-[10px] uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md border border-white/20 transition-all"
            >
              {copied ? "✓ Kopyalandı!" : "📋 Özeti Kopyala"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {([
            ["today", "Bugün"],
            ["week", "Bu Hafta"],
            ["month", "Bu Ay"],
          ] as [RangePreset, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setPreset(value)}
              className={`py-3 text-xs font-black uppercase tracking-widest rounded-xl border transition-all ${
                preset === value
                  ? "bg-alaz-orange border-alaz-orange text-black"
                  : "bg-white/5 border-white/10 text-white/50 hover:border-white/30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {errorMsg && (
          <p className="text-[#ff003c] text-sm font-bold bg-[#ff003c]/10 border border-[#ff003c]/30 rounded-xl px-4 py-3 mb-6">
            {errorMsg}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-alaz-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Oyun Sayısı</p>
                <p className="text-3xl font-black text-white">{data.roomCount}</p>
                <p className="text-white/30 text-[10px] mt-1">{data.finishedCount} tamamlandı</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Oyuncu</p>
                <p className="text-3xl font-black text-white">{data.playerCount}</p>
                <p className="text-white/30 text-[10px] mt-1">toplam katılım</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Oda Başına</p>
                <p className="text-3xl font-black text-cyan-400">{data.avgPlayersPerRoom}</p>
                <p className="text-white/30 text-[10px] mt-1">ort. oyuncu</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">İkram Dağıtıldı</p>
                <p className="text-4xl font-black text-alaz-orange">{data.rewardsGranted}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Barda Kullanıldı</p>
                <p className="text-4xl font-black text-green-400">
                  {data.rewardsClaimed}
                  {redemptionRate !== null && (
                    <span className="text-base text-white/30 font-bold ml-2">%{redemptionRate}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Hourly Traffic Distribution */}
            {data.hourlyBreakdown.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-4">⏰ Saatlik Yoğunluk (Peak Hours)</p>
                <div className="space-y-3">
                  {data.hourlyBreakdown.map((item) => {
                    const maxHourly = Math.max(...data.hourlyBreakdown.map((b) => b.count), 1);
                    const percentage = Math.round((item.count / maxHourly) * 100);
                    return (
                      <div key={item.hourLabel} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/70 font-mono">{item.hourLabel}</span>
                          <span className="font-bold text-alaz-orange">{item.count} oyun</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-alaz-orange to-yellow-400 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {Object.keys(data.modeBreakdown).length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-4">🎮 Oyun Modu Popülaritesi</p>
                <div className="space-y-2">
                  {Object.entries(data.modeBreakdown)
                    .sort((a, b) => b[1] - a[1])
                    .map(([mode, count]) => {
                      const modePercent = Math.round((count / (data.roomCount || 1)) * 100);
                      return (
                        <div key={mode} className="flex items-center justify-between py-1 border-b border-white/5">
                          <span className="text-sm text-white/80">{mode}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-white/40">%{modePercent}</span>
                            <span className="font-mono font-bold text-alaz-orange">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {data.roomCount === 0 && (
              <p className="text-white/30 text-sm text-center py-8">
                Bu aralıkta hiç oyun açılmamış.
              </p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
