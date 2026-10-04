import type { QuizQuestion } from "../../types/database";
import data from "../../content/quiz/tr.json";

// HENGAME quiz havuzu — TR. İçerik src/content/quiz/tr.json'da (geliştirici
// olmayan editör de düzenleyebilsin diye JSON). Şema lib/quizPack.ts'te;
// quizContent testi her soruyu CI'da bu şemayla doğruluyor.
export const trQuestions: QuizQuestion[] = data as QuizQuestion[];
