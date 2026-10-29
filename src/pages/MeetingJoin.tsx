import React from "react";
import { Link, useLoaderData, useParams } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  Building2,
  Download,
  Share2,
  Home,
  MapPin,
  UserRound,
  Users,
  BadgeCheck,
} from "lucide-react";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { Asterisk } from "@/components/Asterisk";
import { Card, Field, Stroke, darkPill, lightPill, pillIcon } from "@/components/meeting/MeetingUi";
import { joinMeeting, type MeetingDetails } from "@/lib/meeting-api";
import { renderTicketPng, ticketFileName, type TicketData } from "@/lib/ticketImage";

type Form = { name: string; department: string; role: string };
type Ticket = TicketData;

const EMPTY: Form = { name: "", department: "", role: "" };
const ROLE_CHIPS = ["Lecturer", "Staff", "Student", "Guest", "Vendor"];
const SAVED_KEY = "it-meeting-attendee";

function loadSaved(): Form | null {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Form>) } : null;
  } catch {
    return null;
  }
}

function storeSaved(form: Form | null) {
  try {
    if (form) localStorage.setItem(SAVED_KEY, JSON.stringify(form));
    else localStorage.removeItem(SAVED_KEY);
  } catch {
    // Storage blocked; the form just won't be prefilled next time.
  }
}

// Coloured "ticket stub" with the meeting details, shared by the form and the success screen.
function MeetingStub({
  meeting,
  badge = "Sign-in open",
  children,
}: {
  meeting: MeetingDetails;
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[22px] bg-[#7B61FF] p-6 text-white sm:p-7">
      <Asterisk className="absolute -right-6 -top-6 w-28 text-[#FFD93D]/90" duration={24} />
      <span className="relative inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 font-mono text-[12px] backdrop-blur">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FFD93D] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FFD93D]" />
        </span>
        {badge}
      </span>
      <h1 className="relative mt-5 break-words pr-10 font-heading text-[clamp(1.9rem,7.5vw,2.75rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
        {meeting.name}
      </h1>
      <dl className="relative mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/70" />
          <div className="min-w-0">
            <dt className="font-mono text-[11px] uppercase tracking-wide text-white/60">Place</dt>
            <dd className="break-words font-medium">{meeting.place}</dd>
          </div>
        </div>
        <div className="flex min-w-0 items-start gap-2.5">
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-white/70" />
          <div className="min-w-0">
            <dt className="font-mono text-[11px] uppercase tracking-wide text-white/60">
              Organised by
            </dt>
            <dd className="break-words font-medium">{meeting.organiser}</dd>
          </div>
        </div>
      </dl>
      {children}
    </div>
  );
}

// Dashed tear line with notches, so the card reads as a ticket.
function Perforation() {
  return (
    <div className="relative -mx-2 my-1 h-6" aria-hidden="true">
      <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-neutral-200/70 bg-[#FAFAF8]" />
      <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-neutral-200/70 bg-[#FAFAF8]" />
      <span className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-neutral-200" />
    </div>
  );
}

function Closed() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-6 pb-24 pt-40 text-center">
      <Asterisk className="w-12 text-[#7B61FF]" />
      <h1 className="mt-8 font-heading text-4xl font-semibold tracking-[-0.035em] text-neutral-950 md:text-5xl">
        This meeting has ended
      </h1>
      <p className="mt-3 text-neutral-600">
        Sign-in is closed, or the link is no longer valid. Please check with the organiser.
      </p>
      <Link to="/" className={`${lightPill} mt-8`}>
        Back to home
        <span className={pillIcon}>
          <Home className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </Link>
    </section>
  );
}

