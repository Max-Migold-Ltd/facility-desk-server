import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  category: z.string().optional(),
  unitOfMeasure: z.string().optional(),
  cost: z.number(),
});

export const updateItemSchema = createItemSchema.partial();

export const itemFilterSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
});

export type CreateItemDto = z.infer<typeof createItemSchema>;
export type UpdateItemDto = z.infer<typeof updateItemSchema>;
export type ItemFilterDto = z.infer<typeof itemFilterSchema>;
