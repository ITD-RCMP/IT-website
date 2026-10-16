import { createFileRoute } from "@tanstack/react-router";
import ManageInformation from "@/admin/manageInformation";
import { listInformationContent } from "@/lib/information-api";

export const Route = createFileRoute("/admin/manage-information")({
  loader: async () => {
    const items = await listInformationContent();
    return { items };
  },
  component: ManageInformation,
});
