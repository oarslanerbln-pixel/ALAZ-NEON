import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { KineticSpark } from "../KineticSpark";
import { titleFontSize } from "../../lib/titleFontSize";

describe("KineticSpark Component", () => {
  it("renders without crashing", () => {
    render(<KineticSpark />);
    // Since it's a visual component, we check for core text content.
    // The brand mark text was renamed from "ALAZ" to "HENGAME" as part of the
    // quiz rebrand; this test was left asserting the old copy and always failed.
    expect(screen.getAllByText("HENGAME")[0]).toBeInTheDocument();
  });

  it("renders custom tagline when showTagline is true", () => {
    const customTagline = "Test Tagline";
    render(<KineticSpark showTagline tagline={customTagline} />);
    expect(screen.getByText(customTagline)).toBeInTheDocument();
  });

});

/**
 * Mekan markalaşması geldikten sonra bu başlık artık mekanın adını basıyor.
 * Boyut yalnızca ekran genişliğine bağlıyken uzun adlar taşıyordu: tarayıcıda
 * ölçüldü, "HÜRREM SULTAN" 1920px'lik bir TV'de 2340px yer kaplayıp iki
 * yanından ~420px kırpılıyordu.
 *
 * Render edilen stil üzerinden değil SAF FONKSİYON üzerinden test ediliyor:
 * jsdom, `clamp(..., min(...), ...)` gibi iç içe modern CSS fonksiyonlarını
 * ayrıştıramayıp değeri tamamen düşürüyor (gerçek tarayıcılarda sorun yok).
 */
describe("titleFontSize — mekan adı uzunluğuna göre ölçek", () => {
  it("uzun mekan adında 17vw tavanının altına iner (taşmayı önler)", () => {
    // 135 / 13 karakter ≈ 10.38vw
    expect(titleFontSize("HÜRREM SULTAN")).toContain("10.38vw");
  });

  it("kısa adlarda 17vw tavanı korunur (eski davranış değişmedi)", () => {
    // 135 / 7 ≈ 19.29vw > 17vw → min() 17vw'yi seçer, yani boyut eskisiyle aynı
    const size = titleFontSize("HENGAME");
    expect(size).toContain("17vw");
    expect(size).toContain("19.29vw");
  });

  it("boş metinde sıfıra bölmez", () => {
    expect(() => titleFontSize("")).not.toThrow();
    expect(titleFontSize("")).toContain("135.00vw");
  });
});
