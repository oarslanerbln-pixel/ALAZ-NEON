import type { QuizQuestion } from "../types/database";

// ALAZ QUIZ Questions
// Categorized by locale, with multiple difficulties

export const trQuestions: QuizQuestion[] = [
  // Difficulty 1 (Easy)
  {
    id: "tr_easy_1",
    text: "Türkiye'nin başkenti neresidir?",
    options: { A: "İstanbul", B: "Ankara", C: "İzmir", D: "Bursa" },
    correctOption: "B",
    difficulty: 1,
  },
  {
    id: "tr_easy_2",
    text: "Hangi gezegen Güneş Sistemi'nde Güneş'e en yakın olandır?",
    options: { A: "Venüs", B: "Mars", C: "Merkür", D: "Dünya" },
    correctOption: "C",
    difficulty: 1,
  },
  {
    id: "tr_easy_3",
    text: "İngilizcede 'Kırmızı' hangi kelimeyle ifade edilir?",
    options: { A: "Blue", B: "Yellow", C: "Green", D: "Red" },
    correctOption: "D",
    difficulty: 1,
  },
  
  // Difficulty 2 (Medium)
  {
    id: "tr_med_1",
    text: "Mona Lisa tablosu hangi ünlü ressama aittir?",
    options: { A: "Vincent van Gogh", B: "Pablo Picasso", C: "Leonardo da Vinci", D: "Claude Monet" },
    correctOption: "C",
    difficulty: 2,
  },
  {
    id: "tr_med_2",
    text: "Hangi elementin periyodik tablodaki sembolü 'Au' dur?",
    options: { A: "Gümüş", B: "Altın", C: "Alüminyum", D: "Argon" },
    correctOption: "B",
    difficulty: 2,
  },
  {
    id: "tr_med_3",
    text: "Osmanlı İmparatorluğu hangi yılda kurulmuştur?",
    options: { A: "1071", B: "1453", C: "1299", D: "1923" },
    correctOption: "C",
    difficulty: 2,
  },

  // Difficulty 3 (Hard)
  {
    id: "tr_hard_1",
    text: "Nobel Edebiyat Ödülü'nü kazanan ilk Türk yazar kimdir?",
    options: { A: "Yaşar Kemal", B: "Orhan Pamuk", C: "Sabahattin Ali", D: "Halide Edip Adıvar" },
    correctOption: "B",
    difficulty: 3,
  },
  {
    id: "tr_hard_2",
    text: "DNA'nın çift sarmal yapısını kimler keşfetmiştir?",
    options: { A: "Newton & Einstein", B: "Watson & Crick", C: "Pasteur & Koch", D: "Curie & Bohr" },
    correctOption: "B",
    difficulty: 3,
  },
  {
    id: "tr_hard_3",
    text: "Japonya'nın para birimi nedir?",
    options: { A: "Yen", B: "Yuan", C: "Won", D: "Baht" },
    correctOption: "A",
    difficulty: 3,
  },
  // Expanded Questions
  {
    id: "tr_exp_1",
    text: "Dünyanın en yüksek dağı hangisidir?",
    options: { A: "K2", B: "Everest", C: "Kilimanjaro", D: "Ağrı Dağı" },
    correctOption: "B",
    difficulty: 1,
  },
  {
    id: "tr_exp_2",
    text: "Hangi hayvan 'Çöl Gemisi' olarak bilinir?",
    options: { A: "Deve", B: "At", C: "Fil", D: "Lama" },
    correctOption: "A",
    difficulty: 1,
  },
  {
    id: "tr_exp_3",
    text: "Türk alfabesinde kaç harf vardır?",
    options: { A: "27", B: "28", C: "29", D: "30" },
    correctOption: "C",
    difficulty: 1,
  },
  {
    id: "tr_exp_4",
    text: "Suyun kimyasal formülü nedir?",
    options: { A: "CO2", B: "O2", C: "H2O", D: "NaCl" },
    correctOption: "C",
    difficulty: 1,
  },
  {
    id: "tr_exp_5",
    text: "'Romeo ve Juliet' eserinin yazarı kimdir?",
    options: { A: "Charles Dickens", B: "William Shakespeare", C: "Victor Hugo", D: "Lev Tolstoy" },
    correctOption: "B",
    difficulty: 2,
  },
  {
    id: "tr_exp_6",
    text: "Pi sayısının ilk üç basamağı nedir?",
    options: { A: "3.12", B: "3.14", C: "3.16", D: "3.18" },
    correctOption: "B",
    difficulty: 2,
  },
  {
    id: "tr_exp_7",
    text: "Işık hızına en yakın olan hız hangisidir?",
    options: { A: "Ses Hızı", B: "Rüzgar Hızı", C: "Elektron Hızı", D: "Güneş Rüzgarı Hızı" },
    correctOption: "C",
    difficulty: 3,
  },
  {
    id: "tr_exp_8",
    text: "Fatih Sultan Mehmet İstanbul'u kaç yaşında fethetmiştir?",
    options: { A: "19", B: "21", C: "23", D: "25" },
    correctOption: "B",
    difficulty: 2,
  },
  {
    id: "tr_exp_9",
    text: "Aşağıdakilerden hangisi bir asal sayı değildir?",
    options: { A: "2", B: "7", C: "9", D: "11" },
    correctOption: "C",
    difficulty: 2,
  },
  {
    id: "tr_exp_10",
    text: "İnsan vücudundaki en küçük kemik nerededir?",
    options: { A: "Kulak", B: "Burun", C: "Serçe Parmak", D: "Ayak" },
    correctOption: "A",
    difficulty: 3,
  },
  {
    id: "tr_exp_11",
    text: "Tarihte bilinen ilk yazılı antlaşma hangisidir?",
    options: { A: "Magna Carta", B: "Kadeş Antlaşması", C: "Hammurabi Kanunları", D: "Versay Antlaşması" },
    correctOption: "B",
    difficulty: 3,
  },
  {
    id: "tr_exp_12",
    text: "Kıbrıs Barış Harekatı hangi yılda gerçekleşmiştir?",
    options: { A: "1960", B: "1974", C: "1980", D: "1983" },
    correctOption: "B",
    difficulty: 2,
  },
  {
    id: "tr_exp_13",
    text: "Türkiye'nin en uzun nehri hangisidir?",
    options: { A: "Kızılırmak", B: "Sakarya", C: "Fırat", D: "Yeşilırmak" },
    correctOption: "A",
    difficulty: 2,
  },
  {
    id: "tr_exp_14",
    text: "Gökyüzü neden mavidir?",
    options: { A: "Denizlerin yansıması", B: "Oksijen rengi", C: "Işığın saçılması (Rayleigh)", D: "Uzayın rengi" },
    correctOption: "C",
    difficulty: 3,
  },
  {
    id: "tr_exp_15",
    text: "İlk bilgisayar programcısı olarak kabul edilen kişi kimdir?",
    options: { A: "Alan Turing", B: "Ada Lovelace", C: "Charles Babbage", D: "Bill Gates" },
    correctOption: "B",
    difficulty: 3,
  },
  {
    id: "tr_exp_16",
    text: "Satrançta her iki tarafın başlangıçta kaçar taşı vardır?",
    options: { A: "12", B: "14", C: "16", D: "18" },
    correctOption: "C",
    difficulty: 1,
  },
  {
    id: "tr_exp_17",
    text: "Türkiye'de kaç adet coğrafi bölge vardır?",
    options: { A: "5", B: "6", C: "7", D: "8" },
    correctOption: "C",
    difficulty: 1,
  },
  {
    id: "tr_exp_18",
    text: "Mimar Sinan'ın 'Ustalık Eserim' dediği cami hangisidir?",
    options: { A: "Süleymaniye", B: "Şehzadebaşı", C: "Selimiye", D: "Sultanahmet" },
    correctOption: "C",
    difficulty: 2,
  },
  {
    id: "tr_exp_19",
    text: "İlk Dünya Kupası hangi ülkede düzenlenmiştir?",
    options: { A: "Brezilya", B: "Arjantin", C: "Uruguay", D: "İtalya" },
    correctOption: "C",
    difficulty: 3,
  },
  {
    id: "tr_exp_20",
    text: "Avrupa Birliği'nin başkenti neresi kabul edilir?",
    options: { A: "Paris", B: "Berlin", C: "Brüksel", D: "Londra" },
    correctOption: "C",
    difficulty: 2,
  }
];

