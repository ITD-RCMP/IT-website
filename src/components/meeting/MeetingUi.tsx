import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, type LucideIcon } from "lucide-react";

export function Field({
  label,
  name,
  placeholder,
  value,
  onChange,
  autoFocus,
  icon: Icon,
  autoComplete = "off",
  enterKeyHint,
  children,
}: {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  icon?: LucideIcon;
  autoComplete?: string;
  enterKeyHint?: "next" | "done";
  children?: ReactNode;
}) {
  const filled = value.trim().length > 0;
  return (
    <div>
      <label className="block">
        <span className="font-mono text-[13px] text-neutral-500">{label}</span>
        <span className="relative mt-2 block">
          {Icon ? (
            <Icon
              className={`pointer-events-none absolute left-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 transition-colors ${
                filled ? "text-[#2F5BD3]" : "text-neutral-400"
              }`}
              strokeWidth={2}
            />
          ) : null}
          <input
            name={name}
            required
            maxLength={120}
            autoFocus={autoFocus}
            autoComplete={autoComplete}
            autoCapitalize="words"
            enterKeyHint={enterKeyHint}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`block w-full rounded-[18px] border border-neutral-200 bg-[#FAFAF8] py-4 pr-12 text-[16px] text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-[#2F5BD3] focus:bg-white focus:ring-4 focus:ring-[#2F5BD3]/10 ${
              Icon ? "pl-12" : "pl-5"
            }`}
          />
          <AnimatePresence>
            {filled ? (
              <motion.span
                className="pointer-events-none absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#2F5BD3] text-white"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 26 }}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
      </label>
      {children}
    </div>
  );
}

export function Stroke({ delay = 0.5 }: { delay?: number }) {
  return (
    <svg
      viewBox="0 0 300 30"
      preserveAspectRatio="none"
      className="absolute -bottom-[0.18em] left-[-4%] h-[0.28em] w-[108%] overflow-visible"
      aria-hidden="true"
    >
      <motion.path
        d="M4 24 C80 16 180 8 296 4"
        fill="none"
        stroke="#FFD93D"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="stroke-[5] md:stroke-[8]"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay, duration: 0.8, ease: "easeInOut" }}
      />
    </svg>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[28px] border border-neutral-200/70 bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export const darkPill =
  "group flex items-center justify-between gap-3 rounded-full bg-neutral-950 py-1.5 pl-6 pr-1.5 text-[15px] font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50";
export const lightPill =
  "group flex items-center justify-between gap-3 rounded-full bg-neutral-100 py-1.5 pl-6 pr-1.5 text-[15px] font-medium text-neutral-900 transition hover:bg-neutral-200";
export const pillIcon =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-neutral-950 shadow-sm transition-transform duration-300";
