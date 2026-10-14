import { describe, it, expect } from "vitest";
import { appCheckSetup } from "../appCheckSetup";

describe("appCheckSetup", () => {
  it("site anahtarı yoksa App Check kapalı kalır (bugünkü davranış)", () => {
    expect(appCheckSetup({ dev: false })).toBeNull();
    expect(appCheckSetup({ siteKey: "   ", dev: true })).toBeNull();
  });

  it("üretimde yalnızca reCAPTCHA kullanılır, hata ayıklama sağlayıcısı kapalı", () => {
    expect(appCheckSetup({ siteKey: "site-key", dev: false })).toEqual({
      siteKey: "site-key",
      debugToken: null,
    });
  });

  it("geliştirmede SDK konsola kaydedilecek bir hata ayıklama jetonu üretir", () => {
    expect(appCheckSetup({ siteKey: "site-key", dev: true })).toEqual({
      siteKey: "site-key",
      debugToken: true,
    });
  });

  it("kayıtlı sabit jeton verildiyse (CI/test) onu kullanır", () => {
    expect(appCheckSetup({ siteKey: "site-key", debugToken: " ci-token ", dev: false })).toEqual({
      siteKey: "site-key",
      debugToken: "ci-token",
    });
  });
});
