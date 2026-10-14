import type { Locale, TranslationKey } from "./i18n";
import type { Room } from "../types/database";
import { SALON_INSIGHT, salonQuestionById, salonSourceLabel } from "./aynaSalon";

/**
 * AYNA soru havuzu.
 *
 * Kurallar (yeni soru eklerken):
 * - Cevap 0–100 skalasına sığmalı (yüzde ya da yıl).
 * - Her soru güvenilir bir KAYNAK ve mümkünse veri YILI taşır; TV'de cevapla
 *   birlikte gösteriliyor. Kaynaksız "internette gördüm" bilgisi yok.
 * - Siyaset, din, göç ve travma gibi mekânda gerilim yaratacak konulardan
 *   uzak durulur. Amaç utandırmak değil, "dünyayı yanlış biliyormuşuz"
 *   şaşkınlığı ve başka hayatlara bir pencere.
 * - `insight`, cevaptan sonra okunacak TEK cümlelik insani not. Rakamı bir
 *   hikâyeye bağlar.
 *
 * Metinler oda dokümanına yazılmıyor, yalnızca `id`'ler yazılıyor: her
 * misafir soruyu kendi telefonunda seçtiği dilde görüyor.
 */

export type AynaCategory = "health" | "society" | "environment" | "science" | "history" | "salon";
export type AynaUnit = "percent" | "years";

export const AYNA_CATEGORY_KEY: Record<AynaCategory, TranslationKey> = {
  health: "ayna.category.health",
  society: "ayna.category.society",
  environment: "ayna.category.environment",
  science: "ayna.category.science",
  history: "ayna.category.history",
  salon: "ayna.category.salon",
};

export interface AynaQuestion {
  id: string;
  category: AynaCategory;
  answer: number;
  unit: AynaUnit;
  /** Verinin ait olduğu yıl; zamandan bağımsız bilgilerde yok. */
  year?: string;
  source: string;
  text: Record<Locale, string>;
  insight: Record<Locale, string>;
}

/**
 * Telefonun da yüklediği kısım: gerçek değer ve açıklama notu yok. Onlar
 * yalnızca TV'nin yüklediği aynaFacts.ts'te; açıklama anında odaya yazılır.
 */
export type AynaQuestionText = Omit<AynaQuestion, "answer" | "insight">;

const NO_INSIGHT: Record<Locale, string> = { tr: "", de: "", en: "" };

