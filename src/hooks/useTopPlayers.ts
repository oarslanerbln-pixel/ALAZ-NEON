import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Player } from "../types/database";

export type LeaderboardRange = "week" | "all";

export interface TopPlayer {
  rank: number;
  name: string;
  score: number;
}

/**
 * Gerçek `players` kayıtlarından sıralama üretir.
 *
 * Hem /leaderboard sayfası hem de boşta ekranı (AttractMode) bunu kullanıyor —
 * ikisi de eskiden AYNI sabit sahte listeyi ("Ateşin_Oğlu", 12450 puan...)
 * gösteriyordu, yani bir mekan sahibine demo yapılırken uydurma isimler
 * görünüyordu.
 *
 * Aynı takma ad birden fazla odada oynamış olabileceği için puanlar isim
 * bazında toplanıyor.
 *
 * NOT: oyuncular henüz mekana bağlı değil (çoklu-kiracılık eksiği), bu yüzden
 * sıralama tüm mekanları birlikte gösteriyor. Tek müşteride doğru; ikinci
 * müşteriden itibaren buraya mekan filtresi eklenmeli.
 */
export function useTopPlayers(range: LeaderboardRange, limit = 10) {
  const [players, setPlayers] = useState<TopPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const playersRef = collection(db, "players");
        // Tek alan aralık sorgusu — kompozit index gerektirmiyor.
        const q =
          range === "week"
            ? query(
                playersRef,
                where("created_at", ">=", Date.now() - 7 * 24 * 60 * 60 * 1000),
              )
            : query(playersRef);

        const snap = await getDocs(q);
        if (cancelled) return;

        const totals = new Map<string, number>();
        snap.docs.forEach((d) => {
          const p = d.data() as Player;
          const name = (p.nickname || "").trim();
          if (!name) return;
          totals.set(name, (totals.get(name) || 0) + (p.total_score || 0));
        });

        setPlayers(
          [...totals.entries()]
            .filter(([, score]) => score > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([name, score], i) => ({ rank: i + 1, name, score })),
        );
      } catch (err) {
        console.error("[useTopPlayers] Sıralama yüklenemedi:", err);
        if (!cancelled) setPlayers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [range, limit]);

  return { players, loading };
}
