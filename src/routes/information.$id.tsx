import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import InformationDetail from "../pages/informationDetail";
import { createSeoHead, webPageJsonLd } from "@/lib/seo";

const GUIDE_TITLES: Record<string, string> = {
  "unikl-link": "UniKL Link - App login & setup guide",
  "wow-video": "WOW Video - Department introduction for new students",
  "mic-guidelines": "Wireless Microphone - Usage & care guideline",
  "new-student-guide": "New Student Guide - How to log in to your UniKL applications",
  "microsoft-authenticator": "Microsoft Authenticator - Set up the app that confirms your UniKL sign-in",
};

const GUIDE_DESCRIPTIONS: Record<string, string> = {
  "unikl-link": "How to sign in, update to the latest version, and fix common iOS trust issues with the UniKL Link app.",
  "wow-video": "A short video introduction to help new incoming students get to know the IT department and how we support campus.",
  "mic-guidelines": "Guidance and usage details for the IT department wireless microphones. Improper handling may result in audio issues or equipment damage.",
  "new-student-guide": "A quick guide for new students on which username and password to use for Microsoft 365, Portal / ECITIE, UniKL Link and VLE.",
  "microsoft-authenticator": "Microsoft Authenticator is the phone app UniKL uses to confirm it is really you when you sign in to Microsoft 365.",
};

export const Route = createFileRoute("/information/$id")({
  head: ({ params }) => {
    const title = GUIDE_TITLES[params.id] || "Guide";
    const description = GUIDE_DESCRIPTIONS[params.id] || "Information guide from the RCMP IT Department.";

    return createSeoHead({
      title,
      description,
      path: `/information/${params.id}`,
      jsonLd: webPageJsonLd({ title, description, path: `/information/${params.id}` }),
    });
  },
  component: InformationDetail,
});

export default function InformationDetailRoute() {
  return <InformationDetail />;
}