export const AYNA_QUESTIONS: readonly AynaQuestionText[] = [
  {
    id: "ayna-vaccines",
    category: "health",
    unit: "percent",
    year: "2023",
    source: "WHO / UNICEF (WUENIC)",
    text: {
      tr: "Dünyadaki 1 yaşındaki çocukların yüzde kaçı üç doz difteri-tetanoz-boğmaca aşısı oldu?",
      de: "Wie viel Prozent der Einjährigen weltweit haben alle drei Dosen der Diphtherie-Tetanus-Keuchhusten-Impfung erhalten?",
      en: "What percentage of the world's one-year-olds received all three doses of the diphtheria-tetanus-pertussis vaccine?",
    },
  },
  {
    id: "ayna-child-mortality-1800",
    category: "history",
    unit: "percent",
    year: "1800",
    source: "Gapminder / Our World in Data",
    text: {
      tr: "1800 yılında çocukların yüzde kaçı 5 yaşına gelmeden hayatını kaybediyordu?",
      de: "Wie viel Prozent der Kinder starben im Jahr 1800 vor ihrem fünften Geburtstag?",
      en: "In 1800, what percentage of children died before their fifth birthday?",
    },
  },
  {
    id: "ayna-child-mortality-today",
    category: "health",
    unit: "percent",
    year: "2022",
    source: "UN IGME",
    text: {
      tr: "Bugün dünyada çocukların yüzde kaçı 5 yaşına gelmeden hayatını kaybediyor?",
      de: "Wie viel Prozent der Kinder weltweit sterben heute vor ihrem fünften Geburtstag?",
      en: "Today, what percentage of children worldwide die before their fifth birthday?",
    },
  },
  {
    id: "ayna-safe-water",
    category: "health",
    unit: "percent",
    year: "2022",
    source: "WHO / UNICEF (JMP)",
    text: {
      tr: "Dünya nüfusunun yüzde kaçı evinde güvenli içme suyuna erişebiliyor?",
      de: "Wie viel Prozent der Weltbevölkerung haben zu Hause Zugang zu sicherem Trinkwasser?",
      en: "What percentage of the world's population has safe drinking water at home?",
    },
  },
  {
    id: "ayna-sanitation",
    category: "health",
    unit: "percent",
    year: "2022",
    source: "WHO / UNICEF (JMP)",
    text: {
      tr: "Dünya nüfusunun yüzde kaçı güvenli tuvalet ve kanalizasyon hizmetine sahip?",
      de: "Wie viel Prozent der Weltbevölkerung haben eine sichere Sanitärversorgung?",
      en: "What percentage of the world's population has safely managed sanitation?",
    },
  },
  {
    id: "ayna-life-expectancy",
    category: "health",
    unit: "years",
    year: "2024",
    source: "UN World Population Prospects 2024",
    text: {
      tr: "Bugün dünyada doğan bir bebeğin ortalama yaşam beklentisi kaç yıl?",
      de: "Wie viele Jahre beträgt die durchschnittliche Lebenserwartung bei Geburt weltweit?",
      en: "What is the average life expectancy at birth worldwide, in years?",
    },
  },
  {
    id: "ayna-urban",
    category: "society",
    unit: "percent",
    year: "2023",
    source: "World Bank / UN DESA",
    text: {
      tr: "Dünya nüfusunun yüzde kaçı şehirlerde yaşıyor?",
      de: "Wie viel Prozent der Weltbevölkerung leben in Städten?",
      en: "What percentage of the world's population lives in cities?",
    },
  },
  {
    id: "ayna-internet",
    category: "society",
    unit: "percent",
    year: "2023",
    source: "ITU",
    text: {
      tr: "Dünya nüfusunun yüzde kaçı internet kullanıyor?",
      de: "Wie viel Prozent der Weltbevölkerung nutzen das Internet?",
      en: "What percentage of the world's population uses the internet?",
    },
  },
  {
    id: "ayna-electricity",
    category: "society",
    unit: "percent",
    year: "2022",
    source: "IEA, IRENA, UN, World Bank, WHO (Tracking SDG7)",
    text: {
      tr: "Dünya nüfusunun yüzde kaçı elektriğe erişebiliyor?",
      de: "Wie viel Prozent der Weltbevölkerung haben Zugang zu Elektrizität?",
      en: "What percentage of the world's population has access to electricity?",
    },
  },
  {
    id: "ayna-literacy",
    category: "society",
    unit: "percent",
    year: "2022",
    source: "UNESCO Institute for Statistics",
    text: {
      tr: "Dünyadaki yetişkinlerin yüzde kaçı okuma yazma biliyor?",
      de: "Wie viel Prozent der Erwachsenen weltweit können lesen und schreiben?",
      en: "What percentage of adults worldwide can read and write?",
    },
  },
  {
    id: "ayna-literacy-1820",
    category: "history",
    unit: "percent",
    year: "1820",
    source: "Our World in Data (van Zanden et al.)",
    text: {
      tr: "1820'de dünyadaki insanların yüzde kaçı okuma yazma biliyordu?",
      de: "Wie viel Prozent der Menschen weltweit konnten 1820 lesen und schreiben?",
      en: "In 1820, what percentage of people worldwide could read and write?",
    },
  },
  {
    id: "ayna-women-parliament",
    category: "society",
    unit: "percent",
    year: "2024",
    source: "Inter-Parliamentary Union",
    text: {
      tr: "Dünyadaki ulusal meclis üyelerinin yüzde kaçı kadın?",
      de: "Wie viel Prozent der Abgeordneten in nationalen Parlamenten weltweit sind Frauen?",
      en: "What percentage of members of national parliaments worldwide are women?",
    },
  },
  {
    id: "ayna-aged-65",
    category: "society",
    unit: "percent",
    year: "2022",
    source: "UN World Population Prospects 2022",
    text: {
      tr: "Dünya nüfusunun yüzde kaçı 65 yaş ve üzerinde?",
      de: "Wie viel Prozent der Weltbevölkerung sind 65 Jahre oder älter?",
      en: "What percentage of the world's population is aged 65 or older?",
    },
  },
  {
    id: "ayna-under-15",
    category: "society",
    unit: "percent",
    year: "2022",
    source: "UN World Population Prospects 2022",
    text: {
      tr: "Dünya nüfusunun yüzde kaçı 15 yaşın altında?",
      de: "Wie viel Prozent der Weltbevölkerung sind jünger als 15 Jahre?",
      en: "What percentage of the world's population is under 15?",
    },
  },
  {
    id: "ayna-asia",
    category: "society",
    unit: "percent",
    year: "2023",
    source: "UN World Population Prospects",
    text: {
      tr: "Dünya nüfusunun yüzde kaçı Asya'da yaşıyor?",
      de: "Wie viel Prozent der Weltbevölkerung leben in Asien?",
      en: "What percentage of the world's population lives in Asia?",
    },
  },
  {
    id: "ayna-bank-account",
    category: "society",
    unit: "percent",
    year: "2021",
    source: "World Bank Global Findex",
    text: {
      tr: "Dünyadaki yetişkinlerin yüzde kaçının banka ya da mobil para hesabı var?",
      de: "Wie viel Prozent der Erwachsenen weltweit haben ein Bank- oder Mobile-Money-Konto?",
      en: "What percentage of adults worldwide have a bank or mobile money account?",
    },
  },
  {
    id: "ayna-extreme-poverty",
    category: "society",
    unit: "percent",
    year: "2022",
    source: "World Bank",
    text: {
      tr: "Dünya nüfusunun yüzde kaçı aşırı yoksulluk içinde (günde 2,15 dolardan az) yaşıyor?",
      de: "Wie viel Prozent der Weltbevölkerung leben in extremer Armut (weniger als 2,15 $ pro Tag)?",
      en: "What percentage of the world's population lives in extreme poverty (under $2.15 a day)?",
    },
  },
  {
    id: "ayna-left-handed",
    category: "science",
    unit: "percent",
    year: "2020",
    source: "Papadatou-Pastou et al., Psychological Bulletin (2020)",
    text: {
      tr: "İnsanların yüzde kaçı solak?",
      de: "Wie viel Prozent der Menschen sind Linkshänder?",
      en: "What percentage of people are left-handed?",
    },
  },
  {
    id: "ayna-nobel-women",
    category: "history",
    unit: "percent",
    year: "1901–2023",
    source: "nobelprize.org",
    text: {
      tr: "1901'den bu yana Nobel ödülü alan kişilerin yüzde kaçı kadın?",
      de: "Wie viel Prozent der Nobelpreisträger seit 1901 sind Frauen?",
      en: "Since 1901, what percentage of Nobel Prize laureates have been women?",
    },
  },
  {
    id: "ayna-forests",
    category: "environment",
    unit: "percent",
    year: "2020",
    source: "FAO Global Forest Resources Assessment 2020",
    text: {
      tr: "Dünyadaki karaların yüzde kaçı ormanlarla kaplı?",
      de: "Wie viel Prozent der Landfläche der Erde sind von Wald bedeckt?",
      en: "What percentage of the Earth's land area is covered by forest?",
    },
  },
  {
    id: "ayna-ocean",
    category: "science",
    unit: "percent",
    source: "NOAA / USGS",
    text: {
      tr: "Dünya yüzeyinin yüzde kaçı okyanuslarla kaplı?",
      de: "Wie viel Prozent der Erdoberfläche sind von Ozeanen bedeckt?",
      en: "What percentage of the Earth's surface is covered by oceans?",
    },
  },
  {
    id: "ayna-freshwater",
    category: "science",
    unit: "percent",
    source: "USGS",
    text: {
      tr: "Dünyadaki suyun yüzde kaçı tatlı su?",
      de: "Wie viel Prozent des Wassers auf der Erde sind Süßwasser?",
      en: "What percentage of the Earth's water is fresh water?",
    },
  },
  {
    id: "ayna-antarctica-ice",
    category: "environment",
    unit: "percent",
    source: "NSIDC",
    text: {
      tr: "Dünyadaki buzun yüzde kaçı Antarktika'da?",
      de: "Wie viel Prozent des Eises der Erde befinden sich in der Antarktis?",
      en: "What percentage of the world's ice is in Antarctica?",
    },
  },
  {
    id: "ayna-plastic-recycled",
    category: "environment",
    unit: "percent",
    year: "2019",
    source: "OECD Global Plastics Outlook 2022",
    text: {
      tr: "Dünyadaki plastik atıkların yüzde kaçı geri dönüştürülüyor?",
      de: "Wie viel Prozent des Plastikmülls weltweit werden recycelt?",
      en: "What percentage of the world's plastic waste is recycled?",
    },
  },
  {
    id: "ayna-food-waste",
    category: "environment",
    unit: "percent",
    year: "2011",
    source: "FAO",
    text: {
      tr: "İnsanlar için üretilen gıdanın yaklaşık yüzde kaçı kayboluyor ya da israf ediliyor?",
      de: "Wie viel Prozent der für Menschen produzierten Lebensmittel gehen ungefähr verloren oder werden verschwendet?",
      en: "Roughly what percentage of food produced for people is lost or wasted?",
    },
  },
  {
    id: "ayna-agri-land",
    category: "environment",
    unit: "percent",
    year: "2019",
    source: "Our World in Data (FAO)",
    text: {
      tr: "Dünyadaki yaşanabilir karaların yüzde kaçı tarım için kullanılıyor?",
      de: "Wie viel Prozent der bewohnbaren Landfläche der Erde werden landwirtschaftlich genutzt?",
      en: "What percentage of the world's habitable land is used for agriculture?",
    },
  },
  {
    id: "ayna-renewables",
    category: "environment",
    unit: "percent",
    year: "2023",
    source: "Ember Global Electricity Review 2024",
    text: {
      tr: "Dünyada üretilen elektriğin yüzde kaçı yenilenebilir kaynaklardan geliyor?",
      de: "Wie viel Prozent des weltweit erzeugten Stroms stammen aus erneuerbaren Quellen?",
      en: "What percentage of the world's electricity comes from renewable sources?",
    },
  },
  {
    id: "ayna-food-emissions",
    category: "environment",
    unit: "percent",
    year: "2018",
    source: "Poore & Nemecek, Science (2018)",
    text: {
      tr: "İnsan kaynaklı sera gazı emisyonlarının yüzde kaçı gıda üretiminden geliyor?",
      de: "Wie viel Prozent der menschengemachten Treibhausgasemissionen stammen aus der Lebensmittelproduktion?",
      en: "What percentage of human-caused greenhouse gas emissions comes from food production?",
    },
  },
  {
    id: "ayna-wild-mammals",
    category: "environment",
    unit: "percent",
    year: "2018",
    source: "Bar-On, Phillips & Milo, PNAS (2018)",
    text: {
      tr: "Dünyadaki tüm memelilerin toplam ağırlığının yüzde kaçı vahşi hayvanlara ait?",
      de: "Wie viel Prozent der Gesamtmasse aller Säugetiere auf der Erde entfallen auf Wildtiere?",
      en: "What percentage of the total mass of all mammals on Earth belongs to wild animals?",
    },
  },
  {
    id: "ayna-nitrogen",
    category: "science",
    unit: "percent",
    source: "NASA",
    text: {
      tr: "Soluduğumuz havanın yüzde kaçı azot?",
      de: "Wie viel Prozent der Luft, die wir atmen, sind Stickstoff?",
      en: "What percentage of the air we breathe is nitrogen?",
    },
  },
  {
    id: "ayna-body-water",
    category: "science",
    unit: "percent",
    source: "USGS",
    text: {
      tr: "Yetişkin bir insan vücudunun yaklaşık yüzde kaçı su?",
      de: "Wie viel Prozent des Körpers eines Erwachsenen bestehen ungefähr aus Wasser?",
      en: "Roughly what percentage of an adult human body is water?",
    },
  },
  {
    id: "ayna-chimp-dna",
    category: "science",
    unit: "percent",
    source: "Smithsonian Institution / NHGRI",
    text: {
      tr: "İnsan DNA'sının yüzde kaçı şempanzelerle aynı?",
      de: "Wie viel Prozent unserer DNA teilen wir mit Schimpansen?",
      en: "What percentage of our DNA do we share with chimpanzees?",
    },
  },
  {
    id: "ayna-moon-gravity",
    category: "science",
    unit: "percent",
    source: "NASA",
    text: {
      tr: "Ay'daki yer çekimi, Dünya'dakinin yüzde kaçı kadar?",
      de: "Wie viel Prozent der Erdanziehung beträgt die Schwerkraft auf dem Mond?",
      en: "The Moon's gravity is what percentage of Earth's?",
    },
  },
  {
    id: "ayna-colorblind",
    category: "science",
    unit: "percent",
    source: "Colour Blind Awareness / NEI",
    text: {
      tr: "Erkeklerin yaklaşık yüzde kaçı renk körü?",
      de: "Wie viel Prozent der Männer sind ungefähr farbenblind?",
      en: "Roughly what percentage of men are colour-blind?",
    },
  },
];

