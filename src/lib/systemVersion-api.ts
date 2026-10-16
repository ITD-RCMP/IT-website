import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createSystemVersion as createSystemVersionRecord,
  deleteSystemVersion as deleteSystemVersionRecord,
  listSystemVersions as loadSystemVersions,
  updateSystemVersion as updateSystemVersionRecord,
  uploadSystemVersionImage as uploadSystemVersionImageRecord,
} from "@/lib/systemVersion.server";

export type { SystemVersion } from "@/lib/systemVersion.server";

export const listSystemVersions = createServerFn({ method: "GET" }).handler(async () =>
  loadSystemVersions(),
);

export const createSystemVersion = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      version: z.string().min(1),
      systemName: z.string().min(1),
      systemUrl: z.string().nullable().optional(),
      releaseNotes: z.string().min(1),
      imagePath: z.string().nullable().optional(),
      releasedAt: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => createSystemVersionRecord(data));

export const updateSystemVersion = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.number().int().positive(),
      version: z.string().min(1),
      systemName: z.string().min(1),
      systemUrl: z.string().nullable().optional(),
      releaseNotes: z.string().min(1),
      imagePath: z.string().nullable().optional(),
      releasedAt: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => updateSystemVersionRecord(data));

export const deleteSystemVersion = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data }) => deleteSystemVersionRecord(data.id));

export const uploadSystemVersionImage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      base64Data: z.string().min(1),
      contentType: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => uploadSystemVersionImageRecord(data));
