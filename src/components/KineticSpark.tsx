import { useEffect } from "react";
import { motion } from "framer-motion";
import { playCinematicWhoosh } from "../lib/soundSynth";
import { SoundManager, sounds } from "../lib/audio";
import { titleFontSize } from "../lib/titleFontSize";

interface KineticSparkProps {
  className?: string;
  delay?: number;
  showTagline?: boolean;
  tagline?: string;
  playAudio?: boolean;
  /** Büyük 3B başlık metni. Mekan markasına göre değişebilir, varsayılan HENGAME. */
  text?: string;
}

/** Ekstrüzyon derinliği em cinsinden — böylece yazıyla orantılı kalıyor. */
const LAYER_DEPTH_EM = 0.025;

/**
 * Ekstrüzyon katman sayısı. 8'den 16'ya çıktı: toplam derinlik 0.2em → 0.4em.
 * Yazı döndükçe yanağı görünür hâle geliyor, önceden neredeyse düz duruyordu.
 */
const LAYER_COUNT = 16;

/**
 * Katmanların rengi düz siyah değil: öne yakın katmanlar sıcak (kor) tonda
 * başlayıp derine gittikçe koyulaşıyor. Gerçek ekstrüzyonda yanak, ön yüzden
 * sızan ışığı alır — malzeme hissi verir.
 */
/**
 * Katmanların rengi: 3 renk uyumu (Altın, Yoğun Beyaz, Derin Gece Mavisi)
 * Öne yakın katmanlar sıcak altın kor tonunda, derine gittikçe derin safir/gece mavisine dönüşür.
 */
function extrusionFace(i: number): { color: string; stroke: string } {
  const depth = i / (LAYER_COUNT - 1); // 0 = ön yanak, 1 = en arka
  const warmth = 1 - depth;
  // Sıcak altın/kehribardan derin gece safir mavisine geçiş
  const r = Math.round(14 + warmth * 145);
  const g = Math.round(28 + warmth * 75);
  const b = Math.round(62 + warmth * -25);
  return {
    color: `rgb(${r}, ${g}, ${b})`,
    stroke: depth < 0.45 
      ? `rgba(255, 170, 46, ${0.45 * warmth + 0.1})`
      : `rgba(30, 80, 190, ${0.4 * depth + 0.08})`,
  };
}

export function KineticSpark({
  className = "",
  delay = 0,
  showTagline = false,
  tagline = "HENGAME ARENA",
  playAudio = false,
  text = "HENGAME",
}: KineticSparkProps) {
  // Ekstrüzyon katmanları ve ön yüz BİREBİR aynı boyutta olmak zorunda —
  // tek yerde hesaplanıp ikisine de veriliyor.
  const fontSize = titleFontSize(text);

  useEffect(() => {
    if (!playAudio) return;

    const audioTimer = setTimeout(() => {
      SoundManager.getInstance().playSFX(sounds.START_JAZZ, 0.4);
    }, Math.max(0, delay) * 1000);

    const timer = setTimeout(() => playCinematicWhoosh(), Math.max(0, delay + 0.6) * 1000);
    const secondTimer = setTimeout(() => playCinematicWhoosh(), Math.max(0, delay + 1.2) * 1000);

    return () => {
      clearTimeout(audioTimer);
      clearTimeout(timer);
      clearTimeout(secondTimer);
    };
  }, [delay, playAudio]);

  return (
    <div
      className={`relative w-full h-full noise-suppression overflow-visible flex flex-col items-center justify-center ${className}`}
      style={{ perspective: "820px" }}
    >
      {/* Giriş Animasyonu — Açılışta yumuşak geçiş */}
      <motion.div
        initial={delay >= 0 ? { rotateX: 45, scale: 0.7, opacity: 0, z: -200 } : false}
        animate={{ rotateX: 0, scale: 1, opacity: 1, z: 0 }}
        transition={{
          duration: 1.8,
          delay: Math.max(0, delay),
          ease: "easeOut",
        }}
        className="relative w-full flex items-center justify-center"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/*
          SÜREKLİ 3D SÜZÜLME & SALINIM (Floating 3D Levitation Glide)
          Daha Geniş Açılı (Slow-motion 3D)
        */}
        <motion.div
          animate={{
            rotateY: [-15, 15, -15], // Daha kontrollü, merkezcil ve estetik Y dönüşü
            rotateX: [8, -8, 8],     // Hafif baş eğme (X ekseni)
            y: [-12, 12, -12],       // Yukarı-aşağı dengeli süzülme
          }}
          transition={{
            rotateY: { duration: 14, repeat: Infinity, ease: "easeInOut" },
            rotateX: { duration: 10, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
          }}
          className="relative w-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Sis ve buğu hissi veren büyük geniş blur haleleri tamamen kaldırıldı (Keskinlik için) */}

          {/* Yığılmış HTML katmanlarıyla gerçek 3B ekstrüzyon derinliği */}
          <div className="relative group" style={{ transformStyle: "preserve-3d" }}>
            {[...Array(LAYER_COUNT)].map((_, i) => {
              const face = extrusionFace(i);
              return (
                <div
                  key={i}
                  className="absolute top-0 left-0 font-black uppercase tracking-tighter select-none"
                  style={{
                    fontSize,
                    transform: `translateZ(-${(i + 1) * LAYER_DEPTH_EM}em)`,
                    color: face.color,
                    WebkitTextStroke: `1.5px ${face.stroke}`,
                  }}
                >
                  {text}
                </div>
              );
            })}

            {/* Ön yüz: Ana Altın/Kor Gradyanı ve Üzerinde Gezen Beyaz Işık (Tek Element) */}
            <motion.div
              className="relative font-black uppercase tracking-tighter select-none"
              style={{
                fontSize,
                backgroundImage: `
                  linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.9) 50%, transparent 65%),
                  linear-gradient(180deg, #ffffff 0%, #ffe680 22%, #ffaa00 52%, #ff5e00 78%, #0f1c3f 100%)
                `,
                backgroundSize: "250% 100%, 100% 100%",
                backgroundRepeat: "no-repeat, no-repeat",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 0 6px rgba(255,170,0,0.65))", // Daha keskin, buğusuz gölge
                transform: "translateZ(0px)",
              }}
              animate={{ 
                backgroundPosition: ["200% 0%, 0% 0%", "-100% 0%, 0% 0%"] 
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                repeatDelay: 0.5, 
                ease: "easeInOut" 
              }}
            >
              {text}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Cinematic Crisp Neon Tagline */}
      {showTagline && (
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: Math.max(0, delay) + 1.2, duration: 1.0, ease: "easeOut" }}
          className="mt-6 sm:mt-8 flex flex-col items-center gap-2.5 relative z-20"
        >
          {/* Keskin Neon Ayrım Çizgisi */}
          <motion.div
            animate={{ width: ["0%", "100%", "0%"], opacity: [0.3, 1, 0.3] }}
            transition={{ delay: 1.5, duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-[1.5px] w-44 sm:w-60 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_rgba(255,180,0,0.85)]"
          />
          <p
            className="text-[11px] sm:text-xs md:text-sm font-mono font-black tracking-[0.35em] sm:tracking-[0.45em] uppercase text-amber-300 drop-shadow-[0_0_10px_rgba(255,170,0,0.8)] max-w-full pl-[0.35em] sm:pl-[0.45em]"
          >
            {tagline}
          </p>
        </motion.div>
      )}
    </div>
  );
}
