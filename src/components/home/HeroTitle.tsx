import { motion } from "motion/react";

// Hand-drawn strokes laid over the title. The SVG stretches to the title box
// (viewBox 1000x300 maps to the title plus padding), so strokes use
// non-scaling-stroke to keep an even marker width.
const STROKES = [
  {
    d: "M200 268 C150 300 105 240 130 150 C150 70 200 10 250 14 C300 18 290 90 255 150 C220 210 180 270 150 292",
    color: "#2F6BFF",
    width: "stroke-[5] md:stroke-[9]",
    delay: 0.35,
  },
  {
    d: "M30 286 C180 262 330 246 470 236",
    color: "#FFD93D",
    width: "stroke-[6] md:stroke-[11]",
    delay: 0.75,
  },
  {
    d: "M50 298 C200 272 340 256 450 248",
    color: "#FFD93D",
    width: "stroke-[4] md:stroke-[7]",
    delay: 0.9,
  },
  {
    d: "M705 246 C790 242 880 240 975 242",
    color: "#FFD93D",
    width: "stroke-[5] md:stroke-[9]",
    delay: 1.05,
  },
  {
    d: "M905 18 C915 100 880 190 820 245 C790 272 760 300 790 296 C825 290 800 250 765 262 C730 274 700 290 650 292",
    color: "#FF7A2F",
    width: "stroke-[4] md:stroke-[8]",
    delay: 0.55,
  },
];

function Asterisk({ className, duration }: { className: string; duration: number }) {
  return (
    <motion.svg
      viewBox="0 0 60 60"
      className={className}
      aria-hidden="true"
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 270 }}
      transition={{
        scale: { type: "spring", stiffness: 200, damping: 12, delay: 1.1 },
        rotate: { duration, ease: "linear", repeat: Infinity },
      }}
    >
      {[0, 60, 120].map((r) => (
        <line
          key={r}
          x1="30"
          y1="8"
          x2="30"
          y2="52"
          stroke="#7B61FF"
          strokeWidth="13"
          strokeLinecap="round"
          transform={`rotate(${r} 30 30)`}
        />
      ))}
    </motion.svg>
  );
}

export function HeroTitle() {
  return (
    <div className="pointer-events-none relative z-10 select-none text-center">
      <div className="relative inline-block">
        <motion.h1
          className="font-display whitespace-nowrap text-[16vw] font-black leading-[0.9] tracking-[-0.02em] text-neutral-950 [font-stretch:125%] md:text-[clamp(5rem,12.5vw,13rem)]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span aria-hidden="true">IT DEPT</span>
          <span className="sr-only">Information Technology Department, UniKL RCMP</span>
        </motion.h1>

        <svg
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
          className="absolute -inset-x-[6%] -inset-y-[28%] h-[156%] w-[112%] overflow-visible"
          aria-hidden="true"
        >
          {STROKES.map((s) => (
            <motion.path
              key={s.d}
              d={s.d}
              fill="none"
              stroke={s.color}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className={s.width}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { duration: 0.9, delay: s.delay, ease: "easeInOut" },
                opacity: { duration: 0.01, delay: s.delay },
              }}
            />
          ))}
        </svg>

        <Asterisk className="absolute left-[47%] top-[-30%] w-[9%]" duration={14} />
        <Asterisk className="absolute bottom-[-42%] left-[14%] w-[5%]" duration={10} />
      </div>

      <motion.p
        className="mt-16 text-[13px] font-medium text-neutral-700 md:mt-[clamp(3.5rem,6vw,6rem)] md:text-[15px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        Explore our services and guidelines to enhance your experience.
      </motion.p>
    </div>
  );
}
