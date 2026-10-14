import type { ReactNode } from "react";

/**
 * Oyun ayarlarındaki "başlık + seçenek düğmeleri" ızgarası. Modalda aynı
 * işaretleme 14 kez kopyalanmıştı; yalnızca renkler ve sütun sayısı
 * değişiyordu (docs/roadmap.md, 2.7).
 */
export interface Option {
  value: string;
  label: string;
}

interface Props {
  label: ReactNode;
  /** Etiketin önündeki ikon; verilmezse etiket blok olarak durur. */
  icon?: ReactNode;
  labelClassName?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  /** Seçili düğmenin görünümü (renk, gölge). */
  activeClassName: string;
  columns: 2 | 3 | 4;
  /** Düğme metninin boyutu (bomba ayarları küçük ekranda daralıyordu). */
  textClassName?: string;
}

const GRID_COLUMNS = { 2: "grid-cols-2 gap-3", 3: "grid-cols-3 gap-2.5", 4: "grid-cols-4 gap-2.5" } as const;

export function OptionGrid({
  label,
  icon,
  labelClassName = "text-gray-300",
  options,
  value,
  onChange,
  activeClassName,
  columns,
  textClassName = "text-sm",
}: Props) {
  return (
    <div>
      <label
        className={`text-xs sm:text-sm font-mono uppercase tracking-[0.2em] font-black mb-2.5 ${labelClassName} ${
          icon ? "flex items-center gap-1.5" : "block"
        }`}
      >
        {icon}
        {icon ? <span>{label}</span> : label}
      </label>
      <div className={`grid ${GRID_COLUMNS[columns]}`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`py-3.5 rounded-xl font-mono font-black ${textClassName} transition-all border-2 cursor-pointer ${
              value === option.value
                ? `${activeClassName} scale-105`
                : "bg-white/5 border-white/15 text-gray-300 hover:border-white/40 hover:text-white"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
