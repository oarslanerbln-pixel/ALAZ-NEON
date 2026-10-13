import { motion } from "framer-motion";

import { EASE, DURATION } from "../../lib/motion";

interface RevealTextProps {
  text: string;
  className?: string;
  /** İlk kelimeden önce bekleme (sn). */
  delay?: number;
  /** Kelimeler arası gecikme (sn). */
  stagger?: number;
  as?: "h1" | "h2" | "p" | "span";
}

/**
 * Metni kelime kelime aşağıdan süzerek açar (Motion Primitives "Text
 * Effect" / Magic UI "Blur Fade" deseni). Bulanıklık animasyonu paint
 * tetiklediği için yalnızca opacity + translateY kullanılıyor.
 *
 * Ekran okuyucu metni bütün olarak okur; parçalar `aria-hidden`.
 */
export function RevealText({ text, className = "", delay = 0, stagger = 0.06, as = "h1" }: RevealTextProps) {
  const Tag = motion[as];
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          aria-hidden="true"
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: "0.35em" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.slow, ease: EASE.out, delay: delay + i * stagger }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
