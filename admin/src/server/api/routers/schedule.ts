import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

// Router for Schedule operations
export const scheduleRouter = createTRPCRouter({
  // Get all schedules
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.schedule.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }], // Optional: order schedules
    });
  }),

  // Potentially add create, update, delete later if needed
});