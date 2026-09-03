"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth/config";

export async function authenticate(
  _previousState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Email ou senha incorretos.";
        default:
          return "Não foi possível entrar. Tente novamente.";
      }
    }
    throw error;
  }
}
