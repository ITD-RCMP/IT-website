import type { ReactElement } from "react";
import { AnimatePresence, motion } from "motion/react";

export type FocusKey = "av" | "network" | "system-dev";

const STROKE = "#2F5BD3";
const LAYERS = Array.from({ length: 14 }, (_, i) => i);

// Interlocking rings, each drawn from a stack of slightly offset ellipses.
function Rings() {
  return (
    <>
      {[
        { cx: 210, cy: 190, tilt: -38, dir: 1 },
        { cx: 290, cy: 270, tilt: 38, dir: -1 },
      ].map((ring) => (
        <motion.g
          key={ring.tilt}
          animate={{ rotate: [ring.tilt, ring.tilt + 360 * ring.dir] }}
          transition={{ duration: 60, ease: "linear", repeat: Infinity }}
        >
          {LAYERS.map((i) => (
            <ellipse
              key={i}
              cx={ring.cx}
              cy={ring.cy}
              rx={150 + i * 2.2}
              ry={92 + i * 1.6}
              transform={`rotate(${i * 1.4} ${ring.cx} ${ring.cy})`}
              fill="none"
              stroke={STROKE}
              strokeWidth={i === 0 || i === LAYERS.length - 1 ? 1.6 : 0.8}
              opacity={i === 0 ? 0.9 : 0.45}
            />
          ))}
        </motion.g>
      ))}
    </>
  );
}

// Ripples spreading out like sound from a speaker.
function Waves() {
  return (
    <>
      {LAYERS.map((i) => (
        <motion.circle
          key={i}
          cx={250}
          cy={230}
          r={24 + i * 13}
          fill="none"
          stroke={STROKE}
          strokeWidth={i % 4 === 0 ? 1.6 : 0.8}
          animate={{ opacity: [0.15, 0.85, 0.15] }}
          transition={{ duration: 2.4, delay: i * 0.12, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <circle cx={250} cy={230} r={14} fill={STROKE} />
    </>
  );
}

// Twisted stack of squares, like a block being built up.
function Blocks() {
  return (
    <motion.g
      animate={{ rotate: 360 }}
      transition={{ duration: 50, ease: "linear", repeat: Infinity }}
    >
      {LAYERS.map((i) => {
        const size = 140 + i * 9;
        return (
          <rect
            key={i}
            x={250 - size / 2}
            y={230 - size / 2}
            width={size}
            height={size}
            rx={10}
            transform={`rotate(${i * 4.5} 250 230)`}
            fill="none"
            stroke={STROKE}
            strokeWidth={i === 0 || i === LAYERS.length - 1 ? 1.6 : 0.8}
            opacity={i === 0 ? 0.9 : 0.45}
          />
        );
      })}
    </motion.g>
  );
}

const SHAPES: Record<FocusKey | "idle", () => ReactElement> = {
  idle: Rings,
  av: Waves,
  network: Rings,
  "system-dev": Blocks,
};

export function FocusArt({ active, className }: { active: FocusKey | null; className?: string }) {
  const key = active ?? "idle";
  // idle and network share the same rings, so keep them mounted between the two
  const shapeKey = key === "network" ? "idle" : key;
  const Shape = SHAPES[key];

  return (
    <svg viewBox="0 0 500 460" className={className} aria-hidden="true">
      <AnimatePresence mode="wait">
        <motion.g
          key={shapeKey}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Shape />
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}
