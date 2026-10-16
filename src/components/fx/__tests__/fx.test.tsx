import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { ShimmerButton } from "../ShimmerButton";
import { CardSpotlight } from "../CardSpotlight";
import { KineticText } from "../KineticText";
import { NumberTicker } from "../NumberTicker";

describe("FX Components", () => {
  describe("ShimmerButton", () => {
    it("renders children correctly and triggers click handler", () => {
      const handleClick = vi.fn();
      const { getByRole, getByText } = render(
        <ShimmerButton onClick={handleClick} color="orange">
          BAŞLA
        </ShimmerButton>
      );

      const button = getByRole("button");
      expect(button).toBeInTheDocument();
      expect(getByText("BAŞLA")).toBeInTheDocument();

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("triggers navigator.vibrate when haptic is enabled", () => {
      const vibrateMock = vi.fn();
      vi.stubGlobal("navigator", { vibrate: vibrateMock });

      const { getByRole } = render(
        <ShimmerButton haptic={true}>
          DOKUN
        </ShimmerButton>
      );

      fireEvent.click(getByRole("button"));
      expect(vibrateMock).toHaveBeenCalledWith(12);

      vi.unstubAllGlobals();
    });

    it("does not trigger click or vibrate when disabled", () => {
      const handleClick = vi.fn();
      const vibrateMock = vi.fn();
      vi.stubGlobal("navigator", { vibrate: vibrateMock });

      const { getByRole } = render(
        <ShimmerButton disabled onClick={handleClick} haptic={true}>
          ENGELİ
        </ShimmerButton>
      );

      const button = getByRole("button");
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
      expect(vibrateMock).not.toHaveBeenCalled();

      vi.unstubAllGlobals();
    });
  });

  describe("CardSpotlight", () => {
    it("renders inner content properly", () => {
      const { getByText } = render(
        <CardSpotlight color="cyan" ambient={true}>
          <span>Kart İçi Metin</span>
        </CardSpotlight>
      );

      expect(getByText("Kart İçi Metin")).toBeInTheDocument();
    });

    it("handles mouse enter and mouse move without crashing", () => {
      const { container } = render(
        <CardSpotlight color="purple">
          <div>İçerik</div>
        </CardSpotlight>
      );

      const card = container.firstChild as HTMLElement;
      fireEvent.mouseEnter(card);
      fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });
      fireEvent.mouseLeave(card);

      expect(card).toBeInTheDocument();
    });
  });

  describe("KineticText", () => {
    it("renders full accessible text via aria-label", () => {
      const text = "ALAZ NEON PARTİ";
      const { getByLabelText } = render(
        <KineticText text={text} mode="words" as="h1" />
      );

      const heading = getByLabelText(text);
      expect(heading).toBeInTheDocument();
    });

    it("splits text into individual words in words mode", () => {
      const { getByText } = render(
        <KineticText text="OYUN BAŞLIYOR" mode="words" />
      );

      expect(getByText("OYUN")).toBeInTheDocument();
      expect(getByText("BAŞLIYOR")).toBeInTheDocument();
    });
  });

  describe("NumberTicker", () => {
    it("renders number with prefix and suffix", () => {
      const { container } = render(
        <NumberTicker value={100} prefix="+" suffix=" Puan" />
      );

      expect(container.textContent).toContain("+");
      expect(container.textContent).toContain("Puan");
    });
  });
});
