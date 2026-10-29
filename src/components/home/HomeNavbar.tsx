import React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/information", label: "Info" },
  { to: "/about", label: "About us" },
] as const;

const pillClass =
  "rounded-full px-5 py-2.5 text-[15px] font-medium text-neutral-800 transition-colors hover:bg-neutral-100";

export function HomeNavbar() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4 md:px-8">
      <div className="mx-auto max-w-7xl rounded-[26px] border border-neutral-200/70 bg-white/90 p-2 pl-3 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <img
              src="/unikl-official.png"
              alt="UniKL logo"
              className="h-11 w-auto object-contain"
            />
            <span className="hidden leading-tight sm:block">
              <span className="block text-[17px] font-semibold text-neutral-900">
                Information Technology Department
              </span>
              <span className="block text-[13px] text-neutral-500">
                UniKL Royal College Of Medicine Perak
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={pillClass}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "bg-neutral-100" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/feedback"
              className="group ml-2 flex items-center gap-3 rounded-full bg-neutral-100 py-1.5 pl-6 pr-1.5 text-[15px] font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
            >
              Send Feedback
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
              </span>
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-900 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open ? (
          <div className="mt-2 flex flex-col gap-1 border-t border-neutral-100 pt-2 md:hidden">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-[15px] font-medium text-neutral-900 hover:bg-neutral-100"
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "bg-neutral-100" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/feedback"
              className="flex items-center justify-between rounded-2xl bg-neutral-950 px-4 py-3 text-[15px] font-semibold text-white"
            >
              Send Feedback <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
}
