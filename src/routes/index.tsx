import React from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Wifi, Monitor, GraduationCap, LayoutDashboard, Projector, Cloud, Headphones, Megaphone } from "lucide-react";
import { MaxhubSection } from "../components/section/Maxhub";
import { SystemSection } from "../components/section/System";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  createSeoHead,
  organizationJsonLd,
  webSiteJsonLd,
} from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    createSeoHead({
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      path: "/",
      jsonLd: [organizationJsonLd(), webSiteJsonLd()],
    }),
  component: Index,
});

type FloatIcon = {
  Icon?: typeof Wifi;
  imgSrc?: string;
  imgAlt?: string;
  iconClassName?: string;
  label: string;
  href: string;
  bg: string;
  fg: string;
  // desktop position (percent)
  top: string;
  left: string;
  delay: string;
  duration: string;
};

const ICONS: FloatIcon[] = [
  { Icon: Megaphone, label: "Info", href: "/information", bg: "bg-[#0A84FF]", fg: "text-white", top: "10%", left: "8%", delay: "0s", duration: "7s" },
  { Icon: Monitor, label: "Systems", href: "#", bg: "bg-neutral-900", fg: "text-white", top: "6%", left: "28%", delay: "1.2s", duration: "8s" },
  { Icon: GraduationCap, label: "UniKL VLE", href: "https://vle.unikl.edu.my/", bg: "bg-[#FFCC00]", fg: "text-neutral-900", top: "14%", left: "70%", delay: "0.6s", duration: "9s" },
  { Icon: LayoutDashboard, label: "Portal", href: "https://cas.unikl.edu.my/", bg: "bg-[#FF3B30]", fg: "text-white", top: "8%", left: "88%", delay: "2s", duration: "7.5s" },
  { imgSrc: "/maxhub.png", imgAlt: "MaxHub", iconClassName: "invert", label: "MaxHub Connect", href: "#", bg: "bg-neutral-950", fg: "text-white", top: "78%", left: "10%", delay: "0.9s", duration: "8s" },
  { Icon: Projector, label: "Epson iProjection", href: "https://epson.com/support/wireless-projector-support", bg: "bg-white border border-neutral-200", fg: "text-neutral-900", top: "82%", left: "30%", delay: "1.5s", duration: "7s" },
  { Icon: Cloud, label: "Cloud Drive", href: "https://www.office.com/", bg: "bg-[#0061FE]", fg: "text-white", top: "76%", left: "84%", delay: "2.2s", duration: "8.2s" },
  { Icon: Headphones, label: "Helpdesk", href: "http://rush.rcmp.edu.my", bg: "bg-[#FF9500]", fg: "text-white", top: "70%", left: "70%", delay: "1.7s", duration: "8.7s" },
];

