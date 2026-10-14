import { describe, it, expect } from "vitest";
import { playerCountUpdate } from "../playerCount";

describe("playerCountUpdate", () => {
  it("oyuncu listesi yüklenmeden yazmaz — boş başlangıç '0 oyuncu' yazdırmasın", () => {
    expect(playerCountUpdate(5, 0, false)).toBeNull();
    expect(playerCountUpdate(undefined, 0, false)).toBeNull();
  });

  it("sayı değişmediyse yazmaz (heartbeat anlık görüntüleri yazma üretmesin)", () => {
    expect(playerCountUpdate(12, 12, true)).toBeNull();
  });

  it("katılım ve ayrılmada yeni sayıyı verir", () => {
    expect(playerCountUpdate(12, 13, true)).toBe(13);
    expect(playerCountUpdate(12, 11, true)).toBe(11);
  });

  it("alanı olmayan eski odada ilk yüklemede sayıyı yazar", () => {
    expect(playerCountUpdate(undefined, 7, true)).toBe(7);
    expect(playerCountUpdate(undefined, 0, true)).toBe(0);
  });
});
