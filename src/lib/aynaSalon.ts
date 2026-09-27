import type { Locale } from "./i18n";

/**
 * AYNA "salon soruları" — doğru cevabı o gecenin, o salonun kendisi olan
 * sorular.
 *
 * Oyunun başında her misafir telefonunda birkaç kısa evet/hayır sorusu
 * yanıtlıyor (gizli anket). Sonra dünya sorularının arasına "Bu
 * salondakilerin yüzde kaçı…?" soruları giriyor ve gerçek, anketin
 * toplamından hesaplanıyor. Her gece farklı, yalnızca o salona özgü içerik:
 * yanındaki insanları tahmin etmek, oyunun empati tarafının kalbi.
 *
 * Mahremiyet: cevaplar herkese açık `answers` koleksiyonuna DEĞİL, yalnızca
 * host'un okuyabildiği `ayna_survey` koleksiyonuna yazılıyor (bkz.
 * firestore.rules). TV yalnızca toplamı gösteriyor ve AYNA_SALON_MIN'den az
 * kişinin cevapladığı soru hiç sorulmuyor. Sorular bilinçli olarak
 * zararsız: sağlık, siyaset, din, cinsellik, göç ve para yok.
 */

export interface SalonQuestion {
  id: string;
  /** Telefondaki anket sorusu — birinci tekil, evet/hayır. */
  prompt: Record<Locale, string>;
  /** TV'deki tahmin sorusu — salonun geneli hakkında. */
  text: Record<Locale, string>;
}

/** Bundan az kişinin cevapladığı salon sorusu sorulmaz (yerine yedek gelir). */
export const AYNA_SALON_MIN = 5;
/** Anketin en uzun süresi; herkes bitirirse daha erken kapanır. */
export const AYNA_SURVEY_MS = 30_000;

export const SALON_QUESTIONS: readonly SalonQuestion[] = [
  {
    id: "salon-bilingual",
    prompt: {
      tr: "En az iki dil konuşabiliyor musun?",
      de: "Sprichst du mindestens zwei Sprachen?",
      en: "Do you speak at least two languages?",
    },
    text: {
      tr: "Bu salondakilerin yüzde kaçı en az iki dil konuşabiliyor?",
      de: "Wie viel Prozent der Leute in diesem Raum sprechen mindestens zwei Sprachen?",
      en: "What percentage of people in this room speak at least two languages?",
    },
  },
  {
    id: "salon-first-visit",
    prompt: {
      tr: "Bu mekâna ilk kez mi geliyorsun?",
      de: "Bist du zum ersten Mal hier?",
      en: "Is this your first time here?",
    },
    text: {
      tr: "Bu salondakilerin yüzde kaçı buraya ilk kez geldi?",
      de: "Wie viel Prozent der Leute in diesem Raum sind zum ersten Mal hier?",
      en: "What percentage of people in this room are here for the first time?",
    },
  },
  {
    id: "salon-morning",
    prompt: {
      tr: "Kendini sabah insanı olarak görüyor musun?",
      de: "Bist du ein Morgenmensch?",
      en: "Are you a morning person?",
    },
    text: {
      tr: "Bu salondakilerin yüzde kaçı kendini sabah insanı olarak görüyor?",
      de: "Wie viel Prozent der Leute in diesem Raum sind Morgenmenschen?",
      en: "What percentage of people in this room are morning people?",
    },
  },
  {
    id: "salon-instrument",
    prompt: {
      tr: "Bir müzik aleti çalabiliyor musun?",
      de: "Spielst du ein Musikinstrument?",
      en: "Can you play a musical instrument?",
    },
    text: {
      tr: "Bu salondakilerin yüzde kaçı bir müzik aleti çalabiliyor?",
      de: "Wie viel Prozent der Leute in diesem Raum spielen ein Musikinstrument?",
      en: "What percentage of people in this room can play a musical instrument?",
    },
  },
  {
    id: "salon-book",
    prompt: {
      tr: "Son bir ayda bir kitap bitirdin mi?",
      de: "Hast du im letzten Monat ein Buch zu Ende gelesen?",
      en: "Have you finished a book in the last month?",
    },
    text: {
      tr: "Bu salondakilerin yüzde kaçı son bir ayda bir kitap bitirdi?",
      de: "Wie viel Prozent der Leute in diesem Raum haben im letzten Monat ein Buch beendet?",
      en: "What percentage of people in this room finished a book in the last month?",
    },
  },
  {
    id: "salon-helped-stranger",
    prompt: {
      tr: "Bu hafta bir yabancıya yardım ettin mi?",
      de: "Hast du diese Woche einem fremden Menschen geholfen?",
      en: "Did you help a stranger this week?",
    },
    text: {
      tr: "Bu salondakilerin yüzde kaçı bu hafta bir yabancıya yardım etti?",
      de: "Wie viel Prozent der Leute in diesem Raum haben diese Woche einem Fremden geholfen?",
      en: "What percentage of people in this room helped a stranger this week?",
    },
  },
  {
    id: "salon-cooked",
    prompt: {
      tr: "Bu hafta evde yemek pişirdin mi?",
      de: "Hast du diese Woche zu Hause gekocht?",
      en: "Did you cook at home this week?",
    },
    text: {
      tr: "Bu salondakilerin yüzde kaçı bu hafta evde yemek pişirdi?",
      de: "Wie viel Prozent der Leute in diesem Raum haben diese Woche zu Hause gekocht?",
      en: "What percentage of people in this room cooked at home this week?",
    },
  },
  {
    id: "salon-solo-travel",
    prompt: {
      tr: "Hiç tek başına yurt dışına seyahat ettin mi?",
      de: "Bist du schon einmal allein ins Ausland gereist?",
      en: "Have you ever travelled abroad on your own?",
    },
    text: {
      tr: "Bu salondakilerin yüzde kaçı hiç tek başına yurt dışına seyahat etti?",
      de: "Wie viel Prozent der Leute in diesem Raum sind schon allein ins Ausland gereist?",
      en: "What percentage of people in this room have travelled abroad on their own?",
    },
  },
];

