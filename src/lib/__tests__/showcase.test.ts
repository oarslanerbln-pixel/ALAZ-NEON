import { describe, expect, it } from "vitest";

import { BRAND_SLIDES, buildShowcaseSlides, nextShowcaseIndex } from "../showcase";

describe("buildShowcaseSlides", () => {
  it("önce marka videosu, sonra görseller, en sonda mekan görselleri", () => {
    const slides = buildShowcaseSlides(["https://mekan.example/a.jpg"], false);
    expect(slides[0].kind).toBe("video");
    expect(slides).toHaveLength(BRAND_SLIDES.length + 1);
    expect(slides.at(-1)).toEqual({ kind: "image", src: "https://mekan.example/a.jpg", contain: true });
  });

  it("hareketi azaltmada videonun yerine durağan poster gelir", () => {
    const slides = buildShowcaseSlides([], true);
    expect(slides.some((s) => s.kind === "video")).toBe(false);
    expect(slides[0]).toEqual({ kind: "image", src: "/media/tanitim/video-poster.webp" });
  });

  it("boş ve yinelenen mekan adreslerini atar", () => {
    const slides = buildShowcaseSlides([" ", "x.jpg", "x.jpg ", ""], false);
    expect(slides).toHaveLength(BRAND_SLIDES.length + 1);
  });
});

describe("nextShowcaseIndex", () => {
  it("sondan başa döner, boş listede 0", () => {
    expect(nextShowcaseIndex(0, 3)).toBe(1);
    expect(nextShowcaseIndex(2, 3)).toBe(0);
    expect(nextShowcaseIndex(5, 0)).toBe(0);
  });
});
