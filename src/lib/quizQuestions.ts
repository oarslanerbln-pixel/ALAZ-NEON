import type { QuizQuestion } from "../types/database";

// ═══════════════════════════════════════════════════════════════════════════
// HENGÂME QUIZ QUESTIONS POOL (TR / DE / EN)
// Categorized by locale, with difficulties (1=Easy, 2=Medium, 3=Hard/Chaos)
// Includes categories and fun facts for TV reveal cards.
// ═══════════════════════════════════════════════════════════════════════════

export const trQuestions: QuizQuestion[] = [
  // ─── GECE HAYATI & KAFE KÜLTÜRÜ ───
  {
    id: "tr_night_1",
    category: "🍸 GECE & KAFE",
    text: "Geleneksel 'Mojito' kokteylinin ana alkollü içkisi hangisidir?",
    options: { A: "Votka", B: "Rom (Rum)", C: "Tekila", D: "Cin" },
    correctOption: "B",
    difficulty: 1,
    funFact: "Mojito, Küba'nın Havana kentinde doğmuş olup Ernest Hemingway'in de en sevdiği kokteyldir!",
  },
  {
    id: "tr_night_2",
    category: "🍸 GECE & KAFE",
    text: "Kahve çekirdeği aslında botanik olarak nedir?",
    options: { A: "Ağaç Kabuğu", B: "Bir Meyvenin Çekirdeği", C: "Kök Yumrusu", D: "Yaprak Tomurcuğu" },
    correctOption: "B",
    difficulty: 2,
    funFact: "Kahve çekirdekleri, 'kahve kirazı' adı verilen kırmızı meyvelerin içindeki tohumlardır.",
  },
  {
    id: "tr_night_3",
    category: "🍸 GECE & KAFE",
    text: "'Espresso Martini' kokteylinin üzerine geleneksel olarak kaç adet kahve çekirdeği konur?",
    options: { A: "1", B: "2", C: "3", D: "5" },
    correctOption: "C",
    difficulty: 2,
    funFact: "Üç çekirdek sırasıyla sağlık, zenginlik ve mutluluğu temsil eder.",
  },

  // ─── MÜZİK & POPÜLER KÜLTÜR ───
  {
    id: "tr_music_1",
    category: "🎵 MÜZİK",
    text: "Spotify'da tüm zamanların ilk 3 milyar dinlenmeyi aşan şarkısı hangisidir?",
    options: { A: "Blinding Lights (The Weeknd)", B: "Shape of You (Ed Sheeran)", C: "Despacito (Luis Fonsi)", D: "Dance Monkey (Tones and I)" },
    correctOption: "B",
    difficulty: 2,
    funFact: "Ed Sheeran'ın 'Shape of You' şarkısı 2021'de 3 milyar barajını ilk geçen şarkı olmuştur.",
  },
  {
    id: "tr_music_2",
    category: "🎵 MÜZİK",
    text: "Efsanevi rock grubu Queen'in 'Bohemian Rhapsody' şarkısı hangi yılda yayınlanmıştır?",
    options: { A: "1969", B: "1975", C: "1982", D: "1989" },
    correctOption: "B",
    difficulty: 2,
    funFact: "Plak şirketi şarkının 6 dakikalık süresini radyolar için çok uzun bulup ilk başta reddetmişti!",
  },
  {
    id: "tr_music_3",
    category: "🎵 MÜZİK",
    text: "Daft Punk'ın ikonik robot kaskları ilk olarak hangi albüm döneminde sahneye çıktı?",
    options: { A: "Homework", B: "Discovery", C: "Human After All", D: "Random Access Memories" },
    correctOption: "B",
    difficulty: 3,
    funFact: "İkili, 1999 yılında bir stüdyo patlamasında robota dönüştüklerini iddia eden eğlenceli bir hikaye uydurmuştu.",
  },

  // ─── SİNEMA & DİZİ ───
  {
    id: "tr_cinema_1",
    category: "🎬 SİNEMA",
    text: "'Matrix' filminde Neo'nun gerçeği görmek için seçtiği hap hangi renktir?",
    options: { A: "Mavi", B: "Kırmızı", C: "Yeşil", D: "Sarı" },
    correctOption: "B",
    difficulty: 1,
    funFact: "Mavi hap illüzyon dolu Matrix'te uyumayı, Kırmızı hap ise acımasız gerçek dünyayı temsil eder.",
  },
  {
    id: "tr_cinema_2",
    category: "🎬 SİNEMA",
    text: "Quentin Tarantino'nun 'Pulp Fiction' filmindeki meşhur parlayan çantanın içinde ne olduğu filmde açıklanır mı?",
    options: { A: "Elmaslar", B: "Marcellus'un Ruhu", C: "Altın Külçeleri", D: "Hiçbir zaman açıklanmaz" },
    correctOption: "D",
    difficulty: 2,
    funFact: "Tarantino, çantanın içinde ne olduğunu izleyicinin hayal gücüne bırakmak için bilerek gizli tutmuştur.",
  },
  {
    id: "tr_cinema_3",
    category: "🎬 SİNEMA",
    text: "Yüzüklerin Efendisi serisinde 'Tek Yüzük' hangi dağın ateşinde dövülmüştür?",
    options: { A: "Hüküm Dağı (Mount Doom)", B: "Erebor Dağı", C: "Sisli Dağlar", D: "Caradhras" },
    correctOption: "A",
    difficulty: 1,
    funFact: "Yüzük yalnızca dövüldüğü yer olan Hüküm Dağı'nın lavlarında yok edilebilir.",
  },

  // ─── ZEKA & MANTIK TUZAKLARI ───
  {
    id: "tr_brain_1",
    category: "🧠 ZEKA TUZAĞI",
    text: "Bir yarışta ikinci sıradaki koşucuyu geçerseniz kaçıncı olursunuz?",
    options: { A: "Birinci", B: "İkinci", C: "Üçüncü", D: "Yarışı kazanırsınız" },
    correctOption: "B",
    difficulty: 1,
    funFact: "İkincinin yerini aldığınız için siz ikinci olursunuz, birinci hâlâ önünüzdedir!",
  },
  {
    id: "tr_brain_2",
    category: "🧠 ZEKA TUZAĞI",
    text: "Bazı aylar 30, bazıları 31 çeker. Kaç ayda 28 gün vardır?",
    options: { A: "1 (Şubat)", B: "6", C: "12 (Hepsinde)", D: "Hiçbiri" },
    correctOption: "C",
    difficulty: 2,
    funFact: "Yılın 12 ayının tamamında en az 28 gün bulunmaktadır!",
  },
  {
    id: "tr_brain_3",
    category: "🧠 ZEKA TUZAĞI",
    text: "Bir tuğlanın ağırlığı 1 kg artı yarım tuğla kadardır. Bir tuğla kaç kg'dır?",
    options: { A: "1.5 kg", B: "2 kg", C: "2.5 kg", D: "3 kg" },
    correctOption: "B",
    difficulty: 3,
    funFact: "Matematiksel olarak: X = 1 + X/2 denkleminden X = 2 kg çıkar.",
  },

  // ─── GENEL KÜLTÜR & COĞRAFYA ───
  {
    id: "tr_gen_1",
    category: "🌍 GENEL KÜLTÜR",
    text: "Dünyanın yüzölçümü bakımından en büyük okyanusu hangisidir?",
    options: { A: "Atlantik (Atlas)", B: "Pasifik (Büyük Okyanus)", C: "Hint Okyanusu", D: "Arktik Okyanusu" },
    correctOption: "B",
    difficulty: 1,
    funFact: "Pasifik Okyanusu, dünyadaki tüm kara parçalarının toplamından daha geniş bir alanı kaplar!",
  },
  {
    id: "tr_gen_2",
    category: "🌍 GENEL KÜLTÜR",
    text: "Hangi element periyodik tabloda 'Au' simgesi ile gösterilir?",
    options: { A: "Gümüş", B: "Altın", C: "Alüminyum", D: "Bakır" },
    correctOption: "B",
    difficulty: 1,
    funFact: "'Au' simgesi, Latince 'parlayan şafak' anlamına gelen 'Aurum' kelimesinden gelir.",
  },
  {
    id: "tr_gen_3",
    category: "🌍 GENEL KÜLTÜR",
    text: "Mona Lisa tablosu günümüzde hangi müzede sergilenmektedir?",
    options: { A: "British Museum", B: "Prado Müzesi", C: "Louvre Müzesi", D: "Uffizi Galerisi" },
    correctOption: "C",
    difficulty: 1,
    funFact: "Mona Lisa tablosunun kendi posta kutusu vardır ve her yıl binlerce aşk mektubu alır!",
  },
  {
    id: "tr_gen_4",
    category: "🌍 GENEL KÜLTÜR",
    text: "Nobel Edebiyat Ödülü'nü kazanan ilk Türk yazar kimdir?",
    options: { A: "Yaşar Kemal", B: "Orhan Pamuk", C: "Sabahattin Ali", D: "Nazım Hikmet" },
    correctOption: "B",
    difficulty: 2,
    funFact: "Orhan Pamuk, Nobel Edebiyat Ödülü'nü 2006 yılında kazanmıştır.",
  },
  {
    id: "tr_gen_5",
    category: "🌍 GENEL KÜLTÜR",
    text: "Japonya'nın resmi para birimi nedir?",
    options: { A: "Yen", B: "Yuan", C: "Won", D: "Baht" },
    correctOption: "A",
    difficulty: 1,
    funFact: "Japonca 'Yen', kelime anlamı olarak 'yuvarlak nesne' veya 'daire' demektir.",
  },

  // ─── BİLİM & TEKNOLOJİ ───
  {
    id: "tr_sci_1",
    category: "🚀 BİLİM & TEKNO",
    text: "Güneş Sistemi'ndeki en sıcak gezegen hangisidir?",
    options: { A: "Merkür", B: "Venüs", C: "Mars", D: "Jüpiter" },
    correctOption: "B",
    difficulty: 2,
    funFact: "Güneş'e en yakın gezegen Merkür olsa da, yoğun sera gazı atmosferi nedeniyle en sıcağı Venüs'tür (465°C)!",
  },
  {
    id: "tr_sci_2",
    category: "🚀 BİLİM & TEKNO",
    text: "Tarihteki ilk bilgisayar programcısı olarak kabul edilen bilim insanı kimdir?",
    options: { A: "Alan Turing", B: "Ada Lovelace", C: "Nikola Tesla", D: "Charles Babbage" },
    correctOption: "B",
    difficulty: 3,
    funFact: "Ada Lovelace, 1843 yılında mekanik bilgisayar için ilk algoritmayı yazmıştır.",
  },
  {
    id: "tr_sci_3",
    category: "🚀 BİLİM & TEKNO",
    text: "Işığın boşluktaki hızı saniyede yaklaşık kaç kilometredir?",
    options: { A: "150.000 km/s", B: "300.000 km/s", C: "500.000 km/s", D: "1.000.000 km/s" },
    correctOption: "B",
    difficulty: 2,
    funFact: "Işık hızında seyahat edebilseydiniz, 1 saniyede Dünya'nın etrafını 7.5 kez turlayabilirdiniz!",
  },
  {
    id: "tr_sci_4",
    category: "🚀 BİLİM & TEKNO",
    text: "İnsan vücudundaki en güçlü ve en büyük kemik hangisidir?",
    options: { A: "Uyluk Kemiği (Femur)", B: "Kaval Kemiği", C: "Omurga", D: "Kafatası" },
    correctOption: "A",
    difficulty: 2,
    funFact: "Femur kemiği betondan daha yüksek basınca ve vücut ağırlığının 30 katına kadar yüke dayanabilir.",
  },
  {
    id: "tr_sci_5",
    category: "🚀 BİLİM & TEKNO",
    text: "Ahtapotların kaç adet kalbi vardır?",
    options: { A: "1", B: "2", C: "3", D: "4" },
    correctOption: "C",
    difficulty: 2,
    funFact: "Ahtapotların 3 kalbi ve mavi renkte kanı vardır!",
  },
];

