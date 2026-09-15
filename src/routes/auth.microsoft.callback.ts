import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/microsoft/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { finishMicrosoftSso } = await import("@/lib/auth.server");
        return finishMicrosoftSso(request);
      },
    },
  },
});
