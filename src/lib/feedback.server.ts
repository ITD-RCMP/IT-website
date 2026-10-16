import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getDb, query } from "@/lib/db.server";
import { CATEGORIES, RATING_LABELS, type Category } from "@/lib/feedback";

const RATING_SCORE: Record<(typeof RATING_LABELS)[number], number> = {
  "Not Satisfied": 1,
  "Somewhat Satisfied": 2,
  Neutral: 3,
  Satisfied: 4,
  "Very Satisfied": 5,
};

export type FeedbackStatsFilter = {
  year: number;
  month: number;
};

export type FeedbackStats = {
  filter: FeedbackStatsFilter;
  availableYears: number[];
  totalResponses: number;
  averageScore: number | null;
  byCategory: { category: Category; count: number }[];
  byRating: { rating: (typeof RATING_LABELS)[number]; count: number }[];
  byCategoryRating: {
    category: "Academic Staff" | "Non-Academic Staff";
    ratings: { rating: (typeof RATING_LABELS)[number]; count: number }[];
  }[];
  byQuestion: {
    sortOrder: number;
    question: string;
    averageScore: number | null;
    responses: number;
  }[];
  recentSuggestions: {
    id: number;
    category: Category;
    suggestion: string;
    createdAt: string;
  }[];
};

export type FeedbackEntry = {
  id: number;
  category: Category;
  suggestion: string;
  createdAt: string;
  averageScore: number | null;
};

export type FeedbackQuestion = {
  id: number;
  sortOrder: number;
  question: string;
  isActive: boolean;
  responseCount: number;
};

type FeedbackQuestionRow = RowDataPacket & {
  id: number;
  sort_order: number;
  question: string;
  is_active: number;
  response_count: number;
};
type CountRow = RowDataPacket & { count: number };
type AvgRow = RowDataPacket & { average_score: number | null };
type CategoryRow = RowDataPacket & { category: Category; count: number };
type RatingRow = RowDataPacket & {
  rating: (typeof RATING_LABELS)[number];
  count: number;
};
type CategoryRatingRow = RowDataPacket & {
  category: "Academic Staff" | "Non-Academic Staff";
  rating: (typeof RATING_LABELS)[number];
  count: number;
};
type QuestionRow = RowDataPacket & {
  sort_order: number;
  question: string;
  average_score: number | null;
  responses: number;
};
type SuggestionRow = RowDataPacket & {
  id: number;
  category: Category;
  suggestion: string;
  created_at: Date | string;
};
type FeedbackEntryRow = RowDataPacket & {
  id: number;
  category: Category;
  suggestion: string;
  created_at: Date | string;
  average_score: number | null;
};
type QuestionIdRow = RowDataPacket & { id: number; sort_order: number };
type YearRow = RowDataPacket & { year: number };

function scoreCaseSql(column = "rating") {
  return RATING_LABELS.map(
    (label, i) => `WHEN ${column} = '${label.replace(/'/g, "''")}' THEN ${i + 1}`,
  ).join(" ");
}

function feedbackDateWhere(alias = "") {
  const col = alias ? `${alias}.created_at` : "created_at";
  return `YEAR(${col}) = ? AND MONTH(${col}) = ?`;
}

export async function getAvailableYears(): Promise<number[]> {
  const rows = await query<YearRow[]>(
    "SELECT DISTINCT YEAR(created_at) AS year FROM feedback ORDER BY year DESC",
  );
  const years = rows.map((row) => Number(row.year)).filter((year) => year > 0);
  if (years.length === 0) {
    return [new Date().getFullYear()];
  }
  return years;
}

export async function getFeedbackStats(filter: FeedbackStatsFilter): Promise<FeedbackStats> {
  try {
    return await loadFeedbackStats(filter);
  } catch (error) {
    console.error("getFeedbackStats failed:", error);
    return {
      filter,
      availableYears: [filter.year],
      totalResponses: 0,
      averageScore: null,
      byCategory: CATEGORIES.map((category) => ({ category, count: 0 })),
      byRating: RATING_LABELS.map((rating) => ({ rating, count: 0 })),
      byCategoryRating: (["Academic Staff", "Non-Academic Staff"] as const).map((category) => ({
        category,
        ratings: RATING_LABELS.map((rating) => ({ rating, count: 0 })),
      })),
      byQuestion: [],
      recentSuggestions: [],
    };
  }
}

