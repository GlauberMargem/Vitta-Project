import type { DefaultSession } from "next-auth";
import type { Role } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      // null = login via Google ainda sem perfil completo, ver
      // src/app/cadastro/completar/
      role: Role | null;
    } & DefaultSession["user"];
  }

  interface User {
    // Role | null (não só Role): essa interface é intersectada dentro de
    // Session.user via DefaultSession["user"] — se ficasse `Role` aqui, a
    // interseção colapsava `Session.user.role` de volta pra não-nulo,
    // mesmo declarando `Role | null` lá embaixo. O retorno real de
    // `authorize()` (Credentials) continua sempre não-nulo na prática —
    // isso é só o tipo, a função já garante isso em runtime.
    role: Role | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role | null;
  }
}
