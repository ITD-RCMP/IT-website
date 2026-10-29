import { createFileRoute } from "@tanstack/react-router";
import MeetingHost from "../pages/MeetingHost";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/meeting/")({
  head: () =>
    createSeoHead({
      title: "Meeting Attendance",
      description: "Create a QR code sign-in sheet for your meeting.",
      path: "/meeting",
      noIndex: true,
    }),
  component: MeetingHost,
});