async function loadFeedbackStats(filter: FeedbackStatsFilter): Promise<FeedbackStats> {
  const { year, month } = filter;
  const dateParams = [year, month];

  const [
    availableYears,
    totalRows,
    avgRows,
    categoryRows,
    ratingRows,
    categoryRatingRows,
    questionRows,
    suggestionRows,
  ] = await Promise.all([
    getAvailableYears(),
    query<CountRow[]>(
      `SELECT COUNT(*) AS count FROM feedback WHERE ${feedbackDateWhere()}`,
      dateParams,
    ),
    query<AvgRow[]>(
      `
        SELECT AVG(CASE ${scoreCaseSql("fr.rating")} END) AS average_score
        FROM feedback_rating fr
        INNER JOIN feedback f ON f.id = fr.feedback_id
        WHERE ${feedbackDateWhere("f")}
      `,
      dateParams,
    ),
    query<CategoryRow[]>(
      `
        SELECT category, COUNT(*) AS count
        FROM feedback
        WHERE ${feedbackDateWhere()}
        GROUP BY category
      `,
      dateParams,
    ),
    query<RatingRow[]>(
      `
        SELECT fr.rating, COUNT(*) AS count
        FROM feedback_rating fr
        INNER JOIN feedback f ON f.id = fr.feedback_id
        WHERE ${feedbackDateWhere("f")}
        GROUP BY fr.rating
      `,
      dateParams,
    ),
    query<CategoryRatingRow[]>(
      `
        SELECT f.category, fr.rating, COUNT(*) AS count
        FROM feedback_rating fr
        INNER JOIN feedback f ON f.id = fr.feedback_id
        WHERE ${feedbackDateWhere("f")} AND f.category IN ('Academic Staff', 'Non-Academic Staff')
        GROUP BY f.category, fr.rating
      `,
      dateParams,
    ),
    query<QuestionRow[]>(
      `
        SELECT
          fq.sort_order,
          fq.question,
          AVG(CASE ${scoreCaseSql("filtered_fr.rating")} END) AS average_score,
          COUNT(filtered_fr.id) AS responses
        FROM feedback_question fq
        LEFT JOIN (
          SELECT fr.id, fr.question_id, fr.rating
          FROM feedback_rating fr
          INNER JOIN feedback f ON f.id = fr.feedback_id
          WHERE ${feedbackDateWhere("f")}
        ) filtered_fr ON filtered_fr.question_id = fq.id
        GROUP BY fq.id, fq.sort_order, fq.question
        ORDER BY fq.sort_order ASC
      `,
      dateParams,
    ),
    query<SuggestionRow[]>(
      `
        SELECT id, category, suggestion, created_at
        FROM feedback
        WHERE ${feedbackDateWhere()}
        ORDER BY created_at DESC
      `,
      dateParams,
    ),
  ]);

  const categoryMap = new Map(categoryRows.map((row) => [row.category, Number(row.count)]));
  const ratingMap = new Map(ratingRows.map((row) => [row.rating, Number(row.count)]));

  return {
    filter,
    availableYears,
    totalResponses: Number(totalRows[0]?.count ?? 0),
    averageScore:
      avgRows[0]?.average_score == null ? null : Number(Number(avgRows[0].average_score).toFixed(2)),
    byCategory: CATEGORIES.map((category) => ({
      category,
      count: categoryMap.get(category) ?? 0,
    })),
    byRating: RATING_LABELS.map((rating) => ({
      rating,
      count: ratingMap.get(rating) ?? 0,
    })),
    byCategoryRating: (["Academic Staff", "Non-Academic Staff"] as const).map((category) => {
      const counts = new Map(
        categoryRatingRows
          .filter((row) => row.category === category)
          .map((row) => [row.rating, Number(row.count)]),
      );
      return {
        category,
        ratings: RATING_LABELS.map((rating) => ({
          rating,
          count: counts.get(rating) ?? 0,
        })),
      };
    }),
    byQuestion: questionRows.map((row) => ({
      sortOrder: Number(row.sort_order),
      question: row.question,
      averageScore:
        row.average_score == null ? null : Number(Number(row.average_score).toFixed(2)),
      responses: Number(row.responses),
    })),
    recentSuggestions: suggestionRows.map((row) => ({
      id: Number(row.id),
      category: row.category,
      suggestion: row.suggestion,
      createdAt:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : String(row.created_at),
    })),
  };
}

