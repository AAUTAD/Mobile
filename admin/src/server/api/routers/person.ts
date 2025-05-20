import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { personSchema, createPersonSchema, updatePersonSchema } from "~/schemas/person-schema";

export const personRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createPersonSchema) // Ensure this schema expects sports as array of {id: string}
    .mutation(async ({ ctx, input }) => {
      const { sports, ...personData } = input;
      return ctx.db.person.create({
        data: {
          ...personData,
          sports: sports // Prisma will handle connecting by ID
            ? {
                connect: sports.map((sport) => ({ id: sport.id })),
              }
            : undefined,
        },
      });
    }),

  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.person.findMany({
        include: {
          sports: true, // Include related sports
        },
      });
    }),
  
  getById: publicProcedure // Added getById for completeness, if needed elsewhere
    .input(z.object({ id: z.string() }))
    .query(async ({ctx, input}) => {
      return ctx.db.person.findUnique({
        where: {id: input.id},
        include: {
          sports: true,
        }
      });
    }),

  edit: protectedProcedure
    .input(updatePersonSchema) // Ensure this schema expects sports as array of {id: string}
    .mutation(async ({ ctx, input }) => {
      const { id, sports, ...personData } = input;
      return ctx.db.person.update({
        where: { id },
        data: {
          ...personData,
          sports: sports 
            ? { 
                set: sports.map((sport) => ({ id: sport.id })) 
              }
            : undefined, // If sports is undefined, no changes; if empty array, disconnects all
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.person.delete({
        where: { id: input.id },
      });
    }),
});
