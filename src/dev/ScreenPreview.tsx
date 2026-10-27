import { Suspense, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { poolFor } from "../lib/quizQuestions";
import { isScreenPreview } from "../lib/firebase";
import { getLocale } from "../lib/i18n";
import type { RoutedGame } from "../lib/gameRouting";
import type { Player, Room, RoomStatus } from "../types/database";
import { HostDashboard } from "../pages/host/dashboard/HostDashboard";
import { HostShowcase } from "../pages/host/dashboard/HostShowcase";
import { TVScaleFrame } from "../components/TVScaleFrame";
import { HOST_GAME_DISPLAYS } from "../pages/host/gameDisplays";
import { PLAYER_GAME_CONTROLLERS } from "../pages/player/gameControllers";
import { PlayerGameShell } from "../pages/player/components/PlayerGameShell";
import { LetterSpinner } from "../components/LetterSpinner";
import { HostPlaying } from "../pages/host/views/HostPlaying";
import { Slingshot3DArena } from "../components/slingshot/Slingshot3DArena";
import { SlingshotController } from "../components/slingshot/SlingshotController";

/**
 * Yalnızca geliştirmede açılan ekran önizlemesi: host ve oyuncu ekranlarını
 * sahte oda verisiyle, gerçek bir oda açmadan her durumda gösterir. Görsel
 * kontrol (taşma, kesilme, dokunma hedefleri) için:
 *
 *   /__screens?side=host&game=quiz&status=question_active&n=8
 *   /__screens?side=player&game=bomb&status=bomb_active&me=0
 *   /__screens?side=host&game=showcase&slide=1   (TV tanıtım döngüsü)
 *
 * `n` oyuncu sayısı, `me` telefonun hangi oyuncu olduğu, `left` kalan süre (sn). Firebase bu yolda
 * ulaşılamayan bir emülatöre bağlı (bkz. lib/firebase `isScreenPreview`),
 * yani yazımlar hiçbir yere gitmez.
 */

const NAMES = [
  "Ayşe",
  "Muhammed Emin Karadağlı",
  "Jo",
  "Schmetterling_2000",
  "Zeynep 🔥",
  "Kevin-Maximilian",
  "Ece",
  "Ali Rıza",
  "Leonie",
  "Bartu",
  "Mehmet Can",
  "Sophie-Charlotte",
];

function mockPlayers(n: number): Player[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i}`,
    room_id: "preview",
    nickname: NAMES[i % NAMES.length],
    team_name: null,
    total_score: Math.max(0, 1450 - i * 170 + (i % 3) * 40),
    night_score: 25 - i * 2,
    created_at: Date.now() - i * 60_000,
    lives: i % 4 === 3 ? 1 : 3,
  }));
}

function mockRoom(game: RoutedGame | "dashboard" | "showcase", status: RoomStatus, players: Player[], secondsLeft: number): Room {
  // Odaya yazılan soru gibi: doğru şık yok (bkz. PublicQuizQuestion).
  // Sorular arayüz diliyle aynı havuzdan: Almanca ekranda Türkçe soru çıkmasın.
  const questions = poolFor(getLocale())
    .slice(0, 5)
    .map((q) => ({ id: q.id, text: q.text, category: q.category, options: q.options, difficulty: q.difficulty, funFact: q.funFact }));
  return {
    id: "preview",
    code: "4821",
    status,
    created_at: Date.now(),
    host_last_active: Date.now(),
    active_game: game === "dashboard" || game === "showcase" ? "none" : game,
    categories: [],
    timer_setting: 20,
    total_rounds: 5,
    current_round: 2,
    round_end_time: Date.now() + secondsLeft * 1000,
    game_mode: "individual",
    locale: "tr",
    quiz_questions: questions,
    current_question_index: 1,
    quiz_reveal: status === "question_reveal" ? { index: 1, option: "B" } : null,
    bomb_target_player: players[0]?.id,
    used_words: ["elma", "armut"],
    bomb_speed_multiplier: 1.2,
    used_bomb_categories: [],
  };
}

const noop = async () => {};

export function ScreenPreview() {
  const [params] = useSearchParams();
  const side = params.get("side") === "player" ? "player" : "host";
  const game = (params.get("game") ?? "quiz") as RoutedGame | "dashboard" | "showcase";
  const status = (params.get("status") ?? "lobby") as RoomStatus;
  const n = Number(params.get("n") ?? 8);
  const me = Number(params.get("me") ?? 1);
  // Kalan süre (sn): sakin / amber / kırmızı süre tonlarını ayrı ayrı görmek için.
  const left = Number(params.get("left") ?? 14);

  const players = useMemo(() => mockPlayers(n), [n]);
  const room = useMemo(() => mockRoom(game, status, players, left), [game, status, players, left]);

  if (!isScreenPreview) return null;

  if (side === "host") {
    if (game === "showcase") {
      return (
        <TVScaleFrame>
          <HostShowcase joinUrl="https://alaz-neon-web.web.app/join?code=4821" roomCode="4821" onClose={() => {}} initialIndex={Number(params.get("slide") ?? 0)} />
        </TVScaleFrame>
      );
    }
    if (game === "dashboard") {
      return <HostDashboard room={room} players={players} updateRoomStatus={noop} />;
    }
    if ((game as string) === "arena" || (game as string) === "scattegories") {
      if (status === "countdown") {
        return (
          <TVScaleFrame>
            <div className="w-full h-full flex items-center justify-center bg-black">
              <LetterSpinner targetLetter={params.get("letter") ?? "A"} onComplete={noop} />
            </div>
          </TVScaleFrame>
        );
      }
      return (
        <TVScaleFrame>
          <HostPlaying
            currentLetter={params.get("letter") ?? "A"}
            timeLeft={left}
            maxTime={room.timer_setting}
            categories={["ŞEHİR", "HAYVAN", "MEYVE / SEBZE", "ÜNLÜ KİŞİ"]}
            submittedPlayerIds={players.slice(0, Math.min(3, players.length)).map((p) => p.id)}
            playersCount={players.length}
            currentRound={room.current_round}
          />
        </TVScaleFrame>
      );
    }
    if ((game as string) === "slingshot" || (game as string) === "penalti") {
      return (
        <TVScaleFrame>
          <Slingshot3DArena
            players={players.map((p, i) => ({
              id: p.id,
              nickname: p.nickname,
              color: ["#00f3ff", "#ff5500", "#f43f5e", "#10b981"][i % 4],
              score: Math.floor(p.total_score / 100),
            }))}
            shot={null}
          />
        </TVScaleFrame>
      );
    }
    const Display = HOST_GAME_DISPLAYS[game as RoutedGame];
    return (
      <Suspense fallback={null}>
        <Display room={room} players={players} updateRoomStatus={noop} updatePlayerScore={noop} />
      </Suspense>
    );
  }

  const player = players[me] ?? players[0];

  if ((game as string) === "slingshot" || (game as string) === "penalti") {
    return (
      <PlayerGameShell>
        <SlingshotController roundHint="PENALTI ŞUTU" />
      </PlayerGameShell>
    );
  }

  const Controller = PLAYER_GAME_CONTROLLERS[game as RoutedGame];
  return (
    <PlayerGameShell>
      <Suspense fallback={null}>
        <Controller room={room} player={player} />
      </Suspense>
    </PlayerGameShell>
  );
}
