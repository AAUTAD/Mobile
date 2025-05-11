import { z } from "zod";

export const sportSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  details: z.string().optional().nullable(),
  link: z.string().url().optional().nullable().or(z.literal('')), // Allow empty string
  imageUrl: z.string().url().optional().nullable().or(z.literal('')), // Allow empty string
  persons: z.array(z.object({ id: z.string() })).optional(), // Added persons field
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
});

export type Sport = z.infer<typeof sportSchema>;

export const createSportSchema = sportSchema.omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });
export const updateSportSchema = sportSchema.partial().extend({ id: z.string() });
