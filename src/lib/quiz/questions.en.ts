import type { QuizQuestion } from "../../types/database";
import data from "../../content/quiz/en.json";

// HENGAME quiz havuzu — EN. İçerik src/content/quiz/en.json'da (geliştirici
// olmayan editör de düzenleyebilsin diye JSON). Şema lib/quizPack.ts'te;
// quizContent testi her soruyu CI'da bu şemayla doğruluyor.
export const enQuestions: QuizQuestion[] = data as QuizQuestion[];
