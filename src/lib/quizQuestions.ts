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
