import { RACE_TEAM_IDS, type RaceTeamId } from "../../lib/race";

/**
 * NOVA'nın önceden render edilmiş varlıkları (Blender; kaynak:
 * `scripts/blender/nova_assets.py`, çıktı `public/race/`, toplam ~26 KB).
 * Nötr fildişi: vurgu rengi mekâna göre değiştiği için arayüzde verilir.
 */
export function dieAsset(face: number): string {
  return `/race/die-${face}.webp`;
}

export function pawnAsset(team: RaceTeamId): string {
  return `/race/pawn-${team}.webp`;
}

/** Zar yuvarlanırken ara yüzler titremesin diye görseller önceden istenir. */
export function preloadRaceAssets(): void {
  for (const url of [...[1, 2, 3, 4, 5, 6].map(dieAsset), ...RACE_TEAM_IDS.map(pawnAsset)]) {
    new Image().src = url;
  }
}
