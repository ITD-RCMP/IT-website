import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import QRCode from "qrcode";
import { ArrowRight, ArrowUpRight, Check, Copy, Download, Home, Plus, X } from "lucide-react";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { Asterisk } from "@/components/Asterisk";
import { Card, Field, Stroke, darkPill, lightPill, pillIcon } from "@/components/meeting/MeetingUi";
import {
  endMeeting,
  getAttendees,
  removeAttendee,
  restoreMeeting,
  startMeeting,
  type Attendee,
  type MeetingDetails,
} from "@/lib/meeting-api";
import { downloadMeetingPdf } from "@/lib/meetingPdf";

const STORAGE_KEY = "it-meeting-host";
const POLL_MS = 3000;

type HostMeeting = {
  id: string;
  hostKey: string;
  details: MeetingDetails;
  startedAt: string;
  attendees: Attendee[];
  endedAt?: string;
};

function loadSaved(): HostMeeting | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HostMeeting) : null;
  } catch {
    return null;
  }
}

function save(meeting: HostMeeting | null) {
  try {
    if (meeting) localStorage.setItem(STORAGE_KEY, JSON.stringify(meeting));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked (private mode); the meeting still works for this tab.
  }
}

const timeOnly = (value: string) =>
  new Intl.DateTimeFormat("en-MY", { timeStyle: "short" }).format(new Date(value));
const pad = (n: number) => String(n).padStart(2, "0");

export default function MeetingHost() {
  const [ready, setReady] = React.useState(false);
  const [meeting, setMeetingState] = React.useState<HostMeeting | null>(null);

  const setMeeting = React.useCallback((next: HostMeeting | null) => {
    setMeetingState(next);
    save(next);
  }, []);

  React.useEffect(() => {
    setMeetingState(loadSaved());
    setReady(true);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAFAF8] text-neutral-900">
      <HomeNavbar />
      {!ready ? null : !meeting ? (
        <SetupStep onStarted={setMeeting} />
      ) : meeting.endedAt ? (
        <EndedStep meeting={meeting} onReset={() => setMeeting(null)} />
      ) : (
        <LiveStep meeting={meeting} onChange={setMeeting} />
      )}
    </main>
  );
}

