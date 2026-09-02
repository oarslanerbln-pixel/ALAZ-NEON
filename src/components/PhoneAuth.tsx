import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import type { ConfirmationResult } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "../hooks/useLocale";
import type { Locale } from "../lib/i18n";

// grecaptcha isn't part of the DOM lib types — it's injected by the reCAPTCHA
// script Firebase Auth loads. Only the bits used here are declared.
interface Grecaptcha {
  reset: (widgetId?: number) => void;
}

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    grecaptcha?: Grecaptcha;
  }
}

interface PhoneAuthProps {
  onSuccess: (uid: string, phoneNumber: string) => void;
  onCancel?: () => void;
}

interface Country {
  dialCode: string; // no "+"
  iso: string;
  flag: string;
  label: string;
  // Mobile national numbers aren't a fixed length everywhere — Turkish
  // numbers are always exactly 10 digits, German ones commonly run 10 or 11.
  minDigits: number;
  maxDigits: number;
}

// Oyun Berlin'de pazarlanacak: yerel (+49) VE Berlin'in çok büyük Türk
// topluluğu (+90) aynı gecede aynı barda oynayabilir.
const COUNTRIES: Country[] = [
  { dialCode: "49", iso: "DE", flag: "🇩🇪", label: "Deutschland", minDigits: 10, maxDigits: 11 },
  { dialCode: "90", iso: "TR", flag: "🇹🇷", label: "Türkiye", minDigits: 10, maxDigits: 10 },
];

function defaultCountryForLocale(locale: Locale): Country {
  return COUNTRIES.find((c) => c.iso === (locale === "tr" ? "TR" : "DE")) || COUNTRIES[0];
}

/**
 * Kullanıcının yazdığı ham rakamlardan baştaki tek bir "0"ı (varsa) atar —
 * hem TR hem DE'de numaralar neredeyse hep başında "0" ile yazılır/söylenir.
 */
function normalizeDigits(raw: string): string {
  return raw.startsWith("0") ? raw.slice(1) : raw;
}

function isValidLength(digits: string, country: Country): boolean {
  return digits.length >= country.minDigits && digits.length <= country.maxDigits;
}

// Ortak input stili — premium redesign'da PlayerJoin.tsx ile aynı dil
// (yuvarlak köşe, cam panel, ince kenarlık) burada da tekrar ediyor.
const fieldWrapClass =
  "flex items-center rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-alaz-orange/60 focus-within:bg-white/[0.06] transition-colors overflow-hidden";
const inputClass =
  "w-full bg-transparent px-4 py-4 text-white text-lg font-semibold tracking-wide placeholder:text-white/20 focus:outline-none";
const primaryButtonClass =
  "w-full rounded-2xl bg-alaz-orange text-black font-bold py-4 text-sm tracking-wide shadow-lg shadow-alaz-orange/20 hover:shadow-alaz-orange/40 hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed";

