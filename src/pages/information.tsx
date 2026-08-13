import React from "react";
import { Link } from "@tanstack/react-router";

type GuideLink = {
  label: string;
  href: string;
  icon?: "android" | "ios";
};

type GuideStep = {
  title: string;
  body: string;
  links?: GuideLink[];
  substeps?: string[];
};

function PlatformIcon({ platform }: { platform: "android" | "ios" }) {
  if (platform === "android") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 fill-current">
        <path d="M17.523 15.341a.957.957 0 0 1-.956-.956.957.957 0 0 1 .956-.956.957.957 0 0 1 .956.956.957.957 0 0 1-.956.956m-11.046 0a.957.957 0 0 1-.956-.956.957.957 0 0 1 .956-.956.957.957 0 0 1 .956.956.957.957 0 0 1-.956.956m11.404-6.12 1.997-3.46a.416.416 0 0 0-.152-.568.416.416 0 0 0-.568.152l-2.022 3.503A12.6 12.6 0 0 0 12 7.843a12.6 12.6 0 0 0-4.636 1.005L5.342 5.345a.416.416 0 0 0-.568-.152.416.416 0 0 0-.152.568l1.997 3.46C3.281 11.118 1.875 14.162 1.71 17.591h20.58c-.165-3.429-1.571-6.473-4.409-8.37" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 fill-current">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" />
    </svg>
  );
}

type Resource = {
  id: string;
  index: string;
  title: string;
  meta: string;
  description: string;
  note: string;
  image?: string;
  video?: string;
  steps?: GuideStep[];
};

const RESOURCES: Resource[] = [
  {
    id: "unikl-link",
    index: "01",
    title: "UniKL Link",
    meta: "App login & setup guide",
    description:
      "How to sign in, update to the latest version, and fix common iOS trust issues with the UniKL Link app.",
    note: "Students & staff",
    steps: [
      {
        title: "Sign in correctly",
        body: 'If "Sign in with Microsoft" fails, do not use it — it has known technical issues. Enter your email without "@s.unikl.edu.my", use your ECITIE password, then tap Login.',
      },
      {
        title: "Use the latest version",
        body: "Confirm you are on Version 2.3.5 (iOS) or 2.3.7 (Android). The version number is at the bottom of the login screen. Update if needed:",
        links: [
          {
            label: "Android — Google Play",
            href: "https://play.google.com/store/apps/details?id=my.edu.unikl.uniklconnect",
            icon: "android",
          },
          {
            label: "iOS — download (uninstall existing app first)",
            href: "https://online1.unikl.edu.my/apps_unikllink/beta/ios/",
            icon: "ios",
          },
        ],
      },
      {
        title: "Trust the iOS developer profile",
        body: 'If iOS shows "Untrusted Enterprise Developer" when opening the app, trust the Universiti Kuala Lumpur profile:',
        substeps: [
          "Unlock your iPhone or iPad and open Settings.",
          "Tap General.",
          "Tap VPN & Device Management (iOS 15+) or Profiles & Device Management (iOS 14 and earlier).",
          "Under Enterprise App, tap Universiti Kuala Lumpur.",
          'Tap Trust "Universiti Kuala Lumpur".',
          "When prompted, tap Trust again to confirm.",
          "Enter your device passcode if required.",
          "On newer iOS versions, restart the device to finish setup.",
          "After restarting, open UniKL Link from the Home Screen.",
        ],
      },
      {
        title: "Avoid dark theme",
        body: "Make sure the app is not using dark theme while troubleshooting login.",
      },
      {
        title: "Still unable to log in?",
        body: "Confirm you can sign in to the Student Portal with the same password. If the portal works but UniKL Link does not, contact IT support for help.",
      },
    ],
  },
  {
    id: "wow-video",
    index: "02",
    title: "WOW Student",
    meta: "Department introduction for new students",
    description:
      "A short video introduction to help new incoming students get to know the IT department and how we support campus.",
    note: "For incoming students",
    video: "/unikl-wow.mp4",
  },
  {
    id: "mic-guidelines",
    index: "03",
    title: "Wireless Microphone",
    meta: "Usage & care guideline",
    description:
      "Guidance and usage details for the IT department wireless microphones. Improper handling may result in audio issues or equipment damage.",
    note: "Required before use",
    image: "/mic-guide.jpeg",
  },
];

