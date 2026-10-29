import React from "react";
import { Link, useLoaderData, useParams } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowUpRight, Home, Plus } from "lucide-react";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { Asterisk } from "@/components/Asterisk";
import { Card, Field, Stroke, darkPill, lightPill, pillIcon } from "@/components/meeting/MeetingUi";
import { joinMeeting, type MeetingDetails } from "@/lib/meeting-api";

const EMPTY = { name: "", department: "", role: "" };

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

export default function MeetingJoin() {
  const { id } = useParams({ from: "/meeting/$id" });
  const { meeting } = useLoaderData({ from: "/meeting/$id" }) as {
    meeting: MeetingDetails | null;
  };
  const [form, setForm] = React.useState(EMPTY);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [signedIn, setSignedIn] = React.useState<string | null>(null);
  const [closed, setClosed] = React.useState(!meeting);

  const set = (key: keyof typeof EMPTY) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await joinMeeting({ data: { id, ...form } });
      if (result.ok) {
        setSignedIn(form.name.trim());
        setForm(EMPTY);
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAFAF8] text-neutral-900">
      <HomeNavbar />
      {closed || !meeting ? (
        <Closed />
      ) : signedIn ? (
        <section className="mx-auto flex max-w-xl flex-col items-center px-6 pb-24 pt-40 text-center">
          <Asterisk className="w-12 text-[#7B61FF]" />
          <motion.h1
            className="mt-8 font-heading text-[clamp(2.6rem,10vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-neutral-950"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            You're{" "}
            <span className="relative inline-block">
              in!
              <Stroke delay={0.3} />
            </span>
          </motion.h1>
          <p className="mt-8 text-[15px] leading-7 text-neutral-600">
            Thanks, <span className="font-medium text-neutral-900">{signedIn}</span>. Your name is
            now on the attendance list for{" "}
            <span className="font-medium text-neutral-900">{meeting.name}</span>.
          </p>
          <button type="button" onClick={() => setSignedIn(null)} className={`${lightPill} mt-8`}>
            Sign in another person
            <span className={pillIcon}>
              <Plus className="h-4 w-4" strokeWidth={2.4} />
            </span>
          </button>
        </section>
      ) : (
        <section className="mx-auto max-w-xl px-5 pb-20 pt-32 md:pt-40">
          <p className="font-mono text-[13px] text-neutral-500">Meeting sign-in</p>
          <h1 className="mt-3 break-words font-heading text-[clamp(2.2rem,8vw,3.5rem)] font-semibold leading-[1] tracking-[-0.035em] text-neutral-950">
            {meeting.name}
          </h1>
          <dl className="mt-5 flex flex-wrap gap-2 text-sm">
            <div className="rounded-full bg-white px-3 py-1.5 ring-1 ring-neutral-200">
              <dt className="sr-only">Place</dt>
              <dd className="text-neutral-700">{meeting.place}</dd>
            </div>
            <div className="rounded-full bg-white px-3 py-1.5 ring-1 ring-neutral-200">
              <dt className="sr-only">Organised by</dt>
              <dd className="text-neutral-700">By {meeting.organiser}</dd>
            </div>
          </dl>

          <Card className="mt-8">
            <form onSubmit={submit} className="flex flex-col gap-5 p-5 sm:p-7">
              <Field
                label="Name"
                name="name"
                placeholder="Your full name"
                value={form.name}
                onChange={set("name")}
              />
              <Field
                label="Department"
                name="department"
                placeholder="e.g. IT Department"
                value={form.department}
                onChange={set("department")}
              />
              <Field
                label="Role"
                name="role"
                placeholder="e.g. Lecturer, Staff, Student"
                value={form.role}
                onChange={set("role")}
              />
              {error ? (
                <p className="text-sm font-medium text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
              <button type="submit" disabled={busy} className={`${darkPill} mt-2 w-full`}>
                {busy ? "Signing in…" : "Sign in"}
                <span className={`${pillIcon} group-hover:rotate-45`}>
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
                </span>
              </button>
            </form>
          </Card>
          <p className="mt-5 text-center text-xs leading-5 text-neutral-400">
            Your details are only shared with the meeting organiser and are not stored in our
            database.
          </p>
        </section>
      )}
    </main>
  );
}
