import { PrismaAdapter } from "@auth/prisma-adapter";
import * as bcrypt from 'bcryptjs';
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await db.user.findFirst({
          where: {
            email: credentials?.email as string,
          },
        });

        if(user && credentials.password) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          if (!user.password) {
            return null;
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const isValid = await bcrypt.compare(credentials.password as string, user.password);
          if(isValid) {
          return user;
          }
        }

        return null;
    },
  }),
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
      },
    }),
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
