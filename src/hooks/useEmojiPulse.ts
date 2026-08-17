import { useEffect, useRef } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export function useEmojiPulse(
  roomId: string | null,
  onReaction?: (emoji: string) => void,
) {
  // Render sırasında Date.now() çağırmak saf değil (aynı render iki kez
  // çalışırsa farklı sonuç verir). Başlangıç zamanı abonelik kurulurken atanıyor.
  const lastProcessedTime = useRef<number>(0);

  useEffect(() => {
    if (!roomId) return;

    // Odaya girmeden önce gönderilmiş eski reaksiyonlar tekrar oynatılmasın
    lastProcessedTime.current = Date.now();

    const docRef = doc(db, "rooms", roomId, "transient", "emojiPulse");

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && onReaction) {
        const data = docSnap.data();
        if (data && data.timestamp > lastProcessedTime.current) {
          lastProcessedTime.current = data.timestamp;
          onReaction(data.emoji);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomId, onReaction]);

  const sendReaction = (emoji: string) => {
    if (!roomId) return;
    
    const docRef = doc(db, "rooms", roomId, "transient", "emojiPulse");
    setDoc(docRef, {
      emoji,
      timestamp: Date.now()
    }).catch(err => console.error("Error sending reaction:", err));

    // Haptic vibration if available
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  return { sendReaction };
}
