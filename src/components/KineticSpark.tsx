import { motion } from 'framer-motion';

interface KineticSparkProps {
    className?: string;
    fontSizeAlaz?: string;
    fontSizeNeon?: string;
    sparkRadius?: number;
    delay?: number;
    showTagline?: boolean;
    tagline?: string;
}

export function KineticSpark({
    className = "",
    fontSizeAlaz = "text-[14rem]",
    fontSizeNeon = "text-[12rem]",
    sparkRadius = 6,
    delay = 0,
    showTagline = false,
    tagline = "Ancient Fire • Modern Soul"
}: KineticSparkProps) {
    return (
        <div className={`relative w-full noise-suppression overflow-visible ${className}`}>
            <svg viewBox="0 0 1000 450" className="w-full h-auto drop-shadow-[0_0_50px_rgba(255,77,0,0.2)] overflow-visible">
                <defs>
                    <filter id="sparkGlowUniversal">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* ALAZ (SVG Text) */}
                <motion.text
                    x="50%"
                    y="40%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`${fontSizeAlaz} font-black italic tracking-tighter`}
                    style={{
                        fill: "none",
                        stroke: "rgba(255, 77, 0, 0.4)",
                        strokeWidth: 1.5,
                    }}
                    initial={{ strokeDasharray: 2000, strokeDashoffset: 2000 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 2, ease: "easeInOut", delay }}
                >
                    ALAZ
                </motion.text>

                {/* NEON (SVG Text) */}
                <motion.text
                    x="50%"
                    y="75%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`${fontSizeNeon} font-black tracking-[0.3em]`}
                    style={{
                        fill: "none",
                        stroke: "rgba(0, 243, 255, 0.4)",
                        strokeWidth: 1.5,
                    }}
                    initial={{ strokeDasharray: 2000, strokeDashoffset: 2000 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 2, ease: "easeInOut", delay: delay + 1 }}
                >
                    NEON
                </motion.text>

                {/* Kinetic Spark Tracer (ALAZ) */}
                <motion.circle
                    r={sparkRadius}
                    className="fill-white"
                    style={{ filter: "url(#sparkGlowUniversal)" }}
                    initial={{ cx: "5%", cy: "40%", opacity: 0 }}
                    animate={{
                        cx: ["5%", "95%"],
                        opacity: [0, 1, 1, 0]
                    }}
                    transition={{
                        delay,
                        duration: 2,
                        ease: "easeInOut",
                        times: [0, 0.1, 0.9, 1]
                    }}
                />

                {/* Kinetic Spark Tracer (NEON) */}
                <motion.circle
                    r={sparkRadius}
                    className="fill-white"
                    style={{ filter: "url(#sparkGlowUniversal)" }}
                    initial={{ cx: "5%", cy: "75%", opacity: 0 }}
                    animate={{
                        cx: ["5%", "95%"],
                        opacity: [0, 1, 1, 0]
                    }}
                    transition={{
                        delay: delay + 1,
                        duration: 2,
                        ease: "easeInOut",
                        times: [0, 0.1, 0.9, 1]
                    }}
                />

                {/* Final Fill Reveal */}
                <motion.g
                    initial={{ opacity: 0, filter: "blur(20px)" }}
                    animate={{
                        opacity: [0, 1, 0.8, 1],
                        filter: "blur(0px)"
                    }}
                    transition={{
                        delay: delay + 2.5,
                        duration: 1.5,
                        times: [0, 0.7, 0.8, 1]
                    }}
                >
                    <text x="50%" y="40%" textAnchor="middle" dominantBaseline="middle" className={`${fontSizeAlaz} font-black italic tracking-tighter text-glow-premium-alaz fill-white/5`}>ALAZ</text>
                    <text x="50%" y="75%" textAnchor="middle" dominantBaseline="middle" className={`${fontSizeNeon} font-black tracking-[0.3em] text-glow-premium-blue fill-white/5`}>NEON</text>
                </motion.g>
            </svg>

            {showTagline && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.8, y: 0 }}
                    transition={{ delay: delay + 3.5, duration: 1 }}
                    className="text-alaz-orange text-xl md:text-2xl tracking-[0.3em] uppercase font-bold mt-4 text-center"
                >
                    {tagline}
                </motion.p>
            )}
        </div>
    );
}
