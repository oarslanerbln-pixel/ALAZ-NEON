import { useLocale } from "../../../hooks/useLocale";
import { GAME_CARDS } from "../../../lib/gameCatalog";
import type { VenueKpis } from "../../../lib/venueKpis";

const gameName = (id: string) => {
  const card = GAME_CARDS.find((g) => g.id === id);
  return card ? `${card.titlePrefix} ${card.titleHighlight}` : id;
};

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[11px] uppercase tracking-widest text-white/50">{label}</p>
      <p className="text-2xl font-black text-white mt-1 tabular-nums">{value}</p>
      {note && <p className="text-xs text-white/50 mt-0.5">{note}</p>}
    </div>
  );
}

/** Oyun olaylarından hesaplanan mekan göstergeleri (docs/roadmap.md, 3.2). */
export function VenueKpiPanel({ kpis }: { kpis: VenueKpis }) {
  const { t } = useLocale();
  const dash = "—";
  const maxCount = Math.max(1, ...kpis.topGames.map((g) => g.count));

  return (
    <section aria-labelledby="venue-kpi-title" className="space-y-4">
      <h2 id="venue-kpi-title" className="text-sm font-black uppercase tracking-widest text-alaz-orange">
        {t("report.kpiTitle")}
      </h2>

      {kpis.gamesPlayed === 0 && <p className="text-sm text-white/60">{t("report.noTelemetry")}</p>}

      <div className="grid grid-cols-2 gap-3">
        <Stat
          label={t("report.gamesPlayed")}
          value={String(kpis.gamesPlayed)}
          note={kpis.gamesPlayed > 0 ? t("report.gamesPerNight", kpis.gamesPerNight) : undefined}
        />
        <Stat label={t("report.avgPlayers")} value={kpis.gamesPlayed > 0 ? String(kpis.avgPlayersPerGame) : dash} />
        <Stat
          label={t("report.avgMinutes")}
          value={kpis.avgGameMinutes === null ? dash : t("report.minutes", kpis.avgGameMinutes)}
        />
        <Stat
          label={t("report.peakHour")}
          value={kpis.peakHour === null ? dash : `${String(kpis.peakHour).padStart(2, "0")}:00`}
        />
        <Stat label={t("report.uniqueGuests")} value={String(kpis.uniqueGuests)} />
        <Stat
          label={t("report.returning")}
          value={
            kpis.returningRate === null
              ? dash
              : t("report.returningValue", kpis.returningGuests, Math.round(kpis.returningRate * 100))
          }
        />
      </div>

      {kpis.topGames.length > 0 && (
        <div>
          <h3 className="text-[11px] uppercase tracking-widest text-white/50 mb-2">{t("report.topGames")}</h3>
          <ul className="space-y-2">
            {kpis.topGames.slice(0, 5).map((g) => (
              <li key={g.game} className="text-sm">
                <div className="flex justify-between">
                  <span className="font-bold">{gameName(g.game)}</span>
                  <span className="tabular-nums text-white/70">{g.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 mt-1">
                  <div className="h-full rounded-full bg-alaz-orange" style={{ width: `${(g.count / maxCount) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
