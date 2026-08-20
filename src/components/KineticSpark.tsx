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
  /** Büyük 3B başlık metni. Mekan markasına göre değişebilir, varsayılan HENGAME. */
  text?: string;
}

/**
 * Başlık boyutu tek kaynaktan: 3B katmanların hepsi birebir aynı ölçüde
 * olmak zorunda, iki ayrı yerde tutmak kaymaya davetiye çıkarıyordu.
 *
 * Sabit `text-[10rem]` mobilde 160px demekti ve "HENGAME" 375px'lik bir ekranda
 * 557px yer kaplayıp iki yanından kırpılıyordu. clamp() ile telefondan TV'ye
 * kadar akışkan ölçekleniyor.
 */
const TITLE_FONT_SIZE = "clamp(3.25rem, 17vw, 18rem)";

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
      {/* Giriş animasyonu — yalnızca bir kez çalışır */}
      <motion.div
        initial={{ rotateX: 60, scale: 0.5, opacity: 0, z: -500 }}
        animate={{ rotateX: 0, scale: 1, opacity: 1, z: 0 }}
        transition={{
          rotateX: { delay: delay + 0.2, duration: 2, ease: "easeOut" },
          scale: { delay: delay + 0.2, duration: 2, ease: "easeOut" },
          opacity: { delay: delay + 0.2, duration: 1.5, ease: "easeIn" },
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
            Arka hâle: eski leylak/mor (#C8A2C8 → #E0B0FF) sıcak altın yazının
            altında çamurlu bir mor-sarı karışımı üretiyordu. Artık markanın
            kendi paletinden derin indigo → turkuaz: sıcak korun karşısına
            soğuk bir zemin koyuyor, tamamlayıcı kontrast yazıyı öne itiyor.
          */}
          <motion.div
            animate={{ opacity: [0.45, 0.8, 0.45], scale: [1, 1.12, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,#1b1f6b_0%,#0a2f5e_45%,#00131f_75%,transparent_100%)] blur-[110px] rounded-[100%] mix-blend-screen -z-20"
            style={{ transform: "translateZ(-120px)" }}
          />
          {/*
            İkinci, dar hâle: yazının hemen arkasında sıcak bir kor.
            Derinlikte daha ileride durduğu için yazı döndükçe arkasından
            kayıyor — tek katmanlı hâlede olmayan bir paralaks veriyor.
          */}
          <motion.div
            animate={{ opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-[15%] inset-y-[25%] bg-[radial-gradient(ellipse_at_center,#ff6b1a_0%,#c0300a_50%,transparent_78%)] blur-[80px] rounded-[100%] mix-blend-screen -z-10"
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
                    fontSize: TITLE_FONT_SIZE,
                    transform: `translateZ(-${(i + 1) * LAYER_DEPTH_EM}em)`,
                    color: face.color,
                    WebkitTextStroke: `1.5px ${face.stroke}`,
                  }}
                >
                  {text}
                </div>
              );
            })}

            {/*
              Ön yüz: düz altın (#FFD700 → #FFF8DC) yerine kor→şeftali→sıcak
              beyaz. Altın tek başına ucuz/kumarhane çağrışımı yapıyordu;
              turuncu-kırmızı uçlar markanın alaz-orange'ıyla aynı ailede,
              tepe noktasındaki sıcak beyaz ise metalik parlamayı veriyor.
            */}
            <motion.div
              className="relative font-black uppercase tracking-tighter bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0% center", "-200% center"] }}
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              style={{
                fontSize: TITLE_FONT_SIZE,
                backgroundImage:
                  "linear-gradient(100deg, #FF5500 0%, #FF9A3C 14%, #FFE7B8 26%, #FFF6E8 32%, #FFC15E 44%, #FF6B1A 58%, #FFD98A 72%, #FFF2D6 80%, #FF7A22 92%, #FF5500 100%)",
                backgroundSize: "200% auto",
                textShadow:
                  "0 0 18px rgba(255,120,30,0.55), 0 0 46px rgba(255,85,0,0.35), 0 2px 2px rgba(60,14,0,0.6)",
                WebkitTextStroke: "1px rgba(255,190,110,0.7)",
                transform: "translateZ(0px)",
              }}
            >
              {text}
            </motion.div>
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
