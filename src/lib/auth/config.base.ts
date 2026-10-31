import { NextResponse } from "next/server";
import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      if (!auth) return false;
      // Cadastro via Google ainda sem perfil completo — manda terminar
      // antes de liberar qualquer rota protegida. Ver
      // src/app/cadastro/completar/.
      if (!auth.user.role) {
        return NextResponse.redirect(
          new URL("/cadastro/completar", request.url)
        );
      }
      return true;
    },
    jwt({ token, user }): JWT {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }): Session {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
};