export async function listFeedbackQuestions(): Promise<FeedbackQuestion[]> {
  try {
    const rows = await query<FeedbackQuestionRow[]>(`
      SELECT
        fq.id,
        fq.sort_order,
        fq.question,
        fq.is_active,
        COUNT(fr.id) AS response_count
      FROM feedback_question fq
      LEFT JOIN feedback_rating fr ON fr.question_id = fq.id
      GROUP BY fq.id, fq.sort_order, fq.question, fq.is_active
      ORDER BY fq.sort_order ASC
    `);

    return rows.map((row) => ({
      id: Number(row.id),
      sortOrder: Number(row.sort_order),
      question: row.question,
      isActive: Boolean(row.is_active),
      responseCount: Number(row.response_count),
    }));
  } catch (error) {
    console.error("listFeedbackQuestions failed:", error);
    return [];
  }
}

export async function listActiveFeedbackQuestions(): Promise<FeedbackQuestion[]> {
  const questions = await listFeedbackQuestions();
  return questions.filter((question) => question.isActive);
}

export async function setFeedbackQuestionActive(
  id: number,
  isActive: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const [result] = await getDb().execute<ResultSetHeader>(
      "UPDATE feedback_question SET is_active = ? WHERE id = ?",
      [isActive ? 1 : 0, id],
    );

    if (result.affectedRows === 0) {
      return { ok: false, error: "Question not found." };
    }

    return { ok: true };
  } catch (error) {
    console.error("setFeedbackQuestionActive failed:", error);
    return { ok: false, error: "Unable to update question." };
  }
}

export async function reorderFeedbackQuestions(
  orderedIds: number[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (orderedIds.length === 0) {
    return { ok: false, error: "No questions to reorder." };
  }

  const db = getDb();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // sort_order is uniquely constrained, so push everything to negative
    // placeholders first to avoid collisions while reassigning final values.
    for (const [index, id] of orderedIds.entries()) {
      await connection.execute(
        "UPDATE feedback_question SET sort_order = ? WHERE id = ?",
        [-(index + 1), id],
      );
    }
    for (const [index, id] of orderedIds.entries()) {
      await connection.execute(
        "UPDATE feedback_question SET sort_order = ? WHERE id = ?",
        [index + 1, id],
      );
    }

    await connection.commit();
    return { ok: true };
  } catch (error) {
    await connection.rollback();
    console.error("reorderFeedbackQuestions failed:", error);
    return { ok: false, error: "Unable to reorder questions." };
  } finally {
    connection.release();
  }
}