export const deQuestions: QuizQuestion[] = [
  // ─── NIGHTLIFE & CAFE ───
  {
    id: "de_night_1",
    category: "🍸 NACHTLEBEN",
    text: "Was ist die Hauptspirituose in einem traditionellen 'Mojito'?",
    options: { A: "Wodka", B: "Rum", C: "Tequila", D: "Gin" },
    correctOption: "B",
    difficulty: 1,
    funFact: "Der Mojito stammt aus Havanna (Kuba) und war der Lieblingsdrink von Ernest Hemingway!",
  },
  {
    id: "de_night_2",
    category: "🍸 NACHTLEBEN",
    text: "Wie viele Kaffeebohnen werden traditionell auf einen Espresso Martini gelegt?",
    options: { A: "1", B: "2", C: "3", D: "5" },
    correctOption: "C",
    difficulty: 2,
    funFact: "Die drei Bohnen stehen für Gesundheit, Wohlstand und Glück.",
  },
  {
    id: "de_night_3",
    category: "🍸 NACHTLEBEN",
    text: "Was ist eine Kaffeebohne aus botanischer Sicht?",
    options: { A: "Baumrinde", B: "Samen einer Steinfrucht", C: "Wurzelknolle", D: "Blattknospe" },
    correctOption: "B",
    difficulty: 2,
    funFact: "Kaffeebohnen sind eigentlich die Samen der roten Kaffeekirsche!",
  },

  // ─── MUSIK & POPKULTUR ───
  {
    id: "de_music_1",
    category: "🎵 MUSIK",
    text: "Welcher Song hat auf Spotify als erster aller Zeiten 3 Milliarden Streams erreicht?",
    options: { A: "Blinding Lights (The Weeknd)", B: "Shape of You (Ed Sheeran)", C: "Despacito (Luis Fonsi)", D: "Dance Monkey" },
    correctOption: "B",
    difficulty: 2,
    funFact: "Ed Sheerans Megahit knackte im Dezember 2021 als erster Track die 3-Milliarden-Marke.",
  },
  {
    id: "de_music_2",
    category: "🎵 MUSIK",
    text: "In welchem Jahr erschien der legendäre Queen-Hit 'Bohemian Rhapsody'?",
    options: { A: "1969", B: "1975", C: "1982", D: "1989" },
    correctOption: "B",
    difficulty: 2,
    funFact: "Die Plattenfirma hielt den Song mit fast 6 Minuten anfangs für viel zu lang fürs Radio!",
  },

  // ─── KINO & SERIEN ───
  {
    id: "de_cinema_1",
    category: "🎬 KINO",
    text: "Welche Pille wählt Neo in 'Matrix', um die Wahrheit über die Welt zu erfahren?",
    options: { A: "Blau", B: "Rot", C: "Grün", D: "Gelb" },
    correctOption: "B",
    difficulty: 1,
    funFact: "Die rote Pille öffnet das Tor zur Realität, die blaue lässt einen in der Matrix weiterschlafen.",
  },
  {
    id: "de_cinema_2",
    category: "🎬 KINO",
    text: "Wo wurde der Eine Ring in 'Der Herr der Ringe' geschmiedet?",
    options: { A: "Schicksalsberg (Mount Doom)", B: "Erebor", C: "Nebelgebirge", D: "Isengart" },
    correctOption: "A",
    difficulty: 1,
    funFact: "Der Ring kann nur dort zerstört werden, wo Sauron ihn einst geschmiedet hat.",
  },

  // ─── LOGIK & DENKSPORT ───
  {
    id: "de_brain_1",
    category: "🧠 DENKSPORT",
    text: "Wenn du in einem Rennen den Zweiten überholst, an welcher Position bist du dann?",
    options: { A: "Erster", B: "Zweiter", C: "Dritter", D: "Sieger" },
    correctOption: "B",
    difficulty: 1,
    funFact: "Du übernimmst den Platz des Zweiten, der Erste ist immer noch vor dir!",
  },
  {
    id: "de_brain_2",
    category: "🧠 DENKSPORT",
    text: "Manche Monate haben 30 Tage, manche 31. Wie viele Monate haben 28 Tage?",
    options: { A: "1 (Februar)", B: "6", C: "Alle 12", D: "Keiner" },
    correctOption: "C",
    difficulty: 2,
    funFact: "Jeder der 12 Monate hat mindestens 28 Tage!",
  },

  // ─── ALLGEMEINWISSEN ───
  {
    id: "de_gen_1",
    category: "🌍 WISSEN",
    text: "Was ist die Hauptstadt von Deutschland?",
    options: { A: "München", B: "Berlin", C: "Hamburg", D: "Frankfurt" },
    correctOption: "B",
    difficulty: 1,
    funFact: "Berlin hat mehr Brücken als Venedig – insgesamt rund 960 Stück!",
  },
  {
    id: "de_gen_2",
    category: "🌍 WISSEN",
    text: "Welches chemische Element hat das Symbol 'Au' im Periodensystem?",
    options: { A: "Silber", B: "Gold", C: "Aluminium", D: "Kupfer" },
    correctOption: "B",
    difficulty: 1,
    funFact: "Das Symbol leitet sich vom lateinischen Wort 'Aurum' (Morgenröte) ab.",
  },
  {
    id: "de_gen_3",
    category: "🌍 WISSEN",
    text: "In welchem Museum hängt das berühmte Gemälde 'Mona Lisa'?",
    options: { A: "British Museum", B: "Prado", C: "Louvre", D: "Uffizien" },
    correctOption: "C",
    difficulty: 1,
    funFact: "Die Mona Lisa hat im Louvre einen eigenen Briefkasten für Liebesbriefe!",
  },
  {
    id: "de_gen_4",
    category: "🌍 WISSEN",
    text: "In welchem Jahr fiel die Berliner Mauer?",
    options: { A: "1989", B: "1990", C: "1991", D: "1988" },
    correctOption: "A",
    difficulty: 2,
    funFact: "Der historische Mauerfall ereignete sich am Abend des 9. November 1989.",
  },

  // ─── WISSENSCHAFT & TECH ───
  {
    id: "de_sci_1",
    category: "🚀 WISSENSCHAFT",
    text: "Welcher Planet ist der heißeste in unserem Sonnensystem?",
    options: { A: "Merkur", B: "Venus", C: "Mars", D: "Jupiter" },
    correctOption: "B",
    difficulty: 2,
    funFact: "Wegen des extremen Treibhauseffekts herrschen auf der Venus ca. 465°C!",
  },
  {
    id: "de_sci_2",
    category: "🚀 WISSENSCHAFT",
    text: "Wie viele Herzen hat ein Oktopus (Krake)?",
    options: { A: "1", B: "2", C: "3", D: "4" },
    correctOption: "C",
    difficulty: 2,
    funFact: "Kraken haben 3 Herzen und ihr Blut ist durch Kupfer blau gefärbt!",
  },
  {
    id: "de_sci_3",
    category: "🚀 WISSENSCHAFT",
    text: "Wer gilt als die erste Computerprogrammiererin der Geschichte?",
    options: { A: "Alan Turing", B: "Ada Lovelace", C: "Marie Curie", D: "Grace Hopper" },
    correctOption: "B",
    difficulty: 3,
    funFact: "Ada Lovelace verfasste bereits 1843 den ersten Algorithmus für eine Rechenmaschine.",
  }
];