function FloatingIcon({
  item,
  index,
  onClick,
}: {
  item: FloatIcon;
  index: number;
  onClick?: () => void;
}) {
  const { Icon, imgSrc, imgAlt, iconClassName, label, href, bg, fg, top, left, delay, duration } = item;
  return (
    <a
      href={href}
      title={label}
      aria-label={label}
      onClick={onClick ? (e) => { e.preventDefault(); onClick(); } : undefined}
      className="hidden md:flex absolute h-16 w-16 lg:h-20 lg:w-20 items-center justify-center rounded-[22px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] ring-1 ring-black/5 transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.18)] animate-[float_var(--d)_ease-in-out_infinite]"
      style={{
        top,
        left,
        animationDelay: delay,
        ['--d' as string]: duration,
      } as React.CSSProperties}
    >
      <span className={`flex h-full w-full items-center justify-center rounded-[22px] ${bg}`}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={imgAlt ?? label}
            className={`h-7 w-7 lg:h-9 lg:w-9 object-contain ${iconClassName ?? ""}`}
          />
        ) : (
          Icon ? <Icon className={`h-7 w-7 lg:h-9 lg:w-9 ${fg}`} strokeWidth={2.2} /> : null
        )}
      </span>
      <span className="sr-only">{label}</span>
      {/* keep index referenced */}
      <span className="hidden">{index}</span>
    </a>
  );
}
function Index() {
  const [showMaxhub, setShowMaxhub] = React.useState(false);
  const [showSystems, setShowSystems] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const openMaxhub = () => {
    setShowMaxhub(true);
    queueMicrotask(() => {
      document.getElementById("maxhub")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const closeMaxhub = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setShowMaxhub(false), 250);
  };

  const openSystems = () => {
    setShowSystems(true);
    queueMicrotask(() => {
      document.getElementById("systems")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const closeSystems = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setShowSystems(false), 250);
  };

  return (
    <>
    <main className="relative min-h-screen overflow-hidden bg-white">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-14px) translateX(6px); }
        }
      `}</style>

      {/* Nav */}
      <header className="relative z-20 mx-auto flex max-w-5xl items-center justify-between px-6 pt-6">

          <img
            src="/unikl-official.png"
            alt="UniKL Logo"
            className="h-8 w-auto object-contain md:h-10"
          />
  
        <nav className="hidden items-center gap-7 text-sm font-medium text-neutral-700 md:flex">
          <Link to="/information" className="hover:text-neutral-900">Info</Link>
          <Link to="/about" className="hover:text-neutral-900">About us</Link>
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

      {/* Mobile nav */}
      {mobileMenuOpen ? (
        <div className="relative z-20 mx-auto max-w-5xl px-6 pt-3 md:hidden">
          <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
            <a
              href="#"
              className="block rounded-xl px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </a>

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

      {/* Hero */}
      <section className="relative mx-auto flex min-h-[88vh] max-w-7xl items-center justify-center px-6">
        {/* Floating icons (desktop only, absolutely positioned) */}
        {ICONS.map((it, i) => (
          <FloatingIcon
            key={it.label}
            item={it}
            index={i}
            onClick={
              it.label === "MaxHub Connect"
                ? openMaxhub
                : it.label === "Systems"
                  ? openSystems
                  : undefined
            }
          />
        ))}

        {/* Center content */}
        <div className="relative z-10 text-center">
          <p className="mb-4 font-heading text-3xl font-bold tracking-wide text-neutral-500">ONE STOP CENTER</p>
          <h1 className="font-heading text-4xl font-bold leading-[0.95] tracking-tight text-neutral-900 sm:text-6xl md:text-7xl lg:text-8xl">
            INFORMATION TECHNOLOGY DEPARTMENT
          </h1>
          <p className="mt-6 text-lg font-medium text-neutral-600 md:text-xl">
            10+ Services <span className="mx-2 text-neutral-300">|</span> 3 Internal Systems
          </p>
        </div>
      </section>

      {/* Mobile icon grid (no absolute, no overlap) */}
      <section className="md:hidden px-6 pb-16">
        <div className="grid grid-cols-4 gap-4">
          {ICONS.map(({ Icon, imgSrc, imgAlt, iconClassName, label, href, bg, fg }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              onClick={
                label === "MaxHub Connect"
                  ? (e) => { e.preventDefault(); openMaxhub(); }
                  : label === "Systems"
                    ? (e) => { e.preventDefault(); openSystems(); }
                    : undefined
              }
              className="flex flex-col items-center gap-2"
            >
              <span className={`flex h-14 w-14 items-center justify-center rounded-[18px] ring-1 ring-black/5 shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-all duration-300 hover:scale-110 hover:shadow-[0_14px_30px_rgba(0,0,0,0.18)] ${bg}`}>
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={imgAlt ?? label}
                    className={`h-6 w-6 object-contain ${iconClassName ?? ""}`}
                  />
                ) : (
                  Icon ? <Icon className={`h-6 w-6 ${fg}`} strokeWidth={2.2} /> : null
                )}
              </span>
              <span className="text-[11px] font-medium text-neutral-600 text-center leading-tight">{label}</span>
            </a>
          ))}
        </div>
      </section>

      {showSystems ? <SystemSection onClose={closeSystems} /> : null}
      {showMaxhub ? <MaxhubSection onClose={closeMaxhub} /> : null}

      <footer className="mx-auto max-w-7xl px-6 pb-8">
        <div className="text-right text-xs font-medium text-neutral-400">
          © 2026 Information Technology Department RCMP
        </div>
      </footer>
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
