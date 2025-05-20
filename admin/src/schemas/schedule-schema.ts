import { z } from 'zod';

// Define the schema for Schedule
export const scheduleSchema = z.object({
  id: z.string(),
  dayOfWeek: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Schedule = z.infer<typeof scheduleSchema>;