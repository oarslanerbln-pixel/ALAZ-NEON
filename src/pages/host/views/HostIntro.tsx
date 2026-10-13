import type { Player } from "../../../types/database";
import { useLocale } from "../../../hooks/useLocale";
import { GameIntroCinematic } from "../components/GameIntroCinematic";

interface HostIntroProps {
  players: Player[];
  onComplete: () => void;
}

/** Klasik oyunun (HENGAME ARENA) TV açılışı. */
export function HostIntro({ players, onComplete }: HostIntroProps) {
  const { t } = useLocale();
  return (
    <GameIntroCinematic
      eyebrow="HENGAME"
      title={t("intro.arena.titleShort")}
      subtitle={t("intro.arena.subtitle")}
      roster={players.map((p) => p.nickname)}
      steps={[
        { icon: "🔤", text: t("intro.arena.step1") },
        { icon: "✍️", text: t("intro.arena.step2") },
        { icon: "🎯", text: t("intro.arena.step3") },
      ]}
      rgb={["255,85,0", "251,191,36"]}
      onComplete={onComplete}
    />
  );
}
