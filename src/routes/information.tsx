import React from "react";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import Information from "../pages/information";
import { createSeoHead, webPageJsonLd } from "@/lib/seo";

const title = "Information";
const description =
  "Guides and resources from the RCMP IT Department, including the new student login guide, wireless microphone usage, and department introductions.";

function InformationLayout() {
  const location = useLocation();

  // If the current path is just /information, show the listing
  if (location.pathname === "/information" || location.pathname === "/information/") {
    return <Information />;
  }

  // Otherwise, let child routes render
  return <Outlet />;
}

export const Route = createFileRoute("/information")({
  head: () =>
    createSeoHead({
      title,
      description,
      path: "/information",
      jsonLd: webPageJsonLd({ title, description, path: "/information" }),
    }),
  component: InformationLayout,
});

export default InformationLayout;
