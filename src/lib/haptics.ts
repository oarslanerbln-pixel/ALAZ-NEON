/**
 * Mobil cihazlar için güvenli dokunsal geri bildirim (Haptic Feedback).
 * Desteklenmeyen veya tarayıcı izin vermeyen durumlarda sessizce geçilir.
 */
export const haptics = {
  /** Hafif dokunuş: Buton tıklama, şık seçimi */
  tap: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        /* yoksay */
      }
    }
  },

  /** Başarı titreşimi: Doğru cevap, bomba paslama */
  success: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([30, 50, 40]);
      } catch {
        /* yoksay */
      }
    }
  },

  /** Uyarı titreşimi: Son saniye geri sayımı, bomba süresi daralması */
  warning: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(40);
      } catch {
        /* yoksay */
      }
    }
  },

  /** Güçlü etki: Bomba patlaması, buzzer basımı */
  impact: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([80, 40, 120]);
      } catch {
        /* yoksay */
      }
    }
  },
};
