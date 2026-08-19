import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { KineticSpark } from "../KineticSpark";

describe("KineticSpark Component", () => {
  it("renders without crashing", () => {
    render(<KineticSpark />);
    // Since it's a visual component, we check for core text content.
    // The brand mark text was renamed from "ALAZ" to "KAMUS" as part of the
    // quiz rebrand; this test was left asserting the old copy and always failed.
    expect(screen.getAllByText("KAMUS")[0]).toBeInTheDocument();
  });

  it("renders custom tagline when showTagline is true", () => {
    const customTagline = "Test Tagline";
    render(<KineticSpark showTagline tagline={customTagline} />);
    expect(screen.getByText(customTagline)).toBeInTheDocument();
  });
});
