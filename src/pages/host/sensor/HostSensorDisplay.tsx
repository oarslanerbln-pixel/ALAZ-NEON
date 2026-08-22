import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { SoundManager, sounds } from "../../../lib/audio";
import { getRandomSensorImage, SENSOR_IMAGES, type SensorImage } from "../../../data/sensorImages";
import { safeForDisplay } from "../../../lib/profanity";

import { HostHeader } from "../components/HostHeader";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { HostLobby } from "../views/HostLobby";
import { useLocale } from "../../../hooks/useLocale";
import { grantGameRewards } from "../../../lib/rewards";
import { useVenue } from "../../../contexts/VenueContextCore";

import type { Room, Player } from "../../../types/database";

export function HostSensorDisplay({
  room,
  players,
  updateRoomStatus,
  updatePlayerScore,
}: {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], extra?: Partial<Room>) => Promise<void>;
  updatePlayerScore: (playerId: string, score: number) => Promise<void>;
}) {
  const { t } = useLocale();
  const { venue } = useVenue();
  // Sensör de quiz gibi hep bireysel sıralama gösteriyor.
  const grantSensorRewards = () =>
    grantGameRewards("individual", players, venue).catch((err) =>
      console.error("[HostSensorDisplay] Ödül dağıtımı başarısız:", err),
    );
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  
  const rawStatus = room?.status || "lobby";
  const gameState =
    rawStatus === "lobby" ? "lobby" :
    rawStatus === "tutorial" ? "tutorial" :
    rawStatus.startsWith("sensor_") || rawStatus === "finished"
      ? rawStatus
      : "lobby";

  // Pure derivations from room/players — no need for useState+useEffect,
  // which was one render behind (and triggered an extra cascading render on
  // every room update) versus just computing them straight from props.
  const isSensorScreen =
    gameState === "sensor_intro" ||
    gameState === "sensor_active" ||
    gameState === "sensor_buzzed" ||
    gameState === "sensor_reveal";
  const currentImage: SensorImage | null =
    (isSensorScreen && room.sensor_current_media
      ? SENSOR_IMAGES.find(i => i.url === room.sensor_current_media)
      : null) || null;
  const currentImageIndex = room.current_round || 0;
  const buzzerPlayerName = room.sensor_buzzer_player_id
    ? players.find(pl => pl.id === room.sensor_buzzer_player_id)?.nickname || null
    : null;

  // When somebody buzzes, play sound
  useEffect(() => {
    if (gameState === "sensor_buzzed") {
      SoundManager.getInstance().playSFX(sounds.SIREN); // Or a specific buzz sound
    }
  }, [gameState]);


  const startGame = async () => {
    if (!roomId) return;
    SoundManager.getInstance().playSFX(sounds.START);
    
    try {
      const q = query(collection(db, "answers"), where("room_id", "==", roomId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.forEach(docSnap => batch.delete(docSnap.ref));
        await batch.commit();
      }
    } catch (e) {
      console.warn("Could not delete old answers:", e);
    }

    const firstImg = getRandomSensorImage([]);
    await updateRoomStatus("sensor_intro", { 
      current_round: 0,
      used_sensor_images: [firstImg.id],
      sensor_current_media: firstImg.url,
      sensor_media_answer: firstImg.answer,
      sensor_buzzer_player_id: null,
      sensor_buzzer_timestamp: null,
      sensor_player_answer: null
    });
  };

  const startRound = async () => {
    SoundManager.getInstance().playSFX(sounds.CLICK);
    await updateRoomStatus("sensor_active", {
      sensor_buzzer_player_id: null,
      sensor_buzzer_timestamp: null,
      sensor_player_answer: null
    });
  };

  const handleEvaluate = async (isCorrect: boolean) => {
    if (isCorrect && room.sensor_buzzer_player_id) {
      SoundManager.getInstance().playSFX(sounds.SUCCESS);
      await updatePlayerScore(room.sensor_buzzer_player_id, 100);
      await updateRoomStatus("sensor_reveal");
    } else {
      SoundManager.getInstance().playSFX(sounds.FAILURE);
      // Yanlış ise geri sayıma / oyuna devam
      await updateRoomStatus("sensor_active", {
        sensor_buzzer_player_id: null,
        sensor_buzzer_timestamp: null,
        sensor_player_answer: null
      });
    }
  };
  
  const nextRound = async () => {
    const nextIdx = (room.current_round || 0) + 1;
    // For sensor, if we played 10 rounds or all available images, end it
    if (nextIdx >= Math.min(room.total_rounds, SENSOR_IMAGES.length)) {
      grantSensorRewards();
      await updateRoomStatus("finished");
      return;
    }
    
    const used = room.used_sensor_images || [];
    const nextImg = getRandomSensorImage(used);

    await updateRoomStatus("sensor_intro", { 
      current_round: nextIdx,
      used_sensor_images: [...used, nextImg.id],
      sensor_current_media: nextImg.url,
      sensor_media_answer: nextImg.answer,
      sensor_buzzer_player_id: null,
      sensor_buzzer_timestamp: null,
      sensor_player_answer: null
    });
  };

  if (gameState === "lobby") {
    return (
      <TVScaleFrame>
      <div className="w-full h-full bg-black text-white overflow-hidden flex flex-col font-mono relative">
        <HostHeader room={room} onEndGameEarly={() => { grantSensorRewards(); updateRoomStatus("finished"); }} />
        {/*
          Burada ikinci bir "başlat" butonu vardı: HostLobby zaten kendi
          başlatma butonunu gösteriyor, bu ise onun üzerine sabitlenmiş
          ikinci bir buton olarak duruyordu. İki farklı buton aynı işi
          yapınca host hangisinin geçerli olduğunu bilemiyor; üstelik
          bunun HostLobby'nin "en az bir oyuncu olmalı" koşulu yoktu,
          yani oyunu boş odada başlatabiliyordu.
        */}
        <div className="flex-1 relative z-10">
          <HostLobby
            room={room}
            players={players}
            onStartGame={startGame}
            onUpdateCategories={async () => {}}
          />
        </div>
      </div>
      </TVScaleFrame>
    );
  }

  return (
    <TVScaleFrame>
    <div className="w-full h-full bg-black text-white overflow-hidden flex flex-col font-sans relative">
      <HostHeader room={room} onEndGameEarly={() => { grantSensorRewards(); updateRoomStatus("finished"); }} />

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        
        {gameState === "sensor_intro" && currentImage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h1 className="text-5xl font-black text-purple-500 mb-8 tracking-widest uppercase animate-pulse">
              {t("sensor.roundLabel", currentImageIndex + 1)}
            </h1>
            <p className="text-2xl text-gray-400 mb-12">{t("sensor.categoryLabel")} <span className="text-white font-bold">{currentImage.category}</span></p>
            <button
              onClick={startRound}
              className="px-12 py-5 bg-white text-black text-xl font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-colors"
            >
              {t("sensor.openImage")}
            </button>
          </motion.div>
        )}

        {gameState === "sensor_active" && currentImage && (
          <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden border-4 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
            {/* 30 seconds blur animation from 50px to 0px */}
            <motion.img 
              src={currentImage.url}
              initial={{ filter: "blur(50px)", scale: 1.2 }}
              animate={{ filter: "blur(0px)", scale: 1 }}
              transition={{ duration: 30, ease: "linear" }}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-black/80 px-4 py-2 text-purple-400 font-bold uppercase tracking-widest text-sm rounded animate-pulse">
              {t("sensor.buzzerActive")}
            </div>
          </div>
        )}

        {gameState === "sensor_buzzed" && currentImage && (
          <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden border-4 border-red-500 shadow-[0_0_100px_rgba(255,0,0,0.5)]">
            <img 
              src={currentImage.url}
              className="w-full h-full object-cover"
              style={{ filter: "blur(20px)" }} // Paused blur effect approx
            />
            <div className="absolute inset-0 bg-red-500/20 flex flex-col items-center justify-center backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="bg-black/90 p-8 border-2 border-red-500 text-center"
              >
                <h2 className="text-3xl text-red-500 font-black mb-2 tracking-widest uppercase">
                  {t("sensor.stop")}
                </h2>
                <p className="text-xl text-white font-bold mb-6">
                  {t("sensor.pressedBuzzer", buzzerPlayerName || "")}
                </p>
                
                {room.sensor_player_answer ? (
                   <div className="mb-8">
                     <p className="text-gray-400 text-sm mb-2 uppercase">{t("sensor.answerLabel")}</p>
                     <p className="text-4xl font-black text-white">"{safeForDisplay(room.sensor_player_answer)}"</p>
                   </div>
                ) : (
                  <div className="mb-8 flex flex-col items-center gap-5">
                    <div className="flex items-center justify-center gap-3 text-alaz-orange">
                      <span className="w-4 h-4 rounded-full bg-alaz-orange animate-bounce" />
                      <span className="w-4 h-4 rounded-full bg-alaz-orange animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <span className="w-4 h-4 rounded-full bg-alaz-orange animate-bounce" style={{ animationDelay: "0.4s" }} />
                      <span className="ml-2 font-bold uppercase">{t("sensor.waitingAnswer")}</span>
                    </div>
                    {/*
                      Oyuncu buzzer'a basıp cevap yazmazsa (telefon kilitlenir,
                      dikkati dağılır vb.) host'un tüm oyunu bitirmek dışında
                      turu ilerletmenin hiçbir yolu yoktu. handleEvaluate(false)
                      ile aynı sıfırlamayı kullanıyoruz — "yanlış" demekle
                      "vazgeçti, buzzer'ı serbest bırak" aynı sonucu üretiyor.
                    */}
                    <button
                      onClick={() => handleEvaluate(false)}
                      className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest border border-white/20 hover:border-white/40 px-4 py-2 transition-colors"
                    >
                      {t("sensor.releaseBuzzer")}
                    </button>
                  </div>
                )}

                {room.sensor_player_answer && (
                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={() => handleEvaluate(true)}
                      className="px-8 py-3 bg-green-500 text-black font-black uppercase hover:bg-green-400 transition-colors"
                    >
                      {t("sensor.correct")}
                    </button>
                    <button 
                      onClick={() => handleEvaluate(false)}
                      className="px-8 py-3 bg-red-600 text-white font-black uppercase hover:bg-red-500 transition-colors"
                    >
                      {t("sensor.wrong")}
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}

        {gameState === "sensor_reveal" && currentImage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden border-4 border-green-500 shadow-[0_0_100px_rgba(34,197,94,0.4)] mb-8">
              <img 
                src={currentImage.url}
                className="w-full h-full object-cover"
              />
            </div>
            
            <h2 className="text-5xl font-black text-white mb-4 uppercase tracking-widest">
              {currentImage.answer}
            </h2>
            <p className="text-xl text-green-400 font-bold mb-10">
              {t("sensor.wonPoints", buzzerPlayerName || "")}
            </p>

            <button
              onClick={nextRound}
              className="px-12 py-5 bg-white text-black text-xl font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-colors"
            >
              {t("sensor.nextRound")}
            </button>
          </motion.div>
        )}

        {gameState === "finished" && (
          <div className="text-center">
            <h1 className="text-5xl font-black text-white mb-8 tracking-widest uppercase">
              {t("sensor.gameOver")}
            </h1>
            <button
              onClick={() => updateRoomStatus("standings")}
              className="px-12 py-5 bg-purple-600 text-white text-xl font-black uppercase tracking-widest hover:bg-purple-500 transition-colors"
            >
              {t("sensor.seeResults")}
            </button>
          </div>
        )}

      </div>
    </div>
    </TVScaleFrame>
  );
}
