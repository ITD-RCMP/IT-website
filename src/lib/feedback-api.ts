import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createFeedbackQuestion as createFeedbackQuestionRecord,
  deleteFeedbackQuestion as deleteFeedbackQuestionRecord,
  getFeedbackStats as loadFeedbackStats,
  listActiveFeedbackQuestions as loadActiveFeedbackQuestions,
  listFeedbackEntries as loadFeedbackEntries,
  listFeedbackQuestions as loadFeedbackQuestions,
  reorderFeedbackQuestions as reorderFeedbackQuestionsRecord,
  setFeedbackQuestionActive as setFeedbackQuestionActiveRecord,
  submitFeedback as saveFeedback,
  updateFeedbackQuestion as updateFeedbackQuestionRecord,
  type FeedbackStats,
} from "@/lib/feedback.server";

export type { FeedbackStats };
export type { FeedbackEntry, FeedbackQuestion } from "@/lib/feedback.server";

const statsFilterSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
});

export const getFeedbackStats = createServerFn({ method: "GET" })
  .validator(statsFilterSchema)
  .handler(async ({ data }) => loadFeedbackStats(data));

export const listFeedbackEntries = createServerFn({ method: "GET" }).handler(async () =>
  loadFeedbackEntries(),
);

export const listFeedbackQuestions = createServerFn({ method: "GET" }).handler(async () =>
  loadFeedbackQuestions(),
);

export const listActiveFeedbackQuestions = createServerFn({ method: "GET" }).handler(async () =>
  loadActiveFeedbackQuestions(),
);

export const setFeedbackQuestionActive = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.number().int().positive(),
      isActive: z.boolean(),
    }),
  )
  .handler(async ({ data }) => setFeedbackQuestionActiveRecord(data.id, data.isActive));

export const reorderFeedbackQuestions = createServerFn({ method: "POST" })
  .validator(z.object({ orderedIds: z.array(z.number().int().positive()).min(1) }))
  .handler(async ({ data }) => reorderFeedbackQuestionsRecord(data.orderedIds));

export const createFeedbackQuestion = createServerFn({ method: "POST" })
  .validator(
    z.object({
      question: z.string().min(1),
      sortOrder: z.number().int().min(1).max(255).optional(),
    }),
  )
  .handler(async ({ data }) => createFeedbackQuestionRecord(data));

export const updateFeedbackQuestion = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.number().int().positive(),
      question: z.string().min(1),
      sortOrder: z.number().int().min(1).max(255),
    }),
  )
  .handler(async ({ data }) => updateFeedbackQuestionRecord(data));

export const deleteFeedbackQuestion = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data }) => deleteFeedbackQuestionRecord(data.id));

export const submitFeedback = createServerFn({ method: "POST" })
  .validator(
    z.object({
      category: z.enum(["Academic Staff", "Non-Academic Staff", "Student"]),
      suggestion: z.string().min(1),
      ratings: z.array(z.number().int().min(1).max(5)).min(1),
    }),
  )
  .handler(async ({ data }) => saveFeedback(data));
