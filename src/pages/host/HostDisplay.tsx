import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";

// Hooks
import { useHostRoom } from "../../hooks/useHostRoom";

// Components
import { RoomStatusScreen } from "../../components/RoomStatusScreen";

/**
 * Her oyun modu kendi JS parçasında (lazy-loaded). Öncesinde altıncı bir
 * mod eklendikçe hepsinin kodu (Quiz/Bomba/Sensör/Çark/Overload/Klasik +
 * bunların tüm alt bileşenleri) statik import'lar yüzünden TEK bir pakette
 * birleşiyordu — bu paket ~765KB'a (gzip ~219KB) çıkmıştı. Bir host sadece
 * Quiz oynatacak olsa bile diğer 5 modun tüm kodunu da indirmek zorunda
 * kalıyordu; kafe/bar WiFi'sinde bu gerçek bir yükleme gecikmesi demek.
 * Artık her mod ayrı bir chunk — host TV'si yalnızca o an oynanan modun
 * kodunu indiriyor.
 */
const HostQuizDisplay = lazy(() =>
  import("./quiz/HostQuizDisplay").then((m) => ({ default: m.HostQuizDisplay }))
);
const HostBombDisplay = lazy(() =>
  import("./bomb/HostBombDisplay").then((m) => ({ default: m.HostBombDisplay }))
);
const HostSensorDisplay = lazy(() =>
  import("./sensor/HostSensorDisplay").then((m) => ({ default: m.HostSensorDisplay }))
);
const HostWheelDisplay = lazy(() =>
  import("./wheel/HostWheelDisplay").then((m) => ({ default: m.HostWheelDisplay }))
);
const HostOverloadDisplay = lazy(() =>
  import("./overload/HostOverloadDisplay").then((m) => ({ default: m.HostOverloadDisplay }))
);
const HostDashboard = lazy(() =>
  import("./dashboard/HostDashboard").then((m) => ({ default: m.HostDashboard }))
);
const HostDisplayClassic = lazy(() =>
  import("./HostDisplayClassic").then((m) => ({ default: m.HostDisplayClassic }))
);

export function HostDisplay() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const hostRoom = useHostRoom(roomId);
  const { room, loading, notFound, error } = hostRoom;

  // Oda durum kapıları. HostDisplay'in kendi hook sayısı sabit olduğu için
  // buradaki erken dönüşler hook sırasını bozmuyor. Eskiden burada çıplak bir
  // siyah div dönülüyordu ve hatalı/silinmiş oda sonsuz siyah ekran demekti.
  if (error) return <RoomStatusScreen kind="error" roomId={roomId} detail={error.message} />;
  if (loading) return <RoomStatusScreen kind="loading" roomId={roomId} />;
  if (notFound || room === null) return <RoomStatusScreen kind="notfound" roomId={roomId} />;

  let content;
  if (room.active_game === "quiz" || room.game_type === "quiz") {
    content = (
      <HostQuizDisplay
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
        updatePlayerScore={hostRoom.updatePlayerScore}
      />
    );
  } else if (room.active_game === "bomb" || room.game_type === "bomb") {
    content = (
      <HostBombDisplay
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
        updatePlayerScore={hostRoom.updatePlayerScore}
      />
    );
  } else if (room.active_game === "sensor" || room.game_type === "sensor") {
    content = (
      <HostSensorDisplay
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
        updatePlayerScore={hostRoom.updatePlayerScore}
      />
    );
  } else if (room.active_game === "wheel" || room.game_type === "wheel") {
    content = (
      <HostWheelDisplay
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
      />
    );
  } else if (room.active_game === "overload") {
    content = (
      <HostOverloadDisplay
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
      />
    );
  } else if (room.status === "night_lobby" || room.active_game === "none") {
    content = (
      <HostDashboard
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
      />
    );
  } else {
    content = <HostDisplayClassic roomId={roomId} {...hostRoom} />;
  }

  return (
    <Suspense fallback={<RoomStatusScreen kind="loading" roomId={roomId} />}>
      {content}
    </Suspense>
  );
}