function SetupStep({ onStarted }: { onStarted: (m: HostMeeting) => void }) {
  const [details, setDetails] = React.useState<MeetingDetails>({
    name: "",
    place: "",
    organiser: "",
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const set = (key: keyof MeetingDetails) => (value: string) =>
    setDetails((d) => ({ ...d, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const started = await startMeeting({ data: details });
      onStarted({ ...started, details, attendees: [] });
    } catch {
      setError("Couldn't start the meeting. Please try again.");
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-36 md:pt-44">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative">
          <p className="font-mono text-[13px] text-neutral-500">Internal systems · Attendance</p>
          <motion.h1
            className="mt-4 font-heading text-[clamp(2.6rem,6.5vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-neutral-950"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Meeting{" "}
            <span className="relative inline-block">
              attendance
              <Stroke />
            </span>
          </motion.h1>
          <p className="mt-10 max-w-md text-[15px] leading-7 text-neutral-600 md:text-lg md:leading-8">
            Fill in the meeting details to get a QR code. Attendees scan it with their phone, sign
            in, and their names appear on your screen.
          </p>
          <ol className="mt-8 flex flex-col gap-3 font-mono text-[13px] text-neutral-500">
            <li>01 — Enter meeting details</li>
            <li>02 — Show the QR code</li>
            <li>03 — End the meeting and download the PDF</li>
          </ol>
          <p className="mt-8 max-w-md text-xs leading-5 text-neutral-400">
            Nothing is saved in our database. The list stays in this browser and is cleared from the
            server when you end the meeting.
          </p>
          <Asterisk className="absolute -top-6 right-[6%] hidden w-12 text-[#7B61FF] lg:block" />
        </div>

        <Card>
          <form onSubmit={submit} className="flex flex-col gap-5 p-5 sm:p-7">
            <Field
              label="Meeting name"
              name="name"
              placeholder="e.g. Monthly IT briefing"
              value={details.name}
              onChange={set("name")}
              autoFocus
            />
            <Field
              label="Place"
              name="place"
              placeholder="e.g. Meeting Room 2, Level 3"
              value={details.place}
              onChange={set("place")}
            />
            <Field
              label="Organised by"
              name="organiser"
              placeholder="e.g. IT Department"
              value={details.organiser}
              onChange={set("organiser")}
            />
            {error ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" disabled={busy} className={`${darkPill} mt-2 w-full`}>
              {busy ? "Starting…" : "Generate QR code"}
              <span className={`${pillIcon} group-hover:rotate-45`}>
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
              </span>
            </button>
          </form>
        </Card>
      </div>
    </section>
  );
}

function LiveStep({
  meeting,
  onChange,
}: {
  meeting: HostMeeting;
  onChange: (m: HostMeeting) => void;
}) {
  const [qr, setQr] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [confirmEnd, setConfirmEnd] = React.useState(false);
  const [ending, setEnding] = React.useState(false);
  const [offline, setOffline] = React.useState(false);
  const latest = React.useRef(meeting);
  latest.current = meeting;

  const removed = React.useRef(new Set<string>());

  const joinUrl = `${window.location.origin}/meeting/${meeting.id}`;
  const host = { id: meeting.id, hostKey: meeting.hostKey };

  React.useEffect(() => {
    QRCode.toDataURL(joinUrl, { width: 720, margin: 1, color: { dark: "#0a0a0a" } }).then(setQr);
  }, [joinUrl]);

  React.useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const m = latest.current;
        let attendees = await getAttendees({ data: { id: m.id, hostKey: m.hostKey } });
        if (attendees === null) {
          // Server memory was reset (e.g. a restart); re-register from this browser's copy.
          await restoreMeeting({
            data: {
              id: m.id,
              hostKey: m.hostKey,
              details: m.details,
              startedAt: m.startedAt,
              attendees: m.attendees,
            },
          });
          attendees = m.attendees;
        }
        if (!cancelled) {
          setOffline(false);
          // A poll that started before a removal can still contain the removed name.
          const visible = attendees.filter((a) => !removed.current.has(a.id));
          onChange({ ...latest.current, attendees: visible });
        }
      } catch {
        if (!cancelled) setOffline(true);
      }
    };
    void poll();
    const timer = window.setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [onChange]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable; the link is still visible to copy by hand.
    }
  };

  const remove = (attendeeId: string) => {
    removed.current.add(attendeeId);
    onChange({ ...meeting, attendees: meeting.attendees.filter((a) => a.id !== attendeeId) });
    void removeAttendee({ data: { ...host, attendeeId } }).catch(() => {});
  };

  const end = async () => {
    setEnding(true);
    let attendees = meeting.attendees;
    try {
      attendees = (await endMeeting({ data: host })) ?? attendees;
    } catch {
      // Keep the local copy; the server entry expires on its own.
    }
    onChange({ ...meeting, attendees, endedAt: new Date().toISOString() });
  };

  const facts = [
    ["Place", meeting.details.place],
    ["Organised by", meeting.details.organiser],
    ["Started", timeOnly(meeting.startedAt)],
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:pt-40">
      <div className="flex flex-wrap items-center gap-3 font-mono text-[13px] text-neutral-500">
        <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-neutral-200">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
        Meeting in progress
        {offline ? <span className="text-red-600">· reconnecting…</span> : null}
      </div>
      <h1 className="mt-4 break-words font-heading text-[clamp(2.2rem,5vw,4.25rem)] font-semibold leading-[1] tracking-[-0.035em] text-neutral-950">
        {meeting.details.name}
      </h1>

      <div className="mt-10 grid items-start gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="min-w-0">
          <div className="rounded-[22px] bg-[#FAFAF8] p-5 sm:p-8">
            <div className="mx-auto aspect-square w-full max-w-[380px] rounded-[20px] bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              {qr ? (
                <img src={qr} alt="QR code to sign in to this meeting" className="h-full w-full" />
              ) : null}
            </div>
            <p className="mt-5 text-center font-heading text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
              Scan to sign in
            </p>
            <div className="mx-auto mt-3 flex max-w-[380px] items-center gap-2 rounded-full bg-white p-1.5 pl-4 ring-1 ring-neutral-200">
              <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-neutral-500">
                {joinUrl}
              </span>
              <button
                type="button"
                onClick={copy}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-900 transition hover:bg-neutral-200"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <dl className="grid gap-3 px-5 pb-4 pt-5 sm:grid-cols-3">
            {facts.map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="font-mono text-[12px] text-neutral-500">{label}</dt>
                <dd className="mt-0.5 break-words text-sm font-medium text-neutral-900">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="flex min-w-0 min-h-[420px] flex-col">
          <div className="flex items-end justify-between gap-4 px-5 pb-4 pt-5">
            <div>
              <p className="font-mono text-[13px] text-neutral-500">Attendees</p>
              <p className="font-display text-6xl font-black leading-none tracking-[-0.02em] text-neutral-950 [font-stretch:125%]">
                {pad(meeting.attendees.length)}
              </p>
            </div>
            <p className="pb-1 text-right text-xs leading-5 text-neutral-400">
              Updates every few
              <br />
              seconds
            </p>
          </div>

          {meeting.attendees.length === 0 ? (
            <div className="mx-2 flex flex-1 flex-col items-center justify-center rounded-[22px] bg-[#FAFAF8] px-6 py-16 text-center">
              <Asterisk className="w-10 text-[#7B61FF]" />
              <p className="mt-5 font-heading text-xl font-semibold tracking-[-0.02em] text-neutral-950">
                Waiting for the first sign-in…
              </p>
              <p className="mt-1 text-sm text-neutral-500">Names will pop up here.</p>
            </div>
          ) : (
            <ul className="flex max-h-[560px] flex-col gap-1 overflow-y-auto px-1 pb-1">
              <AnimatePresence initial={false}>
                {[...meeting.attendees].reverse().map((a, i) => (
                  <motion.li
                    key={a.id}
                    layout
                    initial={{ opacity: 0, y: -12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="group flex items-center gap-4 rounded-[20px] px-3 py-3 transition-colors hover:bg-neutral-50"
                  >
                    <span className="w-7 shrink-0 font-mono text-[12px] text-neutral-400">
                      {pad(meeting.attendees.length - i)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-heading text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                        {a.name}
                      </span>
                      <span className="block truncate text-sm text-neutral-500">
                        {a.department} · {a.role}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[12px] text-neutral-400">
                      {timeOnly(a.joinedAt)}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(a.id)}
                      aria-label={`Remove ${a.name}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-red-50 hover:text-red-600 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          <div className="mt-auto flex flex-wrap items-center justify-end gap-3 p-3 pt-4">
            {confirmEnd ? (
              <>
                <span className="mr-auto pl-2 text-sm text-neutral-600">
                  End the meeting? No one can sign in after this.
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmEnd(false)}
                  className="rounded-full px-5 py-3 text-[15px] font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button type="button" onClick={end} disabled={ending} className={darkPill}>
                  {ending ? "Ending…" : "Yes, end meeting"}
                  <span className={pillIcon}>
                    <Check className="h-4 w-4" strokeWidth={2.4} />
                  </span>
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmEnd(true)} className={darkPill}>
                End meeting
                <span className={`${pillIcon} group-hover:translate-x-0.5`}>
                  <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
                </span>
              </button>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}

function EndedStep({ meeting, onReset }: { meeting: HostMeeting; onReset: () => void }) {
  const navigate = useNavigate();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const download = async () => {
    setBusy(true);
    setError("");
    try {
      await downloadMeetingPdf({ ...meeting, endedAt: meeting.endedAt! });
    } catch {
      setError("Couldn't create the PDF. Please try again.");
    }
    setBusy(false);
  };

  const goHome = () => {
    onReset();
    void navigate({ to: "/" });
  };

  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-24 pt-40 text-center md:pt-48">
      <Asterisk className="w-12 text-[#7B61FF]" />
      <motion.h1
        className="mt-8 font-heading text-[clamp(2.8rem,8vw,6rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-neutral-950"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="relative inline-block">
          Thank you
          <Stroke delay={0.4} />
        </span>
      </motion.h1>
      <p className="mt-10 max-w-md text-[15px] leading-7 text-neutral-600 md:text-lg md:leading-8">
        <span className="font-medium text-neutral-900">{meeting.details.name}</span> has ended with{" "}
        <span className="font-medium text-neutral-900">
          {meeting.attendees.length} {meeting.attendees.length === 1 ? "attendee" : "attendees"}
        </span>
        . Download the attendance list before you leave.
      </p>

      <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
        <button type="button" onClick={download} disabled={busy} className={darkPill}>
          {busy ? "Preparing…" : "Download PDF"}
          <span className={pillIcon}>
            <Download className="h-4 w-4" strokeWidth={2.4} />
          </span>
        </button>
        <button type="button" onClick={goHome} className={lightPill}>
          Back to home
          <span className={pillIcon}>
            <Home className="h-4 w-4" strokeWidth={2.2} />
          </span>
        </button>
      </div>
      {error ? (
        <p className="mt-4 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={onReset}
        className="mt-8 flex items-center gap-1.5 font-mono text-[13px] text-neutral-500 transition hover:text-neutral-900"
      >
        <Plus className="h-3.5 w-3.5" /> Start a new meeting
      </button>
    </section>
  );
}
