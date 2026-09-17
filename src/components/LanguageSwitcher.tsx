import { useLocale } from "../hooks/useLocale";
import type { Locale } from "../lib/i18n";

// `ariaLabel` bilerek t() üzerinden GEÇMİYOR: dil adları her zaman kendi
// dillerinde okunmalı. Arayüz Türkçedeyken Alman misafirin "Almanca"
// duyması işe yaramaz, aradığı şey "Deutsch". Bu yüzden a11yLabels
// testinin t() kuralının dışında kalıyorlar; `lang` özniteliği de ekran
// okuyucunun her adı doğru telaffuz etmesi için düğmenin üzerinde.
const LANGUAGES: { code: Locale; label: string; ariaLabel: string }[] = [
  { code: "de", label: "DE", ariaLabel: "Deutsch" },
  { code: "tr", label: "TR", ariaLabel: "Türkçe" },
  { code: "en", label: "EN", ariaLabel: "English" },
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
  const { locale, switchLocale, t } = useLocale();

  return (
    // `className` sadece EKLENİYOR, taban `flex` düzenini ezmiyor —
    // çağıran taraf `grid` gibi çakışan bir display sınıfı geçerse hangisinin
    // kazanacağı Tailwind'in dahili kural sırasına kalır, öngörülemez olurdu.
    // Tam genişlik ihtiyacı `fullWidth` ile karşılanıyor.
    <div
      role="group"
      aria-label={t("common.languageSwitcher")}
      className={`flex items-center gap-2 p-1 bg-black/40 border border-white/5 rounded-sm shadow-inner ${className}`}
    >
      {LANGUAGES.map(({ code, label, ariaLabel }) => (
        <button
          key={code}
          type="button"
          lang={code}
          onClick={() => {
            switchLocale(code);
            onSwitch?.(code);
          }}
          aria-pressed={locale === code}
          aria-label={ariaLabel}
          className={`relative px-4 py-2 text-xs font-black uppercase tracking-[0.2em] rounded-sm transition-all duration-300 ${
            fullWidth ? "flex-1 py-4" : ""
          } ${
            locale === code
              ? "bg-gradient-to-b from-alaz-orange to-[#cc4400] text-black shadow-[0_0_20px_rgba(255,85,0,0.6)] border border-alaz-orange scale-[1.02] z-10"
              : "bg-transparent text-white/30 hover:text-white/80 hover:bg-white/5 border border-transparent hover:border-white/10"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
