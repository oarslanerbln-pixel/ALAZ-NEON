import { describe, it, expect } from "vitest";

import { echoQuestionText } from "../echoQuestions";
import { setLocale } from "../i18n";

describe("echoQuestionText", () => {
  it("anahtarı seçili dile çeviriyor", () => {
    setLocale("de");
    expect(echoQuestionText("echo.q1")).toBe("Wer wird bei einer Zombie-Apokalypse zuerst gefressen?");
    setLocale("en");
    expect(echoQuestionText("echo.q1")).toBe("Who gets eaten first in a zombie apocalypse?");
  });

  it("eski odalardaki düz metni olduğu gibi bırakıyor", () => {
    // Bu değişiklikten önce açılmış odalar soruyu metin olarak saklıyor;
    // çeviri denemesi onları "echo.q..." gibi ham anahtara çevirirdi.
    setLocale("de");
    const legacy = "Bir zombi istilasında ilk kim yem olur?";
    expect(echoQuestionText(legacy)).toBe(legacy);
  });

  it("boş değerde boş string", () => {
    expect(echoQuestionText(null)).toBe("");
    expect(echoQuestionText(undefined)).toBe("");
  });
});
