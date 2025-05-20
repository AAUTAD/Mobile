import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { parceiroSchema } from "~/schemas/partners-schema";
import { Decimal } from "@prisma/client/runtime/library";
import { string, z } from "zod";

export const partnersRouter = createTRPCRouter({
    create: protectedProcedure
        .input(parceiroSchema)
        .mutation(async ({ ctx, input }) => {
            const parsedData = parceiroSchema.parse(input)

            const longitudeDecimal = new Decimal(parsedData.longitude);
            const latitudeDecimal = new Decimal(parsedData.latitude);

            return ctx.db.partner.create({
                data: {
                    ...parsedData,
                    longitude: longitudeDecimal,
                    latitude: latitudeDecimal,
                    nameUrl: parsedData.nameUrl ?? "",
                },
            })
        }),
    getAll: publicProcedure
        .query(async ({ ctx }) => {
            return ctx.db.partner.findMany()
        }),
    delete: protectedProcedure
        .input(string())
        .mutation(async ({ ctx, input }) => {
            return ctx.db.partner.delete({
                where: {
                    id: input,
                },
            })
        }),
    edit: protectedProcedure
        .input(z.object({
            parceiroSchema,
            id: string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const parsedData = parceiroSchema.parse(input.parceiroSchema)

            const longitudeDecimal = new Decimal(parsedData.longitude);
            const latitudeDecimal = new Decimal(parsedData.latitude);

            return ctx.db.partner.update({
                where: {
                    id: input.id,
                },
                data: {
                    ...parsedData,
                    longitude: longitudeDecimal,
                    latitude: latitudeDecimal,
                },
            })
        }),
})