import React from "react";
import { Link, useLoaderData, useParams } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { Asterisk } from "@/components/Asterisk";
import { GuideCover } from "@/components/info/GuideCover";
import { isVideo } from "@/lib/text";
import { ShareMenu } from "@/components/info/ShareMenu";
import type { InformationContent } from "@/lib/information-api";

const pad = (n: number) => String(n).padStart(2, "0");

function BackLink() {
  return (
    <Link
      to="/information"
      className="inline-flex items-center gap-2 rounded-full bg-neutral-100 py-2 pl-3 pr-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2F5BD3]"
    >
      <ArrowLeft className="h-4 w-4" />
      All guides
    </Link>
  );
}

function Footer() {
  return (
    <footer className="mx-auto mt-24 max-w-6xl border-t border-neutral-200 px-6 pb-8 pt-8">
      <p className="text-right text-xs font-medium text-neutral-400">
        © 2026 Information Technology Department RCMP
      </p>
    </footer>
  );
}

function SiblingCard({
  item,
  index,
  direction,
}: {
  item: InformationContent;
  index: number;
  direction: "prev" | "next";
}) {
  const isNext = direction === "next";
  return (
    <Link
      to="/information/$id"
      params={{ id: String(item.id) }}
      className={`group flex items-center gap-4 rounded-[28px] border border-neutral-200/70 bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(0,0,0,0.22)] ${
        isNext ? "flex-row-reverse text-right" : ""
      }`}
    >
      <GuideCover
        imagePath={item.imagePath}
        title={item.title}
        index={index}
        className="h-20 w-24 shrink-0 rounded-[20px] sm:h-24 sm:w-32"
      />
      <span className="min-w-0 flex-1">
        <span
          className={`flex items-center gap-1.5 font-mono text-[12px] text-neutral-500 ${
            isNext ? "justify-end" : ""
          }`}
        >
          {isNext ? null : <ArrowLeft className="h-3.5 w-3.5" />}
          {isNext ? "Next guide" : "Previous guide"}
          {isNext ? <ArrowRight className="h-3.5 w-3.5" /> : null}
        </span>
        <span className="mt-1 block truncate font-heading text-lg font-semibold tracking-[-0.02em] text-neutral-950 transition-colors group-hover:text-[#2F5BD3] sm:text-xl">
          {item.title}
        </span>
      </span>
    </Link>
  );
}

export default function InformationDetail() {
  const { id } = useParams({ from: "/information/$id" });
  const { item } = useLoaderData({ from: "/information/$id" }) as {
    item: InformationContent | null;
  };
  // The parent /information route already loads every guide; use it for numbering and next/prev.
  const { items } = useLoaderData({ from: "/information" }) as { items: InformationContent[] };
  const detailRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    detailRef.current?.focus();
    window.scrollTo(0, 0);
  }, [id]);

  if (!item) {
    return (
      <main className="relative min-h-screen bg-[#FAFAF8] text-neutral-900">
        <HomeNavbar />
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-44 text-center">
          <Asterisk className="w-12 text-[#7B61FF]" />
          <h1 className="mt-8 font-heading text-4xl font-semibold tracking-[-0.035em] text-neutral-950 md:text-5xl">
            Guide not found
          </h1>
          <p className="mt-3 text-neutral-600">The guide you're looking for doesn't exist.</p>
          <div className="mt-8">
            <BackLink />
          </div>
        </div>
      </main>
    );
  }

  const position = items.findIndex((g) => g.id === item.id);
  const prev = position > 0 ? items[position - 1] : null;
  const next = position >= 0 && position < items.length - 1 ? items[position + 1] : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAFAF8] text-neutral-900">
      <HomeNavbar />

      <article className="mx-auto max-w-4xl px-6 pt-32 md:pt-40">
        <div className="flex items-center justify-between gap-4">
          <BackLink />
          {position >= 0 ? (
            <span className="font-mono text-[13px] text-neutral-500">
              Guide {pad(position + 1)} / {pad(items.length)}
            </span>
          ) : null}
        </div>

        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mt-10 flex items-start justify-between gap-6">
            <h1
              ref={detailRef}
              tabIndex={-1}
              className="font-heading text-[clamp(2.4rem,6vw,4.75rem)] font-semibold leading-[1] tracking-[-0.035em] text-neutral-950 outline-none"
            >
              {item.title}
            </h1>
            <div className="mt-2 shrink-0">
              <ShareMenu variant="inline" url={`/information/${item.id}`} title={item.title} />
            </div>
          </div>
          <svg
            viewBox="0 0 300 30"
            preserveAspectRatio="none"
            className="mt-4 h-3 w-40 overflow-visible md:w-56"
            aria-hidden="true"
          >
            <motion.path
              d="M4 24 C80 16 180 8 296 4"
              fill="none"
              stroke="#FFD93D"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="stroke-[6] md:stroke-[8]"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.4, duration: 0.7, ease: "easeInOut" }}
            />
          </svg>

          {item.imagePath ? (
            <figure className="mt-10 rounded-[28px] border border-neutral-200/70 bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              {isVideo(item.imagePath) ? (
                <video
                  src={item.imagePath}
                  controls
                  className="block max-h-[75vh] w-full rounded-[22px] bg-neutral-950 object-contain"
                />
              ) : (
                <a
                  href={item.imagePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-[22px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2F5BD3]"
                >
                  <img
                    src={item.imagePath}
                    alt={item.title}
                    className="block max-h-[75vh] w-full rounded-[22px] bg-neutral-50 object-contain object-top"
                  />
                </a>
              )}
              {!isVideo(item.imagePath) ? (
                <figcaption className="px-3 pb-1 pt-3 font-mono text-[12px] text-neutral-500">
                  Open the image to view it full size ↗
                </figcaption>
              ) : null}
            </figure>
          ) : null}

          <div
            className="prose prose-neutral mt-10 max-w-2xl text-[16px] leading-8 text-neutral-700 [&_a]:font-medium [&_a]:text-[#2F5BD3] [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:text-neutral-950 [&_h3]:mt-6 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-neutral-950 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_p]:mt-4 [&_strong]:text-neutral-950 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />
        </motion.div>
      </article>

      {prev || next ? (
        <nav
          aria-label="More guides"
          className="mx-auto mt-20 grid max-w-4xl gap-4 px-6 sm:grid-cols-2"
        >
          <div>
            {prev ? <SiblingCard item={prev} index={position - 1} direction="prev" /> : null}
          </div>
          <div>
            {next ? <SiblingCard item={next} index={position + 1} direction="next" /> : null}
          </div>
        </nav>
      ) : null}

      <Footer />
    </main>
  );
}
