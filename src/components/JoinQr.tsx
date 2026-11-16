import { QRCodeSVG } from "qrcode.react";

import { getJoinUrl } from "../lib/roomUrls";

interface JoinQrProps {
  roomCode: string;
  /** Kodun kenar uzunluğu (TV tuvalinde px). Masadan okunması için lobi ve ana ekranda en az 400. */
  size: number;
  testId?: string;
}

/**
 * TV'deki katılım QR'ı. Tek yerde durur ki boyut ve hata düzeltme seviyesi
 * ekrandan ekrana kaymasın.
 *
 * Seviye "M": ekranda leke/yırtık riski yok, "H" yalnızca kodu sıklaştırıp
 * modülleri küçültüyordu (aynı adres H'de 37, M'de 33 modül). Uzaktan
 * okunurluğu modül boyutu belirler (10:1 kuralı, bkz.
 * docs/superpowers/specs/2026-11-15-lounge-yon-design.md).
 */
export function JoinQr({ roomCode, size, testId }: JoinQrProps) {
  return (
    <div className="bg-white p-4 rounded-2xl shrink-0">
      <QRCodeSVG
        data-testid={testId}
        value={getJoinUrl(roomCode)}
        size={size}
        bgColor="#ffffff"
        fgColor="#000000"
        level="M"
        marginSize={1}
      />
    </div>
  );
}
