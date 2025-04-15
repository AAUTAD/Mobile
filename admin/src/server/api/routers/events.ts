import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { EventSchema as eventSchema } from "~/schemas/events-schema";
import { z } from "zod";

// filepath: /Users/joaoazevedo/Documents/Utad/aautad/Mobile/admin/src/server/api/routers/events.ts

export const eventsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(eventSchema)
        .mutation(async ({ ctx, input }) => {
            const parsedData = eventSchema.parse(input);

            return ctx.db.event.create({
                data: {
                    ...parsedData,
                },
            });
        }),
    getAll: publicProcedure
        .query(async ({ ctx }) => {
            return ctx.db.event.findMany();
        }),
    delete: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            return ctx.db.event.delete({
                where: {
                    id: input,
                },
            });
        }),
    edit: protectedProcedure
        .input(z.object({
            eventSchema,
            id: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const parsedData = eventSchema.parse(input.eventSchema);
            
            if(input.id) { return }

            return ctx.db.event.update({
                where: {
                    id: input.id,
                },
                data: {
                    ...parsedData,
                },
            });
        }),
    getUpcoming: publicProcedure
        .query(async ({ ctx }) => {
            const now = new Date();

            return ctx.db.event.findMany({
                where: {
                    OR: [
                        {
                            startDate: {
                                gte: now, // Fetch events with a start date in the future
                            },
                        },
                        {
                            endDate: {
                                gte: now, // Fetch events with an end date in the future
                            },
                        },
                    ],
                },
                orderBy: {
                    startDate: "asc", // Order by the nearest start date
                },
            });
        }),
});