import { useState, useEffect, type ReactNode } from "react";

// TV host ekranları 1920×1080 (Full HD TV) baz alınarak tasarlandı — dev
// harfler (text-[18rem]), sabit piksel kutular (w-[350px] vb.) hep bu
// referansa göre ölçüldü. Bu, gerçek bir TV'de (veya benzer 16:9 büyük
// ekranda) sorunsuz görünüyordu; ama bir laptopta (13-16", genelde daha KISA
// bir viewport) aynı sabit boyutlar viewport'u dikey taşırıyor, sayfa
// kaydırılmak zorunda kalıyordu — TV'de hiç fark edilmeyen ama laptopta
// ölçüm sırasında ortaya çıkan bir kusurdu.
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

function computeScale() {
  if (typeof window === "undefined") return 1;
  return Math.min(
    window.innerWidth / DESIGN_WIDTH,
    window.innerHeight / DESIGN_HEIGHT,
  );
}

/**
 * Host (TV) ekranlarını SABİT 1920×1080'lik bir tuvale çizip, o tuvali
 * gerçek ekrana ORANTILI biçimde sığdırır (transform: scale). Sonuç: 13"
 * laptopta da, 55" salon TV'sinde de, 4K bir ekranda da içerik ASLA taşmıyor
 * / kaydırma gerektirmiyor — yalnızca orantılı küçülüp büyüyor. Bu, ekranın
 * "kendi boyutuna göre akıllıca konumlanması" için istenen sistem.
 *
 * Not: transform içeren bir ata, içindeki `position: fixed` elemanlar için
 * yeni bir konumlama bağlamı oluşturur (CSS spesifikasyonu) — bu yüzden
 * ParticleBackground/EmojiRain/DatabaseStatus gibi `fixed` bileşenler artık
 * gerçek tarayıcı penceresine değil, bu TV tuvaline göre konumlanıp onunla
 * birlikte ölçekleniyor. İstenen tam olarak bu: taşan kısımlar (letterbox
 * şeritleri) düz siyah kalıyor, hiçbir öğe ekranın dışına sarkmıyor.
 */
export function TVScaleFrame({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(computeScale);

  useEffect(() => {
    const onResize = () => setScale(computeScale());
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center">
      <div
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${scale})`,
        }}
        className="relative flex-shrink-0 origin-center"
      >
        {children}
      </div>
    </div>
  );
}
