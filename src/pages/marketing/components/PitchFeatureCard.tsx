import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import type { MouseEvent } from "react";

interface PitchFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
  className?: string;
  glowColor?: "cyan" | "orange" | "purple";
}

export function PitchFeatureCard({
  title,
  description,
  icon,
  delay = 0,
  className,
  glowColor = "cyan",
}: PitchFeatureCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const glowVar =
    glowColor === "cyan"
      ? "rgba(34, 211, 238, 0.15)"
      : glowColor === "orange"
      ? "rgba(255, 77, 0, 0.15)"
      : "rgba(168, 85, 247, 0.15)";

  const borderVar =
    glowColor === "cyan"
      ? "rgba(34, 211, 238, 0.4)"
      : glowColor === "orange"
      ? "rgba(255, 77, 0, 0.4)"
      : "rgba(168, 85, 247, 0.4)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      onMouseMove={handleMouseMove}
      className={[
        "group relative flex flex-col items-center text-center p-8 rounded-3xl",
        "bg-white/[0.02] border border-white/5 backdrop-blur-md overflow-hidden",
        "hover:border-white/10 transition-colors duration-500",
        className
      ].filter(Boolean).join(" ")}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              ${glowVar},
              transparent 80%
            )
          `,
        }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          border: useMotionTemplate`1px solid ${borderVar}`,
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              250px circle at ${mouseX}px ${mouseY}px,
              black,
              transparent 80%
            )
          `,
          maskImage: useMotionTemplate`
            radial-gradient(
              250px circle at ${mouseX}px ${mouseY}px,
              black,
              transparent 80%
            )
          `,
        }}
      />

      <div
        className={[
          "mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10",
          glowColor === "cyan" && "text-neon-blue shadow-[0_0_20px_rgba(34,211,238,0.2)]",
          glowColor === "orange" && "text-alaz-orange shadow-[0_0_20px_rgba(255,77,0,0.2)]",
          glowColor === "purple" && "text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
        ].filter(Boolean).join(" ")}
      >
        {icon}
      </div>

      <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-4">
        {title}
      </h3>
      <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-sm">
        {description}
      </p>
    </motion.div>
  );
}
