import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { memberSchema } from "~/schemas/member-schema";
import { string, z } from "zod";
import { CardStatus } from "~/types/member";

export const membersRouter = createTRPCRouter({
    create: protectedProcedure
        .input(memberSchema)
        .mutation(async ({ ctx, input }) => {
            const parsedData = memberSchema.parse(input);

            return ctx.db.member.create({
                data: {
                    ...parsedData,
                    registrationDate: parsedData.registrationDate || new Date().toISOString(),
                },
            });
        }),
    getAll: publicProcedure
        .query(async ({ ctx }) => {
            return ctx.db.member.findMany();
        }),
    delete: protectedProcedure
        .input(string())
        .mutation(async ({ ctx, input }) => {
            return ctx.db.member.delete({
                where: {
                    id: input,
                },
            });
        }),
    edit: protectedProcedure
        .input(z.object({
            memberSchema,
            id: string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const parsedData = memberSchema.parse(input.memberSchema);

            return ctx.db.member.update({
                where: {
                    id: input.id,
                },
                data: {
                    ...parsedData,
                },
            });
        }),
    getByEmail: publicProcedure 
        .input(string())
        .query(async ({ ctx, input }) => {
            return ctx.db.member.findUnique({
                where: {
                    email: input,
                },
            });
        }),
    
    createAccess: publicProcedure 
        .input(z.object({
            member: memberSchema, 
            token: string(),
            verification_token: string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { member, token, verification_token } = input;

            if(member.cardStatus === CardStatus.active) {

            }

            if (member.nextPayment && new Date(member.nextPayment) < new Date()) {
                throw new Error("Next payment date has already passed.");
            }

            if(member && member.nextPayment) {
                const data = {
                        email: member.email,
                        verificationToken: verification_token,
                        token,
                        expirationDate: member.nextPayment,
                        expired: false,
                    }

                try{
                    return ctx.db.cardAccesses.create({
                        data 
                    })            
                } catch(error) {
                    console.log(error);
                }
            } else {
                return null;
            }
        }),
});