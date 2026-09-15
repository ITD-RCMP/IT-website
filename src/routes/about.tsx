import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import AboutUs from "../pages/AboutUs";
import { createSeoHead, webPageJsonLd } from "@/lib/seo";

const title = "About Us";
const description =
  "Learn about the RCMP IT Department — audio and visual support, campus network help, and internal system development.";

const aboutSearchSchema = z.object({
  error: z.enum(["access_denied", "unauthorized", "invalid", "config", "failed"]).optional().catch(undefined),
});

const AUTH_ERRORS: Record<NonNullable<z.infer<typeof aboutSearchSchema>["error"]>, string> = {
  access_denied: "Microsoft sign-in was cancelled.",
  unauthorized: "This Microsoft account is not authorized for the admin portal.",
  invalid: "Microsoft sign-in could not be verified. Please try again.",
  config: "Microsoft sign-in is not configured on the server.",
  failed: "Unable to sign in with Microsoft. Please try again.",
};

export const Route = createFileRoute("/about")({
  validateSearch: aboutSearchSchema,
  head: () =>
    createSeoHead({
      title,
      description,
      path: "/about",
      jsonLd: webPageJsonLd({ title, description, path: "/about" }),
    }),
  component: AboutPage,
});

function AboutPage() {
  const { error } = Route.useSearch();
  return <AboutUs authError={error ? AUTH_ERRORS[error] : ""} />;
}
