import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { CadastroForm } from "./CadastroForm";

export default async function CadastroPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-64 bg-[#c8e1ff]"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 55%, 0 100%)" }}
      />

      <div className="relative z-10 w-full max-w-sm rounded-lg bg-card p-8 shadow-lg">
        <h1 className="mb-1 text-lg font-semibold text-foreground">
          Começando com o Vitta!
        </h1>

        <CadastroForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>

      <p className="relative z-10 mt-10 text-center text-xs text-muted-foreground">
        Projeto de Glauber Margem — TCC UniRios
      </p>
    </main>
  );
}
