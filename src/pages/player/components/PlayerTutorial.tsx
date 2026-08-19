import { motion, AnimatePresence } from "framer-motion";
import type { Room } from "../../../types/database";

interface Props {
  room: Room;
}

const PLAYER_TUTORIAL_CONTENT = {
  scattegories: [
    {
      title: "KLAVYE HIZINI HAZIRLA!",
      desc: "Ana ekranda harf belirdiğinde, telefonun senin oyun kumandan olacak. Panik yapma, odaklan.",
      icon: "📱"
    },
    {
      title: "KUTUCUKLARI DOLDUR",
      desc: "Kategorilere uygun en ilginç kelimeleri yaz ve süre bitmeden 'GÖNDER' butonuna bas!",
      icon: "✍️"
    }
  ],
  quiz: [
    {
      title: "SORU EKRANDA, CEVAP BURADA",
      desc: "Sorular ana ekranda (TV) görünecek. Sen telefonundan A, B, C veya D şıklarından birini seçeceksin.",
      icon: "👀"
    },
    {
      title: "EN HIZLI SEN TIKLA!",
      desc: "Doğru cevabı ne kadar hızlı seçersen o kadar çok puan alırsın. Hızlı ol!",
      icon: "⚡"
    }
  ],
  bomb: [
    {
      title: "BOMBA SANA GELİRSE...",
      desc: "Ekranın aniden KIRMIZI olacak ve telefonun titreyecek. Panik yapma, sakin kal!",
      icon: "🚨"
    },
    {
      title: "HEMEN YAZ VE AT!",
      desc: "Kategoriye uygun, DAHA ÖNCE YAZILMAMIŞ bir kelime yaz ve BOMBAYI AT butonuna basarak kurtul!",
      icon: "🏃‍♂️"
    }
  ],
  sensor: [
    {
      title: "REFLEKSLERİNİ TEST ET",
      desc: "Ekranda beliren görseli/sesi herkesten önce bulmalısın. Telefonundaki devasa DEV BUTON'a ilk basan cevap hakkı kazanır!",
      icon: "⚡"
    },
    {
      title: "HIZLI OLAN KAZANIR",
      desc: "Butona bastıktan sonra kelimeyi TV ekranında veya Host'a söyle, puanı kap!",
      icon: "🏆"
    }
  ]
};

export function PlayerTutorial({ room }: Props) {
  const step = room.tutorial_step || 0;
  const gameType = room.active_game || room.game_type || "scattegories";
  const content = PLAYER_TUTORIAL_CONTENT[gameType as keyof typeof PLAYER_TUTORIAL_CONTENT] || PLAYER_TUTORIAL_CONTENT.scattegories;
  const currentSlide = content[step] || content[0];

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] bg-black relative overflow-hidden p-6 text-center">
      {/* Dynamic Background based on game type */}
      <div className={`absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] ${
        gameType === 'bomb' ? 'from-[#ff003c] to-transparent' : 
        gameType === 'quiz' ? 'from-blue-500 to-transparent' : 
        'from-alaz-orange to-transparent'
      }`} />
      
      <div className="z-10 w-full max-w-sm flex flex-col items-center">
        <div className="bg-black/60 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 mb-8">
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">
            Dev ekrana da bakın
          </p>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col items-center"
          >
            <div className="text-7xl mb-8 animate-bounce drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              {currentSlide.icon}
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
              {currentSlide.title}
            </h1>
            <p className="text-lg text-gray-400 font-medium leading-relaxed">
              {currentSlide.desc}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-16 text-gray-500 flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-gray-600 border-t-white animate-spin" />
          <p className="text-xs uppercase tracking-widest font-bold">Oyun Yöneticisi Bekleniyor...</p>
        </div>
      </div>
    </div>
  );
}
