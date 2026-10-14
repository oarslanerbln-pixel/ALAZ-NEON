import { useLocale } from "../../../../hooks/useLocale";
import { GameIntroCinematic } from "../../components/GameIntroCinematic";

interface HostQuizIntroProps {
  onComplete: () => void;
}

export function HostQuizIntro({ onComplete }: HostQuizIntroProps) {
  const { t } = useLocale();
  return (
    <GameIntroCinematic
      eyebrow="HENGAME"
      title={t("intro.quiz.titleShort")}
      subtitle={t("intro.quiz.subtitle")}
      steps={[
        { icon: "📺", text: t("intro.quiz.step1") },
        { icon: "⚡", text: t("intro.quiz.step2") },
        { icon: "🏆", text: t("intro.quiz.step3") },
      ]}
      rgb={["56,189,248", "255,85,0"]}
      onComplete={onComplete}
    />
  );
}