export const deQuestions: QuizQuestion[] = [
  // Difficulty 1 (Easy)
  {
    id: "de_easy_1",
    text: "Was ist die Hauptstadt von Deutschland?",
    options: { A: "München", B: "Berlin", C: "Hamburg", D: "Frankfurt" },
    correctOption: "B",
    difficulty: 1,
  },
  {
    id: "de_easy_2",
    text: "Wie viele Farben hat ein Regenbogen?",
    options: { A: "Fünf", B: "Sechs", C: "Sieben", D: "Acht" },
    correctOption: "C",
    difficulty: 1,
  },
  {
    id: "de_easy_3",
    text: "Welches Tier ist als 'König der Tiere' bekannt?",
    options: { A: "Elefant", B: "Bär", C: "Tiger", D: "Löwe" },
    correctOption: "D",
    difficulty: 1,
  },

  // Difficulty 2 (Medium)
  {
    id: "de_med_1",
    text: "Wer malte die Mona Lisa?",
    options: { A: "Vincent van Gogh", B: "Pablo Picasso", C: "Leonardo da Vinci", D: "Claude Monet" },
    correctOption: "C",
    difficulty: 2,
  },
  {
    id: "de_med_2",
    text: "Welches chemische Element hat das Symbol 'O'?",
    options: { A: "Gold", B: "Sauerstoff", C: "Osmium", D: "Silber" },
    correctOption: "B",
    difficulty: 2,
  },
  {
    id: "de_med_3",
    text: "In welchem Jahr fiel die Berliner Mauer?",
    options: { A: "1989", B: "1990", C: "1991", D: "1988" },
    correctOption: "A",
    difficulty: 2,
  },

  // Difficulty 3 (Hard)
  {
    id: "de_hard_1",
    text: "Welcher Planet ist der größte in unserem Sonnensystem?",
    options: { A: "Saturn", B: "Jupiter", C: "Uranus", D: "Neptun" },
    correctOption: "B",
    difficulty: 3,
  },
  {
    id: "de_hard_2",
    text: "Wer schrieb 'Faust'?",
    options: { A: "Friedrich Schiller", B: "Thomas Mann", C: "Johann Wolfgang von Goethe", D: "Heinrich Heine" },
    correctOption: "C",
    difficulty: 3,
  },
  {
    id: "de_hard_3",
    text: "Wie heißt der längste Fluss der Erde?",
    options: { A: "Amazonas", B: "Nil", C: "Jangtsekiang", D: "Mississippi" },
    correctOption: "B", 
    difficulty: 3,
  }
];

export function getQuizQuestions(locale: string = "tr", count: number = 5): QuizQuestion[] {
  const pool = locale.startsWith("de") ? [...deQuestions] : [...trQuestions];
  
  // Shuffle the pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Return exactly 'count' questions, repeating if necessary
  const result: QuizQuestion[] = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[i % pool.length]);
  }
  
  return result;
}
