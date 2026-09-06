import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { auth } from "@/lib/auth/config";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
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
        <div className="mb-8 flex flex-col items-center gap-1">
          <Image src="/logo-vitta.svg" alt="" width={40} height={37} priority />
          <span className="font-heading text-2xl font-semibold text-foreground">
            vitta
          </span>
        </div>

        <LoginForm />

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          Outras formas de login
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          disabled
          title="Login com Google ainda não disponível"
          className="w-full rounded-lg"
        >
          <GoogleIcon className="size-4" />
          Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não possui uma conta?{" "}
          <Link
            href="/cadastro"
            className="font-medium text-foreground hover:underline"
          >
            Cadastre-se aqui
          </Link>
        </p>
      </div>

      <p className="relative z-10 mt-10 text-center text-xs text-muted-foreground">
        Projeto de Glauber Margem — TCC UniRios
      </p>
    </main>
  );
}
