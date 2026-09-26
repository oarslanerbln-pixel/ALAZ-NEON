import type { Locale, TranslationKey } from "./i18n";

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

export type AynaCategory = "health" | "society" | "environment" | "science" | "history";
export type AynaUnit = "percent" | "years";

export const AYNA_CATEGORY_KEY: Record<AynaCategory, TranslationKey> = {
  health: "ayna.category.health",
  society: "ayna.category.society",
  environment: "ayna.category.environment",
  science: "ayna.category.science",
  history: "ayna.category.history",
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

export const AYNA_QUESTIONS: readonly AynaQuestion[] = [
  {
    id: "ayna-vaccines",
    category: "health",
    answer: 84,
    unit: "percent",
    year: "2023",
    source: "WHO / UNICEF (WUENIC)",
    text: {
      tr: "Dünyadaki 1 yaşındaki çocukların yüzde kaçı üç doz difteri-tetanoz-boğmaca aşısı oldu?",
      de: "Wie viel Prozent der Einjährigen weltweit haben alle drei Dosen der Diphtherie-Tetanus-Keuchhusten-Impfung erhalten?",
      en: "What percentage of the world's one-year-olds received all three doses of the diphtheria-tetanus-pertussis vaccine?",
    },
    insight: {
      tr: "Çoğu insan bunu çok düşük tahmin ediyor. Aşılar her yıl milyonlarca çocuğun hayatını kurtarıyor.",
      de: "Die meisten schätzen das viel zu niedrig. Impfungen retten jedes Jahr Millionen Kinderleben.",
      en: "Most people guess far too low. Vaccines save millions of children's lives every year.",
    },
  },
  {
    id: "ayna-child-mortality-1800",
    category: "history",
    answer: 43,
    unit: "percent",
    year: "1800",
    source: "Gapminder / Our World in Data",
    text: {
      tr: "1800 yılında çocukların yüzde kaçı 5 yaşına gelmeden hayatını kaybediyordu?",
      de: "Wie viel Prozent der Kinder starben im Jahr 1800 vor ihrem fünften Geburtstag?",
      en: "In 1800, what percentage of children died before their fifth birthday?",
    },
    insight: {
      tr: "Neredeyse her iki çocuktan biri. O dönemde hemen her aile bir çocuğunun yasını tutuyordu.",
      de: "Fast jedes zweite Kind. Damals trauerte fast jede Familie um ein Kind.",
      en: "Almost one in two. Back then, nearly every family grieved a child.",
    },
  },
  {
    id: "ayna-child-mortality-today",
    category: "health",
    answer: 3.7,
    unit: "percent",
    year: "2022",
    source: "UN IGME",
    text: {
      tr: "Bugün dünyada çocukların yüzde kaçı 5 yaşına gelmeden hayatını kaybediyor?",
      de: "Wie viel Prozent der Kinder weltweit sterben heute vor ihrem fünften Geburtstag?",
      en: "Today, what percentage of children worldwide die before their fifth birthday?",
    },
    insight: {
      tr: "%43'ten %4'ün altına. Hâlâ yılda yaklaşık 5 milyon çocuk; ama insanlığın en büyük başarılarından biri.",
      de: "Von 43 % auf unter 4 %. Immer noch rund 5 Millionen Kinder pro Jahr – aber einer der größten Erfolge der Menschheit.",
      en: "From 43% to under 4%. Still about 5 million children a year – but one of humanity's greatest achievements.",
    },
  },
  {
    id: "ayna-safe-water",
    category: "health",
    answer: 73,
    unit: "percent",
    year: "2022",
    source: "WHO / UNICEF (JMP)",
    text: {
      tr: "Dünya nüfusunun yüzde kaçı evinde güvenli içme suyuna erişebiliyor?",
      de: "Wie viel Prozent der Weltbevölkerung haben zu Hause Zugang zu sicherem Trinkwasser?",
      en: "What percentage of the world's population has safe drinking water at home?",
    },
    insight: {
      tr: "Geri kalan 2 milyardan fazla insan için su, her gün taşınması gereken bir yük.",
      de: "Für die übrigen mehr als 2 Milliarden Menschen ist Wasser eine tägliche Last, die getragen werden muss.",
      en: "For the remaining 2 billion-plus people, water is a daily burden that has to be carried.",
    },
  },
  {
    id: "ayna-sanitation",
    category: "health",
    answer: 57,
    unit: "percent",
    year: "2022",
    source: "WHO / UNICEF (JMP)",
    text: {
      tr: "Dünya nüfusunun yüzde kaçı güvenli tuvalet ve kanalizasyon hizmetine sahip?",
      de: "Wie viel Prozent der Weltbevölkerung haben eine sichere Sanitärversorgung?",
      en: "What percentage of the world's population has safely managed sanitation?",
    },
    insight: {
      tr: "Yaklaşık 3,5 milyar insan hâlâ güvenli bir tuvaletten yoksun; bu en çok kadınları ve çocukları etkiliyor.",
      de: "Rund 3,5 Milliarden Menschen fehlt noch eine sichere Toilette – das trifft vor allem Frauen und Kinder.",
      en: "About 3.5 billion people still lack a safe toilet – which hits women and children hardest.",
    },
  },
  {
    id: "ayna-life-expectancy",
    category: "health",
    answer: 73,
    unit: "years",
    year: "2024",
    source: "UN World Population Prospects 2024",
    text: {
      tr: "Bugün dünyada doğan bir bebeğin ortalama yaşam beklentisi kaç yıl?",
      de: "Wie viele Jahre beträgt die durchschnittliche Lebenserwartung bei Geburt weltweit?",
      en: "What is the average life expectancy at birth worldwide, in years?",
    },
    insight: {
      tr: "1900'de bu sayı 32 civarındaydı. Ortalama insan ömrü bir asırda iki katından fazla uzadı.",
      de: "Um 1900 lag sie bei etwa 32 Jahren. In einem Jahrhundert hat sich das Leben mehr als verdoppelt.",
      en: "Around 1900 it was about 32 years. In a century, the average human life more than doubled.",
    },
  },
  {
    id: "ayna-urban",
    category: "society",
    answer: 57,
    unit: "percent",
    year: "2023",
    source: "World Bank / UN DESA",
    text: {
      tr: "Dünya nüfusunun yüzde kaçı şehirlerde yaşıyor?",
      de: "Wie viel Prozent der Weltbevölkerung leben in Städten?",
      en: "What percentage of the world's population lives in cities?",
    },
    insight: {
      tr: "2007'de ilk kez şehirliler çoğunluğa geçti. 2050'de her 10 kişiden yaklaşık 7'si şehirli olacak.",
      de: "2007 lebten erstmals mehr Menschen in Städten als auf dem Land. 2050 werden es fast 7 von 10 sein.",
      en: "In 2007 city dwellers became the majority for the first time. By 2050 it will be nearly 7 in 10.",
    },
  },
  {
    id: "ayna-internet",
    category: "society",
    answer: 67,
    unit: "percent",
    year: "2023",
    source: "ITU",
    text: {
      tr: "Dünya nüfusunun yüzde kaçı internet kullanıyor?",
      de: "Wie viel Prozent der Weltbevölkerung nutzen das Internet?",
      en: "What percentage of the world's population uses the internet?",
    },
    insight: {
      tr: "Yaklaşık 2,6 milyar insan hâlâ çevrimdışı; çoğu kırsal bölgelerde yaşıyor.",
      de: "Rund 2,6 Milliarden Menschen sind noch offline – die meisten leben auf dem Land.",
      en: "About 2.6 billion people are still offline – most of them in rural areas.",
    },
  },
  {
    id: "ayna-electricity",
    category: "society",
    answer: 91,
    unit: "percent",
    year: "2022",
    source: "IEA, IRENA, UN, World Bank, WHO (Tracking SDG7)",
    text: {
      tr: "Dünya nüfusunun yüzde kaçı elektriğe erişebiliyor?",
      de: "Wie viel Prozent der Weltbevölkerung haben Zugang zu Elektrizität?",
      en: "What percentage of the world's population has access to electricity?",
    },
    insight: {
      tr: "Elektriği olmayan yaklaşık 685 milyon insanın çoğu Sahra Altı Afrika'da yaşıyor.",
      de: "Die meisten der rund 685 Millionen Menschen ohne Strom leben in Subsahara-Afrika.",
      en: "Most of the roughly 685 million people without electricity live in sub-Saharan Africa.",
    },
  },
  {
    id: "ayna-literacy",
    category: "society",
    answer: 87,
    unit: "percent",
    year: "2022",
    source: "UNESCO Institute for Statistics",
    text: {
      tr: "Dünyadaki yetişkinlerin yüzde kaçı okuma yazma biliyor?",
      de: "Wie viel Prozent der Erwachsenen weltweit können lesen und schreiben?",
      en: "What percentage of adults worldwide can read and write?",
    },
    insight: {
      tr: "Okuma yazma bilmeyen yaklaşık 750 milyon yetişkinin üçte ikisi kadın.",
      de: "Von den rund 750 Millionen Erwachsenen, die nicht lesen können, sind zwei Drittel Frauen.",
      en: "Of the roughly 750 million adults who cannot read, two thirds are women.",
    },
  },
  {
    id: "ayna-literacy-1820",
    category: "history",
    answer: 12,
    unit: "percent",
    year: "1820",
    source: "Our World in Data (van Zanden et al.)",
    text: {
      tr: "1820'de dünyadaki insanların yüzde kaçı okuma yazma biliyordu?",
      de: "Wie viel Prozent der Menschen weltweit konnten 1820 lesen und schreiben?",
      en: "In 1820, what percentage of people worldwide could read and write?",
    },
    insight: {
      tr: "İki yüz yılda tablo tersine döndü: o zaman okuyabilenler azınlıktaydı, bugün okuyamayanlar.",
      de: "In 200 Jahren hat sich das Bild umgekehrt: Damals waren Lesende die Minderheit, heute sind es Nichtlesende.",
      en: "In 200 years the picture flipped: back then readers were the minority; today it's non-readers.",
    },
  },
  {
    id: "ayna-women-parliament",
    category: "society",
    answer: 27,
    unit: "percent",
    year: "2024",
    source: "Inter-Parliamentary Union",
    text: {
      tr: "Dünyadaki ulusal meclis üyelerinin yüzde kaçı kadın?",
      de: "Wie viel Prozent der Abgeordneten in nationalen Parlamenten weltweit sind Frauen?",
      en: "What percentage of members of national parliaments worldwide are women?",
    },
    insight: {
      tr: "1995'te bu oran %11'di. Artıyor, ama bu hızla eşitlik daha on yıllar alacak.",
      de: "1995 waren es 11 %. Der Anteil steigt – doch in diesem Tempo dauert Gleichstellung noch Jahrzehnte.",
      en: "In 1995 it was 11%. It's rising – but at this pace, parity will take decades.",
    },
  },
  {
    id: "ayna-aged-65",
    category: "society",
    answer: 10,
    unit: "percent",
    year: "2022",
    source: "UN World Population Prospects 2022",
    text: {
      tr: "Dünya nüfusunun yüzde kaçı 65 yaş ve üzerinde?",
      de: "Wie viel Prozent der Weltbevölkerung sind 65 Jahre oder älter?",
      en: "What percentage of the world's population is aged 65 or older?",
    },
    insight: {
      tr: "2050'de bu oran %16'ya çıkacak: her altı kişiden biri. Büyükanne ve büyükbabalar çoğalıyor.",
      de: "Bis 2050 steigt der Anteil auf 16 % – jeder Sechste. Es gibt immer mehr Großeltern.",
      en: "By 2050 it will reach 16% – one in six. There are more and more grandparents.",
    },
  },
  {
    id: "ayna-under-15",
    category: "society",
    answer: 25,
    unit: "percent",
    year: "2022",
    source: "UN World Population Prospects 2022",
    text: {
      tr: "Dünya nüfusunun yüzde kaçı 15 yaşın altında?",
      de: "Wie viel Prozent der Weltbevölkerung sind jünger als 15 Jahre?",
      en: "What percentage of the world's population is under 15?",
    },
    insight: {
      tr: "Dünyadaki çocuk sayısı artık artmıyor; yaklaşık 2 milyarda dengelendi.",
      de: "Die Zahl der Kinder weltweit wächst nicht mehr – sie hat sich bei rund 2 Milliarden eingependelt.",
      en: "The number of children in the world has stopped growing – it has levelled off at about 2 billion.",
    },
  },
  {
    id: "ayna-asia",
    category: "society",
    answer: 59,
    unit: "percent",
    year: "2023",
    source: "UN World Population Prospects",
    text: {
      tr: "Dünya nüfusunun yüzde kaçı Asya'da yaşıyor?",
      de: "Wie viel Prozent der Weltbevölkerung leben in Asien?",
      en: "What percentage of the world's population lives in Asia?",
    },
    insight: {
      tr: "Dünyayı 10 kişilik bir masa olarak düşün: 6'sı Asyalı, 2'si Afrikalı, 1'i Avrupalı, 1'i Amerikalı.",
      de: "Stell dir die Welt als Tisch mit 10 Personen vor: 6 aus Asien, 2 aus Afrika, 1 aus Europa, 1 aus Amerika.",
      en: "Picture the world as a table of 10: 6 from Asia, 2 from Africa, 1 from Europe, 1 from the Americas.",
    },
  },
  {
    id: "ayna-bank-account",
    category: "society",
    answer: 76,
    unit: "percent",
    year: "2021",
    source: "World Bank Global Findex",
    text: {
      tr: "Dünyadaki yetişkinlerin yüzde kaçının banka ya da mobil para hesabı var?",
      de: "Wie viel Prozent der Erwachsenen weltweit haben ein Bank- oder Mobile-Money-Konto?",
      en: "What percentage of adults worldwide have a bank or mobile money account?",
    },
    insight: {
      tr: "2011'de yalnızca %51'di. Birçok ülkede insanların ilk bankası cepteki telefon oldu.",
      de: "2011 waren es nur 51 %. In vielen Ländern wurde das Handy zur ersten Bank der Menschen.",
      en: "In 2011 it was only 51%. In many countries, the phone became people's first bank.",
    },
  },
  {
    id: "ayna-extreme-poverty",
    category: "society",
    answer: 9,
    unit: "percent",
    year: "2022",
    source: "World Bank",
    text: {
      tr: "Dünya nüfusunun yüzde kaçı aşırı yoksulluk içinde (günde 2,15 dolardan az) yaşıyor?",
      de: "Wie viel Prozent der Weltbevölkerung leben in extremer Armut (weniger als 2,15 $ pro Tag)?",
      en: "What percentage of the world's population lives in extreme poverty (under $2.15 a day)?",
    },
    insight: {
      tr: "1990'da bu oran %38'di. Hâlâ 700 milyondan fazla insan; ama çoğumuz dünyayı olduğundan yoksul sanıyoruz.",
      de: "1990 waren es 38 %. Immer noch über 700 Millionen Menschen – doch die meisten halten die Welt für ärmer, als sie ist.",
      en: "In 1990 it was 38%. Still over 700 million people – yet most of us think the world is poorer than it is.",
    },
  },
  {
    id: "ayna-left-handed",
    category: "science",
    answer: 10.6,
    unit: "percent",
    year: "2020",
    source: "Papadatou-Pastou et al., Psychological Bulletin (2020)",
    text: {
      tr: "İnsanların yüzde kaçı solak?",
      de: "Wie viel Prozent der Menschen sind Linkshänder?",
      en: "What percentage of people are left-handed?",
    },
    insight: {
      tr: "Yaklaşık her 10 kişiden biri. Makaslar, defterler ve kapı kolları hâlâ çoğunlukla sağlaklara göre tasarlanıyor.",
      de: "Etwa jeder Zehnte. Scheren, Hefte und Türgriffe sind trotzdem meist für Rechtshänder gemacht.",
      en: "About one in ten. Yet scissors, notebooks and door handles are still mostly designed for right-handers.",
    },
  },
  {
    id: "ayna-nobel-women",
    category: "history",
    answer: 6.6,
    unit: "percent",
    year: "1901–2023",
    source: "nobelprize.org",
    text: {
      tr: "1901'den bu yana Nobel ödülü alan kişilerin yüzde kaçı kadın?",
      de: "Wie viel Prozent der Nobelpreisträger seit 1901 sind Frauen?",
      en: "Since 1901, what percentage of Nobel Prize laureates have been women?",
    },
    insight: {
      tr: "Yalnızca 64 kadın. Marie Curie ise iki farklı bilim dalında ödül alan tek kişi.",
      de: "Nur 64 Frauen. Marie Curie ist bis heute der einzige Mensch mit Nobelpreisen in zwei verschiedenen Naturwissenschaften.",
      en: "Just 64 women. Marie Curie is still the only person to win in two different sciences.",
    },
  },
  {
    id: "ayna-forests",
    category: "environment",
    answer: 31,
    unit: "percent",
    year: "2020",
    source: "FAO Global Forest Resources Assessment 2020",
    text: {
      tr: "Dünyadaki karaların yüzde kaçı ormanlarla kaplı?",
      de: "Wie viel Prozent der Landfläche der Erde sind von Wald bedeckt?",
      en: "What percentage of the Earth's land area is covered by forest?",
    },
    insight: {
      tr: "Ormanların yarısından fazlası yalnızca beş ülkede: Rusya, Brezilya, Kanada, ABD ve Çin.",
      de: "Mehr als die Hälfte der Wälder liegt in nur fünf Ländern: Russland, Brasilien, Kanada, USA und China.",
      en: "Over half of all forests lie in just five countries: Russia, Brazil, Canada, the US and China.",
    },
  },
  {
    id: "ayna-ocean",
    category: "science",
    answer: 71,
    unit: "percent",
    source: "NOAA / USGS",
    text: {
      tr: "Dünya yüzeyinin yüzde kaçı okyanuslarla kaplı?",
      de: "Wie viel Prozent der Erdoberfläche sind von Ozeanen bedeckt?",
      en: "What percentage of the Earth's surface is covered by oceans?",
    },
    insight: {
      tr: "Buna rağmen okyanus tabanının yalnızca yaklaşık dörtte biri ayrıntılı olarak haritalandı.",
      de: "Trotzdem ist erst rund ein Viertel des Meeresbodens genau kartiert.",
      en: "Yet only about a quarter of the seafloor has been mapped in detail.",
    },
  },
  {
    id: "ayna-freshwater",
    category: "science",
    answer: 2.5,
    unit: "percent",
    source: "USGS",
    text: {
      tr: "Dünyadaki suyun yüzde kaçı tatlı su?",
      de: "Wie viel Prozent des Wassers auf der Erde sind Süßwasser?",
      en: "What percentage of the Earth's water is fresh water?",
    },
    insight: {
      tr: "Bunun da büyük kısmı buzullarda ve yer altında. Musluktan akan her damla sandığımızdan değerli.",
      de: "Und das meiste davon steckt in Gletschern und im Grundwasser. Jeder Tropfen aus dem Hahn ist wertvoller, als wir denken.",
      en: "And most of that is locked in glaciers and groundwater. Every drop from the tap is more precious than we think.",
    },
  },
  {
    id: "ayna-antarctica-ice",
    category: "environment",
    answer: 90,
    unit: "percent",
    source: "NSIDC",
    text: {
      tr: "Dünyadaki buzun yüzde kaçı Antarktika'da?",
      de: "Wie viel Prozent des Eises der Erde befinden sich in der Antarktis?",
      en: "What percentage of the world's ice is in Antarctica?",
    },
    insight: {
      tr: "Antarktika buz tabakası tamamen erise deniz seviyesi yaklaşık 58 metre yükselirdi.",
      de: "Würde der antarktische Eisschild ganz schmelzen, stiege der Meeresspiegel um rund 58 Meter.",
      en: "If the Antarctic ice sheet melted completely, sea levels would rise by about 58 metres.",
    },
  },
  {
    id: "ayna-plastic-recycled",
    category: "environment",
    answer: 9,
    unit: "percent",
    year: "2019",
    source: "OECD Global Plastics Outlook 2022",
    text: {
      tr: "Dünyadaki plastik atıkların yüzde kaçı geri dönüştürülüyor?",
      de: "Wie viel Prozent des Plastikmülls weltweit werden recycelt?",
      en: "What percentage of the world's plastic waste is recycled?",
    },
    insight: {
      tr: "Geri kalanın çoğu çöp sahalarına gidiyor, yakılıyor ya da doğaya karışıyor.",
      de: "Der Rest landet größtenteils auf Deponien, wird verbrannt oder gelangt in die Umwelt.",
      en: "Most of the rest ends up in landfill, gets burned or leaks into nature.",
    },
  },
  {
    id: "ayna-food-waste",
    category: "environment",
    answer: 33,
    unit: "percent",
    year: "2011",
    source: "FAO",
    text: {
      tr: "İnsanlar için üretilen gıdanın yaklaşık yüzde kaçı kayboluyor ya da israf ediliyor?",
      de: "Wie viel Prozent der für Menschen produzierten Lebensmittel gehen ungefähr verloren oder werden verschwendet?",
      en: "Roughly what percentage of food produced for people is lost or wasted?",
    },
    insight: {
      tr: "Yaklaşık üçte biri. Aynı dünyada yüz milyonlarca insan her gece aç yatıyor.",
      de: "Etwa ein Drittel. In derselben Welt gehen Hunderte Millionen Menschen jede Nacht hungrig schlafen.",
      en: "About a third. In the same world, hundreds of millions of people go to bed hungry every night.",
    },
  },
  {
    id: "ayna-agri-land",
    category: "environment",
    answer: 50,
    unit: "percent",
    year: "2019",
    source: "Our World in Data (FAO)",
    text: {
      tr: "Dünyadaki yaşanabilir karaların yüzde kaçı tarım için kullanılıyor?",
      de: "Wie viel Prozent der bewohnbaren Landfläche der Erde werden landwirtschaftlich genutzt?",
      en: "What percentage of the world's habitable land is used for agriculture?",
    },
    insight: {
      tr: "Bunun yaklaşık dörtte üçü hayvancılığa gidiyor; ama bize kalorilerimizin beşte birinden azını sağlıyor.",
      de: "Rund drei Viertel davon dienen der Tierhaltung – die aber weniger als ein Fünftel unserer Kalorien liefert.",
      en: "About three quarters of it goes to livestock – which provides less than a fifth of our calories.",
    },
  },
  {
    id: "ayna-renewables",
    category: "environment",
    answer: 30,
    unit: "percent",
    year: "2023",
    source: "Ember Global Electricity Review 2024",
    text: {
      tr: "Dünyada üretilen elektriğin yüzde kaçı yenilenebilir kaynaklardan geliyor?",
      de: "Wie viel Prozent des weltweit erzeugten Stroms stammen aus erneuerbaren Quellen?",
      en: "What percentage of the world's electricity comes from renewable sources?",
    },
    insight: {
      tr: "En büyük pay hâlâ hidroelektrikte; ama en hızlı büyüyenler rüzgâr ve güneş.",
      de: "Wasserkraft hat noch den größten Anteil – am schnellsten wachsen aber Wind und Sonne.",
      en: "Hydropower still has the biggest share – but wind and solar are growing fastest.",
    },
  },
  {
    id: "ayna-food-emissions",
    category: "environment",
    answer: 26,
    unit: "percent",
    year: "2018",
    source: "Poore & Nemecek, Science (2018)",
    text: {
      tr: "İnsan kaynaklı sera gazı emisyonlarının yüzde kaçı gıda üretiminden geliyor?",
      de: "Wie viel Prozent der menschengemachten Treibhausgasemissionen stammen aus der Lebensmittelproduktion?",
      en: "What percentage of human-caused greenhouse gas emissions comes from food production?",
    },
    insight: {
      tr: "Yaklaşık dörtte biri. Tabağımızdaki seçimler iklim için sandığımızdan önemli.",
      de: "Etwa ein Viertel. Was auf unserem Teller landet, ist fürs Klima wichtiger, als wir denken.",
      en: "About a quarter. What's on our plates matters more for the climate than we think.",
    },
  },
  {
    id: "ayna-wild-mammals",
    category: "environment",
    answer: 4,
    unit: "percent",
    year: "2018",
    source: "Bar-On, Phillips & Milo, PNAS (2018)",
    text: {
      tr: "Dünyadaki tüm memelilerin toplam ağırlığının yüzde kaçı vahşi hayvanlara ait?",
      de: "Wie viel Prozent der Gesamtmasse aller Säugetiere auf der Erde entfallen auf Wildtiere?",
      en: "What percentage of the total mass of all mammals on Earth belongs to wild animals?",
    },
    insight: {
      tr: "Yalnızca %4. Geri kalanın %36'sı insan, %60'ı çiftlik hayvanı.",
      de: "Nur 4 %. Der Rest: 36 % Menschen, 60 % Nutztiere.",
      en: "Only 4%. The rest: 36% humans, 60% livestock.",
    },
  },
  {
    id: "ayna-nitrogen",
    category: "science",
    answer: 78,
    unit: "percent",
    source: "NASA",
    text: {
      tr: "Soluduğumuz havanın yüzde kaçı azot?",
      de: "Wie viel Prozent der Luft, die wir atmen, sind Stickstoff?",
      en: "What percentage of the air we breathe is nitrogen?",
    },
    insight: {
      tr: "Oksijen yalnızca %21. Her nefesin büyük kısmı, vücudumuzun doğrudan kullanmadığı bir gaz.",
      de: "Sauerstoff macht nur 21 % aus. Der Großteil jedes Atemzugs ist ein Gas, das unser Körper nicht direkt nutzt.",
      en: "Oxygen is only 21%. Most of every breath is a gas our body doesn't directly use.",
    },
  },
  {
    id: "ayna-body-water",
    category: "science",
    answer: 60,
    unit: "percent",
    source: "USGS",
    text: {
      tr: "Yetişkin bir insan vücudunun yaklaşık yüzde kaçı su?",
      de: "Wie viel Prozent des Körpers eines Erwachsenen bestehen ungefähr aus Wasser?",
      en: "Roughly what percentage of an adult human body is water?",
    },
    insight: {
      tr: "Beynimiz ve kalbimiz ise yaklaşık %73 sudur.",
      de: "Gehirn und Herz bestehen sogar zu etwa 73 % aus Wasser.",
      en: "Our brain and heart are even about 73% water.",
    },
  },
  {
    id: "ayna-chimp-dna",
    category: "science",
    answer: 98.8,
    unit: "percent",
    source: "Smithsonian Institution / NHGRI",
    text: {
      tr: "İnsan DNA'sının yüzde kaçı şempanzelerle aynı?",
      de: "Wie viel Prozent unserer DNA teilen wir mit Schimpansen?",
      en: "What percentage of our DNA do we share with chimpanzees?",
    },
    insight: {
      tr: "Ve iki insan arasındaki fark bundan da küçük: DNA'mızın %99,9'u herkesle aynı.",
      de: "Und zwei Menschen unterscheiden sich noch weniger: 99,9 % unserer DNA sind bei allen gleich.",
      en: "And any two people differ even less: 99.9% of our DNA is the same in everyone.",
    },
  },
  {
    id: "ayna-moon-gravity",
    category: "science",
    answer: 16.6,
    unit: "percent",
    source: "NASA",
    text: {
      tr: "Ay'daki yer çekimi, Dünya'dakinin yüzde kaçı kadar?",
      de: "Wie viel Prozent der Erdanziehung beträgt die Schwerkraft auf dem Mond?",
      en: "The Moon's gravity is what percentage of Earth's?",
    },
    insight: {
      tr: "Yaklaşık altıda biri: 70 kiloluk biri Ay'da kendini yaklaşık 12 kilo gibi hissederdi.",
      de: "Etwa ein Sechstel: Wer 70 Kilo wiegt, würde sich auf dem Mond wie etwa 12 Kilo fühlen.",
      en: "About a sixth: someone weighing 70 kg would feel like about 12 kg on the Moon.",
    },
  },
  {
    id: "ayna-colorblind",
    category: "science",
    answer: 8,
    unit: "percent",
    source: "Colour Blind Awareness / NEI",
    text: {
      tr: "Erkeklerin yaklaşık yüzde kaçı renk körü?",
      de: "Wie viel Prozent der Männer sind ungefähr farbenblind?",
      en: "Roughly what percentage of men are colour-blind?",
    },
    insight: {
      tr: "Yaklaşık 12 erkekten biri, ama 200 kadından yalnızca biri. Bu salonda da birkaç kişi muhtemelen kırmızıyla yeşili karıştırıyor.",
      de: "Etwa jeder 12. Mann, aber nur jede 200. Frau. Wahrscheinlich verwechseln auch hier im Raum einige Rot und Grün.",
      en: "About 1 in 12 men but only 1 in 200 women. A few people in this room probably mix up red and green.",
    },
  },
];

const BY_ID = new Map(AYNA_QUESTIONS.map((q) => [q.id, q]));

export function aynaQuestionById(id: string | undefined | null): AynaQuestion | undefined {
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
