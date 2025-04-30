import { createTRPCRouter, publicProcedure, protectedProcedure } from '~/server/api/trpc';
import { z } from 'zod';

export const desportoRouter = createTRPCRouter({
  // Create a new desporto
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        imageUrl: z.string().optional(),
        type: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.db.desporto.create({
        data: input,
      });
    }),

  // Get all desportos
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.desporto.findMany();
  }),

  // Get a single desporto by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.desporto.findUnique({
        where: { id: input.id },
      });
    }),

  // Update a desporto by ID
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        imageUrl: z.string().optional(),
        type: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.db.desporto.update({
        where: { id: input.id },
        data: input,
      });
    }),

  // Delete a desporto by ID
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.desporto.delete({
        where: { id: input.id },
      });
    }),
});