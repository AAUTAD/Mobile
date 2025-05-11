import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

export const newsSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    imageUrl: z.string().url().optional(),
    type: z.string().min(1, "Type is required"),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().optional(),
});

export const newsRouter = createTRPCRouter({
    create: publicProcedure
        .input(newsSchema)
        .mutation(async ({ ctx, input }) => {
            const parsedData = newsSchema.parse(input);

            return ctx.db.news.create({
                data: {
                    ...parsedData,
                },
            });
        }),

    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.news.findMany();
     }),

    edit: publicProcedure
        .input(
            z.object({
                id: z.string().optional(),
                newsSchema,
            })
        )
        .mutation(async ({ ctx, input }) => {
            const parsedData = newsSchema.parse(input.newsSchema);

            if(!input.id) return

            return ctx.db.news.update({
                where: {
                    id: input.id,
                },
                data: {
                    ...parsedData,
                },
            });
        }),

    delete: publicProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.db.news.delete({
                where: {
                    id: input.id,
                },
            });
        }),
});