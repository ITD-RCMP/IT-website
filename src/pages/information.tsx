import React from "react";
import { Link, useLoaderData } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { Asterisk } from "@/components/Asterisk";
import { GuideCover } from "@/components/info/GuideCover";
import { ShareMenu } from "@/components/info/ShareMenu";
import { excerpt, formatShortDate, stripHtml } from "@/lib/text";
import type { InformationContent } from "@/lib/information-api";
import type { SystemVersion } from "@/lib/systemVersion-api";

const pad = (n: number) => String(n).padStart(2, "0");

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[13px] text-neutral-500">{children}</p>;
}

function GuideCard({ item, index }: { item: InformationContent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to="/information/$id"
        params={{ id: String(item.id) }}
        className="group relative flex h-full flex-col rounded-[28px] border border-neutral-200/70 bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(0,0,0,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2F5BD3]"
      >
        <div className="relative">
          <GuideCover
            imagePath={item.imagePath}
            title={item.title}
            index={index}
            className="aspect-[16/10] w-full rounded-[22px]"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[12px] text-neutral-700 backdrop-blur">
            {pad(index + 1)}
          </span>
          <div className="absolute right-3 top-3">
            <ShareMenu url={`/information/${item.id}`} title={item.title} />
          </div>
        </div>

        <div className="flex flex-1 flex-col px-4 pb-4 pt-5">
          <h2 className="font-heading text-2xl font-semibold leading-tight tracking-[-0.03em] text-neutral-950 transition-colors group-hover:text-[#2F5BD3]">
            {item.title}
          </h2>
          <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-6 text-neutral-600">
            {stripHtml(item.description)}
          </p>
          <span className="mt-5 flex items-center justify-between rounded-full bg-neutral-100 py-1.5 pl-5 pr-1.5 text-sm font-medium text-neutral-900 transition-colors group-hover:bg-neutral-200">
            Read guide
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
            </span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function ReleaseCover({
  version,
  compact = false,
  className = "",
}: {
  version: SystemVersion;
  compact?: boolean;
  className?: string;
}) {
  if (version.imagePath) {
    return (
      <div className={`overflow-hidden bg-neutral-100 ${className}`}>
        <img
          src={version.imagePath}
          alt={version.systemName}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
  if (compact) {
    return (
      <div className={`flex items-center justify-center bg-neutral-950 ${className}`}>
        <p className="font-display text-sm font-black text-white [font-stretch:125%]">
          v{version.version}
        </p>
      </div>
    );
  }
  return (
    <div className={`relative flex items-end overflow-hidden bg-neutral-950 p-6 ${className}`}>
      <Asterisk className="absolute right-6 top-6 w-10 text-[#7B61FF]" />
      <p className="font-display text-5xl font-black text-white [font-stretch:125%] sm:text-6xl">
        v{version.version}
      </p>
    </div>
  );
}

export default function Information() {
  const { items, versions } = useLoaderData({ from: "/information" }) as {
    items: InformationContent[];
    versions: SystemVersion[];
  };
  const [selectedVersionId, setSelectedVersionId] = React.useState<number | null>(
    versions[0]?.id ?? null,
  );
  const [notesExpanded, setNotesExpanded] = React.useState(false);
  const featuredVersion = versions.find((v) => v.id === selectedVersionId) ?? versions[0] ?? null;

  // Shared release links point at #system-versions-<id>; open that release on arrival.
  React.useEffect(() => {
    const match = window.location.hash.match(/^#system-versions-(\d+)$/);
    if (!match) return;
    const id = Number(match[1]);
    if (versions.some((v) => v.id === id)) {
      setSelectedVersionId(id);
      document.getElementById("system-versions")?.scrollIntoView({ block: "start" });
    }
  }, [versions]);

  const selectVersion = (id: number) => {
    setSelectedVersionId(id);
    setNotesExpanded(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAFAF8] text-neutral-900">
      <HomeNavbar />

      {/* Headline */}
      <section className="relative mx-auto max-w-6xl px-6 pt-36 text-center md:pt-44">
        <Asterisk className="absolute right-[8%] top-32 hidden w-12 text-[#7B61FF] md:block md:top-40" />
        <motion.h1
          className="font-heading text-[clamp(2.6rem,7vw,6.5rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-neutral-950"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          How can we{" "}
          <span className="relative inline-block">
            help
            <svg
              viewBox="0 0 300 30"
              preserveAspectRatio="none"
              className="absolute -bottom-[0.18em] left-[-6%] h-[0.28em] w-[112%] overflow-visible"
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
          you?
        </motion.h1>
        <motion.p
          className="mx-auto mt-10 max-w-xl text-[15px] leading-7 text-neutral-600 md:text-lg md:leading-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Guides, how-tos and resources from the IT Department. Pick a topic to get started.
        </motion.p>
      </section>

      {/* Guides */}
      <section className="mx-auto max-w-6xl px-6 pt-20 md:pt-28">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <SectionLabel>Guides & resources</SectionLabel>
            <h2 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.03em] text-neutral-950 md:text-4xl">
              Browse topics
            </h2>
          </div>
          <span className="font-mono text-[13px] text-neutral-500">
            {pad(items.length)} {items.length === 1 ? "guide" : "guides"}
          </span>
        </div>

        {items.length === 0 ? (
          <p className="rounded-[28px] border border-dashed border-neutral-300 px-6 py-16 text-center text-sm text-neutral-500">
            No guides have been published yet.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <GuideCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* System versions */}
      <section id="system-versions" className="mx-auto max-w-6xl scroll-mt-28 px-6 pb-24 pt-24 md:pb-32 md:pt-32">
        <div className="mb-8">
          <SectionLabel>Release notes</SectionLabel>
          <h2 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.03em] text-neutral-950 md:text-4xl">
            Internal system versions
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-7 text-neutral-600">
            What changed in our internal systems, and when.
          </p>
        </div>

        {versions.length === 0 || !featuredVersion ? (
          <p className="rounded-[28px] border border-dashed border-neutral-300 px-6 py-16 text-center text-sm text-neutral-500">
            No versions have been published yet.
          </p>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
            <article className="relative min-w-0 rounded-[28px] border border-neutral-200/70 bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="relative">
                <ReleaseCover version={featuredVersion} className="h-56 rounded-[22px] sm:h-72" />
                <div className="absolute right-3 top-3">
                  <ShareMenu
                    url={`/information#system-versions-${featuredVersion.id}`}
                    title={`${featuredVersion.systemName} v${featuredVersion.version}`}
                  />
                </div>
              </div>

              <div className="px-4 pb-5 pt-6 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-[#2F5BD3]/10 px-3 py-1 font-mono text-[12px] text-[#2F5BD3]">
                    {featuredVersion.id === versions[0].id ? "Latest release" : "Earlier release"}
                  </span>
                  <span className="font-mono text-[13px] text-neutral-500">
                    {formatShortDate(featuredVersion.releasedAt)}
                  </span>
                </div>
                <h3 className="mt-4 font-heading text-3xl font-semibold tracking-[-0.03em] text-neutral-950">
                  Version {featuredVersion.version}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">{featuredVersion.systemName}</p>

                {notesExpanded ? (
                  <div
                    className="prose prose-neutral mt-5 max-w-none text-[15px] leading-7 text-neutral-600 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: featuredVersion.releaseNotes }}
                  />
                ) : (
                  <p className="mt-5 text-[15px] leading-7 text-neutral-600">
                    {excerpt(stripHtml(featuredVersion.releaseNotes), 220)}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setNotesExpanded((v) => !v)}
                    className="rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
                  >
                    {notesExpanded ? "Show less ↑" : "Read full release notes →"}
                  </button>
                  {featuredVersion.systemUrl ? (
                    <a
                      href={featuredVersion.systemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex min-w-0 items-center gap-3 rounded-full bg-neutral-950 py-1.5 pl-5 pr-1.5 text-left text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                      Open {featuredVersion.systemName}
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-neutral-950 transition-transform duration-300 group-hover:rotate-45">
                        <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
                      </span>
                    </a>
                  ) : null}
                </div>
              </div>
            </article>

            <div className="min-w-0 rounded-[28px] border border-neutral-200/70 bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <p className="px-4 pb-2 pt-4 font-mono text-[13px] text-neutral-500">All releases</p>
              <ul className="flex flex-col gap-1">
                {versions.map((version) => {
                  const isSelected = version.id === featuredVersion.id;
                  return (
                    <li
                      key={version.id}
                      id={`system-versions-${version.id}`}
                      className={`flex items-center gap-3 rounded-[20px] p-2 transition-colors ${
                        isSelected ? "bg-neutral-100" : "hover:bg-neutral-50"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => selectVersion(version.id)}
                        aria-pressed={isSelected}
                        className="flex min-w-0 flex-1 items-center gap-4 text-left"
                      >
                        <ReleaseCover
                          version={version}
                          compact
                          className="h-16 w-20 shrink-0 rounded-2xl"
                        />
                        <span className="min-w-0">
                          <span className="block font-mono text-[12px] text-neutral-500">
                            {formatShortDate(version.releasedAt)}
                          </span>
                          <span
                            className={`mt-0.5 block font-heading text-lg font-semibold tracking-[-0.02em] ${
                              isSelected ? "text-[#2F5BD3]" : "text-neutral-950"
                            }`}
                          >
                            Version {version.version}
                          </span>
                          <span className="block truncate text-xs text-neutral-500">
                            {version.systemName}
                          </span>
                        </span>
                      </button>
                      <ShareMenu
                        variant="inline"
                        url={`/information#system-versions-${version.id}`}
                        title={`${version.systemName} v${version.version}`}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
