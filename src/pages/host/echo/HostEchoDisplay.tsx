import { useEffect, useMemo } from "react";

import type { Room, Player } from "../../../types/database";
import { echoVotesFromInputs } from "../../../lib/roomInputs";
import { useRoomInputs } from "../../../hooks/useRoomInputs";
import { HostEchoIntro } from "./HostEchoIntro";
import { HostEchoActive } from "./HostEchoActive";
import { HostEchoReveal } from "./HostEchoReveal";

interface Props {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], updates?: Partial<Room>) => Promise<void>;
}

/**
 * Soru metni değil ÇEVİRİ ANAHTARI saklanıyor.
 *
 * Oda dokümanına düz metin yazılsaydı dil, soruyu seçen host'un diline
 * sabitlenirdi; oysa oyuncular kendi telefonlarında kendi dillerini
 * seçebiliyor (bkz. PlayerJoin). Anahtar saklandığında herkes soruyu kendi
 * dilinde görüyor. Eski odalarda düz metin durabilir — okuyan taraf
 * (echoQuestionText) iki biçimi de karşılıyor.
 */
const PREMIUM_QUESTION_KEYS = [
  "echo.q1", "echo.q2", "echo.q3", "echo.q4", "echo.q5", "echo.q6",
] as const;

export function HostEchoDisplay({ room, players, updateRoomStatus }: Props) {
  // Oylar oyuncuların kendi giriş kayıtlarından geliyor; sonucu reveal
  // anında odaya host yazıyor (bkz. lib/roomInputs.ts).
  const inputs = useRoomInputs(room.id);
  const votes = useMemo(
    () => echoVotesFromInputs(inputs, room.input_round),
    [inputs, room.input_round],
  );

  // If we are in lobby and starting the game
  useEffect(() => {
    if (room.status === "lobby" || room.status === "echo_intro") {
      if (!room.echo_question) {
        const randomQ =
          PREMIUM_QUESTION_KEYS[Math.floor(Math.random() * PREMIUM_QUESTION_KEYS.length)];
        updateRoomStatus("echo_intro", { echo_question: randomQ, echo_votes: {} });
      } else if (room.status !== "echo_intro") {
        updateRoomStatus("echo_intro");
      }
    }
  }, [room.status, room.echo_question, updateRoomStatus]);

  if (room.status === "echo_intro") {
    return (
      <HostEchoIntro
        room={room}
        onNext={() =>
          updateRoomStatus("echo_active", {
            round_end_time: Date.now() + 20000,
            // Yeni giriş turu: oyuncu yalnızca bu tur için, bir kez oy yazabilir.
            input_round: Date.now(),
            echo_votes: {},
          })
        }
      />
    );
  }

  if (room.status === "echo_active") {
    return (
      <HostEchoActive
        room={room}
        players={players}
        votes={votes}
        onNext={() => updateRoomStatus("echo_reveal", { echo_votes: votes })}
      />
    );
  }

  if (room.status === "echo_reveal") {
    return <HostEchoReveal room={room} players={players} onFinish={() => updateRoomStatus("lobby", { active_game: "none" })} />;
  }

  // Fallback loading
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-alaz-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
