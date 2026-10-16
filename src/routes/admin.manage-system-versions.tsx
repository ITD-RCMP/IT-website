import { createFileRoute } from "@tanstack/react-router";
import ManageSystemVersions from "@/admin/manageSystemVersions";
import { listSystemVersions } from "@/lib/systemVersion-api";

export const Route = createFileRoute("/admin/manage-system-versions")({
  loader: async () => {
    const versions = await listSystemVersions();
    return { versions };
  },
  component: ManageSystemVersions,
});
