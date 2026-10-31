import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config.base";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/userConfig/:path*",
    "/relatorios/:path*",
    "/chat/:path*",
  ],
};