const BY_ID = new Map(AYNA_QUESTIONS.map((q) => [q.id, q]));

export function aynaQuestionById(id: string | undefined | null): AynaQuestionText | undefined {
  return id ? BY_ID.get(id) : undefined;
}

/** Cevabı skalada gösterilecek biçimde yazar: "%84", "84 %", "73 yıl". */
export function formatAynaValue(value: number, unit: AynaUnit, locale: Locale): string {
  const n = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
  // Bölünmez boşluk (\u00A0): "100 %" etiketi dar yerde iki satıra kırılmasın.
  if (unit === "years") {
    return { tr: `${n}\u00A0yıl`, de: `${n}\u00A0Jahre`, en: `${n}\u00A0years` }[locale];
  }
  return { tr: `%${n}`, de: `${n}\u00A0%`, en: `${n}%` }[locale];
}

/**
 * İki değer arasındaki FARK. Yüzdeler arasındaki fark yüzde değil "yüzde
 * puan"dır: %84 ile %48 arası "%36" değil "36 yüzde puan".
 */
export function formatAynaDelta(value: number, unit: AynaUnit, locale: Locale): string {
  if (unit === "years") return formatAynaValue(value, unit, locale);
  const n = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
  return { tr: `${n}\u00A0yüzde puan`, de: `${n}\u00A0Prozentpunkte`, en: `${n}\u00A0percentage points` }[locale];
}

/**
 * Turdaki soruyu, türünden bağımsız tek biçimde verir. Gerçek değer, not
 * ve (salon sorusunda) kaynak satırı odadan geliyor: host açıklama anında
 * yazar. Açıklamadan önce `answer` 0, `insight` boştur; kullanılmamalı.
 */
export function aynaRoundQuestion(
  id: string | undefined | null,
  room: Pick<Room, "ayna_round_truth" | "ayna_round_sample" | "ayna_round_insight">,
  locale: Locale,
): AynaQuestion | undefined {
  const world = aynaQuestionById(id);
  if (world) return { ...world, answer: room.ayna_round_truth ?? 0, insight: room.ayna_round_insight ?? NO_INSIGHT };
  const salon = salonQuestionById(id);
  if (!salon) return undefined;
  return {
    id: salon.id,
    category: "salon",
    unit: "percent",
    answer: room.ayna_round_truth ?? 0,
    source: salonSourceLabel(room.ayna_round_sample ?? 0, locale),
    text: salon.text,
    insight: SALON_INSIGHT,
  };
}
