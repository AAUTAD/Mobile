import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { z } from 'zod';
import { hash } from 'bcryptjs';

export const authRouter = createTRPCRouter({
    register: publicProcedure
        .input(z.object({
            email: z.string().email(),
            password: z.string().min(8),
            confirmPassword: z.string().min(8),
        }))
        .mutation(async ({ ctx, input }) => {
            if (input.password !== input.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            // Verify if email is already in use
            const existingUser = await ctx.db.user.findUnique({
                where: {
                    email: input.email
                }
            });

            if (existingUser) {
                throw new Error('Email is already in use');
            }

            const hashedPassword = await hash(input.password, 10);

            try {
                const user = await ctx.db.user.create({
                    data: {
                        email: input.email,
                        password: hashedPassword,
                    }
                })

                return user;
            } catch (error) {
                throw error;
            }
        }),
    getAllUsers: publicProcedure
        .query(async ({ ctx }) => {
            return ctx.db.user.findMany(); // Fetch all users
        }),

})