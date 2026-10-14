import type { QuizQuestion } from "../../types/database";
import data from "../../content/quiz/de.json";

// HENGAME quiz havuzu — DE. İçerik src/content/quiz/de.json'da (geliştirici
// olmayan editör de düzenleyebilsin diye JSON). Şema lib/quizPack.ts'te;
// quizContent testi her soruyu CI'da bu şemayla doğruluyor.
export const deQuestions: QuizQuestion[] = data as QuizQuestion[];
