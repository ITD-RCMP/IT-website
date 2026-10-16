import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getDb, query } from "@/lib/db.server";
import { deleteUploadedImage as deleteUploadedImageFile, saveUploadedImage as saveUploadedImageFile, saveUploadedVideo as saveUploadedVideoFile } from "@/lib/uploads.server";

export type InformationContent = {
  id: number;
  sortOrder: number;
  title: string;
  description: string;
  imagePath: string | null;
};

type InformationContentRow = RowDataPacket & {
  id: number;
  sort_order: number;
  title: string;
  description: string;
  image_path: string | null;
};

const UPLOAD_SUBDIR = "information";

function mapRow(row: InformationContentRow): InformationContent {
  return {
    id: Number(row.id),
    sortOrder: Number(row.sort_order),
    title: row.title,
    description: row.description,
    imagePath: row.image_path,
  };
}

export async function listInformationContent(): Promise<InformationContent[]> {
  try {
    const rows = await query<InformationContentRow[]>(
      "SELECT id, sort_order, title, description, image_path FROM information_content ORDER BY sort_order ASC",
    );
    return rows.map(mapRow);
  } catch (error) {
    console.error("listInformationContent failed:", error);
    return [];
  }
}

export async function getInformationContent(id: number): Promise<InformationContent | null> {
  const rows = await query<InformationContentRow[]>(
    "SELECT id, sort_order, title, description, image_path FROM information_content WHERE id = ?",
    [id],
  );
  const row = rows[0];
  return row ? mapRow(row) : null;
}

export async function createInformationContent(input: {
  title: string;
  description: string;
  imagePath?: string | null;
  sortOrder?: number;
}): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  const title = input.title.trim();
  const description = input.description.trim();
  if (!title) {
    return { ok: false, error: "Title is required." };
  }
  if (!description) {
    return { ok: false, error: "Description is required." };
  }

  let sortOrder = input.sortOrder;
  if (sortOrder == null) {
    const [maxRow] = await query<(RowDataPacket & { max_sort: number })[]>(
      "SELECT COALESCE(MAX(sort_order), 0) AS max_sort FROM information_content",
    );
    sortOrder = Number(maxRow?.max_sort ?? 0) + 1;
  }

  try {
    const [result] = await getDb().execute<ResultSetHeader>(
      "INSERT INTO information_content (sort_order, title, description, image_path) VALUES (?, ?, ?, ?)",
      [sortOrder, title, description, input.imagePath ?? null],
    );
    return { ok: true, id: result.insertId };
  } catch (error) {
    if (isDuplicateEntry(error)) {
      return { ok: false, error: "That display order is already in use." };
    }
    console.error("createInformationContent failed:", error);
    return { ok: false, error: "Unable to add content." };
  }
}

export async function updateInformationContent(input: {
  id: number;
  title: string;
  description: string;
  imagePath?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const title = input.title.trim();
  const description = input.description.trim();
  if (!title) {
    return { ok: false, error: "Title is required." };
  }
  if (!description) {
    return { ok: false, error: "Description is required." };
  }

  try {
    const previous = input.imagePath !== undefined ? await getInformationContent(input.id) : null;

    const [result] = await getDb().execute<ResultSetHeader>(
      input.imagePath === undefined
        ? "UPDATE information_content SET title = ?, description = ? WHERE id = ?"
        : "UPDATE information_content SET title = ?, description = ?, image_path = ? WHERE id = ?",
      input.imagePath === undefined
        ? [title, description, input.id]
        : [title, description, input.imagePath, input.id],
    );

    if (result.affectedRows === 0) {
      return { ok: false, error: "Content not found." };
    }

    if (previous?.imagePath && previous.imagePath !== input.imagePath) {
      await deleteUploadedImage(previous.imagePath);
    }

    return { ok: true };
  } catch (error) {
    console.error("updateInformationContent failed:", error);
    return { ok: false, error: "Unable to update content." };
  }
}

export async function deleteInformationContent(
  id: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const existing = await getInformationContent(id);

    const [result] = await getDb().execute<ResultSetHeader>(
      "DELETE FROM information_content WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return { ok: false, error: "Content not found." };
    }

    if (existing?.imagePath) {
      await deleteUploadedImage(existing.imagePath);
    }

    return { ok: true };
  } catch (error) {
    console.error("deleteInformationContent failed:", error);
    return { ok: false, error: "Unable to delete content." };
  }
}

export async function reorderInformationContent(
  orderedIds: number[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (orderedIds.length === 0) {
    return { ok: false, error: "No content to reorder." };
  }

  const db = getDb();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // sort_order is uniquely constrained, so push everything to negative
    // placeholders first to avoid collisions while reassigning final values.
    for (const [index, id] of orderedIds.entries()) {
      await connection.execute(
        "UPDATE information_content SET sort_order = ? WHERE id = ?",
        [-(index + 1), id],
      );
    }
    for (const [index, id] of orderedIds.entries()) {
      await connection.execute(
        "UPDATE information_content SET sort_order = ? WHERE id = ?",
        [index + 1, id],
      );
    }

    await connection.commit();
    return { ok: true };
  } catch (error) {
    await connection.rollback();
    console.error("reorderInformationContent failed:", error);
    return { ok: false, error: "Unable to reorder content." };
  } finally {
    connection.release();
  }
}

export async function saveUploadedImage(input: {
  base64Data: string;
  contentType: string;
}): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  return saveUploadedImageFile(UPLOAD_SUBDIR, input);
}

export async function saveUploadedVideo(input: {
  base64Data: string;
  contentType: string;
}): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  return saveUploadedVideoFile(UPLOAD_SUBDIR, input);
}

async function deleteUploadedImage(imagePath: string): Promise<void> {
  return deleteUploadedImageFile(UPLOAD_SUBDIR, imagePath);
}

function isDuplicateEntry(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "ER_DUP_ENTRY"
  );
}