function Success({ meeting, ticket }: { meeting: MeetingDetails; ticket: Ticket }) {
  const rows = [
    ["Name", ticket.name],
    ["Department", ticket.department],
    ["Role", ticket.role],
    ["Signed in", `${ticket.date}, ${ticket.time}`],
  ];
  const [working, setWorking] = React.useState<"share" | "download" | null>(null);
  const [status, setStatus] = React.useState("");

  const saveFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const download = async () => {
    setWorking("download");
    setStatus("");
    try {
      saveFile(await renderTicketPng(meeting, ticket), ticketFileName(meeting, ticket));
      setStatus("Ticket saved as PNG.");
    } catch {
      setStatus("Couldn't create the image. Please try again.");
    }
    setWorking(null);
  };

  const share = async () => {
    setWorking("share");
    setStatus("");
    try {
      const blob = await renderTicketPng(meeting, ticket);
      const file = new File([blob], ticketFileName(meeting, ticket), { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${meeting.name} attendance`,
          text: `${ticket.name} signed in to ${meeting.name} (${ticket.date}, ${ticket.time}).`,
        });
      } else {
        saveFile(blob, file.name);
        setStatus("Sharing isn't available on this device, so the ticket was downloaded instead.");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setStatus("Couldn't share the ticket. Try downloading it instead.");
      }
    }
    setWorking(null);
  };

  return (
    <section className="mx-auto max-w-xl px-5 pb-20 pt-32 md:pt-40">
      <div className="flex flex-col items-center text-center">
        <motion.svg
          viewBox="0 0 64 64"
          className="h-16 w-16"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          aria-hidden="true"
        >
          <circle cx="32" cy="32" r="32" fill="#2F5BD3" />
          <motion.path
            d="M19 33 L28 42 L46 23"
            fill="none"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.25, duration: 0.45, ease: "easeOut" }}
          />
        </motion.svg>
        <motion.h2
          className="mt-6 font-heading text-[clamp(2.6rem,11vw,4rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-neutral-950"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          You're{" "}
          <span className="relative inline-block">
            in!
            <Stroke delay={0.5} />
          </span>
        </motion.h2>
        <p className="mt-6 text-[15px] leading-7 text-neutral-600">
          Your name is now on the organiser's screen.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="mt-8">
          <MeetingStub meeting={meeting} badge="Signed in" />
          <Perforation />
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 pb-5 pt-2">
            {rows.map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="font-mono text-[12px] text-neutral-500">{label}</dt>
                <dd className="mt-0.5 break-words font-medium text-neutral-950">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </motion.div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={share}
          disabled={working !== null}
          className={`${darkPill} pl-5`}
        >
          {working === "share" ? "Preparing…" : "Share ticket"}
          <span className={pillIcon}>
            <Share2 className="h-4 w-4" strokeWidth={2.4} />
          </span>
        </button>
        <button
          type="button"
          onClick={download}
          disabled={working !== null}
          className={`${darkPill} pl-5`}
        >
          {working === "download" ? "Saving…" : "Download ticket"}
          <span className={pillIcon}>
            <Download className="h-4 w-4" strokeWidth={2.4} />
          </span>
        </button>
      </div>
      <p className="mt-3 min-h-5 text-center text-[13px] text-neutral-500" role="status">
        {status}
      </p>

      <div className="mt-6 flex justify-center">
        <Link to="/" className={lightPill}>
          Back to home
          <span className={pillIcon}>
            <Home className="h-4 w-4" strokeWidth={2.2} />
          </span>
        </Link>
      </div>
    </section>
  );
}

export default function MeetingJoin() {
  const { id } = useParams({ from: "/meeting/$id" });
  const { meeting } = useLoaderData({ from: "/meeting/$id" }) as {
    meeting: MeetingDetails | null;
  };
  const [form, setForm] = React.useState<Form>(EMPTY);
  const [prefilled, setPrefilled] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [ticket, setTicket] = React.useState<Ticket | null>(null);
  const [closed, setClosed] = React.useState(!meeting);

  React.useEffect(() => {
    const saved = loadSaved();
    if (saved) {
      setForm(saved);
      setPrefilled(true);
    }
  }, []);

  const set = (key: keyof Form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));
  const filledCount = Object.values(form).filter((v) => v.trim()).length;

  const clearSaved = () => {
    storeSaved(null);
    setForm(EMPTY);
    setPrefilled(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await joinMeeting({ data: { id, ...form } });
      if (result.ok) {
        const clean = {
          name: form.name.trim(),
          department: form.department.trim(),
          role: form.role.trim(),
        };
        storeSaved(clean);
        const now = new Date();
        setTicket({
          ...clean,
          date: new Intl.DateTimeFormat("en-MY", { dateStyle: "medium" }).format(now),
          time: new Intl.DateTimeFormat("en-MY", { timeStyle: "short" }).format(now),
        });
        window.scrollTo({ top: 0 });
      } else if (result.reason === "not-found") {
        setClosed(true);
      } else {
        setError("This meeting is full. Please let the organiser know.");
      }
    } catch {
      setError("Couldn't sign you in. Please check your connection and try again.");
    }
    setBusy(false);
  };

  if (closed || !meeting) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#FAFAF8] text-neutral-900">
        <HomeNavbar />
        <Closed />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAFAF8] text-neutral-900">
      <HomeNavbar />
      {ticket ? (
        <Success meeting={meeting} ticket={ticket} />
      ) : (
        <section className="mx-auto max-w-xl px-5 pb-20 pt-28 md:pt-36">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card>
              <MeetingStub meeting={meeting} />
              <Perforation />

              <form
                onSubmit={submit}
                className="flex flex-col gap-5 px-4 pb-4 pt-1 sm:px-6 sm:pb-6"
              >
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="font-mono text-[13px] text-neutral-500">Attendee sign-in</p>
                    <h2 className="mt-1 font-heading text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                      Tell us who you are
                    </h2>
                  </div>
                  <span className="shrink-0 pb-1 font-mono text-[13px] text-neutral-400">
                    {filledCount} / 3
                  </span>
                </div>

                <AnimatePresence>
                  {prefilled ? (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="-mt-1 flex items-center justify-between gap-3 overflow-hidden rounded-2xl bg-[#FFD93D]/25 px-4 py-2.5 text-[13px] text-neutral-700"
                    >
                      Filled in from your last sign-in on this phone.
                      <button
                        type="button"
                        onClick={clearSaved}
                        className="shrink-0 font-medium text-neutral-950 underline underline-offset-2"
                      >
                        Not you?
                      </button>
                    </motion.p>
                  ) : null}
                </AnimatePresence>

                <Field
                  label="Name"
                  name="name"
                  placeholder="Your full name"
                  icon={UserRound}
                  autoComplete="name"
                  enterKeyHint="next"
                  value={form.name}
                  onChange={set("name")}
                />
                <Field
                  label="Department"
                  name="department"
                  placeholder="e.g. IT Department"
                  icon={Building2}
                  autoComplete="organization"
                  enterKeyHint="next"
                  value={form.department}
                  onChange={set("department")}
                />
                <Field
                  label="Role"
                  name="role"
                  placeholder="Tap below or type your own"
                  icon={BadgeCheck}
                  autoComplete="organization-title"
                  enterKeyHint="done"
                  value={form.role}
                  onChange={set("role")}
                >
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ROLE_CHIPS.map((chip) => {
                      const active = form.role.trim().toLowerCase() === chip.toLowerCase();
                      return (
                        <button
                          key={chip}
                          type="button"
                          aria-pressed={active}
                          onClick={() => set("role")(chip)}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition active:scale-95 ${
                            active
                              ? "bg-neutral-950 text-white"
                              : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                          }`}
                        >
                          {chip}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {error ? (
                  <p className="text-sm font-medium text-red-600" role="alert">
                    {error}
                  </p>
                ) : null}

                <div className="mt-1 flex gap-1.5" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100"
                    >
                      <motion.span
                        className="block h-full rounded-full bg-[#2F5BD3]"
                        initial={false}
                        animate={{ width: i < filledCount ? "100%" : "0%" }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </span>
                  ))}
                </div>

                <button type="submit" disabled={busy} className={`${darkPill} w-full py-2`}>
                  {busy ? "Signing in…" : "Sign in to meeting"}
                  <span className={`${pillIcon} group-hover:rotate-45`}>
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
                  </span>
                </button>
              </form>
            </Card>
          </motion.div>

          <p className="mt-5 px-4 text-center text-xs leading-5 text-neutral-400">
            Only the meeting organiser sees your details. Nothing is stored in our database.
          </p>
        </section>
      )}
    </main>
  );
}
