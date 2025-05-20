import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { instagramAPI } from "../../services/instagram-api";

export const newsSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    type: z.enum(["main", "sports"]),
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
        
    // New endpoint for publishing to Instagram
    publishToInstagram: publicProcedure
        .input(
            z.object({
                id: z.string().optional(),
                title: z.string(),
                content: z.string(),
                imageUrl: z.string().url(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                if (!input.imageUrl) {
                    throw new Error("An image is required to publish to Instagram");
                }

                // Format the caption with title and content
                const caption = `${input.title}\n\n${input.content}`;

                // Call the Instagram API service to publish the post
                const result = await instagramAPI.publishPost({
                    caption,
                    imageUrl: input.imageUrl,
                });

                if (!result.success) {
                    throw new Error(result.error || "Failed to publish to Instagram");
                }

                return { 
                    success: true, 
                    instagramPostId: result.id,
                    message: "Successfully published to Instagram" 
                };
                
            } catch (error) {
                console.error("Instagram publishing error:", error);
                return { 
                    success: false, 
                    error: error instanceof Error ? error.message : "Unknown error occurred" 
                };
            }
        }),
});