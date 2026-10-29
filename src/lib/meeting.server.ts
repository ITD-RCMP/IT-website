import { randomBytes, randomUUID } from "node:crypto";

export type MeetingDetails = {
  name: string;
  place: string;
  organiser: string;
};

export type Attendee = {
  id: string;
  name: string;
  department: string;
  role: string;
  joinedAt: string;
};

type Meeting = {
  id: string;
  hostKey: string;
  details: MeetingDetails;
  startedAt: string;
  attendees: Attendee[];
  expiresAt: number;
};

const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_MEETINGS = 500;
const MAX_ATTENDEES = 500;

// Kept in process memory only (never the database); globalThis survives dev hot reloads.
const store: Map<string, Meeting> = ((
  globalThis as { __meetings?: Map<string, Meeting> }
).__meetings ??= new Map());

function sweep() {
  const now = Date.now();
  for (const [id, meeting] of store) {
    if (meeting.expiresAt <= now) store.delete(id);
  }
}

function hostMeeting(id: string, hostKey: string) {
  sweep();
  const meeting = store.get(id);
  return meeting && meeting.hostKey === hostKey ? meeting : null;
}

function newMeetingId() {
  let id: string;
  do {
    id = randomBytes(6).toString("base64url");
  } while (store.has(id));
  return id;
}

export function startMeeting(details: MeetingDetails) {
  sweep();
  if (store.size >= MAX_MEETINGS)
    throw new Error("Too many meetings are running. Try again later.");
  const meeting: Meeting = {
    id: newMeetingId(),
    hostKey: randomUUID(),
    details,
    startedAt: new Date().toISOString(),
    attendees: [],
    expiresAt: Date.now() + TTL_MS,
  };
  store.set(meeting.id, meeting);
  return { id: meeting.id, hostKey: meeting.hostKey, startedAt: meeting.startedAt };
}

// Re-registers a meeting from the host's browser copy after a server restart wiped memory.
export function restoreMeeting(input: {
  id: string;
  hostKey: string;
  details: MeetingDetails;
  startedAt: string;
  attendees: Attendee[];
}) {
  sweep();
  const existing = store.get(input.id);
  if (existing) return existing.hostKey === input.hostKey;
  if (store.size >= MAX_MEETINGS) return false;
  store.set(input.id, {
    ...input,
    attendees: input.attendees.slice(0, MAX_ATTENDEES),
    expiresAt: Date.now() + TTL_MS,
  });
  return true;
}

export function getMeetingInfo(id: string): MeetingDetails | null {
  sweep();
  return store.get(id)?.details ?? null;
}

export function joinMeeting(
  id: string,
  attendee: Pick<Attendee, "name" | "department" | "role">,
): { ok: true } | { ok: false; reason: "not-found" | "full" } {
  sweep();
  const meeting = store.get(id);
  if (!meeting) return { ok: false, reason: "not-found" };
  if (meeting.attendees.length >= MAX_ATTENDEES) return { ok: false, reason: "full" };
  meeting.attendees.push({ ...attendee, id: randomUUID(), joinedAt: new Date().toISOString() });
  return { ok: true };
}

export function getAttendees(id: string, hostKey: string): Attendee[] | null {
  return hostMeeting(id, hostKey)?.attendees ?? null;
}

export function removeAttendee(id: string, hostKey: string, attendeeId: string) {
  const meeting = hostMeeting(id, hostKey);
  if (!meeting) return false;
  meeting.attendees = meeting.attendees.filter((a) => a.id !== attendeeId);
  return true;
}

export function endMeeting(id: string, hostKey: string): Attendee[] | null {
  const meeting = hostMeeting(id, hostKey);
  if (!meeting) return null;
  store.delete(id);
  return meeting.attendees;
}