export default function Information() {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const active = RESOURCES.find((r) => r.id === activeId) ?? null;

  return (
    <main className="relative min-h-screen bg-[#F2F2F2] text-neutral-900">
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8 sm:py-6 lg:px-10 lg:py-8">
        <div className="pt-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1 py-1 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
          >
            ‹ Back
          </Link>
        </div>

        <header className="max-w-2xl pb-10 pt-10 sm:pb-12 sm:pt-12 animate-[infoIn_0.7s_ease-out_both]">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
            Information Technology Department
          </p>
          <h1 className="text-[1.85rem] font-semibold leading-[1.15] tracking-tight text-neutral-950 sm:text-4xl lg:text-[2.75rem]">
            Resources & guides
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-neutral-500 sm:text-[15px] sm:leading-7">
            Choose a resource from the list to view the full guideline or media.
          </p>
        </header>

        <div className="grid flex-1 gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[14rem_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-8 lg:self-start animate-[infoIn_0.65s_ease-out_0.1s_both]">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-400">
              Contents
            </p>
            <nav
              aria-label="Resource contents"
              className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0"
            >
              {RESOURCES.map((item) => {
                const selected = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    aria-pressed={selected}
                    aria-controls="resource-panel"
                    className={[
                      "flex shrink-0 items-baseline gap-3 border-b-2 px-1 py-2 text-left transition-colors lg:border-b-0 lg:border-l-2 lg:px-3 lg:py-2.5",
                      selected
                        ? "border-neutral-900 text-neutral-950"
                        : "border-transparent text-neutral-400 hover:text-neutral-700",
                    ].join(" ")}
                  >
                    <span className="font-mono text-[10px] font-semibold tabular-nums">
                      {item.index}
                    </span>
                    <span className="text-sm font-medium tracking-tight">{item.title}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0 animate-[infoIn_0.65s_ease-out_0.15s_both]">
            {active ? (
              <article
                key={active.id}
                id="resource-panel"
                role="region"
                aria-live="polite"
                className="animate-[infoPanel_0.35s_ease-out_both]"
              >
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-neutral-300/70 pb-5">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-mono text-[11px] font-semibold tabular-nums text-neutral-400">
                        {active.index}
                      </span>
                      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-400">
                        {active.meta}
                      </span>
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-[1.75rem]">
                      {active.title}
                    </h2>
                  </div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                    {active.note}
                  </p>
                </div>

                <p className="mb-7 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-[15px] sm:leading-7">
                  {active.description}
                </p>

                {active.image ? (
                  <figure className="overflow-hidden bg-white ring-1 ring-neutral-300/80">
                    <img
                      src={active.image}
                      alt={active.title}
                      className="block w-full object-contain"
                    />
                    <figcaption className="border-t border-neutral-200 px-4 py-2.5 text-xs text-neutral-500">
                      Full guideline — scroll or zoom as needed
                    </figcaption>
                  </figure>
                ) : null}

                {active.video ? (
                  <figure className="overflow-hidden bg-neutral-950 ring-1 ring-neutral-800">
                    <video
                      src={active.video}
                      controls
                      playsInline
                      preload="metadata"
                      className="block aspect-video w-full object-contain"
                    >
                      Your browser does not support video playback.
                    </video>
                    <figcaption className="border-t border-neutral-800 bg-neutral-950 px-4 py-2.5 text-xs text-neutral-400">
                      Play with sound on for the full introduction
                    </figcaption>
                  </figure>
                ) : null}

                {active.steps ? (
                  <ol className="space-y-8">
                    {active.steps.map((step, i) => (
                      <li key={step.title} className="grid gap-3 sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:gap-5">
                        <span className="font-mono text-sm font-semibold tabular-nums text-neutral-400">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 space-y-3">
                          <h3 className="text-base font-semibold tracking-tight text-neutral-950 sm:text-lg">
                            {step.title}
                          </h3>
                          <p className="max-w-2xl text-sm leading-6 text-neutral-600 sm:text-[15px] sm:leading-7">
                            {step.body}
                          </p>
                          {step.links ? (
                            <ul className="space-y-2">
                              {step.links.map((link) => (
                                <li key={link.href}>
                                  <a
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-900"
                                  >
                                    {link.icon ? <PlatformIcon platform={link.icon} /> : null}
                                    {link.label}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                          {step.substeps ? (
                            <ol className="max-w-2xl list-decimal space-y-2 pl-5 text-sm leading-6 text-neutral-600 sm:text-[15px] sm:leading-7">
                              {step.substeps.map((sub) => (
                                <li key={sub}>{sub}</li>
                              ))}
                            </ol>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : null}
              </article>
            ) : (
              <div
                id="resource-panel"
                role="region"
                className="flex min-h-[16rem] items-center border border-dashed border-neutral-300/80 px-6 py-12 sm:min-h-[20rem]"
              >
                <p className="max-w-xs text-sm leading-6 text-neutral-400 sm:text-[15px] sm:leading-7">
                  Pick a guide from the list whenever you are ready. We will open it here for you.
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-16 border-t border-neutral-300/70 pb-6 pt-8 sm:mt-20">
          <p className="text-right text-xs font-medium text-neutral-400">
            © 2026 Information Technology Department RCMP
          </p>
        </footer>
      </div>

      <style>{`
        @keyframes infoIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes infoPanel {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
