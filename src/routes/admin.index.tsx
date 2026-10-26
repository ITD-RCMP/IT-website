import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import AdminDashboard from "@/admin/dashboard";
import { getFeedbackStats } from "@/lib/feedback-api";

const now = new Date();

const adminSearchSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).catch(now.getFullYear()).default(now.getFullYear()),
  month: z.coerce.number().int().min(1).max(12).catch(now.getMonth() + 1).default(now.getMonth() + 1),
});

export const Route = createFileRoute("/admin/")({
  validateSearch: adminSearchSchema,
  loaderDeps: ({ search }) => ({ year: search.year, month: search.month }),
  loader: async ({ deps }) => {
    const stats = await getFeedbackStats({ data: deps });
    return { stats };
  },
  component: AdminDashboard,
});
