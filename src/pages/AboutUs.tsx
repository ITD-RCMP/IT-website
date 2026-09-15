import React from "react";
import { Link } from "@tanstack/react-router";
import Tilt from "react-parallax-tilt";

const FOCUS = [
  {
    key: "av",
    title: "Audio & Visual",
    description:
      "Meeting rooms, displays, projectors and presentation setups kept ready for teaching and events.",
  },
  {
    key: "network",
    title: "Network",
    description:
      "Wi‑Fi and LAN support with practical troubleshooting so campus stays connected.",
  },
  {
    key: "system-dev",
    title: "System Development",
    description:
      "Internal systems and tools built to improve the efficiency of university services.",
  },
  {
    key: "helpdesk",
    title: "Helpdesk",
    description:
      "Day-to-day support for staff and students when technology gets in the way.",
  },
] as const;

export default function AboutUs({ authError = "" }: { authError?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [tilted, setTilted] = React.useState<(typeof FOCUS)[number]["key"] | null>(null);

  return (
    <>
      <main className="relative min-h-screen bg-white text-neutral-900">
        <header className="relative z-20 mx-auto flex max-w-5xl items-center justify-between px-6 pt-6">
          <Link to="/" aria-label="Home">
            <img
              src="/unikl-official.png"
              alt="UniKL Logo"
              className="h-8 w-auto object-contain md:h-10"
            />
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-neutral-700 md:flex">
            <Link to="/information" className="hover:text-neutral-900">Info</Link>
            <Link to="/about" className="text-neutral-900">About us</Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 md:hidden"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
            >
              Menu
            </button>
            <a href="http://rush.rcmp.edu.my" className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800">
              Get help
            </a>
          </div>
        </header>

        {mobileMenuOpen ? (
          <div className="relative z-20 mx-auto max-w-5xl px-6 pt-3 md:hidden">
            <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
              <Link
                to="/information"
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Information
              </Link>
              <Link
                to="/about"
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                About us
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mx-auto w-full max-w-5xl px-6 pb-10 pt-16 sm:pt-20">
          <p className="mb-4 font-heading text-sm font-semibold tracking-wide text-neutral-500">
            Information Technology Department — UniKL Royal College of Medicine Perak
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            Support is what people feel.
            <br />
            Systems are what keep campus running.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-7 text-neutral-600">
            We shape both: day-to-day help and the infrastructure behind it.
          </p>

          <section className="mt-16 grid gap-4 sm:grid-cols-2">
            {FOCUS.map((item) => {
              const active = tilted === item.key;
              return (
                <Tilt
                  key={item.key}
                  tiltEnable={active}
                  tiltMaxAngleX={10}
                  tiltMaxAngleY={10}
                  perspective={900}
                  transitionSpeed={600}
                  scale={active ? 1.03 : 1}
                  glareEnable={false}
                  gyroscope={false}
                  className="h-full"
                >
                  <article
                    role="button"
                    tabIndex={0}
                    aria-pressed={active}
                    onClick={() => setTilted(active ? null : item.key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setTilted(active ? null : item.key);
                      }
                    }}
                    className={`h-full cursor-pointer rounded-[22px] border bg-white p-6 text-left shadow-[0_8px_24px_rgba(0,0,0,0.04)] ${
                      active ? "border-neutral-900" : "border-neutral-200"
                    }`}
                  >
                    <h2 className="font-heading text-xl font-bold tracking-tight text-neutral-900">
                      {item.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-neutral-600 sm:text-[15px] sm:leading-7">
                      {item.description}
                    </p>
                  </article>
                </Tilt>
              );
            })}
          </section>

          <section className="mt-16 grid gap-10 border-t border-neutral-200 pt-12 sm:grid-cols-2 sm:gap-16">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900">
                Support
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600 sm:text-[15px] sm:leading-7">
                AV, network and helpdesk that keep teaching, events and daily campus work clear and usable.
              </p>
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900">
                Systems
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600 sm:text-[15px] sm:leading-7">
                Architecture, tools and internal development that keep services stable, efficient and ready to grow.
              </p>
            </div>
          </section>

          <footer className="mt-16 border-t border-neutral-200 pb-8 pt-8">
            {authError ? (
              <p className="mb-4 text-right text-sm font-medium text-red-600" role="alert">
                {authError}
              </p>
            ) : null}
            <p className="text-right text-xs font-medium text-neutral-400">
              © 2026 Information Technology Department RCMP
              <span className="mx-2 text-neutral-300" aria-hidden="true">
                ·
              </span>
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
            </p>
          </footer>
        </div>
      </main>

      <Link
        to="/feedback"
        className="fixed right-0 top-1/2 z-50 flex -translate-y-1/2 items-center rounded-l-md bg-[#0077C8] px-2.5 py-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#0066AD]"
        aria-label="Send Feedback"
      >
        <span className="rotate-180 [writing-mode:vertical-rl]">Send Feedback</span>
      </Link>
    </>
  );
}
