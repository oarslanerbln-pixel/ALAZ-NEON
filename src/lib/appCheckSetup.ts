/**
 * Firebase App Check kurulumu (docs/roadmap.md, 1.6).
 *
 * App Check, Firestore'a gelen isteğin gerçekten bu uygulamadan geldiğini
 * reCAPTCHA v3 ile doğrular. Böylece betiklerle ya da başka sitelerden
 * gelen istekler kotayı tüketemez. Anahtar tanımlı değilse hiçbir şey
 * değişmez: App Check devreye girmez ve uygulama bugünkü gibi çalışır.
 * Zorunlu kılma Firebase konsolundan, istemciler hazır olduktan sonra açılır
 * (README → App Check).
 */
export interface AppCheckEnv {
  /** VITE_RECAPTCHA_SITE_KEY — reCAPTCHA v3 site anahtarı (gizli değil). */
  siteKey?: string;
  /** VITE_APPCHECK_DEBUG_TOKEN — konsolda kayıtlı sabit hata ayıklama jetonu (CI/test). */
  debugToken?: string;
  /** Vite geliştirme sunucusu mu (import.meta.env.DEV). */
  dev: boolean;
}

export interface AppCheckSetup {
  siteKey: string;
  /**
   * `self.FIREBASE_APPCHECK_DEBUG_TOKEN` değeri. `true` → SDK yeni bir jeton
   * üretip konsola yazar (konsolda bir kez kaydedilir); dize → önceden
   * kaydedilmiş jeton; `null` → üretim, hata ayıklama sağlayıcısı kapalı.
   */
  debugToken: string | true | null;
}

export function appCheckSetup(env: AppCheckEnv): AppCheckSetup | null {
  const siteKey = env.siteKey?.trim();
  if (!siteKey) return null;

  const fixedToken = env.debugToken?.trim();
  if (fixedToken) return { siteKey, debugToken: fixedToken };

  // localhost reCAPTCHA'dan geçemez; localhost'u reCAPTCHA'nın izinli alan
  // adlarına eklemek ise herkesin uygulamayı kendi makinesinden çalıştırmasına
  // izin verir. Geliştirmede bu yüzden hata ayıklama sağlayıcısı kullanılıyor.
  return { siteKey, debugToken: env.dev ? true : null };
}
