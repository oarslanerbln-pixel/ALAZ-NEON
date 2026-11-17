import type { RaceTeamId } from "../../lib/race";

/**
 * Takım biçimi. Görsel dil tek vurgu rengine izin verdiği için takımlar
 * renkle değil biçimle ayrılır: Ateş ▲, Toprak ■, Hava ●, Su ◆.
 * Yarıçapı `r` olan, (0,0) merkezli SVG parçası.
 */
export function RaceShape({
  team,
  r,
  className,
  strokeWidth,
}: {
  team: RaceTeamId;
  r: number;
  className?: string;
  strokeWidth?: number;
}) {
  switch (team) {
    case "fire":
      return <polygon className={className} strokeWidth={strokeWidth} points={`0,${-r} ${r * 0.95},${r * 0.78} ${-r * 0.95},${r * 0.78}`} strokeLinejoin="round" />;
    case "earth":
      return <rect className={className} strokeWidth={strokeWidth} x={-r * 0.82} y={-r * 0.82} width={r * 1.64} height={r * 1.64} rx={r * 0.18} />;
    case "air":
      return <circle className={className} strokeWidth={strokeWidth} r={r * 0.92} />;
    case "water":
      return <polygon className={className} strokeWidth={strokeWidth} points={`0,${-r} ${r * 0.86},0 0,${r} ${-r * 0.86},0`} strokeLinejoin="round" />;
  }
}

/** Metin akışında kullanılan bağımsız simge. */
export function RaceGlyph({ team, size = 32, active = false }: { team: RaceTeamId; size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" aria-hidden="true" className="shrink-0">
      <RaceShape team={team} r={10} className={active ? "fill-accent" : "fill-ink"} />
    </svg>
  );
}
