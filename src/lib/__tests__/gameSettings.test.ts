import { describe, it, expect } from "vitest";
import {
  buildRoomSettings,
  FALLBACK_CATEGORIES,
  initialSettingsForm,
  QUIZ_TOPIC_IDS,
  toggleQuizTopic,
  withGameDefaults,
} from "../gameSettings";

const form = () => initialSettingsForm("Şehir, Ülke, İsim");

describe("withGameDefaults", () => {
  it("yalnızca seçilen oyunun alanlarını sıfırlar, diğer seçimler kalır", () => {
    const edited = { ...form(), gameMode: "team" as const, timerValue: "30", totalRounds: "7" };
    const quiz = withGameDefaults(edited, "quiz");
    expect(quiz).toMatchObject({ totalRounds: "5", quizTimePerQuestion: "20", quizQuestionsCount: "8" });
    expect(quiz.gameMode).toBe("team");
    expect(quiz.timerValue).toBe("30"); // quiz kendi süresini kullanıyor
  });

  it("her oyunun varsayılanları", () => {
    expect(withGameDefaults(form(), "scattegories")).toMatchObject({ timerValue: "60", totalRounds: "3" });
    expect(withGameDefaults(form(), "bomb")).toMatchObject({ bombFuseTime: "30", bombLives: "3", totalRounds: "3" });
    expect(withGameDefaults(form(), "sensor")).toMatchObject({ totalRounds: "5", sensorUnblurDuration: "25" });
    expect(withGameDefaults(form(), "bar")).toMatchObject({ barTime: "60" });
    expect(withGameDefaults(form(), "ayna")).toMatchObject({ totalRounds: "7", timerValue: "25" });
    const base = form();
    expect(withGameDefaults(base, "echo")).toBe(base);
  });
});

describe("toggleQuizTopic", () => {
  it("ekler, çıkarır ama son konuyu bırakmaz", () => {
    expect(toggleQuizTopic(["gece"], "muzik")).toEqual(["gece", "muzik"]);
    expect(toggleQuizTopic(["gece", "muzik"], "gece")).toEqual(["muzik"]);
    expect(toggleQuizTopic(["gece"], "gece")).toEqual(["gece"]);
  });
});

describe("buildRoomSettings", () => {
  it("klasik oyun: kategoriler ayrıştırılır, süre ve tur sayısı", () => {
    expect(buildRoomSettings("scattegories", { ...form(), categories: " Şehir ,, Ülke ", timerValue: "45", totalRounds: "5" })).toEqual({
      game_mode: "individual",
      total_rounds: 5,
      timer_setting: 45,
      categories: ["Şehir", "Ülke"],
    });
  });

  it("klasik oyun: boş kategori listesinde yedek kategoriler", () => {
    expect(buildRoomSettings("scattegories", { ...form(), categories: " , " }).categories).toEqual(FALLBACK_CATEGORIES);
  });

  it("quiz: soru sayısı tur sayısına, soru süresi zamanlayıcıya, konular odaya", () => {
    const settings = buildRoomSettings("quiz", {
      ...form(),
      gameMode: "team",
      quizQuestionsCount: "12",
      quizTimePerQuestion: "15",
      quizTopics: ["gece", "zeka"],
    });
    expect(settings).toEqual({ game_mode: "team", total_rounds: 12, timer_setting: 15, quiz_topics: ["gece", "zeka"] });
  });

  it("bomba, sensör ve bar kendi süre alanlarını kullanır", () => {
    expect(buildRoomSettings("bomb", { ...form(), bombFuseTime: "45" })).toMatchObject({
      timer_setting: 45,
      bomb_speed_multiplier: 1,
    });
    expect(buildRoomSettings("sensor", { ...form(), sensorUnblurDuration: "35" }).timer_setting).toBe(35);
    expect(buildRoomSettings("bar", { ...form(), barTime: "90" }).timer_setting).toBe(90);
  });

  it("diğer oyunlar yalnızca ortak alanları yazar", () => {
    expect(buildRoomSettings("echo", form())).toEqual({ game_mode: "individual", total_rounds: 3, timer_setting: 60 });
  });

  it("başlangıçta tüm quiz konuları seçili", () => {
    expect(form().quizTopics).toEqual([...QUIZ_TOPIC_IDS]);
  });
});
