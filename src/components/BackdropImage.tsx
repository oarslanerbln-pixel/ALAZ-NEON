import { motion, type HTMLMotionProps } from "framer-motion";

/** Aynı görselin iki biçimi (scripts/optimize-images.mjs üretir). */
export interface BackdropSource {
  avif: string;
  webp: string;
}

type BackdropImageProps = { source: BackdropSource } & Omit<
  HTMLMotionProps<"img">,
  "src" | "alt" | "srcSet"
>;

/**
 * Dekoratif tam ekran arka plan görseli. AVIF destekleyen tarayıcı onu,
 * diğerleri WebP'yi indirir. Yalnızca süs olduğu için ekran okuyucudan
 * gizli ve düşük öncelikle iniyor: telefonun ilk yüklemesinde uygulama
 * koduyla ve Firestore bağlantısıyla yarışmasın.
 */
export function BackdropImage({ source, ...imgProps }: BackdropImageProps) {
  return (
    <picture>
      <source srcSet={source.avif} type="image/avif" />
      <motion.img
        {...imgProps}
        src={source.webp}
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority="low"
      />
    </picture>
  );
}
