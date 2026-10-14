import { useEffect, Suspense } from "react";
import { useSearchParams } from "react-router-dom";

// Hooks
import { useHostRoom } from "../../hooks/useHostRoom";
import { useFollowRoomVenue } from "../../hooks/useFollowRoomVenue";
import { useLifetimeScoreSync } from "../../hooks/useLifetimeScoreSync";
import { useWakeLock } from "../../hooks/useWakeLock";
import { useMonitoringTags } from "../../hooks/useMonitoringTags";

// Types

// Extracted Components
import { HostDashboard } from "./dashboard/HostDashboard";
import { HOST_GAME_DISPLAYS, preloadHostGameDisplays } from "./gameDisplays";
import { HostDisplayGame } from "./classic/HostDisplayGame";
import { isRetiredGame, resolveRoutedGame } from "../../lib/gameRouting";
import { RoomStatusScreen } from "../../components/RoomStatusScreen";
import { HostAdBreak } from "./views/HostAdBreak";
import { activePlayers as activePlayersOf } from "../../lib/liveness";

export function HostDisplay() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const hostRoom = useHostRoom(roomId);
  useLifetimeScoreSync(hostRoom.players);
  const { room, loading, notFound, error } = hostRoom;
  // Marka, ödül ve sponsor reklamları odanın mekanından (3.1).
  useFollowRoomVenue(room);
  // TV/tablet gece boyunca kararmasın: ekran koruyucu QR'ı ve skorları kapatıyordu.
  useWakeLock(!!room && room.status !== "closed");
  useMonitoringTags({ role: "host", room_id: roomId, game: room?.active_game, status: room?.status });

  // Oyun ekranlarını TV boştayken önceden indir (bkz. preloadHostGameDisplays).
  // Erken dönüşlerden ÖNCE: hook sırası her render'da aynı kalmalı.
  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(preloadHostGameDisplays, { timeout: 10_000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(preloadHostGameDisplays, 3_000);
    return () => clearTimeout(timer);
  }, []);

  // Oda durum kapıları. HostDisplay'in kendi hook sayısı sabit olduğu için
  // buradaki erken dönüşler hook sırasını bozmuyor. Eskiden burada çıplak bir
  // siyah div dönülüyordu ve hatalı/silinmiş oda sonsuz siyah ekran demekti.
  if (error) return <RoomStatusScreen kind="error" roomId={roomId} detail={error.message} />;
  if (loading) return <RoomStatusScreen kind="loading" roomId={roomId} />;
  if (notFound || room === null) return <RoomStatusScreen kind="notfound" roomId={roomId} />;

  // Kendi ekran çifti olan modlar. Bu dönüş, aşağıdaki klasik oyun
  // hook'ları tanımlanmadan önce yapılmalı ki hook sırası sabit kalsın.
  const routedGame = resolveRoutedGame(room);
  if (routedGame) {
    const GameDisplay = HOST_GAME_DISPLAYS[routedGame];
    return (
      <Suspense fallback={<RoomStatusScreen kind="loading" roomId={roomId} />}>
        <GameDisplay
          room={room}
          players={hostRoom.players}
          updateRoomStatus={hostRoom.updateRoomStatus}
          updatePlayerScore={hostRoom.updatePlayerScore}
        />
      </Suspense>
    );
  }

  // Oyunlar arası sponsor reklam arası (panodan başlatılır, docs/roadmap.md
  // 3.3). Klasik oyun kendi turları arasındaki reklam arasını kendisi çiziyor.
  if (room.status === "ad_break" && room.active_game === "none") {
    return (
      <HostAdBreak
        room={room}
        audience={activePlayersOf(hostRoom.players).length}
        onComplete={() => hostRoom.updateRoomStatus(room.ad_break_next_state || "night_lobby")}
      />
    );
  }

  if (room.status === "night_lobby" || room.active_game === "none" || isRetiredGame(room.active_game)) {
    return (
      <HostDashboard
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
      />
    );
  }

  return <HostDisplayGame roomId={roomId} {...hostRoom} />;
}
