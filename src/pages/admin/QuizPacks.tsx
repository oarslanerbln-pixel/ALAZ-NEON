import { useRef, useState } from "react";
import { Link } from "react-router-dom";

import { StaffAccessNotice } from "../../components/StaffAccessNotice";
import { useIsStaff } from "../../hooks/useIsStaff";
import { useLocale } from "../../hooks/useLocale";
import { deleteQuizPack, saveQuizPack, useQuizPacks, type QuizPackSummary } from "../../hooks/useQuizPacks";
import { createLogger } from "../../lib/logger";
import { parseQuizPack, QUIZ_PACK_LIMITS, type QuizIssue, type QuizPack } from "../../lib/quizPack";
import samplePack from "../../content/quiz/sample-pack.json";

const log = createLogger("QuizPacks");

type Issue = QuizIssue | { code: "notJson"; ref?: undefined };
type Translate = ReturnType<typeof useLocale>["t"];

/** Sınır içeren iletilere sayıları şemadan verir; metin ile kural ayrışmasın. */
function issueText(t: Translate, issue: Issue): string {
  const L = QUIZ_PACK_LIMITS;
  switch (issue.code) {
    case "title":
      return t("content.issue.title", L.titleMax);
    case "count":
      return t("content.issue.count", L.minQuestions, L.maxQuestions);
    case "id":
      return t("content.issue.id", L.idMax);
    case "text":
      return t("content.issue.text", L.textMin, L.textMax);
    case "options":
      return t("content.issue.options", L.optionMax);
    case "category":
      return t("content.issue.category", L.categoryMax);
    case "funFact":
      return t("content.issue.funFact", L.funFactMax);
    default:
      return t(`content.issue.${issue.code}`);
  }
}

/**
 * Mekan/kurum soru paketleri (docs/roadmap.md, 3.4). Personel bir JSON
 * dosyası seçer; dosya yüklenmeden önce şemayla doğrulanır ve sorunlar
 * soru kimliğiyle listelenir. Kaydedilen paket TV'de quiz ayarlarından
 * seçilir.
 */
export function QuizPacks() {
  const { t, locale } = useLocale();
  const { user, isStaff } = useIsStaff();
  const packs = useQuizPacks(isStaff === true);
  const fileInput = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<QuizPack | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");

  if (user === undefined || (user && isStaff === undefined)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/50 font-mono text-sm uppercase tracking-widest">
        {t("common.loading")}
      </div>
    );
  }
  if (!user || !isStaff) {
    return <StaffAccessNotice title={t("content.title")} user={user} />;
  }

  const readFile = async (file: File) => {
    setStatus("idle");
    setDraft(null);
    setIssues([]);
    let raw: unknown;
    try {
      raw = JSON.parse(await file.text());
    } catch {
      setIssues([{ code: "notJson" }]);
      return;
    }
    const result = parseQuizPack(raw);
    if (result.ok) setDraft(result.value);
    else setIssues(result.issues);
  };

  const save = async () => {
    if (!draft) return;
    setStatus("saving");
    try {
      await saveQuizPack(draft, user.uid);
      setDraft(null);
      setStatus("saved");
      if (fileInput.current) fileInput.current.value = "";
    } catch (err) {
      log.error("Soru paketi kaydedilemedi:", err);
      setStatus("failed");
    }
  };

  const remove = (pack: QuizPackSummary) => {
    if (!window.confirm(t("content.confirmDelete", pack.title))) return;
    deleteQuizPack(pack.id).catch((err) => log.error("Soru paketi silinemedi:", err));
  };

  const downloadSample = () => {
    const blob = new Blob([JSON.stringify(samplePack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hengame-soru-paketi.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const button =
    "rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer";

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-inter">
      <div className="max-w-2xl mx-auto space-y-8">
        <header>
          <Link to="/admin/venue" className="text-[11px] uppercase tracking-widest text-alaz-orange hover:text-white">
            {t("content.back")}
          </Link>
          <h1 className="text-3xl font-black uppercase tracking-widest mt-3">{t("content.title")}</h1>
          <p className="text-white/60 text-sm mt-2">{t("content.subtitle")}</p>
        </header>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap gap-3">
            <label className={`${button} bg-alaz-orange text-black hover:bg-white focus-within:outline focus-within:outline-2 focus-within:outline-white`}>
              {t("content.upload")}
              <input
                ref={fileInput}
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void readFile(file);
                }}
              />
            </label>
            <button type="button" onClick={downloadSample} className={`${button} border border-white/20 text-white/80 hover:text-white hover:border-white/50`}>
              {t("content.template")}
            </button>
          </div>

          {issues.length > 0 && (
            <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm">
              <p className="font-bold text-red-300 mb-2">{t("content.invalid", issues.length)}</p>
              <ul className="space-y-1 text-red-100/90 max-h-64 overflow-y-auto">
                {issues.map((issue, i) => (
                  <li key={i}>
                    {issue.ref && <span className="font-mono text-red-300">{issue.ref}: </span>}
                    {issueText(t, issue)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {draft && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-4">
              <p className="text-sm font-bold text-emerald-200">
                {t("content.preview", draft.title, draft.questions.length, draft.locale)}
              </p>
              <button
                type="button"
                onClick={() => void save()}
                disabled={status === "saving"}
                className={`${button} bg-emerald-400 text-black hover:bg-white disabled:opacity-50`}
              >
                {t("content.save")}
              </button>
            </div>
          )}

          {status === "saved" && <p role="status" className="text-sm text-emerald-300">{t("content.saved")}</p>}
          {status === "failed" && <p role="alert" className="text-sm text-red-300">{t("content.saveFailed")}</p>}
        </section>

        <section>
          {packs === null ? (
            <p className="text-white/50 text-sm">{t("common.loading")}</p>
          ) : packs.length === 0 ? (
            <p className="text-white/50 text-sm">{t("content.empty")}</p>
          ) : (
            <ul className="space-y-3">
              {packs.map((pack) => (
                <li key={pack.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div>
                    <p className="font-bold">{t("content.preview", pack.title, pack.questionCount, pack.locale)}</p>
                    {pack.createdAt > 0 && (
                      <p className="text-xs text-white/50 mt-1">{new Date(pack.createdAt).toLocaleDateString(locale)}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(pack)}
                    aria-label={`${t("content.delete")} ${pack.title}`}
                    className={`${button} border border-red-500/40 text-red-300 hover:bg-red-500 hover:text-white`}
                  >
                    {t("content.delete")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
