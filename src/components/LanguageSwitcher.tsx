import { useLocale } from "../hooks/useLocale";
import type { Locale } from "../lib/i18n";

const LANGUAGES: { code: Locale; label: string }[] = [
  { code: "de", label: "DE" },
  { code: "tr", label: "TR" },
  { code: "en", label: "EN" },
];

interface LanguageSwitcherProps {
  className?: string;
  /** Dil değiştikten hemen sonra çalışır (örn. HostSetup kategori metnini o dilin varsayılanına yeniliyor). */
  onSwitch?: (locale: Locale) => void;
  /** Üç buton eşit genişlikte, mevcut alanı doldurarak yayılır (HostSetup gibi tam-genişlik formlarda). */
  fullWidth?: boolean;
}

/**
 * Üç dilli (DE/TR/EN) arayüz dili seçici. Kendi kendine yeterli — useLocale()
 * ile doğrudan konuşuyor, bu yüzden host header'dan oyuncu katılım ekranına
 * kadar her yere props geçirmeden eklenebiliyor.
 *
 * Bilerek `room.locale`'i DEĞİŞTİRMİYOR: o alan host'un kategori/oyun
 * içeriği için seçtiği dil, bu ise sadece görüntüleyenin kendi arayüz dili.
 * İkisini birbirine bağlamak, oyuncunun kendi seçtiği dilin oda değişince
 * sessizce ezilmesine yol açıyordu (bkz. PlayerJoin.tsx'teki eski davranış).
 */
export function LanguageSwitcher({ className = "", onSwitch, fullWidth = false }: LanguageSwitcherProps) {
  const { locale, switchLocale } = useLocale();

  return (
    // `className` sadece EKLENİYOR, taban `flex` düzenini ezmiyor —
    // çağıran taraf `grid` gibi çakışan bir display sınıfı geçerse hangisinin
    // kazanacağı Tailwind'in dahili kural sırasına kalır, öngörülemez olurdu.
    // Tam genişlik ihtiyacı `fullWidth` ile karşılanıyor.
    <div className={`flex items-center gap-1 ${className}`}>
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => {
            switchLocale(code);
            onSwitch?.(code);
          }}
          aria-pressed={locale === code}
          className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-md transition-colors ${
            fullWidth ? "flex-1 py-4 rounded-none" : ""
          } ${
            locale === code
              ? "bg-alaz-orange text-black"
              : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
