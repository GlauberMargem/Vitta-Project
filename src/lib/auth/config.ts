import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/client";
import { authConfig } from "./config.base";
import type { JWT } from "next-auth/jwt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash || !user.role) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    Google,
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      // Login social Google — não aceitar email que o Google não confirmou
      // (evita alguém reivindicar um email que não é dele). Ver
      // specs/05-arquitetura.md, "Login social Google".
      if (account?.provider === "google" && profile?.email_verified !== true) {
        return false;
      }
      return true;
    },
    async jwt({ token, user, account, profile }): Promise<JWT> {
      if (account?.provider === "google" && profile?.email) {
        // Acha a conta pelo email (vínculo automático com conta já
        // existente por senha, ou retomada de um cadastro Google
        // incompleto) ou cria um User pendente (role null) na primeira
        // vez — ver specs/05-arquitetura.md, "Login social Google".
        const email = profile.email as string;
        const existing = await db.user.findUnique({ where: { email } });
        const dbUser =
          existing ??
          (await db.user.create({
            data: {
              name: typeof profile.name === "string" ? profile.name : email,
              email,
              passwordHash: null,
              role: null,
            },
          }));
        token.id = dbUser.id;
        token.role = dbUser.role;
        return token;
      }

      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
});
