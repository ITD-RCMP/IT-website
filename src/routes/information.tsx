import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import Information from "../pages/information";
import { createSeoHead, webPageJsonLd } from "@/lib/seo";

const title = "Information";
const description =
  "Guides and resources from the RCMP IT Department, including the new student login guide, wireless microphone usage, and department introductions.";

export const Route = createFileRoute("/information")({
  head: () =>
    createSeoHead({
      title,
      description,
      path: "/information",
      jsonLd: webPageJsonLd({ title, description, path: "/information" }),
    }),
  component: Information,
});

export default function InformationRoute() {
  return <Information />;
}
