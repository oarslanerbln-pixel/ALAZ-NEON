/**
 * Quiz içerik şeması (docs/roadmap.md, 3.4). Hem gömülü havuzlar
 * (`src/content/quiz/*.json`, CI'da birim testiyle) hem de personelin
 * yüklediği mekan/kurum soru paketleri (yüklemede ve oyun başında) aynı
 * kurallarla doğrulanır. Hatalar kod olarak döner; ekran çevirir.
 */
import type { QuizQuestion } from "../types/database";

export const QUIZ_PACK_LOCALES = ["tr", "de", "en"] as const;
export type QuizPackLocale = (typeof QUIZ_PACK_LOCALES)[number];

export const QUIZ_PACK_LIMITS = {
  minQuestions: 5,
  maxQuestions: 200,
  titleMax: 60,
  idMax: 40,
  textMin: 10,
  textMax: 200,
  optionMax: 80,
  categoryMax: 40,
  funFactMax: 300,
} as const;

export interface QuizPack {
  title: string;
  locale: QuizPackLocale;
  questions: QuizQuestion[];
}

export type QuizIssueCode =
  | "notObject"
  | "title"
  | "locale"
  | "count"
  | "questionShape"
  | "id"
  | "duplicateId"
  | "text"
  | "duplicateText"
  | "options"
  | "duplicateOptions"
  | "correctOption"
  | "difficulty"
  | "category"
  | "funFact";

/** `ref`: sorunun kimliği, kimliği yoksa "#sıra" (1'den başlar). */
export interface QuizIssue {
  code: QuizIssueCode;
  ref?: string;
}

export type Validation<T> = { ok: true; value: T } | { ok: false; issues: QuizIssue[] };

const OPTION_KEYS = ["A", "B", "C", "D"] as const;
const ID_PATTERN = /^[A-Za-z0-9_-]+$/;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string | null => (typeof v === "string" ? v.trim() : null);

/** Tek bir soruyu doğrular ve fazladan alanları atarak normalleştirir. */
function checkQuestion(raw: unknown, index: number): { question: QuizQuestion | null; issues: QuizIssue[] } {
  const L = QUIZ_PACK_LIMITS;
  if (!isObject(raw)) return { question: null, issues: [{ code: "questionShape", ref: `#${index + 1}` }] };

  const id = str(raw.id);
  const ref = id || `#${index + 1}`;
  const issues: QuizIssue[] = [];
  const fail = (code: QuizIssueCode) => issues.push({ code, ref });

  if (!id || id.length > L.idMax || !ID_PATTERN.test(id)) fail("id");

  const text = str(raw.text);
  if (!text || text.length < L.textMin || text.length > L.textMax) fail("text");

  const options: Record<string, string> = {};
  if (!isObject(raw.options) || Object.keys(raw.options).length !== 4) {
    fail("options");
  } else {
    for (const key of OPTION_KEYS) {
      const value = str(raw.options[key]);
      if (!value || value.length > L.optionMax) {
        fail("options");
        break;
      }
      options[key] = value;
    }
    const values = Object.values(options).map((v) => v.toLocaleLowerCase());
    if (values.length === 4 && new Set(values).size !== 4) fail("duplicateOptions");
  }

  const correct = raw.correctOption;
  if (typeof correct !== "string" || !(OPTION_KEYS as readonly string[]).includes(correct)) fail("correctOption");

  if (raw.difficulty !== 1 && raw.difficulty !== 2 && raw.difficulty !== 3) fail("difficulty");

  const category = raw.category === undefined ? undefined : str(raw.category);
  if (category === null || (category !== undefined && category.length > L.categoryMax)) fail("category");

  const funFact = raw.funFact === undefined ? undefined : str(raw.funFact);
  if (funFact === null || (funFact !== undefined && funFact.length > L.funFactMax)) fail("funFact");

  if (issues.length > 0) return { question: null, issues };
  return {
    question: {
      id: id!,
      text: text!,
      options: options as QuizQuestion["options"],
      correctOption: correct as QuizQuestion["correctOption"],
      difficulty: raw.difficulty as QuizQuestion["difficulty"],
      ...(category ? { category } : {}),
      ...(funFact ? { funFact } : {}),
    },
    issues,
  };
}

/** Soru listesini doğrular: her soru geçerli, kimlik ve metin benzersiz. */
export function validateQuestions(raw: unknown): Validation<QuizQuestion[]> {
  if (!Array.isArray(raw)) return { ok: false, issues: [{ code: "count" }] };

  const issues: QuizIssue[] = [];
  const questions: QuizQuestion[] = [];
  const ids = new Set<string>();
  const texts = new Set<string>();

  raw.forEach((item, index) => {
    const result = checkQuestion(item, index);
    issues.push(...result.issues);
    const q = result.question;
    if (!q) return;
    if (ids.has(q.id)) issues.push({ code: "duplicateId", ref: q.id });
    ids.add(q.id);
    const text = q.text.toLocaleLowerCase();
    if (texts.has(text)) issues.push({ code: "duplicateText", ref: q.id });
    texts.add(text);
    questions.push(q);
  });

  return issues.length > 0 ? { ok: false, issues } : { ok: true, value: questions };
}

/** Yüklenen paket dosyasını (JSON'dan çözülmüş) doğrular ve normalleştirir. */
export function parseQuizPack(raw: unknown): Validation<QuizPack> {
  const L = QUIZ_PACK_LIMITS;
  if (!isObject(raw)) return { ok: false, issues: [{ code: "notObject" }] };

  const issues: QuizIssue[] = [];
  const title = str(raw.title);
  if (!title || title.length > L.titleMax) issues.push({ code: "title" });

  const locale = raw.locale;
  if (typeof locale !== "string" || !(QUIZ_PACK_LOCALES as readonly string[]).includes(locale)) {
    issues.push({ code: "locale" });
  }

  const count = Array.isArray(raw.questions) ? raw.questions.length : -1;
  if (count < L.minQuestions || count > L.maxQuestions) issues.push({ code: "count" });

  const questions = validateQuestions(raw.questions);
  if (!questions.ok) issues.push(...questions.issues.filter((issue) => issue.code !== "count"));

  if (issues.length > 0 || !questions.ok) return { ok: false, issues };
  return { ok: true, value: { title: title!, locale: locale as QuizPackLocale, questions: questions.value } };
}
