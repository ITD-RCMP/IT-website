import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createInformationContent as createInformationContentRecord,
  deleteInformationContent as deleteInformationContentRecord,
  getInformationContent as getInformationContentRecord,
  listInformationContent as loadInformationContent,
  reorderInformationContent as reorderInformationContentRecord,
  saveUploadedImage as saveUploadedImageRecord,
  updateInformationContent as updateInformationContentRecord,
} from "@/lib/information.server";

export type { InformationContent } from "@/lib/information.server";

export const listInformationContent = createServerFn({ method: "GET" }).handler(async () =>
  loadInformationContent(),
);

export const getInformationContent = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data }) => getInformationContentRecord(data.id));

export const createInformationContent = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      imagePath: z.string().nullable().optional(),
      sortOrder: z.number().int().min(1).optional(),
    }),
  )
  .handler(async ({ data }) => createInformationContentRecord(data));

export const updateInformationContent = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.number().int().positive(),
      title: z.string().min(1),
      description: z.string().min(1),
      imagePath: z.string().nullable().optional(),
    }),
  )
  .handler(async ({ data }) => updateInformationContentRecord(data));

export const deleteInformationContent = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data }) => deleteInformationContentRecord(data.id));

export const reorderInformationContent = createServerFn({ method: "POST" })
  .inputValidator(z.object({ orderedIds: z.array(z.number().int().positive()).min(1) }))
  .handler(async ({ data }) => reorderInformationContentRecord(data.orderedIds));

export const uploadInformationImage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      base64Data: z.string().min(1),
      contentType: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => saveUploadedImageRecord(data));
