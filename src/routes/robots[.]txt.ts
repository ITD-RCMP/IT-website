import { createFileRoute } from "@tanstack/react-router";
import { getSiteUrl } from "@/lib/seo";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const siteUrl = getSiteUrl(new URL(request.url).origin);
        const body = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /admin",
          "Disallow: /admin/",
          "Disallow: /auth",
          "Disallow: /auth/",
          "",
          `Sitemap: ${siteUrl}/sitemap.xml`,
          "",
        ].join("\n");

        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