/** Tüm salon soruları için ortak, cevaptan sonra okunan not. */
export const SALON_INSIGHT: Record<Locale, string> = {
  tr: "Bu rakam bu gece, bu salonda, sizin cevaplarınızdan doğdu. Yanındakileri ne kadar tanıyorsun?",
  de: "Diese Zahl ist heute Abend in diesem Raum aus euren Antworten entstanden. Wie gut kennst du die Leute neben dir?",
  en: "This number was born tonight, in this room, from your answers. How well do you know the people around you?",
};

const BY_ID = new Map(SALON_QUESTIONS.map((q) => [q.id, q]));

export function isSalonId(id: string | undefined | null): boolean {
  return typeof id === "string" && BY_ID.has(id);
}

export function salonQuestionById(id: string | undefined | null): SalonQuestion | undefined {
  return id ? BY_ID.get(id) : undefined;
}

/** Oyundaki salon sorusu sayısı: toplamın yaklaşık üçte biri, en az bir. */
export function salonQuestionCount(total: number): number {
  if (total <= 1) return 0;
  return Math.max(1, Math.round(total * 0.3));
}

/**
 * Soru sırası: salon soruları dünya sorularının arasına eşit aralıklarla
 * serpiliyor (ilk soru her zaman bir dünya sorusu — salon ısınsın).
 * Kalan dünya soruları `reserves`: yeterli cevap gelmeyen salon sorusunun
 * yerine geçiyor, böylece oyun kısalmıyor.
 */
export function buildQuestionOrder(
  worldIds: readonly string[],
  salonIds: readonly string[],
  total: number,
): { order: string[]; reserves: string[] } {
  const salon = salonIds.slice(0, Math.max(0, total - 1));
  const worldNeeded = Math.max(0, total - salon.length);
  const world = worldIds.slice(0, worldNeeded);
  const reserves = worldIds.slice(worldNeeded);

  // Aralıklar SABİT dünya sorusu sayısından hesaplanıyor; `+ i`, önceden
  // eklenen salon sorularının kaydırdığı konumu telafi ediyor.
  const order = [...world];
  salon.forEach((id, i) => {
    const slot = Math.round(((i + 1) * world.length) / (salon.length + 1)) + i;
    order.splice(Math.max(1, Math.min(slot, order.length)), 0, id);
  });
  return { order, reserves };
}

export interface SalonTally {
  yes: number;
  /** Bu soruyu evet ya da hayır diye cevaplayanlar ("geç" diyenler sayılmaz). */
  total: number;
}

/**
 * Anket dokümanlarını soru bazında sayar. Değer boolean değilse (geçildi ya
 * da kurcalanmış istemci) sayılmıyor.
 */
export function tallySurvey(docs: readonly { answers?: unknown }[], ids: readonly string[]): Record<string, SalonTally> {
  const tally: Record<string, SalonTally> = Object.fromEntries(ids.map((id) => [id, { yes: 0, total: 0 }]));
  for (const d of docs) {
    if (!d.answers || typeof d.answers !== "object") continue;
    const answers = d.answers as Record<string, unknown>;
    for (const id of ids) {
      const v = answers[id];
      if (typeof v !== "boolean") continue;
      tally[id].total++;
      if (v) tally[id].yes++;
    }
  }
  return tally;
}

/** Salonun gerçek yüzdesi; eşiğin altındaysa `null` (soru sorulmaz). */
export function salonTruth(t: SalonTally | undefined): number | null {
  if (!t || t.total < AYNA_SALON_MIN) return null;
  return Math.round((t.yes / t.total) * 100);
}

/**
 * Anket kapandıktan sonra son soru sırası: yetersiz cevaplı salon soruları
 * sıradaki yedek dünya sorusuyla değiştiriliyor; yedek kalmadıysa atlanıyor.
 */
export function applySurveyResults(
  order: readonly string[],
  reserves: readonly string[],
  tally: Readonly<Record<string, SalonTally>>,
): string[] {
  const spare = [...reserves];
  const out: string[] = [];
  for (const id of order) {
    if (!isSalonId(id) || salonTruth(tally[id]) !== null) {
      out.push(id);
      continue;
    }
    const replacement = spare.shift();
    if (replacement) out.push(replacement);
  }
  return out;
}

/** Kaynak satırı: "Bu salon · 18 kişi". */
export function salonSourceLabel(respondents: number, locale: Locale): string {
  return { tr: `Bu salon · ${respondents} kişi`, de: `Dieser Raum · ${respondents} Personen`, en: `This room · ${respondents} people` }[locale];
}
