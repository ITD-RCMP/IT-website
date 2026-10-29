import type React from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { Asterisk } from "@/components/Asterisk";

export type SectionLink = {
  title: string;
  description: string;
  href: string;
  cta: string;
  tile: { bg: string; fg: string };
  // opens a page inside this site instead of a new tab
  internal?: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");

export function LinkSection({
  id,
  label,
  title,
  description,
  links,
  closeLabel,
  onClose,
}: {
  id: string;
  label: string;
  title: string;
  description: string;
  links: SectionLink[];
  closeLabel: string;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  return (
    <section id={id} className="scroll-mt-28 px-6 pb-24 pt-8 md:pb-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[13px] text-neutral-500">
              {label} · {pad(links.length)}
            </p>
            <h2 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.035em] text-neutral-950 md:text-5xl">
              <span className="relative inline-block">
                {title}
                <svg
                  viewBox="0 0 300 30"
                  preserveAspectRatio="none"
                  className="absolute -bottom-[0.2em] left-[-3%] h-[0.28em] w-[106%] overflow-visible"
                  aria-hidden="true"
                >
                  <motion.path
                    d="M4 24 C80 16 180 8 296 4"
                    fill="none"
                    stroke="#FFD93D"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    className="stroke-[6]"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.7, ease: "easeInOut" }}
                  />
                </svg>
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-neutral-600">{description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="group flex w-fit items-center gap-3 rounded-full bg-neutral-100 py-1.5 pl-5 pr-1.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
          >
            {closeLabel}
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5">
              <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
            </span>
          </button>
        </div>

        <div
          className={`grid gap-5 sm:grid-cols-2 ${
            links.length >= 4 ? "lg:grid-cols-4" : links.length === 3 ? "lg:grid-cols-3" : ""
          }`}
        >
          {links.map((link, i) => (
            <motion.a
              key={link.title}
              href={link.href}
              {...(link.internal
                ? {
                    onClick: (e: React.MouseEvent) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                      e.preventDefault();
                      void navigate({ to: link.href });
                    },
                  }
                : { target: "_blank", rel: "noopener noreferrer" })}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group flex flex-col rounded-[28px] border border-neutral-200/70 bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_24px_50px_-20px_rgba(0,0,0,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2F5BD3]"
            >
              <div
                className={`relative flex h-36 items-end justify-between overflow-hidden rounded-[22px] p-5 ${link.tile.bg}`}
              >
                <span className={`font-mono text-[13px] ${link.tile.fg}`}>{pad(i + 1)}</span>
                <Asterisk
                  className={`w-12 transition-transform duration-500 group-hover:scale-110 ${link.tile.fg}`}
                  duration={16 + i * 4}
                />
              </div>

              <div className="flex flex-1 flex-col px-4 pb-4 pt-5">
                <h3 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-neutral-950 transition-colors group-hover:text-[#2F5BD3]">
                  {link.title}
                </h3>
                <p className="mt-1.5 flex-1 text-sm leading-6 text-neutral-600">
                  {link.description}
                </p>
                <span className="mt-5 flex items-center justify-between rounded-full bg-neutral-950 py-1.5 pl-5 pr-1.5 text-sm font-medium text-white transition-colors group-hover:bg-neutral-800">
                  {link.cta}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-950 transition-transform duration-300 group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
                  </span>
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
