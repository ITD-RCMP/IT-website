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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeId, setActiveId] = React.useState(RESOURCES[0].id);
  const [stepIndex, setStepIndex] = React.useState(0);
  const active = RESOURCES.find((r) => r.id === activeId) ?? RESOURCES[0];
  const openStep = active.steps?.[stepIndex];

  React.useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!RESOURCES.some((r) => r.id === id)) return;
    setActiveId(id);
    setStepIndex(0);
  }, []);

  const selectResource = (id: string) => {
    setActiveId(id);
    setStepIndex(0);
    window.history.replaceState(null, "", `#${id}`);
  };

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
            <Link to="/information" className="text-neutral-900">Info</Link>
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

        <div className="mx-auto w-full max-w-5xl px-6 pb-16 pt-16 sm:pt-20">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Resources & guides
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-neutral-600">
            Choose a resource from the list to view the full guideline or media.
          </p>

          <div className="mt-12 grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
            <nav aria-label="Resource contents" className="lg:sticky lg:top-8 lg:self-start">
              <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
                {RESOURCES.map((item) => {
                  const selected = item.id === active.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => selectResource(item.id)}
                        aria-pressed={selected}
                        className={`block w-full py-3 text-left text-[15px] ${
                          selected ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-700"
                        }`}
                      >
                        {item.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <section aria-live="polite">
              <p className="text-sm text-neutral-400">{active.note}</p>
              <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-neutral-900">
                {active.title}
              </h2>
              <p className="mt-2 text-sm text-neutral-500">{active.meta}</p>
              <p className="mt-5 max-w-2xl text-[15px] leading-7 text-neutral-600">
                {active.description}
              </p>

              {active.image ? (
                <figure className="mt-8">
                  <img
                    src={active.image}
                    alt={active.title}
                    className="block max-h-[70vh] w-full object-contain object-top"
                  />
                  <figcaption className="mt-2 text-xs text-neutral-500">
                    Full guideline — scroll or zoom as needed
                  </figcaption>
                </figure>
              ) : null}

              {active.video ? (
                <figure className="mt-8">
                  <video
                    src={active.video}
                    controls
                    playsInline
                    preload="metadata"
                    className="block aspect-video w-full bg-neutral-950 object-contain"
                  >
                    Your browser does not support video playback.
                  </video>
                  <figcaption className="mt-2 text-xs text-neutral-500">
                    Play with sound on for the full introduction
                  </figcaption>
                </figure>
              ) : null}

              {active.steps && openStep ? (
                <div className="mt-8">
                  <ol>
                    {active.steps.map((step, i) => {
                      const open = i === stepIndex;
                      return (
                        <li key={step.title} className="border-t border-neutral-200">
                          <button
                            type="button"
                            onClick={() => setStepIndex(i)}
                            aria-expanded={open}
                            className={`w-full py-3 text-left text-[15px] ${
                              open ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-700"
                            }`}
                          >
                            {i + 1}. {step.title}
                          </button>
                          {open ? (
                            <div className="pb-6">
                              <p className="max-w-2xl text-[15px] leading-7 text-neutral-600">
                                {step.body}
                              </p>
                              {step.links ? (
                                <ul className="mt-3 space-y-2">
                                  {step.links.map((link) => (
                                    <li key={link.href}>
                                      <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-[15px] text-neutral-900 underline underline-offset-4"
                                      >
                                        {link.icon ? <PlatformIcon platform={link.icon} /> : null}
                                        {link.label}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                              {step.substeps ? (
                                <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-neutral-600">
                                  {step.substeps.map((sub) => (
                                    <li key={sub}>{sub}</li>
                                  ))}
                                </ol>
                              ) : null}
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ) : null}
            </section>
          </div>

          <footer className="mt-16 border-t border-neutral-200 pt-8">
            <p className="text-xs text-neutral-400">
              © 2026 Information Technology Department RCMP
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
