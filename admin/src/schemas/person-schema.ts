import { z } from "zod";

export const personSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  contact: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  role: z.string().min(1, "Role is required"),
  sports: z.array(z.object({ id: z.string() })).optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
});

export type Person = z.infer<typeof personSchema>;

export const createPersonSchema = personSchema.omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });
export const updatePersonSchema = personSchema.partial().extend({ id: z.string() });
