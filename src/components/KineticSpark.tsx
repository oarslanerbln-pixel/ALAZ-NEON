import { useEffect } from "react";
import { motion } from "framer-motion";
import { playCinematicWhoosh } from "../lib/soundSynth";
import { SoundManager, sounds } from "../lib/audio";

interface KineticSparkProps {
  className?: string;
  delay?: number;
  showTagline?: boolean;
  tagline?: string;
  playAudio?: boolean;
}

/**
 * Başlık boyutu tek kaynaktan: 3B katmanların hepsi birebir aynı ölçüde
 * olmak zorunda, iki ayrı yerde tutmak kaymaya davetiye çıkarıyordu.
 *
 * Sabit `text-[10rem]` mobilde 160px demekti ve "KAMUS" 375px'lik bir ekranda
 * 557px yer kaplayıp iki yanından kırpılıyordu. clamp() ile telefondan TV'ye
 * kadar akışkan ölçekleniyor.
 */
const TITLE_FONT_SIZE = "clamp(3.25rem, 17vw, 18rem)";

/** Ekstrüzyon derinliği em cinsinden — böylece yazıyla orantılı kalıyor. */
const LAYER_DEPTH_EM = 0.025;

export function KineticSpark({
  className = "",
  delay = 0,
  showTagline = false,
  tagline = "KAMUS ARENA",
  playAudio = false,
}: KineticSparkProps) {

  useEffect(() => {
    if (!playAudio) return;

    const audioTimer = setTimeout(() => {
      SoundManager.getInstance().playSFX(sounds.START_JAZZ, 0.4);
    }, delay * 1000);

    const timer = setTimeout(() => playCinematicWhoosh(), (delay + 0.6) * 1000);
    const secondTimer = setTimeout(() => playCinematicWhoosh(), (delay + 1.2) * 1000);

    return () => {
      clearTimeout(audioTimer);
      clearTimeout(timer);
      clearTimeout(secondTimer);
    };
  }, [delay, playAudio]);

  return (
    <div
      className={`relative w-full h-full noise-suppression overflow-visible flex flex-col items-center justify-center ${className}`}
      style={{ perspective: "1000px" }}
    >
      {/* 3D Cinematic Text Container */}
      <motion.div
        initial={{ rotateX: 60, rotateY: 0, scale: 0.5, opacity: 0, z: -500 }}
        animate={{ rotateX: 0, rotateY: [0, 5, -5, 0], scale: 1, opacity: 1, z: 0 }}
        transition={{
          rotateX: { delay: delay + 0.2, duration: 2, ease: "easeOut" },
          scale: { delay: delay + 0.2, duration: 2, ease: "easeOut" },
          opacity: { delay: delay + 0.2, duration: 1.5, ease: "easeIn" },
          rotateY: { delay: delay + 2.5, duration: 10, repeat: Infinity, ease: "easeInOut" }
        }}
        className="relative w-full flex items-center justify-center"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Glow behind the text */}
        <motion.div
          animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-r from-[#C8A2C8] via-[#E0B0FF] to-[#FF8C00] blur-[120px] rounded-[100%] opacity-80 mix-blend-screen -z-10"
        />

        {/* The 3D Text itself using stacked HTML elements for authentic 3D extrusion */}
        <div className="relative group">
          {/* Back layers for 3D depth */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 left-0 font-black uppercase tracking-tighter"
              style={{
                fontSize: TITLE_FONT_SIZE,
                transform: `translateZ(-${(i + 1) * LAYER_DEPTH_EM}em)`,
                color: "rgba(0,0,0,0.8)",
                WebkitTextStroke: "2px rgba(100, 100, 255, 0.2)",
                opacity: 1 - i * 0.1,
              }}
            >
              KAMUS
            </div>
          ))}

          {/* Front Face with Color Animation */}
          <motion.div
            className="relative font-black uppercase tracking-tighter bg-clip-text text-transparent"
            animate={{ backgroundPosition: ["0% center", "-200% center"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            style={{
              fontSize: TITLE_FONT_SIZE,
              backgroundImage: "linear-gradient(to right, #FFD700 0%, #FFF8DC 25%, #FFD700 50%, #FFF8DC 75%, #FFD700 100%)",
              backgroundSize: "200% auto",
              textShadow: "0 0 20px rgba(255,215,0,0.5), 0 0 40px rgba(255,215,0,0.3)",
              WebkitTextStroke: "1px rgba(255,215,0,0.8)",
              transform: "translateZ(0px)",
            }}
          >
            KAMUS
          </motion.div>
        </div>
      </motion.div>

      {/* Cinematic Tagline */}
      {showTagline && (
        <motion.div
          initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: delay + 2, duration: 1.5, ease: "easeOut" }}
          className="absolute bottom-4 md:-bottom-8 flex flex-col items-center gap-4 z-20"
        >
          {/* Animated line */}
          <motion.div
            animate={{ width: ["0%", "100%", "0%"], opacity: [0, 1, 0] }}
            transition={{ delay: delay + 2.5, duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="h-[2px] w-[200px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_10px_rgba(0,229,255,0.8)]"
          />
          <p
            // Harf aralığı mobilde 1.5em iken "KAMUS ARENA" ekran genişliğini
            // zorluyordu; küçük ekranda daha dar başlayıp yukarı doğru açılıyor.
            className="text-[10px] sm:text-xs md:text-sm lg:text-base tracking-[0.5em] sm:tracking-[1em] md:tracking-[2em] uppercase font-bold text-center pl-[0.5em] sm:pl-[1em] md:pl-[2em] bg-clip-text text-transparent bg-gradient-to-r from-gray-300 via-white to-gray-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] max-w-full"
          >
            {tagline}
          </p>
        </motion.div>
      )}
    </div>
  );
}
