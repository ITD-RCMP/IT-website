import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";
import { MaxhubSection } from "../components/section/Maxhub";
import { SystemSection } from "../components/section/System";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { HeroTitle } from "@/components/home/HeroTitle";
import { OrbitRing } from "@/components/home/OrbitRing";
import { SERVICES, type Service } from "@/components/home/services";
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

function Index() {
  const [showMaxhub, setShowMaxhub] = React.useState(false);
  const [showSystems, setShowSystems] = React.useState(false);

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

  const handleServiceClick = (service: Service, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!service.section) return;
    e.preventDefault();
    if (service.section === "maxhub") openMaxhub();
    else openSystems();
  };

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-[#FAFAF8]">
        <HomeNavbar />

        {/* Hero */}
        <section className="relative isolate px-6 pb-12 pt-36 md:h-[100svh] md:min-h-[700px] md:p-0">
          <div className="relative flex items-center justify-center md:absolute md:inset-x-0 md:bottom-0 md:top-[88px]">
            <OrbitRing
              services={SERVICES}
              onActivate={handleServiceClick}
              className="absolute inset-0 hidden md:block"
            />
            <HeroTitle />
          </div>

          {/* Bottom corners (desktop) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 hidden items-end justify-between px-10 pb-8 md:flex lg:px-16">
            <p className="font-heading text-3xl font-medium leading-[1.05] tracking-tight lg:text-4xl">
              <span className="block text-neutral-900">10+ Services</span>
              <span className="block text-neutral-500">4 Internal Systems</span>
            </p>
            <button
              type="button"
              onClick={openSystems}
              className="pointer-events-auto flex items-center gap-8 border-b-2 border-neutral-900 pb-3 text-[17px] font-medium text-neutral-900 transition-colors hover:text-neutral-500"
            >
              Explore systems
              <ArrowDown className="h-5 w-5" strokeWidth={2.2} />
            </button>
          </div>
        </section>

        {/* Mobile icon grid (no absolute, no overlap) */}
        <section className="md:hidden px-6 pb-16">
          <div className="grid grid-cols-4 gap-4">
            {SERVICES.map((service) => {
              const { Icon, imgSrc, imgAlt, iconClassName, label, href, bg, fg } = service;
              return (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  onClick={(e) => handleServiceClick(service, e)}
                  className="flex flex-col items-center gap-2"
                >
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-[18px] ring-1 ring-black/5 shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-all duration-300 hover:scale-110 hover:shadow-[0_14px_30px_rgba(0,0,0,0.18)] ${bg}`}
                  >
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={imgAlt ?? label}
                        className={`h-6 w-6 object-contain ${iconClassName ?? ""}`}
                      />
                    ) : Icon ? (
                      <Icon className={`h-6 w-6 ${fg}`} strokeWidth={2.2} />
                    ) : null}
                  </span>
                  <span className="text-[11px] font-medium text-neutral-600 text-center leading-tight">
                    {label}
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {showSystems ? <SystemSection onClose={closeSystems} /> : null}
        {showMaxhub ? <MaxhubSection onClose={closeMaxhub} /> : null}
      </main>
    </>
  );
}
