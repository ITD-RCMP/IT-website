import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/microsoft/start")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { startMicrosoftSso } = await import("@/lib/auth.server");
        return startMicrosoftSso(request);
      },
    },
  },
});
