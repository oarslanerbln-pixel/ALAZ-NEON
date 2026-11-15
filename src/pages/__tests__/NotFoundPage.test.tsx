import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";

import { NotFoundPage } from "../NotFoundPage";
import { setLocale, type Locale } from "../../lib/i18n";

function renderIn(locale: Locale) {
  setLocale(locale);
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>,
  );
}

describe("NotFoundPage", () => {
  it("Almanca arayüzde Almanca konuşur", () => {
    renderIn("de");
    expect(screen.getByRole("heading", { name: "Seite nicht gefunden" })).toBeInTheDocument();
    expect(screen.queryByText(/sinyal/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /startseite/i })).toHaveAttribute("href", "/");
  });

  it("Türkçe arayüzde sade bir dille söyler", () => {
    renderIn("tr");
    expect(screen.getByRole("heading", { name: "Sayfa bulunamadı" })).toBeInTheDocument();
    expect(screen.queryByText(/frekans|sektör/i)).not.toBeInTheDocument();
  });
});
