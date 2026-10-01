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
  imageAlt?: string;
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
    title: "WOW Video",
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
  {
    id: "new-student-guide",
    index: "04",
    title: "New Student Guide",
    meta: "How to log in to your UniKL applications",
    description:
      "A quick guide for new students on which username and password to use for Microsoft 365, Portal / ECITIE, UniKL Link and VLE.",
    note: "For new students",
    image: "/new-student-guide.png",
    imageAlt:
      "New Student Guide poster: how to log in to UniKL email, Microsoft 365, Portal / ECITIE, UniKL Link and VLE, and which password to use for each.",
    steps: [
      {
        title: "Email from UniKL",
        body: "You will receive an email from UniKL with your UniKL email address and a temporary password. Check your inbox and junk folder.",
      },
      {
        title: "Log in to Microsoft Authenticator and Microsoft 365",
        body: "Use the UniKL email and temporary password from that email to sign in to Microsoft Authenticator and Microsoft 365.",
      },
      {
        title: "Credentials for UniKL applications",
        body: "Each application uses a different combination:",
        substeps: [
          "Portal / ECITIE: username is your Student ID, password is your Portal password.",
          "UniKL Link: username is your UniKL email, password is your Portal password.",
          "VLE: username is your UniKL email, password is your Email password.",
        ],
      },
      {
        title: "UniKL Link tip",
        body: 'Key in your email without "@s.unikl.edu.my". Don\'t use "Sign in with Microsoft", as it has technical issues.',
      },
      {
        title: "Which password goes where?",
        body: "You have two different passwords:",
        substeps: [
          "Portal password: Portal / ECITIE and UniKL Link.",
          "Email password: Microsoft 365, VLE and your UniKL email account.",
        ],
      },
      {
        title: "Avoid common issues",
        body: "Keep these in mind:",
        substeps: [
          "Check your inbox and junk folder for the UniKL email.",
          "Portal and Email passwords are different, so don't mix them up.",
          "Keep your temporary password private.",
          "Never share your password or OTP with anyone.",
          "Still can't log in? Contact the IT Department for help.",
        ],
      },
    ],
  },
  {
    id: "microsoft-authenticator",
    index: "05",
    title: "Microsoft Authenticator",
    meta: "Set up the app that confirms your UniKL sign-in",
    description:
      "Microsoft Authenticator is the phone app UniKL uses to confirm it is really you when you sign in to Microsoft 365. Add your UniKL email once. After that, the app shows a code you approve on your phone.",
    note: "For new students",
    image: "/microsoft-install.png",
    imageAlt:
      "Poster: set up Microsoft Authenticator by adding your UniKL email in 7 steps, from installing the app to approving the sign-in code.",
    steps: [
      {
        title: "What you need first",
        body: "Have these ready before you start:",
        substeps: [
          "Your phone.",
          "Your UniKL email and Email password, from the UniKL welcome email.",
          "A computer or second screen showing Microsoft 365, for the QR code step.",
        ],
      },
      {
        title: "Get the app",
        body: "Install Microsoft Authenticator from the App Store or Google Play, then open it. Look for the blue shield icon.",
      },
      {
        title: "Add your account",
        body: "In the app, tap the plus icon, or tap Add account.",
      },
      {
        title: "Choose your school account",
        body: "Select Work or school account. Do not choose Personal.",
      },
      {
        title: "Sign in",
        body: "Enter your UniKL email and your Email password. This is the password from the welcome email, not your Portal password.",
      },
      {
        title: "Link it with Microsoft 365",
        body: "Open Microsoft 365 on a computer or second screen. Scan the QR code with the app, or sign in to your account on that screen.",
      },
      {
        title: "Approve with the code",
        body: "A number will appear in Microsoft Authenticator. Enter or approve that number to confirm the sign-in.",
      },
      {
        title: "You're all set",
        body: "Your UniKL email is now set up in Microsoft Authenticator. Keep the app installed. You will need it each time you sign in.",
      },
      {
        title: "Avoid common issues",
        body: "If setup stalls, check these first:",
        substeps: [
          "Use your UniKL email, not a personal email.",
          "Pick Work or school account, not Personal.",
          "Keep your phone's date and time set automatically so the codes work.",
          "Never share your codes with anyone.",
          "Do not delete the app or the account after setup. You will need it to sign in.",
          "Still stuck? Contact the IT Department.",
        ],
      },
    ],
  },
];

function readHash() {
  const id = window.location.hash.replace("#", "");
  return RESOURCES.some((item) => item.id === id) ? id : null;
}

