import React from "react";
import { Link, useLoaderData, useParams } from "@tanstack/react-router";
import type { InformationContent } from "@/lib/information-api";

export default function InformationDetail() {
  const { id } = useParams({ from: "/information/$id" });
  const { item } = useLoaderData({ from: "/information/$id" }) as { item: InformationContent | null };
  const detailRef = React.useRef<HTMLHeadingElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    detailRef.current?.focus();
    window.scrollTo(0, 0);
  }, [id]);

  if (!item) {
    return (
      <main className="relative min-h-screen bg-white text-neutral-900">
        <header className="relative z-20 mx-auto flex max-w-3xl items-center justify-between px-6 pt-6">
          <Link to="/" aria-label="Home">
            <img
              src="/unikl-official.png"
              alt="UniKL Logo"
              className="h-8 w-auto object-contain md:h-10"
            />
          </Link>
          <div className="flex items-center gap-2">
            <a href="http://rush.rcmp.edu.my" className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800">
              Get help
            </a>
          </div>
        </header>

        <div className="mx-auto w-full max-w-3xl px-6 pb-20 pt-16 sm:pt-24">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-neutral-900">
              Guide not found
            </h1>
            <p className="mt-2 text-neutral-600">
              The guide you're looking for doesn't exist.
            </p>
            <Link
              to="/information"
              className="mt-6 inline-flex items-center gap-2 rounded-full text-sm font-semibold text-[#0077C8] transition hover:text-[#0066AD]"
            >
              <span aria-hidden="true">←</span>
              Back to all guides
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
          <article>
            <Link
              to="/information"
              className="inline-flex items-center gap-2 rounded-full text-sm font-semibold text-neutral-600 transition hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0077C8] active:translate-y-px"
            >
              <span aria-hidden="true">←</span>
              All guides
            </Link>

            <h1
              ref={detailRef}
              tabIndex={-1}
              className="mt-8 font-heading text-4xl font-bold tracking-tight text-neutral-900 outline-none sm:text-5xl"
            >
              {item.title}
            </h1>

            {item.imagePath ? (
              <figure className="mt-10">
                <a href={item.imagePath} target="_blank" rel="noopener noreferrer" className="block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0077C8]">
                  <img
                    src={item.imagePath}
                    alt={item.title}
                    className="block max-h-[70vh] w-full rounded-2xl border border-neutral-200 object-contain object-top"
                  />
                </a>
                <figcaption className="mt-3 text-xs text-neutral-500">
                  Open the image to view it full size.
                </figcaption>
              </figure>
            ) : null}

            <div
              className="prose prose-neutral mt-6 max-w-2xl text-[15px] leading-7 text-neutral-600 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_strong]:text-neutral-900"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          </article>

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
