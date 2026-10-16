import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  "video/mp4": ".mp4",
};
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export async function saveUploadedImage(
  subdir: string,
  input: { base64Data: string; contentType: string },
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const extension = ALLOWED_IMAGE_TYPES[input.contentType];
  if (!extension) {
    return { ok: false, error: "Only JPG, PNG, WEBP, or GIF images are allowed." };
  }

  const buffer = Buffer.from(input.base64Data, "base64");
  if (buffer.length === 0) {
    return { ok: false, error: "Uploaded image is empty." };
  }
  if (buffer.length > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Image must be smaller than 5 MB." };
  }

  try {
    const dir = path.join(process.cwd(), "public", "uploads", subdir);
    await mkdir(dir, { recursive: true });
    const filename = `${randomUUID()}${extension}`;
    await writeFile(path.join(dir, filename), buffer);
    return { ok: true, path: `/uploads/${subdir}/${filename}` };
  } catch (error) {
    console.error("saveUploadedImage failed:", error);
    return { ok: false, error: "Unable to save image." };
  }
}

export async function saveUploadedVideo(
  subdir: string,
  input: { base64Data: string; contentType: string },
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const extension = ALLOWED_VIDEO_TYPES[input.contentType];
  if (!extension) {
    return { ok: false, error: "Only MP4 videos are allowed." };
  }

  const buffer = Buffer.from(input.base64Data, "base64");
  if (buffer.length === 0) {
    return { ok: false, error: "Uploaded video is empty." };
  }
  if (buffer.length > MAX_VIDEO_BYTES) {
    return { ok: false, error: "Video must be smaller than 100 MB." };
  }

  try {
    const dir = path.join(process.cwd(), "public", "uploads", subdir);
    await mkdir(dir, { recursive: true });
    const filename = `${randomUUID()}${extension}`;
    await writeFile(path.join(dir, filename), buffer);
    return { ok: true, path: `/uploads/${subdir}/${filename}` };
  } catch (error) {
    console.error("saveUploadedVideo failed:", error);
    return { ok: false, error: "Unable to save video." };
  }
}

export async function deleteUploadedImage(subdir: string, imagePath: string): Promise<void> {
  const prefix = `/uploads/${subdir}/`;
  if (!imagePath.startsWith(prefix)) return;

  try {
    const filename = path.basename(imagePath);
    await unlink(path.join(process.cwd(), "public", "uploads", subdir, filename));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("deleteUploadedImage failed:", error);
    }
  }
}
