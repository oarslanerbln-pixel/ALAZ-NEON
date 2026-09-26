import { describe, it, expect } from "vitest";

import { resolveActiveGame, resolvePlayerGameRoute, resolveRoutedGame } from "../gameRouting";

describe("resolveActiveGame", () => {
  it("active_game yazılmışsa onu döner", () => {
    expect(resolveActiveGame({ active_game: "quiz" })).toBe("quiz");
    expect(resolveActiveGame({ active_game: "scattegories" })).toBe("scattegories");
  });

  it("\"none\" oyun seçilmedi demek", () => {
    expect(resolveActiveGame({ active_game: "none" })).toBeNull();
  });

  it("eski game_type, active_game \"none\" iken lobiye dönüşü ezemez", () => {
    expect(resolveActiveGame({ active_game: "none", game_type: "quiz" })).toBeNull();
  });

  it("active_game öncelikli, game_type ile çelişse bile", () => {
    expect(resolveActiveGame({ active_game: "bomb", game_type: "quiz" })).toBe("bomb");
  });

  it("active_game hiç yazılmamış eski odada game_type'a düşer", () => {
    expect(resolveActiveGame({ game_type: "sensor" })).toBe("sensor");
    expect(resolveActiveGame({})).toBeNull();
  });
});

describe("resolveRoutedGame", () => {
  it("Arena klasik akışta kalır, kendi ekran çiftine yönlenmez", () => {
    expect(resolveRoutedGame({ active_game: "scattegories" })).toBeNull();
  });

  it("ekran çifti olan modu döner", () => {
    expect(resolveRoutedGame({ active_game: "kablo" })).toBe("kablo");
  });
});

describe("resolvePlayerGameRoute", () => {
  it("eğitim ve reklam arasında ortak ekran gösterilir", () => {
    expect(resolvePlayerGameRoute({ active_game: "quiz", status: "tutorial" })).toBeNull();
    expect(resolvePlayerGameRoute({ active_game: "quiz", status: "ad_break" })).toBeNull();
  });

  it("oyun durumlarında kumandaya yönlenir", () => {
    expect(resolvePlayerGameRoute({ active_game: "quiz", status: "question_active" })).toBe("quiz");
  });
});
