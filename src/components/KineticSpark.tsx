import { useEffect, useState } from "react";
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
 * sızan ışığı alır — düz siyah bir yığın "gölge" gibi okunuyordu, bu ise
 * malzeme gibi okunuyor.
 */
function extrusionFace(i: number): { color: string; stroke: string } {
  const depth = i / (LAYER_COUNT - 1); // 0 = ön yanak, 1 = en arka
  const warmth = 1 - depth;
  const r = Math.round(46 + warmth * 110);
  const g = Math.round(14 + warmth * 44);
  const b = Math.round(6 + warmth * 8);
  return {
    color: `rgb(${r}, ${g}, ${b})`,
    // Kenar çizgisi derine gittikçe sönüyor; siluetin kenarını tanımlıyor.
    stroke: `rgba(255, 138, 46, ${0.32 * warmth + 0.04})`,
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
  // useState ile rastgele değerleri render sırasında sürekli hesaplanmaktan kurtarıyoruz.
  const [sparks] = useState(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDuration: `${0.3 + Math.random()}s`,
      animationDelay: `${Math.random()}s`,
    }));
  });

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
      // 1000px → 820px: aynı dönüş açısı daha güçlü bir perspektif kısalması
      // üretiyor, yani 3B etkisi belirginleşiyor.
      style={{ perspective: "820px" }}
    >
      {/* Giriş animasyonu — yalnızca bir kez çalışır. Cinematic Power-up (Flicker) eklendi */}
      <motion.div
        initial={{ rotateX: 60, scale: 0.5, opacity: 0, z: -500, filter: "brightness(0) blur(20px)" }}
        animate={{ 
          rotateX: 0, 
          scale: 1, 
          // Power-up flicker sequence: kapalı -> hafif yanar -> söner -> tam güce ulaşır
          opacity: [0, 0.4, 0, 1, 0.8, 1],
          filter: ["brightness(0) blur(20px)", "brightness(2) blur(5px)", "brightness(0) blur(10px)", "brightness(1.5) blur(2px)", "brightness(1) blur(0px)"],
          z: 0 
        }}
        transition={{
          rotateX: { delay: delay + 0.5, duration: 2.5, ease: "easeOut" },
          scale: { delay: delay + 0.5, duration: 2.5, ease: "easeOut" },
          opacity: { delay: delay + 0.5, duration: 2, times: [0, 0.1, 0.15, 0.4, 0.6, 1], ease: "linear" },
          filter: { delay: delay + 0.5, duration: 2, times: [0, 0.1, 0.15, 0.4, 0.6, 1], ease: "linear" },
        }}
        className="relative w-full flex items-center justify-center"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/*
          Sürekli salınım AYRI bir katmanda: giriş animasyonuyla aynı
          motion.div'de olsaydı `rotateX` hem 60°'den 0'a inen giriş değeri
          hem de sonsuz döngünün keyframe dizisi olmak zorunda kalırdı —
          framer dizinin ilk karesine atlayıp giriş eğimini yutuyordu.

          Üç eksenin süreleri bilerek birbirine bölünmüyor (13/9/7 sn):
          bileşke hareket gözle görülür şekilde tekrar etmiyor, sabit bir
          döngü yerine "havada asılı duruyor" hissi veriyor.
        */}
        <motion.div
          animate={{
            rotateY: [0, 13, -6, 9, -13, 0],
            rotateX: [0, -7, 3, -4, 6, 0],
            y: [0, -14, 5, -9, 0],
          }}
          transition={{
            rotateY: { delay: delay + 2.2, duration: 13, repeat: Infinity, ease: "easeInOut" },
            rotateX: { delay: delay + 2.2, duration: 9, repeat: Infinity, ease: "easeInOut" },
            y: { delay: delay + 2.2, duration: 7, repeat: Infinity, ease: "easeInOut" },
          }}
          className="relative w-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/*
            Arka hâle: Premium Cyberpunk/Neon konsepti. Deep purple, neon pink ve
            turkuazın birleşimi, karanlık bir arka planda müthiş bir contrast yaratır.
          */}
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.15, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,#ff00ff_0%,#4a00e0_35%,#00e5ff_75%,transparent_100%)] blur-[120px] rounded-[100%] mix-blend-screen -z-20"
            style={{ transform: "translateZ(-120px)" }}
          />
          {/*
            İkinci, dar hâle: Yazının hemen arkasından vuran çok parlak sıcak bir kor.
            Alaz-orange ile neon pink karışımı.
          */}
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-[15%] inset-y-[25%] bg-[radial-gradient(ellipse_at_center,#ff5500_0%,#ff00ff_45%,transparent_80%)] blur-[90px] rounded-[100%] mix-blend-screen -z-10"
            style={{ transform: "translateZ(-40px)" }}
          />

          {/* Yığılmış HTML katmanlarıyla gerçek 3B ekstrüzyon */}
          <div className="relative group" style={{ transformStyle: "preserve-3d" }}>
            {[...Array(LAYER_COUNT)].map((_, i) => {
              const face = extrusionFace(i);
              return (
                <div
                  key={i}
                  className="absolute top-0 left-0 font-black uppercase tracking-tighter"
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

            {/* Ön yüz: Siyah zemin ve Kıvılcımlar */}
            <div
              className="relative font-black uppercase tracking-tighter"
              style={{
                fontSize,
                color: "#000",
                WebkitTextStroke: "1px rgba(255,255,255,0.2)",
                transform: "translateZ(0px)",
              }}
            >
              {text}

              {/* Spark (Kıvılcım) Partikülleri */}
              <div className="absolute inset-0 pointer-events-none" style={{ WebkitTextStroke: "0" }}>
                {sparks.map((spark) => (
                  <motion.div
                    key={spark.id}
                    className="absolute bg-yellow-400 rounded-full shadow-[0_0_10px_#ffeb3b,0_0_20px_#ffeb3b] w-1 h-1 md:w-1.5 md:h-1.5"
                    style={{
                      left: spark.left,
                      top: spark.top,
                      animation: `spark-flicker ${spark.animationDuration} infinite alternate`,
                      animationDelay: spark.animationDelay,
                    }}
                    animate={{ opacity: [1, 1, 0] }}
                    transition={{ duration: 3, times: [0, 0.7, 1], delay: delay + 1.5 }}
                  />
                ))}
              </div>

              {/* 
                ULTRA-PREMIUM COSMIC FLARE (Hologram Sweep)
                SVG stroke yerine CSS tabanlı, sonsuz çözünürlüklü ışık seli.
                Daha ağırbaşlı, lüks ve jilet gibi keskin bir "Wow Effect".
              */}
              <motion.div
                className="absolute inset-0 liquid-clip-text font-black uppercase tracking-tighter mix-blend-screen"
                style={{
                  // Cyberpunk/Neon renk paletinden oluşan çok geniş bir ışık huzmesi
                  backgroundImage: "linear-gradient(110deg, transparent 0%, rgba(0, 229, 255, 0.4) 35%, rgba(255, 255, 255, 1) 50%, rgba(255, 0, 255, 0.6) 65%, rgba(255, 85, 0, 0.3) 75%, transparent 100%)",
                  backgroundSize: "300% 100%",
                  WebkitTextStroke: "0", // Işık selinde stroke yok, pürüzsüz akacak
                  backgroundPosition: "200% 0%",
                }}
                animate={{ backgroundPosition: ["300% 0%", "-100% 0%"] }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: delay + 1.5 // Giriş animasyonundan sonra başlar
                }}
              >
                {text}
              </motion.div>
            </div>
          </div>
        </motion.div>
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
            // Harf aralığı mobilde 1.5em iken "HENGAME ARENA" ekran genişliğini
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
