import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import type { ConfirmationResult } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

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

/**
 * Kullanıcının yazdığı ham rakamlardan baştaki tek bir "0"ı (varsa) atar.
 * "+90" arayüzde zaten sabit gösterildiği için beklenen format 10 haneli
 * "555 123 4567" — ama Türkiye'de insanlar numaralarını neredeyse hep
 * başında "0" ile söyler/yazar ("0555 123 45 67"). input eskiden maxLength=10
 * idi: kullanıcı "0" ile başlarsa 10. hanede kesiliyor, sonra bu "0" atılıyor
 * ve elde "555123456" gibi 9 haneli (SON HANESİ EKSİK) bir numara kalıyordu —
 * SMS ya hiç gitmiyor ya da yanlış/eksik bir numaraya gidiyordu. Artık 11
 * haneye kadar yazılabiliyor ve gerçek 10 haneyi her durumda bu fonksiyon
 * belirliyor.
 */
function normalizeDigits(raw: string): string {
  return raw.startsWith("0") ? raw.slice(1) : raw;
}

export function PhoneAuth({ onSuccess, onCancel }: PhoneAuthProps) {
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
          setError("TIMEOUT: RECAPTCHA EXPIRED.");
        }
      });
    }
    
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  const digits = normalizeDigits(phoneNumber);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (digits.length !== 10) return;

    setError("");
    setLoading(true);

    try {
      const formattedNumber = `+90${digits}`;
      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) {
        setError("ERR: RECAPTCHA NOT READY. TRY AGAIN.");
        return;
      }
      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      setConfirmationResult(confirmation);
    } catch (err: unknown) {
      console.error(err);
      setError("ERR: COULD NOT SEND SMS. CHECK NUMBER OR RECAPTCHA.");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId) => {
          window.grecaptcha?.reset(widgetId);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !confirmationResult) return;

    setError("");
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(verificationCode);
      const user = result.user;
      onSuccess(user.uid, user.phoneNumber || phoneNumber);
    } catch (err: unknown) {
      console.error(err);
      setError("ERR: INVALID CODE.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div id="recaptcha-container"></div>
      
      <div className="text-center mb-8 flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#ff003c] uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,0,60,0.8)] flex justify-center items-center gap-2">
          &gt; IDENTIFICATION <span className="w-3 h-8 bg-[#ff003c] animate-pulse" />
        </h2>
        <p className="text-alaz-orange mt-4 uppercase tracking-[0.3em] text-xs">
          {confirmationResult ? "AWAITING CONFIRMATION..." : "SECURE LOGIN REQUIRED"}
        </p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#ff003c]/10 border-l-2 border-[#ff003c] p-4 text-[#ff003c] text-xs uppercase tracking-wider mb-6"
          >
            <span className="font-bold">SYSTEM ERROR:</span> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {!confirmationResult ? (
        <form onSubmit={handleSendCode} className="space-y-6">
          <div className="group">
            <label className="flex items-center gap-2 text-alaz-orange/70 text-xs font-bold uppercase tracking-widest mb-2">
              <span className="text-[#ff003c]">[ID]</span> PHONE NUMBER
            </label>
            <div className="flex bg-alaz-orange/5 border border-alaz-orange/30 group-focus-within:border-alaz-orange transition-colors">
              <div className="px-4 py-4 border-r border-alaz-orange/30 text-alaz-orange font-bold bg-alaz-orange/10 flex items-center justify-center">
                +90
              </div>
              <input
                type="tel"
                required
                maxLength={11}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="555 123 4567"
                className="w-full px-4 py-4 text-xl tracking-[0.2em] font-bold focus:outline-none bg-transparent text-alaz-orange placeholder:text-alaz-orange/20"
              />
            </div>
          </div>

          <motion.button
            whileHover={!loading ? { scale: 1.01, backgroundColor: "rgba(255, 77, 0, 0.2)" } : {}}
            whileTap={!loading ? { scale: 0.99 } : {}}
            type="submit"
            disabled={loading || digits.length !== 10}
            className={`w-full py-5 border-2 transition-all font-bold tracking-[0.3em] uppercase text-sm mt-8 ${
              loading
                ? "border-gray-700 text-gray-500 cursor-not-allowed"
                : digits.length === 10
                  ? "border-[#ff003c] text-[#ff003c] bg-[#ff003c]/10 hover:shadow-[0_0_20px_rgba(255,0,60,0.4)]"
                  : "border-alaz-orange/30 text-alaz-orange/50 hover:border-alaz-orange hover:text-alaz-orange"
            }`}
          >
            {loading ? "TRANSMITTING..." : "SEND SMS"}
          </motion.button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full text-alaz-orange/50 hover:text-alaz-orange text-xs uppercase tracking-widest mt-4 transition-colors"
            >
              [ CANCEL_OPERATION ]
            </button>
          )}
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div className="group">
            <label className="flex items-center gap-2 text-alaz-orange/70 text-xs font-bold uppercase tracking-widest mb-2">
              <span className="text-[#ff003c]">[KEY]</span> 6-DIGIT CODE
            </label>
            <div className="flex bg-[#ff003c]/5 border border-[#ff003c]/30 group-focus-within:border-[#ff003c] transition-colors">
              <div className="px-4 py-4 border-r border-[#ff003c]/30 text-[#ff003c] font-bold bg-[#ff003c]/10 flex items-center justify-center">
                &gt;
              </div>
              <input
                type="text"
                required
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-4 text-2xl tracking-[0.5em] text-center font-bold focus:outline-none bg-transparent text-[#ff003c] placeholder:text-[#ff003c]/20"
              />
            </div>
          </div>
          
          <motion.button
            whileHover={!loading ? { scale: 1.01, backgroundColor: "rgba(255, 0, 60, 0.2)" } : {}}
            whileTap={!loading ? { scale: 0.99 } : {}}
            type="submit"
            disabled={loading || verificationCode.length < 6}
            className={`w-full py-5 border-2 transition-all font-bold tracking-[0.3em] uppercase text-sm mt-8 ${
              loading
                ? "border-gray-700 text-gray-500 cursor-not-allowed"
                : verificationCode.length === 6
                  ? "border-[#ff003c] text-[#ff003c] bg-[#ff003c]/10 hover:shadow-[0_0_20px_rgba(255,0,60,0.4)]"
                  : "border-[#ff003c]/30 text-[#ff003c]/50 hover:border-[#ff003c] hover:text-[#ff003c]"
            }`}
          >
            {loading ? "VERIFYING..." : "ACCESS GRANTED"}
          </motion.button>

          <button
            type="button"
            onClick={() => {
              setConfirmationResult(null);
              setVerificationCode("");
              setError("");
            }}
            className="w-full text-alaz-orange/50 hover:text-alaz-orange text-xs uppercase tracking-widest mt-4 transition-colors"
          >
            [ RE-ENTER NUMBER ]
          </button>
        </form>
      )}
    </div>
  );
}
