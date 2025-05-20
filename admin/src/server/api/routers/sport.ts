import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { createSportSchema, updateSportSchema } from "~/schemas/sport-schema";

export const sportRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createSportSchema)
    .mutation(async ({ ctx, input }) => {
      const { persons, ...sportData } = input;
      return ctx.db.sport.create({
        data: {
          ...sportData,
          persons: persons // Prisma will handle connecting by ID
            ? {
                connect: persons.map((person) => ({ id: person.id })),
              }
            : undefined,
        },
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.sport.findMany({
      include: {
        persons: true, // Include related persons
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.sport.findUnique({
        where: { id: input.id },
        include: {
          persons: true,
        },
      });
    }),

  update: protectedProcedure
    .input(updateSportSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, persons, ...sportData } = input;
      return ctx.db.sport.update({
        where: { id },
        data: {
          ...sportData,
          persons: persons // Prisma will handle connecting/disconnecting by ID
            ? {
                set: persons.map((person) => ({ id: person.id })),
              }
            : undefined, // If persons is undefined, no changes; if empty array, disconnects all
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.sport.delete({
        where: { id: input.id },
      });
    }),
});
