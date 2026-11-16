import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";

import { PlayerIntroVideo } from "../PlayerIntroVideo";
import { setLocale, t } from "../../../../lib/i18n";

describe("PlayerIntroVideo", () => {
  it("oynanan oyunun ipucunu gösterir, Arena'nınkini değil", () => {
    setLocale("de");
    render(<PlayerIntroVideo gameTitle="HENGAME QUIZ" tip={t("intro.quizTip")} />);
    expect(screen.getByText(t("intro.quizTip"))).toBeInTheDocument();
    expect(screen.queryByText(t("intro.arenaTip"))).not.toBeInTheDocument();
  });

  it("ses düğmesinin adı arayüz dilinde", () => {
    setLocale("de");
    render(<PlayerIntroVideo gameTitle="HENGAME BOMB" tip="x" />);
    expect(screen.getByRole("button", { name: "Ton einschalten" })).toBeInTheDocument();
  });
});
