import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { CompletarCadastroForm } from "./CompletarCadastroForm";

export default async function CompletarCadastroPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role) {
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
        <h1 className="mb-1 text-base font-semibold text-foreground">
          Falta pouco!
        </h1>
        <p className="mb-4 text-xs text-muted-foreground">
          Confirme seu perfil e complete seus dados pra terminar o cadastro.
        </p>

        <div className="mb-4 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground">
          {session.user.name}
          <br />
          <span className="text-xs text-muted-foreground">
            {session.user.email}
          </span>
        </div>

        <CompletarCadastroForm />
      </div>

      <p className="relative z-10 mt-10 text-center text-xs text-muted-foreground">
        Projeto de Glauber Margem, TCC UniRios
      </p>
    </main>
  );
}
