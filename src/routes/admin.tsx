import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { getAuthUser } from "@/lib/auth";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/admin")({
  head: () =>
    createSeoHead({
      title: "Admin",
      description: "RCMP IT Department admin area.",
      path: "/admin",
      noIndex: true,
    }),
  beforeLoad: async () => {
    const user = await getAuthUser();
    if (!user) {
      throw redirect({ href: "/auth/microsoft/start" });
    }
    return { user };
  },
  component: () => <Outlet />,
});
