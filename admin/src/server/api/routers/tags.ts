import { tagSchema } from '~/schemas/tag-schema';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { z } from 'zod';

export const tagsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(tagSchema)
        .mutation(async ({ ctx, input }) => {
            const parsedData = tagSchema.parse(input)

            return ctx.db.tag.create({
                data: {
                    ...parsedData,
                },
            })
        }),
    edit: protectedProcedure
        .input(z.object({
            tagSchema,
            id: z.string()}))
        .mutation(async ({ ctx, input }) => {
            const parsedData = tagSchema.parse(input)

            return ctx.db.tag.update({
                where: {
                    id: input.id,
                },
                data: {
                    ...parsedData,
                },
            })
        }),
    getAll: publicProcedure
        .query(async ({ ctx }) => {
            return ctx.db.tag.findMany()
        }), 
    delete: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            return ctx.db.tag.delete({
                where: {
                    id: input,
                },
            })
        }),
})