export function PhoneAuth({ onSuccess, onCancel }: PhoneAuthProps) {
  const { t, locale } = useLocale();
  const [country, setCountry] = useState<Country>(() => defaultCountryForLocale(locale));
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {},
        'expired-callback': () => {
          setError(t("phoneAuth.errRecaptchaExpired"));
        }
      });
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const digits = normalizeDigits(phoneNumber);
  const digitsValid = isValidLength(digits, country);

  // PhoneAuth, PlayerJoin'in KENDİ <form onSubmit={handleJoin}>'unun içine
  // (telefon doğrulaması bitene kadar) yerleştiriliyor. Burada da bir <form>
  // kullanmak HTML'de geçersiz bir iç içe form üretiyordu — tarayıcı bunu
  // tutarsız işliyor: "SEND SMS"e basınca handleSendCode hiç çalışmadan
  // sayfa doğrudan mevcut URL'e (GET /join?) native olarak yeniden
  // yükleniyordu, React state sıfırlanıyordu ve signInWithPhoneNumber asla
  // çağrılmıyordu — "numaramı yazınca SMS gelmiyor" hatasının birebir
  // sebebi buydu. Aşağıdaki iki adım artık <form> değil düz <div>; Enter
  // tuşuyla gönderme davranışını inputlardaki onKeyDown ile koruyoruz.
  const handleSendCode = async (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    if (!digitsValid) return;

    setError("");
    setLoading(true);

    try {
      const formattedNumber = `+${country.dialCode}${digits}`;
      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) {
        setError(t("phoneAuth.errRecaptcha"));
        return;
      }
      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      setConfirmationResult(confirmation);
    } catch (err: unknown) {
      console.error(err);
      setError(t("phoneAuth.errSendFailed"));
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId) => {
          window.grecaptcha?.reset(widgetId);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    if (!verificationCode || !confirmationResult) return;

    setError("");
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(verificationCode);
      const user = result.user;
      onSuccess(user.uid, user.phoneNumber || phoneNumber);
    } catch (err: unknown) {
      console.error(err);
      setError(t("phoneAuth.errInvalidCode"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div id="recaptcha-container"></div>

      <div className="text-center">
        <h2 className="text-lg font-bold text-white tracking-tight">
          {t("phoneAuth.title")}
        </h2>
        <p className="text-white/40 text-xs mt-1">
          {confirmationResult ? t("phoneAuth.subtitleAwaiting") : t("phoneAuth.subtitleEnterPhone")}
        </p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-xs font-medium overflow-hidden"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {!confirmationResult ? (
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="phone-input" className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                {t("phoneAuth.phoneLabel")}
              </label>
              {/* Ülke seçici: Berlin'de hem yerel (+49) hem çok büyük Türk
                  topluluğu (+90) numarasıyla katılan olacak. */}
              <div className="flex items-center gap-1">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.iso}
                    type="button"
                    onClick={() => {
                      setCountry(c);
                      setError("");
                    }}
                    aria-label={c.label}
                    aria-pressed={country.iso === c.iso}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-colors flex items-center gap-1 ${
                      country.iso === c.iso
                        ? "bg-alaz-orange text-black"
                        : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{c.flag}</span> +{c.dialCode}
                  </button>
                ))}
              </div>
            </div>
            <div className={fieldWrapClass}>
              <span className="pl-4 text-white/40 font-semibold text-base">+{country.dialCode}</span>
              <input
                id="phone-input"
                type="tel"
                required
                maxLength={country.maxDigits + 1}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={(e) => e.key === "Enter" && handleSendCode(e)}
                placeholder={country.iso === "DE" ? "151 2345678" : "555 123 4567"}
                autoFocus
                className={inputClass}
              />
            </div>
          </div>

          <motion.button
            whileHover={!loading ? { scale: 1.01 } : {}}
            whileTap={!loading ? { scale: 0.99 } : {}}
            type="button"
            onClick={() => handleSendCode()}
            disabled={loading || !digitsValid}
            className={primaryButtonClass}
          >
            {loading ? t("phoneAuth.sending") : t("phoneAuth.sendSms")}
          </motion.button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-white/30 hover:text-white/60 text-xs font-medium transition-colors"
            >
              {t("phoneAuth.cancel")}
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="code-input" className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
              {t("phoneAuth.codeLabel")}
            </label>
            <div className={fieldWrapClass}>
              <input
                id="code-input"
                type="text"
                required
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyCode(e)}
                placeholder="000000"
                autoFocus
                className={`${inputClass} text-center text-2xl tracking-[0.5em]`}
              />
            </div>
          </div>

          <motion.button
            whileHover={!loading ? { scale: 1.01 } : {}}
            whileTap={!loading ? { scale: 0.99 } : {}}
            type="button"
            onClick={() => handleVerifyCode()}
            disabled={loading || verificationCode.length < 6}
            className={primaryButtonClass}
          >
            {loading ? t("phoneAuth.verifying") : t("phoneAuth.verify")}
          </motion.button>

          <button
            type="button"
            onClick={() => {
              setConfirmationResult(null);
              setVerificationCode("");
              setError("");
            }}
            className="text-white/30 hover:text-white/60 text-xs font-medium transition-colors"
          >
            {t("phoneAuth.reenterNumber")}
          </button>
        </div>
      )}
    </div>
  );
}