export default function Information() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const detailRef = React.useRef<HTMLHeadingElement>(null);
  const active = RESOURCES.find((item) => item.id === activeId) ?? null;

  React.useEffect(() => {
    const sync = () => setActiveId(readHash());
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  React.useEffect(() => {
    if (!active) return;
    detailRef.current?.focus();
    window.scrollTo(0, 0);
  }, [active]);

  const openResource = (id: string) => {
    const url = `${window.location.pathname}${window.location.search}#${id}`;
    window.history.pushState(null, "", url);
    setActiveId(id);
  };

  const closeResource = () => {
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}`);
    setActiveId(null);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <main className="relative min-h-screen bg-white text-neutral-900">
        <header className="relative z-20 mx-auto flex max-w-3xl items-center justify-between px-6 pt-6">
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
          <div className="relative z-20 mx-auto max-w-3xl px-6 pt-3 md:hidden">
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

        <div className="mx-auto w-full max-w-3xl px-6 pb-20 pt-16 sm:pt-24">
          {active ? (
            <article>
              <button
                type="button"
                onClick={closeResource}
                className="inline-flex items-center gap-2 rounded-full text-sm font-semibold text-neutral-600 transition hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0077C8] active:translate-y-px"
              >
                <span aria-hidden="true">←</span>
                All guides
              </button>

              <p className="mt-8 text-sm font-medium text-[#0077C8]">{active.note}</p>
              <h1
                ref={detailRef}
                tabIndex={-1}
                className="mt-2 font-heading text-4xl font-bold tracking-tight text-neutral-900 outline-none sm:text-5xl"
              >
                {active.title}
              </h1>
              <p className="mt-3 text-base text-neutral-500">{active.meta}</p>
              <p className="mt-6 max-w-2xl text-[15px] leading-7 text-neutral-600">
                {active.description}
              </p>

              {active.image ? (
                <figure className="mt-10">
                  <a href={active.image} target="_blank" rel="noopener noreferrer" className="block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0077C8]">
                    <img
                      src={active.image}
                      alt={active.imageAlt ?? active.title}
                      className="block max-h-[70vh] w-full rounded-2xl border border-neutral-200 object-contain object-top"
                    />
                  </a>
                  <figcaption className="mt-3 text-xs text-neutral-500">
                    Open the image to view it full size.
                  </figcaption>
                </figure>
              ) : null}

              {active.video ? (
                <figure className="mt-10">
                  <video
                    src={active.video}
                    controls
                    playsInline
                    preload="metadata"
                    className="block aspect-video w-full rounded-2xl bg-neutral-950 object-contain"
                  >
                    Your browser does not support video playback.
                  </video>
                  <figcaption className="mt-3 text-xs text-neutral-500">
                    Play with sound on for the full introduction.
                  </figcaption>
                </figure>
              ) : null}

              {active.steps ? (
                <ol className="mt-12 space-y-10">
                  {active.steps.map((step, i) => (
                    <li key={step.title} className="border-t border-neutral-200 pt-8">
                      <p className="text-sm font-medium text-neutral-400">{i + 1}</p>
                      <h2 className="mt-1 font-heading text-xl font-bold tracking-tight text-neutral-900">
                        {step.title}
                      </h2>
                      <p className="mt-3 max-w-2xl text-[15px] leading-7 text-neutral-600">
                        {step.body}
                      </p>
                      {step.links ? (
                        <ul className="mt-4 space-y-2">
                          {step.links.map((link) => (
                            <li key={link.href}>
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-sm text-[15px] font-medium text-[#0077C8] underline decoration-[#0077C8]/30 underline-offset-4 hover:decoration-[#0077C8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0077C8]"
                              >
                                {link.icon ? <PlatformIcon platform={link.icon} /> : null}
                                {link.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {step.substeps ? (
                        <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-neutral-600">
                          {step.substeps.map((sub) => (
                            <li key={sub}>{sub}</li>
                          ))}
                        </ol>
                      ) : null}
                    </li>
                  ))}
                </ol>
              ) : null}
            </article>
          ) : (
            <section>
              <h1 className="font-heading text-4xl font-bold tracking-tight text-neutral-900 sm:text-6xl">
                How can we help you?
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
                Pick a topic below and I’ll open the full guide.
              </p>

              <ul className="mt-12 border-t border-neutral-200">
                {RESOURCES.map((item) => (
                  <li key={item.id} className="border-b border-neutral-200">
                    <button
                      type="button"
                      onClick={() => openResource(item.id)}
                      className="group flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0077C8] active:bg-neutral-100 sm:py-7"
                    >
                      <span className="min-w-0">
                        <span className="block font-heading text-2xl font-bold tracking-tight text-neutral-900 group-hover:text-[#0077C8]">
                          {item.title}
                        </span>
                        <span className="mt-1.5 block text-sm leading-6 text-neutral-500">
                          {item.meta}
                        </span>
                        <span className="mt-2 block text-xs font-medium uppercase tracking-wide text-neutral-400">
                          {item.note}
                        </span>
                      </span>
                      <span aria-hidden="true" className="mt-1 shrink-0 text-lg text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-[#0077C8]">
                        →
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

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
