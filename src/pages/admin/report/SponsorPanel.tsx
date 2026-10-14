import { useLocale } from "../../../hooks/useLocale";
import { impressionsCsv, summarizeSponsors, type AdImpressionRecord } from "../../../lib/sponsorReport";

/**
 * Sponsor gösterim raporu (proof-of-play, docs/roadmap.md 3.3): sponsor
 * başına gösterim, tam gösterim oranı, ekran süresi ve izleyici; satır satır
 * döküm CSV olarak indirilir (sponsora ek / fatura).
 */
export function SponsorPanel({ impressions }: { impressions: AdImpressionRecord[] }) {
  const { t } = useLocale();
  const rows = summarizeSponsors(impressions);

  const download = () => {
    const blob = new Blob([impressionsCsv(impressions)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hengame-sponsor-gosterimleri.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section aria-labelledby="sponsor-title" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="sponsor-title" className="text-sm font-black uppercase tracking-widest text-alaz-orange">
          {t("report.sponsorTitle")}
        </h2>
        {impressions.length > 0 && (
          <button
            type="button"
            onClick={download}
            className="rounded-xl border border-white/20 px-3 py-2 text-[11px] font-black uppercase tracking-widest text-white/80 hover:text-white hover:border-white/50"
          >
            {t("report.sponsorCsv")}
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-white/60">{t("report.sponsorEmpty")}</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-widest text-white/50">
              <th scope="col" className="py-2 font-bold">{t("report.sponsorColSponsor")}</th>
              <th scope="col" className="py-2 font-bold text-right">{t("report.sponsorColImpressions")}</th>
              <th scope="col" className="py-2 font-bold text-right">{t("report.sponsorColCompleted")}</th>
              <th scope="col" className="py-2 font-bold text-right">{t("report.sponsorColSeconds")}</th>
              <th scope="col" className="py-2 font-bold text-right">{t("report.sponsorColAudience")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.sponsor} className="border-t border-white/10">
                <th scope="row" className="py-2 text-left font-bold">{row.sponsor}</th>
                <td className="py-2 text-right tabular-nums">{row.impressions}</td>
                <td className="py-2 text-right tabular-nums">%{Math.round(row.completionRate * 100)}</td>
                <td className="py-2 text-right tabular-nums">{row.secondsOnScreen}</td>
                <td className="py-2 text-right tabular-nums">{row.avgAudience}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
