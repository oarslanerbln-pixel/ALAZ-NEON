import { useState } from "react";
import { Link } from "react-router-dom";

import { useIsStaff } from "../../hooks/useIsStaff";
import { useLocale } from "../../hooks/useLocale";
import { addVenueStaff, removeVenueStaff, useVenueStaff, type VenueStaffMember } from "../../hooks/useVenueStaff";
import { useVenue } from "../../contexts/VenueContextCore";
import { StaffAccessNotice } from "../../components/StaffAccessNotice";
import { VenueSwitcher } from "../../components/VenueSwitcher";
import { DEFAULT_VENUE_ID, staffUidIssue, type StaffUidIssue } from "../../lib/venues";
import { createLogger } from "../../lib/logger";

const log = createLogger("VenueStaff");

/**
 * Mekan sahibinin personel ekranı (docs/design/3.1-cok-mekan.md, §5.5).
 * Sunucu olmadığı için e-postadan hesap bulunamıyor: yeni personel önce
 * hesap açar, /admin'de gördüğü kimliği sahibe verir, sahip buraya girer.
 * Sahip yalnızca "staff" ekler ve çıkarır; sahibi HENGAME ekibi atar.
 */
export function VenueStaff() {
  const { t } = useLocale();
  const { user, isStaff, venues, isOwner } = useIsStaff();
  const { venueId } = useVenue();
  const members = useVenueStaff(isStaff === true ? venueId : null);
  const [uid, setUid] = useState("");
  const [issue, setIssue] = useState<StaffUidIssue | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "added" | "failed">("idle");

  if (user === undefined || (user && isStaff === undefined)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/50 font-mono text-sm uppercase tracking-widest">
        {t("common.loading")}
      </div>
    );
  }
  if (!user || !isStaff) {
    return <StaffAccessNotice title={t("staffAdmin.title")} user={user} venues={venues} />;
  }

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const candidate = uid.trim();
    const found = staffUidIssue(candidate, user.uid, (members ?? []).map((m) => m.uid));
    setIssue(found);
    if (found) return;
    setStatus("saving");
    try {
      await addVenueStaff(venueId, candidate, user.uid);
      setUid("");
      setStatus("added");
    } catch (err) {
      log.error("Personel eklenemedi:", err);
      setStatus("failed");
    }
  };

  const remove = (member: VenueStaffMember) => {
    if (!window.confirm(t("staffAdmin.confirmRemove", member.uid))) return;
    removeVenueStaff(venueId, member.uid).catch((err) => {
      log.error("Personel çıkarılamadı:", err);
      setStatus("failed");
    });
  };

  const button = "rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer";

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-inter">
      <div className="max-w-2xl mx-auto space-y-8">
        <header>
          <Link to="/admin/venue" className="text-[11px] uppercase tracking-widest text-alaz-orange hover:text-white">
            {t("content.back")}
          </Link>
          <h1 className="text-3xl font-black uppercase tracking-widest mt-3">{t("staffAdmin.title")}</h1>
          <p className="text-white/60 text-sm mt-2">{t("staffAdmin.subtitle")}</p>
          <div className="mt-3">
            <VenueSwitcher venues={venues} />
          </div>
        </header>

        {isOwner ? (
          <form onSubmit={add} className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <label htmlFor="staff-uid" className="block text-[11px] uppercase tracking-widest text-white/50">
              {t("staffAdmin.addLabel")}
            </label>
            <div className="flex gap-3">
              <input
                id="staff-uid"
                value={uid}
                onChange={(e) => {
                  setUid(e.target.value);
                  setIssue(null);
                  setStatus("idle");
                }}
                autoComplete="off"
                spellCheck={false}
                className="flex-1 min-w-0 bg-black border border-white/20 rounded-xl px-4 py-3 font-mono text-sm"
              />
              <button
                type="submit"
                disabled={status === "saving"}
                className={`${button} bg-alaz-orange text-black hover:bg-white disabled:opacity-50`}
              >
                {t("staffAdmin.add")}
              </button>
            </div>
            <p className="text-xs text-white/40">{t("staffAdmin.addHint")}</p>
            {issue && <p role="alert" className="text-sm text-red-400">{t(`staffAdmin.issue.${issue}`)}</p>}
            {status === "added" && <p role="status" className="text-sm text-green-400">{t("staffAdmin.added")}</p>}
            {status === "failed" && <p role="alert" className="text-sm text-red-400">{t("staffAdmin.failed")}</p>}
          </form>
        ) : (
          <p className="text-sm text-white/60">{t("staffAdmin.ownerOnly")}</p>
        )}

        <section className="space-y-2">
          {venueId === DEFAULT_VENUE_ID && <p className="text-xs text-white/40">{t("staffAdmin.legacyNote")}</p>}
          {members && members.length === 0 && <p className="text-sm text-white/60">{t("staffAdmin.empty")}</p>}
          <ul className="space-y-2">
            {(members ?? []).map((m) => (
              <li
                key={m.uid}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs break-all">
                    {m.uid}
                    {m.uid === user.uid && <span className="text-white/40"> · {t("staffAdmin.you")}</span>}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-alaz-orange mt-1">
                    {m.role === "owner" ? t("staffAdmin.roleOwner") : t("staffAdmin.roleStaff")}
                  </p>
                </div>
                {isOwner && m.role === "staff" && (
                  <button
                    type="button"
                    onClick={() => remove(m)}
                    className={`${button} border border-white/20 text-white/70 hover:text-white hover:border-white/50`}
                  >
                    {t("staffAdmin.remove")}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
