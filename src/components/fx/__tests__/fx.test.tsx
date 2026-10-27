import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { NumberTicker } from "../NumberTicker";
import { GameAnimatedLogo } from "../GameAnimatedLogo";
import type { GameType } from "../../../types/database";

describe("FX Components", () => {
  describe("NumberTicker", () => {
    it("renders number with prefix and suffix", () => {
      const { container } = render(
        <NumberTicker value={100} prefix="+" suffix=" Puan" />
      );

      expect(container.textContent).toContain("+");
      expect(container.textContent).toContain("Puan");
    });
  });

  describe("GameAnimatedLogo", () => {
    const ALL_GAMES: GameType[] = ["scattegories", "quiz", "bomb"];

    it.each(ALL_GAMES)("renders SVG emblem correctly for game '%s'", (game) => {
      const { container } = render(
        <GameAnimatedLogo game={game} size="md" glow={true} />
      );
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("renders watermark mode without crashing", () => {
      const { container } = render(
        <GameAnimatedLogo game="quiz" size="watermark" glow={false} />
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });
  });
});
