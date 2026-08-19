import { motion, AnimatePresence } from "framer-motion";
import type { Room } from "../../../types/database";
import { SoundManager, sounds } from "../../../lib/audio";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

interface Props {
  room: Room;
  onComplete: () => void;
}

const TUTORIAL_CONTENT = {
  scattegories: [
    {
      title: "HARFİ GÖR, KELİMELERİ BUL",
      desc: "Her turun başında rastgele bir harf seçilir. Amacın, o harfle başlayan ve kategorilere uygun kelimeleri en hızlı şekilde bulmak.",
      icon: "⚡"
    },
    {
      title: "KOPYA YOK, YARATICILIK ŞART",
      desc: "Başkasıyla aynı kelimeyi yazarsan az puan alırsın. Sadece sana özel, benzersiz kelimeler ekstra puan kazandırır!",
      icon: "🧠"
    }
  ],
  quiz: [
    {
      title: "BİLGİNİ KANITLA",
      desc: "Ekranda beliren soruları oku ve en hızlı şekilde doğru şıkkı seç. Zaman daralıyor!",
      icon: "🎯"
    },
    {
      title: "HIZ VE DİKKAT",
      desc: "Soru zorlaştıkça ve sen ne kadar hızlı cevaplarsan o kadar yüksek puan alırsın. Yanlış cevapta puan yok!",
      icon: "⏱️"
    }
  ],
  bomb: [
    {
      title: "BOMBAYI ELİNDEN AT!",
      desc: "Bomba sana geldiğinde telefonun titrer ve ekran kızarır. Hemen kategoriye uygun bir kelime yaz ve gönder!",
      icon: "💣"
    },
    {
      title: "KULLANILMIŞ KELİME YASAK",
      desc: "Daha önce yazılan bir kelimeyi yazamazsın! Süre dolduğunda bomba kimin elindeyse bir canı gider.",
      icon: "🔥"
    }
  ],
  sensor: [
    {
      title: "GÖRSELİ/SESİ İLK BULAN KAZANIR",
      desc: "Ekranda beliren nesneyi, sesi veya logoyu ilk kim bilirse dev butona o bassın!",
      icon: "⚡"
    },
    {
      title: "HOST ONAYI ŞART",
      desc: "Butona ilk basan oyuncunun cevabı doğruysa Host 'Doğru' der, yanlışsa oyun devam eder.",
      icon: "🎯"
    }
  ]
};

export function HostTutorial({ room, onComplete }: Props) {
  const step = room.tutorial_step || 0;
  const gameType = room.active_game || room.game_type || "scattegories";
  const content = TUTORIAL_CONTENT[gameType as keyof typeof TUTORIAL_CONTENT] || TUTORIAL_CONTENT.scattegories;

  const handleNext = async () => {
    SoundManager.getInstance().playSFX(sounds.CLICK);
    if (step >= content.length - 1) {
      onComplete();
    } else {
      await updateDoc(doc(db, "rooms", room.id), {
        tutorial_step: step + 1
      });
    }
  };

  const currentSlide = content[step];

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-black relative overflow-hidden">
      {/* Dynamic Background based on game type */}
      <div className={`absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] ${
        gameType === 'bomb' ? 'from-[#ff003c] to-transparent' : 
        gameType === 'quiz' ? 'from-blue-500 to-transparent' : 
        'from-alaz-orange to-transparent'
      }`} />
      
      <div className="z-10 w-full max-w-5xl px-8 flex flex-col items-center">
        <h3 className="text-gray-500 font-bold tracking-[0.5em] uppercase mb-12 animate-pulse">Nasıl Oynanır?</h3>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -50, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`w-full p-16 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden group`}
          >
            {/* Glassmorphism shine */}
            <div className="absolute top-0 left-0 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(45deg,transparent_40%,rgba(255,255,255,0.1)_50%,transparent_60%)] animate-[shine_6s_infinite]" />
            
            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
              <div className="text-8xl md:text-[120px] filter drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] animate-bounce" style={{ animationDuration: '3s' }}>
                {currentSlide.icon}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6">
                  {currentSlide.title}
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 font-medium leading-relaxed">
                  {currentSlide.desc}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress indicators */}
        <div className="flex gap-4 mt-12 mb-16">
          {content.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-500 ${
                i === step ? 'w-16 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'w-4 bg-white/20'
              }`} 
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          className={`px-12 py-5 font-black text-xl uppercase tracking-widest transition-all rounded-full ${
            step === content.length - 1
              ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.6)]'
              : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
          }`}
        >
          {step === content.length - 1 ? 'OYUNU BAŞLAT' : 'SONRAKİ'}
        </motion.button>
      </div>
    </div>
  );
}
