import { motion } from "motion/react";

// Spinning purple asterisk used as a decoration across the site.
export function Asterisk({ className, duration = 14 }: { className?: string; duration?: number }) {
  return (
    <motion.svg
      viewBox="0 0 60 60"
      className={className}
      aria-hidden="true"
      animate={{ rotate: 360 }}
      transition={{ duration, ease: "linear", repeat: Infinity }}
    >
      {[0, 60, 120].map((r) => (
        <line
          key={r}
          x1="30"
          y1="8"
          x2="30"
          y2="52"
          stroke="currentColor"
          strokeWidth="13"
          strokeLinecap="round"
          transform={`rotate(${r} 30 30)`}
        />
      ))}
    </motion.svg>
  );
}
