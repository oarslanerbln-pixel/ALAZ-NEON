declare const __LOCAL_IP__: string | undefined;

/**
 * TV / Host ekranlarında gösterilen QR kodları ve bağlantı linkleri için
 * misafir katılım URL'sini üretir.
 *
 * Kafe testinde host laptop'ta çalıştırıldığında (localhost:5173 veya 127.0.0.1),
 * misafirin telefonunun localhost yerine kafe Wi-Fi'sindeki yerel IP'ye
 * (__LOCAL_IP__) bağlanması şarttır.
 */
export function getJoinUrl(roomCode?: string | null): string {
  if (typeof window === "undefined") {
    return roomCode ? `/join?code=${encodeURIComponent(roomCode)}` : "/join";
  }

  const { protocol, hostname, port, host } = window.location;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  let targetHost = host;
  if (
    isLocalhost &&
    typeof __LOCAL_IP__ !== "undefined" &&
    __LOCAL_IP__ &&
    __LOCAL_IP__ !== "localhost"
  ) {
    targetHost = `${__LOCAL_IP__}${port ? `:${port}` : ""}`;
  }

  const codeParam = roomCode ? `?code=${encodeURIComponent(roomCode)}` : "";
  return `${protocol}//${targetHost}/join${codeParam}`;
}
