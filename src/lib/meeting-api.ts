import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  endMeeting as endMeetingRecord,
  getAttendees as loadAttendees,
  getMeetingInfo as loadMeetingInfo,
  joinMeeting as joinMeetingRecord,
  removeAttendee as removeAttendeeRecord,
  restoreMeeting as restoreMeetingRecord,
  startMeeting as startMeetingRecord,
} from "@/lib/meeting.server";

export type { Attendee, MeetingDetails } from "@/lib/meeting.server";

const text = z.string().trim().min(1).max(120);
const meetingId = z.string().regex(/^[A-Za-z0-9_-]{6,16}$/);
const hostSchema = z.object({ id: meetingId, hostKey: z.string().uuid() });
const detailsSchema = z.object({ name: text, place: text, organiser: text });
const attendeeFields = { name: text, department: text, role: text };

export const startMeeting = createServerFn({ method: "POST" })
  .validator(detailsSchema)
  .handler(async ({ data }) => startMeetingRecord(data));

export const restoreMeeting = createServerFn({ method: "POST" })
  .validator(
    hostSchema.extend({
      details: detailsSchema,
      startedAt: z.string().datetime(),
      attendees: z
        .array(
          z.object({
            ...attendeeFields,
            id: z.string().uuid(),
            joinedAt: z.string().datetime(),
          }),
        )
        .max(500),
    }),
  )
  .handler(async ({ data }) => restoreMeetingRecord(data));

export const getMeetingInfo = createServerFn({ method: "GET" })
  .validator(z.object({ id: meetingId }))
  .handler(async ({ data }) => loadMeetingInfo(data.id));

export const joinMeeting = createServerFn({ method: "POST" })
  .validator(z.object({ id: meetingId, ...attendeeFields }))
  .handler(async ({ data }) => {
    const { id, ...attendee } = data;
    return joinMeetingRecord(id, attendee);
  });

export const getAttendees = createServerFn({ method: "GET" })
  .validator(hostSchema)
  .handler(async ({ data }) => loadAttendees(data.id, data.hostKey));

export const removeAttendee = createServerFn({ method: "POST" })
  .validator(hostSchema.extend({ attendeeId: z.string().uuid() }))
  .handler(async ({ data }) => removeAttendeeRecord(data.id, data.hostKey, data.attendeeId));

export const endMeeting = createServerFn({ method: "POST" })
  .validator(hostSchema)
  .handler(async ({ data }) => endMeetingRecord(data.id, data.hostKey));
