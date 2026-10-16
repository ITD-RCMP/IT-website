import React from "react";
import { Link, useLoaderData } from "@tanstack/react-router";
import type { InformationContent } from "@/lib/information-api";
import type { SystemVersion } from "@/lib/systemVersion-api";

function stripHtml(html: string): string {
  return html
    .replace(/<\/(p|li|div|h[1-6])>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/\s+/g, " ")
    .trim();
}

function formatShortDate(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  const day = date.toLocaleDateString(undefined, { day: "numeric" });
  const month = date.toLocaleDateString(undefined, { month: "short" });
  const year = date.toLocaleDateString(undefined, { year: "numeric" });
  return `${day} ${month}, ${year}`;
}

function excerpt(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export default function Information() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { items, versions } = useLoaderData({ from: "/information" }) as {
    items: InformationContent[];
    versions: SystemVersion[];
  };
  const [selectedVersionId, setSelectedVersionId] = React.useState<number | null>(
    versions[0]?.id ?? null,
  );
  const [notesExpanded, setNotesExpanded] = React.useState(false);
  const featuredVersion = versions.find((v) => v.id === selectedVersionId) ?? versions[0] ?? null;

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
            <a href="#system-versions" className="hover:text-neutral-900">System versions</a>
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
              <a
                href="#system-versions"
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                System versions
              </a>
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

        <div className="mx-auto w-full max-w-5xl px-6 pb-20 pt-16 sm:pt-24">
          <section>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
              How can we help you?
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
              Browse our guides and resources. Click on any card to learn more about a topic.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  to="/information/$id"
                  params={{ id: String(item.id) }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:border-[#0077C8] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0077C8]"
                >
                  {item.imagePath ? (
                    <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
                      {item.imagePath.endsWith(".mp4") ? (
                        <video
                          src={item.imagePath}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={item.imagePath}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-[#0077C8]/10 to-[#0077C8]/5" />
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="font-heading text-xl font-bold tracking-tight text-neutral-900 group-hover:text-[#0077C8] transition-colors">
                      {item.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-neutral-600">
                      {stripHtml(item.description)}
                    </p>
                    <span className="mt-4 inline-flex items-center text-sm font-semibold text-[#0077C8] transition group-hover:translate-x-1">
                      Read more
                      <span aria-hidden="true" className="ml-2">→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section id="system-versions" className="mt-24 scroll-mt-24 border-t border-neutral-200 pt-16">
            <h2 className="text-center font-heading text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
              Internal System Version
            </h2>
            <p className="mt-4 text-center text-base leading-7 text-neutral-600">
              Release history for the internal system, what changed, and when.
            </p>

            {versions.length === 0 || !featuredVersion ? (
              <p className="mt-10 text-center text-sm text-neutral-500">
                No versions have been published yet.
              </p>
            ) : (
              <div className="mt-12 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
                <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                  {featuredVersion.imagePath ? (
                    <div className="h-56 w-full overflow-hidden bg-neutral-100 sm:h-64">
                      <img
                        src={featuredVersion.imagePath}
                        alt={featuredVersion.systemName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-56 flex-col justify-center bg-gradient-to-br from-[#0a2a63] via-[#0059b3] to-[#0077C8] px-8 py-10 sm:h-64">
                      <p className="text-sm font-medium text-white/70">New release</p>
                      <p className="mt-2 font-heading text-4xl font-extrabold leading-tight text-white sm:text-5xl">
                        v{featuredVersion.version}
                      </p>
                    </div>
                  )}

                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold uppercase tracking-wide text-[#0077C8]">
                        Latest release
                      </span>
                      <span className="text-sm text-neutral-500">
                        {formatShortDate(featuredVersion.releasedAt)}
                      </span>
                    </div>
                    <h3 className="mt-3 font-heading text-2xl font-bold tracking-tight text-neutral-900">
                      Version {featuredVersion.version}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm text-neutral-500">{featuredVersion.systemName}</span>
                      {featuredVersion.systemUrl ? (
                        <a
                          href={featuredVersion.systemUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm font-semibold text-[#0077C8] underline decoration-[#0077C8]/30 underline-offset-2 hover:decoration-[#0077C8]"
                        >
                          Open {featuredVersion.systemName}
                          <span aria-hidden="true" className="ml-1">↗</span>
                        </a>
                      ) : null}
                    </div>

                    {notesExpanded ? (
                      <div
                        className="prose prose-neutral mt-4 max-w-none text-[15px] leading-7 text-neutral-600 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5"
                        dangerouslySetInnerHTML={{ __html: featuredVersion.releaseNotes }}
                      />
                    ) : (
                      <p className="mt-4 text-sm leading-6 text-neutral-600">
                        {excerpt(stripHtml(featuredVersion.releaseNotes), 220)}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => setNotesExpanded((v) => !v)}
                      className="mt-5 inline-flex items-center text-sm font-semibold text-[#0077C8] transition hover:text-[#0066AD]"
                    >
                      {notesExpanded ? "Show less" : "Read full release notes"}
                      <span aria-hidden="true" className="ml-2">
                        {notesExpanded ? "↑" : "→"}
                      </span>
                    </button>
                  </div>
                </article>

                <div>
                  <h3 className="font-heading text-xl font-bold tracking-tight text-neutral-900">
                    Previous releases
                  </h3>
                  <ul className="mt-6 space-y-6">
                    {versions.map((version) => {
                      const isSelected = version.id === featuredVersion.id;
                      return (
                        <li key={version.id} className="flex items-start gap-4">
                          {version.imagePath ? (
                            <img
                              src={version.imagePath}
                              alt={version.systemName}
                              className="h-16 w-20 shrink-0 rounded-xl border border-neutral-200 object-cover"
                            />
                          ) : (
                            <div
                              className={`flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white ${
                                isSelected
                                  ? "from-[#0a2a63] via-[#0059b3] to-[#0077C8]"
                                  : "from-[#0077C8]/70 to-[#0a84ff]/70"
                              }`}
                            >
                              v{version.version}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs text-neutral-500">{formatShortDate(version.releasedAt)}</p>
                            <p className="mt-0.5 text-sm font-semibold leading-5 text-neutral-900">
                              Version {version.version}
                            </p>
                            <p className="text-xs text-neutral-500">{version.systemName}</p>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVersionId(version.id);
                                setNotesExpanded(false);
                              }}
                              className="mt-1 inline-flex items-center text-sm font-semibold text-[#0077C8] transition hover:text-[#0066AD]"
                            >
                              {isSelected ? "Viewing this release" : "Read this update"}
                              {isSelected ? null : (
                                <span aria-hidden="true" className="ml-1">
                                  →
                                </span>
                              )}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </section>

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
