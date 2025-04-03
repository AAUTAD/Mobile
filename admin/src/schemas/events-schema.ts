import { z } from "zod";

export const EventSchema = z.object({
    id: z.string().cuid().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    location: z.string().min(1, "Location is required"),
    startDate: z.date(),
    endDate: z.date(),
    imageUrl: z.string().url().optional().nullable(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  });

export type Event = z.infer<typeof EventSchema>