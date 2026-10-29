import React from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import type { Service } from "./services";

// Ring tilt, in radians, so the orbit leans like a planet's ring.
const TILT = (-4 * Math.PI) / 180;
// One full lap every 80 seconds.
const SPEED = (Math.PI * 2) / 80_000;

type Placement = { above: boolean; offset: number; align: "start" | "center" | "end" };

export function OrbitRing({
  services,
  onActivate,
  className,
}: {
  services: Service[];
  onActivate: (service: Service, e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const angle = useMotionValue(0);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const speed = React.useRef(1);
  const pausedRef = React.useRef(false);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = React.useState<number | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      rx.set(width * 0.42);
      ry.set(height * 0.33);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [rx, ry]);

  useAnimationFrame((_, delta) => {
    const dt = Math.min(delta, 50);
    const target = pausedRef.current || reduceMotion ? 0 : 1;
    // ease the speed so the ring glides to a stop instead of snapping
    speed.current += (target - speed.current) * Math.min(1, dt / 90);
    if (speed.current > 0.0005) angle.set(angle.get() + dt * SPEED * speed.current);
  });

  const activate = (i: number | null) => {
    pausedRef.current = i !== null;
    setActive(i);
  };

  return (
    <div
      ref={ref}
      className={`[--card-h:96px] [--card-w:96px] lg:[--card-h:124px] lg:[--card-w:124px] ${className ?? ""}`}
      onMouseLeave={() => activate(null)}
    >
      {services.map((service, i) => (
        <OrbitCard
          key={service.label}
          service={service}
          offset={(i / services.length) * Math.PI * 2}
          angle={angle}
          rx={rx}
          ry={ry}
          isActive={active === i}
          onEnter={() => activate(i)}
          onLeave={() => activate(null)}
          onActivate={onActivate}
        />
      ))}
    </div>
  );
}

function OrbitCard({
  service,
  offset,
  angle,
  rx,
  ry,
  isActive,
  onEnter,
  onLeave,
  onActivate,
}: {
  service: Service;
  offset: number;
  angle: MotionValue<number>;
  rx: MotionValue<number>;
  ry: MotionValue<number>;
  isActive: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onActivate: (service: Service, e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const cardRef = React.useRef<HTMLAnchorElement>(null);
  const [placement, setPlacement] = React.useState<Placement>({
    above: true,
    offset: 0,
    align: "center",
  });

  const theta = useTransform(angle, (a) => a + offset);
  // -1 = far side of the ring (top), 1 = near side (bottom)
  const depth = useTransform(theta, (t) => Math.sin(t));
  const x = useTransform(
    [theta, rx, ry],
    ([t, a, b]: number[]) => a * Math.cos(t) * Math.cos(TILT) - b * Math.sin(t) * Math.sin(TILT),
  );
  const y = useTransform(
    [theta, rx, ry],
    ([t, a, b]: number[]) => a * Math.cos(t) * Math.sin(TILT) + b * Math.sin(t) * Math.cos(TILT),
  );
  const scale = useTransform(depth, [-1, 1], [0.55, 1.15]);
  const opacity = useTransform(depth, [-1, 1], [0.75, 1]);
  const rotateY = useTransform(theta, (t) => -Math.cos(t) * 20);
  // near-side cards pass in front of the title (z-10), far-side ones behind it
  const zIndex = useTransform(depth, (d) => (d > 0.1 ? 20 : 5));

  const handleEnter = () => {
    const card = cardRef.current;
    const ringX = rx.get();
    const cx = x.get();
    setPlacement({
      above: y.get() > 0,
      offset: ((card?.offsetHeight ?? 140) * scale.get() * 1.06) / 2 + 14,
      align: cx > ringX * 0.55 ? "end" : cx < -ringX * 0.55 ? "start" : "center",
    });
    onEnter();
  };

  const { Art, label, href, tilt } = service;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        x,
        y,
        zIndex: isActive ? 50 : zIndex,
        width: "var(--card-w)",
        height: "var(--card-h)",
        marginLeft: "calc(var(--card-w) / -2)",
        marginTop: "calc(var(--card-h) / -2)",
      }}
    >
      <motion.a
        ref={cardRef}
        href={href}
        aria-label={label}
        onClick={(e) => onActivate(service, e)}
        onMouseEnter={handleEnter}
        onMouseLeave={onLeave}
        onFocus={handleEnter}
        onBlur={onLeave}
        className="block h-full w-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40"
        style={{ scale, opacity: isActive ? 1 : opacity, transformPerspective: 900 }}
      >
        <motion.span
          className="block h-full w-full"
          style={{ rotateY }}
          initial={false}
          animate={{
            rotate: isActive ? 0 : tilt,
            scale: isActive ? 1.06 : 1,
            filter: isActive
              ? "drop-shadow(0 18px 22px rgba(0,0,0,0.28))"
              : "drop-shadow(0 10px 14px rgba(0,0,0,0.18))",
          }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <Art className="h-full w-full" />
        </motion.span>
      </motion.a>

      <AnimatePresence>
        {isActive ? <ServicePopup service={service} placement={placement} key="popup" /> : null}
      </AnimatePresence>
    </motion.div>
  );
}

function ServicePopup({ service, placement }: { service: Service; placement: Placement }) {
  const { Icon, imgSrc, imgAlt, iconClassName, label, description, section, bg, fg } = service;
  const { above, offset, align } = placement;
  const shiftX = align === "start" ? "-18%" : align === "end" ? "-82%" : "-50%";

  return (
    <motion.div
      role="tooltip"
      className="pointer-events-none absolute left-1/2 w-64"
      style={{
        x: shiftX,
        ...(above ? { bottom: `calc(50% + ${offset}px)` } : { top: `calc(50% + ${offset}px)` }),
      }}
      initial={{ opacity: 0, y: above ? 8 : -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: above ? 6 : -6, scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 text-left shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)]">
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg}`}>
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={imgAlt ?? label}
                className={`h-5 w-5 object-contain ${iconClassName ?? ""}`}
              />
            ) : Icon ? (
              <Icon className={`h-5 w-5 ${fg}`} strokeWidth={2.2} />
            ) : null}
          </span>
          <span className="text-[15px] font-semibold text-neutral-900">{label}</span>
        </div>
        <p className="mt-2.5 text-[13px] leading-snug text-neutral-600">{description}</p>
        <div className="mt-3 flex items-center gap-1.5 border-t border-neutral-100 pt-2.5 text-[12px] font-semibold text-neutral-900">
          {section ? (
            <>
              Click to view below <ArrowDown className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Click to open <ArrowUpRight className="h-3.5 w-3.5" />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
