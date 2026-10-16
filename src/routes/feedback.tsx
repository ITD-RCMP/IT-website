import { createFileRoute } from "@tanstack/react-router";
import FeedbackForm from "../pages/FeedbackForm";
import { listActiveFeedbackQuestions } from "@/lib/feedback-api";
import { createSeoHead, webPageJsonLd } from "@/lib/seo";

const title = "Feedback";
const description =
  "Share your feedback with the RCMP IT Department to help improve campus IT services and support.";

export const Route = createFileRoute("/feedback")({
  head: () =>
    createSeoHead({
      title,
      description,
      path: "/feedback",
      jsonLd: webPageJsonLd({ title, description, path: "/feedback" }),
    }),
  loader: async () => {
    try {
      const questions = await listActiveFeedbackQuestions();
      return { questions };
    } catch (error) {
      console.error("Failed to load feedback questions:", error);
      return { questions: [] };
    }
  },
  component: FeedbackForm,
});