export const enQuestions: QuizQuestion[] = [
  // ─── NIGHTLIFE & CAFE ───
  {
    id: "en_night_1",
    category: "🍸 NIGHTLIFE",
    text: "What is the primary spirit used in a classic 'Mojito'?",
    options: { A: "Vodka", B: "Rum", C: "Tequila", D: "Gin" },
    correctOption: "B",
    difficulty: 1,
    funFact: "The Mojito originated in Havana, Cuba and was famously loved by Ernest Hemingway!",
  },
  {
    id: "en_night_2",
    category: "🍸 NIGHTLIFE",
    text: "How many coffee beans are traditionally placed on an Espresso Martini?",
    options: { A: "1", B: "2", C: "3", D: "5" },
    correctOption: "C",
    difficulty: 2,
    funFact: "The three beans represent health, wealth, and happiness.",
  },

  // ─── MUSIC & POP CULTURE ───
  {
    id: "en_music_1",
    category: "🎵 MUSIC",
    text: "Which song was the first in Spotify history to surpass 3 billion streams?",
    options: { A: "Blinding Lights", B: "Shape of You", C: "Despacito", D: "Starboy" },
    correctOption: "B",
    difficulty: 2,
    funFact: "Ed Sheeran's 'Shape of You' crossed 3 billion streams in December 2021.",
  },
  {
    id: "en_music_2",
    category: "🎵 MUSIC",
    text: "What year was Queen's iconic 'Bohemian Rhapsody' released?",
    options: { A: "1969", B: "1975", C: "1982", D: "1989" },
    correctOption: "B",
    difficulty: 2,
    funFact: "Record executives initially thought the 6-minute operatic track would never work on radio!",
  },

  // ─── CINEMA & TV ───
  {
    id: "en_cinema_1",
    category: "🎬 MOVIES",
    text: "In 'The Matrix', which pill does Neo take to see the real world?",
    options: { A: "Blue Pill", B: "Red Pill", C: "Green Pill", D: "Yellow Pill" },
    correctOption: "B",
    difficulty: 1,
    funFact: "The red pill represents truth and reality, while the blue pill maintains the illusion.",
  },
  {
    id: "en_cinema_2",
    category: "🎬 MOVIES",
    text: "Where was the One Ring forged in 'The Lord of the Rings'?",
    options: { A: "Mount Doom", B: "The Lonely Mountain", C: "Misty Mountains", D: "Isengard" },
    correctOption: "A",
    difficulty: 1,
    funFact: "The One Ring could only be unmade in the fires of Mount Doom where it was forged.",
  },

  // ─── BRAIN TEASERS ───
  {
    id: "en_brain_1",
    category: "🧠 BRAIN TEASER",
    text: "If you overtake the second person in a race, what position are you in?",
    options: { A: "1st", B: "2nd", C: "3rd", D: "Winner" },
    correctOption: "B",
    difficulty: 1,
    funFact: "You take the place of the person in 2nd; the person in 1st is still ahead of you!",
  },
  {
    id: "en_brain_2",
    category: "🧠 BRAIN TEASER",
    text: "Some months have 30 days, some have 31. How many months have 28 days?",
    options: { A: "1 (February)", B: "6", C: "All 12", D: "None" },
    correctOption: "C",
    difficulty: 2,
    funFact: "All 12 months have at least 28 days!",
  },

  // ─── GENERAL KNOWLEDGE ───
  {
    id: "en_gen_1",
    category: "🌍 TRIVIA",
    text: "Which chemical element is represented by the symbol 'Au'?",
    options: { A: "Silver", B: "Gold", C: "Aluminum", D: "Copper" },
    correctOption: "B",
    difficulty: 1,
    funFact: "'Au' comes from the Latin word 'Aurum', meaning 'shining dawn'.",
  },
  {
    id: "en_gen_2",
    category: "🌍 TRIVIA",
    text: "In which museum is the Mona Lisa currently displayed?",
    options: { A: "The British Museum", B: "The Prado", C: "The Louvre", D: "The Met" },
    correctOption: "C",
    difficulty: 1,
    funFact: "The Mona Lisa has her own mailbox at the Louvre and receives love letters every year!",
  },

  // ─── SCIENCE & TECH ───
  {
    id: "en_sci_1",
    category: "🚀 SCIENCE",
    text: "Which planet is the hottest in our solar system?",
    options: { A: "Mercury", B: "Venus", C: "Mars", D: "Jupiter" },
    correctOption: "B",
    difficulty: 2,
    funFact: "Due to its thick carbon dioxide atmosphere and runaway greenhouse effect, Venus reaches 465°C!",
  },
  {
    id: "en_sci_2",
    category: "🚀 SCIENCE",
    text: "How many hearts does an octopus have?",
    options: { A: "1", B: "2", C: "3", D: "4" },
    correctOption: "C",
    difficulty: 2,
    funFact: "Octopuses have 3 hearts and blue copper-based blood!",
  },
  {
    id: "en_sci_3",
    category: "🚀 SCIENCE",
    text: "Who is widely considered the world's first computer programmer?",
    options: { A: "Alan Turing", B: "Ada Lovelace", C: "Charles Babbage", D: "Grace Hopper" },
    correctOption: "B",
    difficulty: 3,
    funFact: "Ada Lovelace wrote the very first algorithm intended for Babbage's Analytical Engine in 1843.",
  }
];

export function getQuizQuestions(locale: string = "tr", count: number = 5): QuizQuestion[] {
  let basePool = trQuestions;
  if (locale.startsWith("de")) basePool = deQuestions;
  else if (locale.startsWith("en")) basePool = enQuestions;

  const shuffle = (arr: QuizQuestion[]) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const result: QuizQuestion[] = [];
  let lap = shuffle(basePool);
  while (result.length < count) {
    if (lap.length === 0) {
      const nextLap = shuffle(basePool);
      const prev = result[result.length - 1];
      if (prev && nextLap[0]?.id === prev.id && nextLap.length > 1) {
        [nextLap[0], nextLap[1]] = [nextLap[1], nextLap[0]];
      }
      lap = nextLap;
    }
    result.push(lap.shift()!);
  }

  return result;
}
