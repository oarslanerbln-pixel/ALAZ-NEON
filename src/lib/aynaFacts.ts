import type { Locale } from "./i18n";

/**
 * AYNA sorularının gerçek değerleri ve açıklama notları. Yalnızca TV (host)
 * yükler: telefonun indirdiği aynaQuestions.ts'te yok. Önceden cevaplar
 * misafirin yüklediği kodda duruyordu; artık açıklama anında host odaya
 * yazıyor (`ayna_round_truth`, `ayna_round_insight`).
 */
export interface AynaFact {
  answer: number;
  /** Cevaptan sonra okunacak tek cümlelik insani not. */
  insight: Record<Locale, string>;
}

export const AYNA_FACTS: Readonly<Record<string, AynaFact>> = {
  "ayna-vaccines": {
    answer: 84,
    insight: {
      tr: "Çoğu insan bunu çok düşük tahmin ediyor. Aşılar her yıl milyonlarca çocuğun hayatını kurtarıyor.",
      de: "Die meisten schätzen das viel zu niedrig. Impfungen retten jedes Jahr Millionen Kinderleben.",
      en: "Most people guess far too low. Vaccines save millions of children's lives every year.",
    },
  },
  "ayna-child-mortality-1800": {
    answer: 43,
    insight: {
      tr: "Neredeyse her iki çocuktan biri. O dönemde hemen her aile bir çocuğunun yasını tutuyordu.",
      de: "Fast jedes zweite Kind. Damals trauerte fast jede Familie um ein Kind.",
      en: "Almost one in two. Back then, nearly every family grieved a child.",
    },
  },
  "ayna-child-mortality-today": {
    answer: 3.7,
    insight: {
      tr: "%43'ten %4'ün altına. Hâlâ yılda yaklaşık 5 milyon çocuk; ama insanlığın en büyük başarılarından biri.",
      de: "Von 43 % auf unter 4 %. Immer noch rund 5 Millionen Kinder pro Jahr – aber einer der größten Erfolge der Menschheit.",
      en: "From 43% to under 4%. Still about 5 million children a year – but one of humanity's greatest achievements.",
    },
  },
  "ayna-safe-water": {
    answer: 73,
    insight: {
      tr: "Geri kalan 2 milyardan fazla insan için su, her gün taşınması gereken bir yük.",
      de: "Für die übrigen mehr als 2 Milliarden Menschen ist Wasser eine tägliche Last, die getragen werden muss.",
      en: "For the remaining 2 billion-plus people, water is a daily burden that has to be carried.",
    },
  },
  "ayna-sanitation": {
    answer: 57,
    insight: {
      tr: "Yaklaşık 3,5 milyar insan hâlâ güvenli bir tuvaletten yoksun; bu en çok kadınları ve çocukları etkiliyor.",
      de: "Rund 3,5 Milliarden Menschen fehlt noch eine sichere Toilette – das trifft vor allem Frauen und Kinder.",
      en: "About 3.5 billion people still lack a safe toilet – which hits women and children hardest.",
    },
  },
  "ayna-life-expectancy": {
    answer: 73,
    insight: {
      tr: "1900'de bu sayı 32 civarındaydı. Ortalama insan ömrü bir asırda iki katından fazla uzadı.",
      de: "Um 1900 lag sie bei etwa 32 Jahren. In einem Jahrhundert hat sich das Leben mehr als verdoppelt.",
      en: "Around 1900 it was about 32 years. In a century, the average human life more than doubled.",
    },
  },
  "ayna-urban": {
    answer: 57,
    insight: {
      tr: "2007'de ilk kez şehirliler çoğunluğa geçti. 2050'de her 10 kişiden yaklaşık 7'si şehirli olacak.",
      de: "2007 lebten erstmals mehr Menschen in Städten als auf dem Land. 2050 werden es fast 7 von 10 sein.",
      en: "In 2007 city dwellers became the majority for the first time. By 2050 it will be nearly 7 in 10.",
    },
  },
  "ayna-internet": {
    answer: 67,
    insight: {
      tr: "Yaklaşık 2,6 milyar insan hâlâ çevrimdışı; çoğu kırsal bölgelerde yaşıyor.",
      de: "Rund 2,6 Milliarden Menschen sind noch offline – die meisten leben auf dem Land.",
      en: "About 2.6 billion people are still offline – most of them in rural areas.",
    },
  },
  "ayna-electricity": {
    answer: 91,
    insight: {
      tr: "Elektriği olmayan yaklaşık 685 milyon insanın çoğu Sahra Altı Afrika'da yaşıyor.",
      de: "Die meisten der rund 685 Millionen Menschen ohne Strom leben in Subsahara-Afrika.",
      en: "Most of the roughly 685 million people without electricity live in sub-Saharan Africa.",
    },
  },
  "ayna-literacy": {
    answer: 87,
    insight: {
      tr: "Okuma yazma bilmeyen yaklaşık 750 milyon yetişkinin üçte ikisi kadın.",
      de: "Von den rund 750 Millionen Erwachsenen, die nicht lesen können, sind zwei Drittel Frauen.",
      en: "Of the roughly 750 million adults who cannot read, two thirds are women.",
    },
  },
  "ayna-literacy-1820": {
    answer: 12,
    insight: {
      tr: "İki yüz yılda tablo tersine döndü: o zaman okuyabilenler azınlıktaydı, bugün okuyamayanlar.",
      de: "In 200 Jahren hat sich das Bild umgekehrt: Damals waren Lesende die Minderheit, heute sind es Nichtlesende.",
      en: "In 200 years the picture flipped: back then readers were the minority; today it's non-readers.",
    },
  },
  "ayna-women-parliament": {
    answer: 27,
    insight: {
      tr: "1995'te bu oran %11'di. Artıyor, ama bu hızla eşitlik daha on yıllar alacak.",
      de: "1995 waren es 11 %. Der Anteil steigt – doch in diesem Tempo dauert Gleichstellung noch Jahrzehnte.",
      en: "In 1995 it was 11%. It's rising – but at this pace, parity will take decades.",
    },
  },
  "ayna-aged-65": {
    answer: 10,
    insight: {
      tr: "2050'de bu oran %16'ya çıkacak: her altı kişiden biri. Büyükanne ve büyükbabalar çoğalıyor.",
      de: "Bis 2050 steigt der Anteil auf 16 % – jeder Sechste. Es gibt immer mehr Großeltern.",
      en: "By 2050 it will reach 16% – one in six. There are more and more grandparents.",
    },
  },
  "ayna-under-15": {
    answer: 25,
    insight: {
      tr: "Dünyadaki çocuk sayısı artık artmıyor; yaklaşık 2 milyarda dengelendi.",
      de: "Die Zahl der Kinder weltweit wächst nicht mehr – sie hat sich bei rund 2 Milliarden eingependelt.",
      en: "The number of children in the world has stopped growing – it has levelled off at about 2 billion.",
    },
  },
  "ayna-asia": {
    answer: 59,
    insight: {
      tr: "Dünyayı 10 kişilik bir masa olarak düşün: 6'sı Asyalı, 2'si Afrikalı, 1'i Avrupalı, 1'i Amerikalı.",
      de: "Stell dir die Welt als Tisch mit 10 Personen vor: 6 aus Asien, 2 aus Afrika, 1 aus Europa, 1 aus Amerika.",
      en: "Picture the world as a table of 10: 6 from Asia, 2 from Africa, 1 from Europe, 1 from the Americas.",
    },
  },
  "ayna-bank-account": {
    answer: 76,
    insight: {
      tr: "2011'de yalnızca %51'di. Birçok ülkede insanların ilk bankası cepteki telefon oldu.",
      de: "2011 waren es nur 51 %. In vielen Ländern wurde das Handy zur ersten Bank der Menschen.",
      en: "In 2011 it was only 51%. In many countries, the phone became people's first bank.",
    },
  },
  "ayna-extreme-poverty": {
    answer: 9,
    insight: {
      tr: "1990'da bu oran %38'di. Hâlâ 700 milyondan fazla insan; ama çoğumuz dünyayı olduğundan yoksul sanıyoruz.",
      de: "1990 waren es 38 %. Immer noch über 700 Millionen Menschen – doch die meisten halten die Welt für ärmer, als sie ist.",
      en: "In 1990 it was 38%. Still over 700 million people – yet most of us think the world is poorer than it is.",
    },
  },
  "ayna-left-handed": {
    answer: 10.6,
    insight: {
      tr: "Yaklaşık her 10 kişiden biri. Makaslar, defterler ve kapı kolları hâlâ çoğunlukla sağlaklara göre tasarlanıyor.",
      de: "Etwa jeder Zehnte. Scheren, Hefte und Türgriffe sind trotzdem meist für Rechtshänder gemacht.",
      en: "About one in ten. Yet scissors, notebooks and door handles are still mostly designed for right-handers.",
    },
  },
  "ayna-nobel-women": {
    answer: 6.6,
    insight: {
      tr: "Yalnızca 64 kadın. Marie Curie ise iki farklı bilim dalında ödül alan tek kişi.",
      de: "Nur 64 Frauen. Marie Curie ist bis heute der einzige Mensch mit Nobelpreisen in zwei verschiedenen Naturwissenschaften.",
      en: "Just 64 women. Marie Curie is still the only person to win in two different sciences.",
    },
  },
  "ayna-forests": {
    answer: 31,
    insight: {
      tr: "Ormanların yarısından fazlası yalnızca beş ülkede: Rusya, Brezilya, Kanada, ABD ve Çin.",
      de: "Mehr als die Hälfte der Wälder liegt in nur fünf Ländern: Russland, Brasilien, Kanada, USA und China.",
      en: "Over half of all forests lie in just five countries: Russia, Brazil, Canada, the US and China.",
    },
  },
  "ayna-ocean": {
    answer: 71,
    insight: {
      tr: "Buna rağmen okyanus tabanının yalnızca yaklaşık dörtte biri ayrıntılı olarak haritalandı.",
      de: "Trotzdem ist erst rund ein Viertel des Meeresbodens genau kartiert.",
      en: "Yet only about a quarter of the seafloor has been mapped in detail.",
    },
  },
  "ayna-freshwater": {
    answer: 2.5,
    insight: {
      tr: "Bunun da büyük kısmı buzullarda ve yer altında. Musluktan akan her damla sandığımızdan değerli.",
      de: "Und das meiste davon steckt in Gletschern und im Grundwasser. Jeder Tropfen aus dem Hahn ist wertvoller, als wir denken.",
      en: "And most of that is locked in glaciers and groundwater. Every drop from the tap is more precious than we think.",
    },
  },
  "ayna-antarctica-ice": {
    answer: 90,
    insight: {
      tr: "Antarktika buz tabakası tamamen erise deniz seviyesi yaklaşık 58 metre yükselirdi.",
      de: "Würde der antarktische Eisschild ganz schmelzen, stiege der Meeresspiegel um rund 58 Meter.",
      en: "If the Antarctic ice sheet melted completely, sea levels would rise by about 58 metres.",
    },
  },
  "ayna-plastic-recycled": {
    answer: 9,
    insight: {
      tr: "Geri kalanın çoğu çöp sahalarına gidiyor, yakılıyor ya da doğaya karışıyor.",
      de: "Der Rest landet größtenteils auf Deponien, wird verbrannt oder gelangt in die Umwelt.",
      en: "Most of the rest ends up in landfill, gets burned or leaks into nature.",
    },
  },
  "ayna-food-waste": {
    answer: 33,
    insight: {
      tr: "Yaklaşık üçte biri. Aynı dünyada yüz milyonlarca insan her gece aç yatıyor.",
      de: "Etwa ein Drittel. In derselben Welt gehen Hunderte Millionen Menschen jede Nacht hungrig schlafen.",
      en: "About a third. In the same world, hundreds of millions of people go to bed hungry every night.",
    },
  },
  "ayna-agri-land": {
    answer: 50,
    insight: {
      tr: "Bunun yaklaşık dörtte üçü hayvancılığa gidiyor; ama bize kalorilerimizin beşte birinden azını sağlıyor.",
      de: "Rund drei Viertel davon dienen der Tierhaltung – die aber weniger als ein Fünftel unserer Kalorien liefert.",
      en: "About three quarters of it goes to livestock – which provides less than a fifth of our calories.",
    },
  },
  "ayna-renewables": {
    answer: 30,
    insight: {
      tr: "En büyük pay hâlâ hidroelektrikte; ama en hızlı büyüyenler rüzgâr ve güneş.",
      de: "Wasserkraft hat noch den größten Anteil – am schnellsten wachsen aber Wind und Sonne.",
      en: "Hydropower still has the biggest share – but wind and solar are growing fastest.",
    },
  },
  "ayna-food-emissions": {
    answer: 26,
    insight: {
      tr: "Yaklaşık dörtte biri. Tabağımızdaki seçimler iklim için sandığımızdan önemli.",
      de: "Etwa ein Viertel. Was auf unserem Teller landet, ist fürs Klima wichtiger, als wir denken.",
      en: "About a quarter. What's on our plates matters more for the climate than we think.",
    },
  },
  "ayna-wild-mammals": {
    answer: 4,
    insight: {
      tr: "Yalnızca %4. Geri kalanın %36'sı insan, %60'ı çiftlik hayvanı.",
      de: "Nur 4 %. Der Rest: 36 % Menschen, 60 % Nutztiere.",
      en: "Only 4%. The rest: 36% humans, 60% livestock.",
    },
  },
  "ayna-nitrogen": {
    answer: 78,
    insight: {
      tr: "Oksijen yalnızca %21. Her nefesin büyük kısmı, vücudumuzun doğrudan kullanmadığı bir gaz.",
      de: "Sauerstoff macht nur 21 % aus. Der Großteil jedes Atemzugs ist ein Gas, das unser Körper nicht direkt nutzt.",
      en: "Oxygen is only 21%. Most of every breath is a gas our body doesn't directly use.",
    },
  },
  "ayna-body-water": {
    answer: 60,
    insight: {
      tr: "Beynimiz ve kalbimiz ise yaklaşık %73 sudur.",
      de: "Gehirn und Herz bestehen sogar zu etwa 73 % aus Wasser.",
      en: "Our brain and heart are even about 73% water.",
    },
  },
  "ayna-chimp-dna": {
    answer: 98.8,
    insight: {
      tr: "Ve iki insan arasındaki fark bundan da küçük: DNA'mızın %99,9'u herkesle aynı.",
      de: "Und zwei Menschen unterscheiden sich noch weniger: 99,9 % unserer DNA sind bei allen gleich.",
      en: "And any two people differ even less: 99.9% of our DNA is the same in everyone.",
    },
  },
  "ayna-moon-gravity": {
    answer: 16.6,
    insight: {
      tr: "Yaklaşık altıda biri: 70 kiloluk biri Ay'da kendini yaklaşık 12 kilo gibi hissederdi.",
      de: "Etwa ein Sechstel: Wer 70 Kilo wiegt, würde sich auf dem Mond wie etwa 12 Kilo fühlen.",
      en: "About a sixth: someone weighing 70 kg would feel like about 12 kg on the Moon.",
    },
  },
  "ayna-colorblind": {
    answer: 8,
    insight: {
      tr: "Yaklaşık 12 erkekten biri, ama 200 kadından yalnızca biri. Bu salonda da birkaç kişi muhtemelen kırmızıyla yeşili karıştırıyor.",
      de: "Etwa jeder 12. Mann, aber nur jede 200. Frau. Wahrscheinlich verwechseln auch hier im Raum einige Rot und Grün.",
      en: "About 1 in 12 men but only 1 in 200 women. A few people in this room probably mix up red and green.",
    },
  },
};

export function aynaFactById(id: string | undefined | null): AynaFact | undefined {
  return id ? AYNA_FACTS[id] : undefined;
}
