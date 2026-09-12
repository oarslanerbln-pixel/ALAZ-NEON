import { describe, it, expect } from "vitest";

import { activePlayers, isHostOnline, isPlayerActive } from "../liveness";

const NOW = 1_700_000_000_000;
const player = (last_active?: number) => ({ last_active });

describe("isPlayerActive", () => {
  it("az önce sinyal göndermiş oyuncu aktif", () => {
    expect(isPlayerActive(player(NOW - 5_000), NOW)).toBe(true);
  });

  it("30 saniyedir sessiz oyuncu aktif değil", () => {
    expect(isPlayerActive(player(NOW - 31_000), NOW)).toBe(false);
  });

  it("sinyali hiç olmayan oyuncu AKTİF sayılıyor", () => {
    // Alan eklenmeden önce katılmış ya da eski sürüm çalıştıran bir telefon
    // sırf sinyal göndermiyor diye oyun dışı bırakılmamalı: gerçek misafiri
    // elemek, hayalet oyuncuya sıra vermekten kötü.
    expect(isPlayerActive(player(undefined), NOW)).toBe(true);
  });
});

describe("activePlayers", () => {
  it("sessizleri eliyor", () => {
    const live = player(NOW - 1_000);
    const ghost = player(NOW - 60_000);
    expect(activePlayers([live, ghost], NOW)).toEqual([live]);
  });

  it("herkes sessizse listeyi olduğu gibi veriyor — oyun kilitlenmesin", () => {
    const a = player(NOW - 60_000);
    const b = player(NOW - 90_000);
    expect(activePlayers([a, b], NOW)).toHaveLength(2);
  });

  it("boş listede boş dönüyor", () => {
    expect(activePlayers([], NOW)).toEqual([]);
  });
});

describe("isHostOnline", () => {
  it("yeni sinyal varsa çevrimiçi", () => {
    expect(isHostOnline({ host_last_active: NOW - 10_000 }, NOW)).toBe(true);
  });

  it("45 saniyedir sinyal yoksa çevrimdışı", () => {
    expect(isHostOnline({ host_last_active: NOW - 46_000 }, NOW)).toBe(false);
  });

  it("alan hiç yoksa ÇEVRİMİÇİ sayılıyor — eski odalar yanlış uyarı almasın", () => {
    expect(isHostOnline({ host_last_active: undefined }, NOW)).toBe(true);
  });
});