export async function createFeedbackQuestion(input: {
  question: string;
  sortOrder?: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const question = input.question.trim();
  if (!question) {
    return { ok: false, error: "Question is required." };
  }

  let sortOrder = input.sortOrder;
  if (sortOrder == null) {
    const [maxRow] = await query<(RowDataPacket & { max_sort: number })[]>(
      "SELECT COALESCE(MAX(sort_order), 0) AS max_sort FROM feedback_question",
    );
    sortOrder = Number(maxRow?.max_sort ?? 0) + 1;
  }

  if (sortOrder < 1 || sortOrder > 255) {
    return { ok: false, error: "Order must be between 1 and 255." };
  }

  try {
    await query("INSERT INTO feedback_question (sort_order, question) VALUES (?, ?)", [
      sortOrder,
      question,
    ]);
    return { ok: true };
  } catch (error) {
    if (isDuplicateEntry(error)) {
      return { ok: false, error: "That question order is already in use." };
    }
    console.error("createFeedbackQuestion failed:", error);
    return { ok: false, error: "Unable to add question." };
  }
}

export async function updateFeedbackQuestion(input: {
  id: number;
  question: string;
  sortOrder: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const question = input.question.trim();
  if (!question) {
    return { ok: false, error: "Question is required." };
  }

  if (input.sortOrder < 1 || input.sortOrder > 255) {
    return { ok: false, error: "Order must be between 1 and 255." };
  }

  try {
    const [result] = await getDb().execute<ResultSetHeader>(
      "UPDATE feedback_question SET sort_order = ?, question = ? WHERE id = ?",
      [input.sortOrder, question, input.id],
    );

    if (result.affectedRows === 0) {
      return { ok: false, error: "Question not found." };
    }

    return { ok: true };
  } catch (error) {
    if (isDuplicateEntry(error)) {
      return { ok: false, error: "That question order is already in use." };
    }
    console.error("updateFeedbackQuestion failed:", error);
    return { ok: false, error: "Unable to update question." };
  }
}

export async function deleteFeedbackQuestion(
  id: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const [result] = await getDb().execute<ResultSetHeader>(
      "DELETE FROM feedback_question WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return { ok: false, error: "Question not found." };
    }

    return { ok: true };
  } catch (error) {
    if (isReferencedError(error)) {
      return {
        ok: false,
        error: "Cannot delete a question that already has responses.",
      };
    }
    console.error("deleteFeedbackQuestion failed:", error);
    return { ok: false, error: "Unable to delete question." };
  }
}

function isDuplicateEntry(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "ER_DUP_ENTRY"
  );
}

function isReferencedError(error: unknown) {
  if (typeof error !== "object" || error === null) return false;
  const err = error as { code?: string | number; errno?: number };
  return err.code === "ER_ROW_IS_REFERENCED_2" || err.errno === 1451;
}

export async function listFeedbackEntries(): Promise<FeedbackEntry[]> {
  const rows = await query<FeedbackEntryRow[]>(`
    SELECT
      f.id,
      f.category,
      f.suggestion,
      f.created_at,
      AVG(CASE ${scoreCaseSql("fr.rating")} END) AS average_score
    FROM feedback f
    LEFT JOIN feedback_rating fr ON fr.feedback_id = f.id
    GROUP BY f.id, f.category, f.suggestion, f.created_at
    ORDER BY f.created_at DESC
  `);

  return rows.map((row) => ({
    id: Number(row.id),
    category: row.category,
    suggestion: row.suggestion,
    createdAt:
      row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    averageScore:
      row.average_score == null ? null : Number(Number(row.average_score).toFixed(2)),
  }));
}

export async function submitFeedback(input: {
  category: Category;
  suggestion: string;
  ratings: number[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const suggestion = input.suggestion.trim();
  if (!suggestion) {
    return { ok: false, error: "Please share a suggestion before submitting." };
  }

  const questions = await query<QuestionIdRow[]>(
    "SELECT id, sort_order FROM feedback_question WHERE is_active = 1 ORDER BY sort_order ASC",
  );

  if (questions.length === 0) {
    return { ok: false, error: "Feedback questions are not configured." };
  }

  if (input.ratings.length !== questions.length || input.ratings.some((r) => r < 1 || r > 5)) {
    return { ok: false, error: "Please answer all rating questions." };
  }

  const db = getDb();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [feedbackResult] = await connection.execute<ResultSetHeader>(
      "INSERT INTO feedback (category, suggestion) VALUES (?, ?)",
      [input.category, suggestion],
    );

    const feedbackId = feedbackResult.insertId;
    const ratingValues = questions.map((question, index) => [
      feedbackId,
      question.id,
      RATING_LABELS[input.ratings[index] - 1],
    ]);

    await connection.query(
      "INSERT INTO feedback_rating (feedback_id, question_id, rating) VALUES ?",
      [ratingValues],
    );

    await connection.commit();
    return { ok: true };
  } catch (error) {
    await connection.rollback();
    console.error("submitFeedback failed:", error);
    return { ok: false, error: "Unable to submit feedback. Please try again." };
  } finally {
    connection.release();
  }
}
