import { createFileRoute } from "@tanstack/react-router";
import MeetingJoin from "../pages/MeetingJoin";
import { getMeetingInfo } from "@/lib/meeting-api";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/meeting/$id")({
  loader: async ({ params }) => {
    try {
      return { meeting: await getMeetingInfo({ data: { id: params.id } }) };
    } catch {
      return { meeting: null };
    }
  },
  head: ({ params }) =>
    createSeoHead({
      title: "Meeting Sign-in",
      description: "Sign in to the meeting attendance list.",
      path: `/meeting/${params.id}`,
      noIndex: true,
    }),
  component: MeetingJoin,
});
