import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import InformationDetail from "../pages/informationDetail";
import { getInformationContent } from "@/lib/information-api";
import { createSeoHead, webPageJsonLd } from "@/lib/seo";

function plainTextExcerpt(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
}

export const Route = createFileRoute("/information/$id")({
  loader: async ({ params }) => {
    const numericId = Number(params.id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return { item: null };
    }
    try {
      const item = await getInformationContent({ data: { id: numericId } });
      return { item };
    } catch (error) {
      console.error("Failed to load information content:", error);
      return { item: null };
    }
  },
  head: ({ loaderData, params }) => {
    const title = loaderData?.item?.title ?? "Guide";
    const description = loaderData?.item
      ? plainTextExcerpt(loaderData.item.description)
      : "Information guide from the RCMP IT Department.";

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
