/**
 * Oyun ayarları modalının saf mantığı (docs/roadmap.md, 2.7).
 *
 * Eskiden `GameSettingsModal` içinde 17 ayrı `useState` ve bir oyun
 * değişince varsayılanları dağıtan zincirleme `if` vardı; odaya ne yazıldığı
 * yalnızca tıklayarak denenebiliyordu. Artık form tek bir nesne, oyun
 * varsayılanları ve odaya yazılan ayarlar birim testli saf fonksiyonlar.
 */
import type { GameType, Room } from "../types/database";

export type GameMode = "individual" | "team";
export type ColorsWinCondition = "domination" | "timed";

/** Modaldaki seçimler. Seçenek düğmeleri metin değer taşıdığı için sayılar da metin. */
export interface GameSettingsForm {
  totalRounds: string;
  timerValue: string;
  gameMode: GameMode;
  categories: string;
  activePreset: string | null;
  quizQuestionsCount: string;
  quizTimePerQuestion: string;
  quizDoubleFinal: boolean;
  quizTopics: string[];
  bombFuseTime: string;
  bombLives: string;
  bombSpeedMultiplier: number;
  sensorUnblurDuration: string;
  sensorPointReward: string;
  barTime: string;
  barRecipeSpeed: string;
  colorsWinCondition: ColorsWinCondition;
}

export const QUIZ_TOPIC_IDS = ["gece", "muzik", "sinema", "zeka", "kultur", "bilim"] as const;

/** Kategori alanı boş bırakılırsa klasik oyunun kullandığı kategoriler. */
export const FALLBACK_CATEGORIES = ["Stadt", "Land", "Name", "Tier"];

export function initialSettingsForm(defaultCategories: string): GameSettingsForm {
  return {
    totalRounds: "3",
    timerValue: "60",
    gameMode: "individual",
    categories: defaultCategories,
    activePreset: null,
    quizQuestionsCount: "8",
    quizTimePerQuestion: "20",
    quizDoubleFinal: true,
    quizTopics: [...QUIZ_TOPIC_IDS],
    bombFuseTime: "30",
    bombLives: "3",
    bombSpeedMultiplier: 1.0,
    sensorUnblurDuration: "25",
    sensorPointReward: "1000",
    barTime: "60",
    barRecipeSpeed: "4.5",
    colorsWinCondition: "domination",
  };
}

/**
 * Modal başka bir oyun için açılınca o oyunun varsayılanları. Yalnızca o
 * oyunun alanları sıfırlanır; diğerleri (ör. oyun modu, kategori listesi)
 * önceki seçimden kalır.
 */
export function withGameDefaults(form: GameSettingsForm, game: GameType | null): GameSettingsForm {
  switch (game) {
    case "scattegories":
      return { ...form, timerValue: "60", totalRounds: "3" };
    case "quiz":
      return { ...form, totalRounds: "5", quizTimePerQuestion: "20", quizQuestionsCount: "8" };
    case "bomb":
      return { ...form, bombFuseTime: "30", bombLives: "3", totalRounds: "3" };
    case "sensor":
      return { ...form, totalRounds: "5", sensorUnblurDuration: "25" };
    case "bar":
      return { ...form, barTime: "60" };
    case "ayna":
      return { ...form, totalRounds: "7", timerValue: "25" };
    default:
      return form;
  }
}

/** Quiz konusu seçimini değiştirir; son kalan konu kaldırılamaz. */
export function toggleQuizTopic(topics: string[], id: string): string[] {
  if (!topics.includes(id)) return [...topics, id];
  return topics.length > 1 ? topics.filter((topic) => topic !== id) : topics;
}

/** "Başlat"a basılınca odaya yazılan ayarlar. */
export function buildRoomSettings(game: GameType, form: GameSettingsForm): Partial<Room> {
  const settings: Partial<Room> = {
    game_mode: form.gameMode,
    total_rounds: parseInt(form.totalRounds, 10),
    timer_setting: parseInt(form.timerValue, 10),
  };

  switch (game) {
    case "scattegories": {
      const parsed = form.categories.split(",").map((c) => c.trim()).filter(Boolean);
      settings.categories = parsed.length > 0 ? parsed : [...FALLBACK_CATEGORIES];
      break;
    }
    case "quiz":
      settings.total_rounds = parseInt(form.quizQuestionsCount, 10);
      settings.timer_setting = parseInt(form.quizTimePerQuestion, 10);
      // Seçim önceden yalnızca ekranda işaretli görünüyordu; hiçbir yere
      // geçmiyordu. Artık odaya yazılıyor ve soru seçimi bunu uyguluyor.
      settings.quiz_topics = form.quizTopics;
      break;
    case "bomb":
      settings.timer_setting = parseInt(form.bombFuseTime, 10);
      settings.bomb_speed_multiplier = form.bombSpeedMultiplier;
      break;
    case "sensor":
      settings.timer_setting = parseInt(form.sensorUnblurDuration, 10);
      break;
    case "bar":
      settings.timer_setting = parseInt(form.barTime, 10);
      break;
  }
  return settings;
}
