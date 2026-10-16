import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getDb, query } from "@/lib/db.server";
import { deleteUploadedImage, saveUploadedImage } from "@/lib/uploads.server";

export type SystemVersion = {
  id: number;
  version: string;
  systemName: string;
  systemUrl: string | null;
  releaseNotes: string;
  imagePath: string | null;
  releasedAt: string;
};

type SystemVersionRow = RowDataPacket & {
  id: number;
  version: string;
  system_name: string;
  system_url: string | null;
  release_notes: string;
  image_path: string | null;
  released_at: string;
};

const UPLOAD_SUBDIR = "system-versions";

function mapRow(row: SystemVersionRow): SystemVersion {
  return {
    id: Number(row.id),
    version: row.version,
    systemName: row.system_name,
    systemUrl: row.system_url,
    releaseNotes: row.release_notes,
    imagePath: row.image_path,
    releasedAt: row.released_at,
  };
}

const SELECT_COLUMNS =
  "id, version, system_name, system_url, release_notes, image_path, DATE_FORMAT(released_at, '%Y-%m-%d') AS released_at";

export async function listSystemVersions(): Promise<SystemVersion[]> {
  try {
    const rows = await query<SystemVersionRow[]>(
      `SELECT ${SELECT_COLUMNS} FROM system_version ORDER BY released_at DESC, id DESC`,
    );
    return rows.map(mapRow);
  } catch (error) {
    console.error("listSystemVersions failed:", error);
    return [];
  }
}

export async function getSystemVersion(id: number): Promise<SystemVersion | null> {
  const rows = await query<SystemVersionRow[]>(
    `SELECT ${SELECT_COLUMNS} FROM system_version WHERE id = ?`,
    [id],
  );
  const row = rows[0];
  return row ? mapRow(row) : null;
}

export async function createSystemVersion(input: {
  version: string;
  systemName: string;
  systemUrl?: string | null;
  releaseNotes: string;
  imagePath?: string | null;
  releasedAt: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const version = input.version.trim();
  const systemName = input.systemName.trim();
  const releaseNotes = input.releaseNotes.trim();
  const systemUrl = input.systemUrl?.trim() || null;

  if (!version) {
    return { ok: false, error: "Version is required." };
  }
  if (!systemName) {
    return { ok: false, error: "System name is required." };
  }
  if (!releaseNotes) {
    return { ok: false, error: "Release notes are required." };
  }
  if (!input.releasedAt) {
    return { ok: false, error: "Release date is required." };
  }
  if (systemUrl && !isValidUrl(systemUrl)) {
    return { ok: false, error: "System link must be a valid URL." };
  }

  try {
    await getDb().execute(
      "INSERT INTO system_version (version, system_name, system_url, release_notes, image_path, released_at) VALUES (?, ?, ?, ?, ?, ?)",
      [version, systemName, systemUrl, releaseNotes, input.imagePath ?? null, input.releasedAt],
    );
    return { ok: true };
  } catch (error) {
    if (isDuplicateEntry(error)) {
      return { ok: false, error: "That version already exists." };
    }
    console.error("createSystemVersion failed:", error);
    return { ok: false, error: "Unable to add version." };
  }
}

export async function updateSystemVersion(input: {
  id: number;
  version: string;
  systemName: string;
  systemUrl?: string | null;
  releaseNotes: string;
  imagePath?: string | null;
  releasedAt: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const version = input.version.trim();
  const systemName = input.systemName.trim();
  const releaseNotes = input.releaseNotes.trim();
  const systemUrl = input.systemUrl?.trim() || null;

  if (!version) {
    return { ok: false, error: "Version is required." };
  }
  if (!systemName) {
    return { ok: false, error: "System name is required." };
  }
  if (!releaseNotes) {
    return { ok: false, error: "Release notes are required." };
  }
  if (!input.releasedAt) {
    return { ok: false, error: "Release date is required." };
  }
  if (systemUrl && !isValidUrl(systemUrl)) {
    return { ok: false, error: "System link must be a valid URL." };
  }

  try {
    const previous = input.imagePath !== undefined ? await getSystemVersion(input.id) : null;

    const [result] = await getDb().execute<ResultSetHeader>(
      input.imagePath === undefined
        ? "UPDATE system_version SET version = ?, system_name = ?, system_url = ?, release_notes = ?, released_at = ? WHERE id = ?"
        : "UPDATE system_version SET version = ?, system_name = ?, system_url = ?, release_notes = ?, released_at = ?, image_path = ? WHERE id = ?",
      input.imagePath === undefined
        ? [version, systemName, systemUrl, releaseNotes, input.releasedAt, input.id]
        : [version, systemName, systemUrl, releaseNotes, input.releasedAt, input.imagePath, input.id],
    );

    if (result.affectedRows === 0) {
      return { ok: false, error: "Version not found." };
    }

    if (previous?.imagePath && previous.imagePath !== input.imagePath) {
      await deleteUploadedImage(UPLOAD_SUBDIR, previous.imagePath);
    }

    return { ok: true };
  } catch (error) {
    if (isDuplicateEntry(error)) {
      return { ok: false, error: "That version already exists." };
    }
    console.error("updateSystemVersion failed:", error);
    return { ok: false, error: "Unable to update version." };
  }
}

export async function deleteSystemVersion(
  id: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const existing = await getSystemVersion(id);

    const [result] = await getDb().execute<ResultSetHeader>(
      "DELETE FROM system_version WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return { ok: false, error: "Version not found." };
    }

    if (existing?.imagePath) {
      await deleteUploadedImage(UPLOAD_SUBDIR, existing.imagePath);
    }

    return { ok: true };
  } catch (error) {
    console.error("deleteSystemVersion failed:", error);
    return { ok: false, error: "Unable to delete version." };
  }
}

export async function uploadSystemVersionImage(input: {
  base64Data: string;
  contentType: string;
}): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  return saveUploadedImage(UPLOAD_SUBDIR, input);
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
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
