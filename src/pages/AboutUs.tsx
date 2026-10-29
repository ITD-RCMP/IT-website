import React from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { FocusArt, type FocusKey } from "@/components/about/FocusArt";
import { Asterisk } from "@/components/Asterisk";

type Focus = {
  key: FocusKey;
  title: string;
  description: string;
  tags: [string, string, string, string];
  // horizontal placement of the word inside the right column
  align: string;
};

const FOCUS: Focus[] = [
  {
    key: "av",
    title: "Audio & Visual",
    description:
      "Meeting rooms, displays, projectors and presentation setups kept ready for teaching and events.",
    tags: ["Projectors", "MaxHub", "PA system", "Meeting rooms"],
    align: "self-start md:ml-[8%]",
  },
  {
    key: "network",
    title: "Network",
    description:
      "Wi‑Fi and LAN support with practical troubleshooting so the campus stays connected.",
    tags: ["Wi‑Fi", "LAN", "Access points", "Troubleshooting"],
    align: "self-end md:mr-[4%]",
  },
  {
    key: "system-dev",
    title: "System Development",
    description: "Internal systems and tools built to make university services faster and simpler.",
    tags: ["Web apps", "VenuQuip", "NexCheck", "Internal tools"],
    align: "self-start md:ml-[2%]",
  },
];

// Where each tag pops up around its word: top-left, top-right, bottom-left, bottom-right.
const TAG_POSITIONS = [
  "-top-7 left-[-6%]",
  "-top-6 right-[-10%]",
  "-bottom-8 left-[-14%]",
  "-bottom-7 right-[4%]",
];

function FocusWord({
  item,
  active,
  onActivate,
}: {
  item: Focus;
  active: boolean;
  onActivate: (key: FocusKey | null) => void;
}) {
  return (
    <div className={`relative ${item.align}`}>
      <button
        type="button"
        aria-expanded={active}
        onMouseEnter={() => onActivate(item.key)}
        onMouseLeave={() => onActivate(null)}
        onFocus={() => onActivate(item.key)}
        onBlur={() => onActivate(null)}
        onClick={() => onActivate(item.key)}
        className={`font-heading text-[clamp(2.5rem,6vw,5rem)] text-left font-semibold leading-none tracking-[-0.035em] transition-colors duration-300 outline-none ${
          active ? "text-[#2F5BD3]" : "text-neutral-950"
        }`}
      >
        {item.title}
      </button>

      <AnimatePresence>
        {active
          ? item.tags.map((tag, i) => (
              <motion.span
                key={tag}
                className={`pointer-events-none absolute whitespace-nowrap font-mono text-[13px] text-neutral-500 md:text-sm ${TAG_POSITIONS[i]}`}
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, transition: { duration: 0.12 } }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 380, damping: 24 }}
              >
                {tag}
              </motion.span>
            ))
          : null}
      </AnimatePresence>
    </div>
  );
}

export default function AboutUs({ authError = "" }: { authError?: string }) {
  const [active, setActive] = React.useState<FocusKey | null>(null);
  const activeItem = FOCUS.find((f) => f.key === active) ?? null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAFAF8] text-neutral-900">
      <HomeNavbar />

      {/* Headline */}
      <section className="mx-auto max-w-6xl px-6 pt-36 text-center md:pt-44">
        <motion.h1
          className="font-heading text-[clamp(2.6rem,7.5vw,7rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-neutral-950"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Support and Systems
          <br />
          behind{" "}
          <span className="relative inline-block">
            campus
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
                transition={{ delay: 0.6, duration: 0.8, ease: "easeInOut" }}
              />
            </svg>
          </span>{" "}
          life
        </motion.h1>

        <motion.p
          className="mx-auto mt-10 max-w-2xl text-[15px] leading-7 text-neutral-600 md:text-lg md:leading-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          From the projector in your lecture hall to the systems running in the background, we keep
          technology out of your way.
        </motion.p>
      </section>

      {/* What we do */}
      <section className="mx-auto mt-16 grid max-w-6xl items-center gap-10 px-6 pb-20 md:mt-24 md:grid-cols-2 md:gap-6">
        <div className="relative mx-auto w-full max-w-[460px]">
          <FocusArt active={active} className="h-auto w-full" />
          <AnimatePresence mode="wait">
            <motion.p
              key={activeItem?.key ?? "idle"}
              className="mx-auto mt-2 max-w-sm text-center text-sm leading-6 text-neutral-600"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {activeItem ? (
                activeItem.description
              ) : (
                <span className="font-mono text-neutral-400">Hover a service to explore</span>
              )}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="relative flex flex-col gap-16 py-8 md:gap-24">
          <Asterisk className="absolute left-[-6%] top-[42%] hidden w-10 text-[#7B61FF] md:block" />
          {FOCUS.map((item) => (
            <FocusWord
              key={item.key}
              item={item}
              active={active === item.key}
              onActivate={setActive}
            />
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl border-t border-neutral-200 px-6 pb-8 pt-8">
        {authError ? (
          <p className="mb-4 text-right text-sm font-medium text-red-600" role="alert">
            {authError}
          </p>
        ) : null}
        <p className="text-right text-xs font-medium text-neutral-400">
          <span className="mx-2 text-neutral-300" aria-hidden="true">
            ·
          </span>
          {import.meta.env.DEV ? (
            <Link to="/admin" className="text-neutral-300 transition hover:text-neutral-500">
              Staff
            </Link>
          ) : (
            <a
              href="/auth/microsoft/start"
              onClick={(event) => {
                event.preventDefault();
                window.location.assign("/auth/microsoft/start");
              }}
              className="text-neutral-300 transition hover:text-neutral-500"
            >
              Staff
            </a>
          )}
        </p>
      </footer>
    </main>
  );
}
