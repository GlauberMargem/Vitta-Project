import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { auth, signIn } from "@/lib/auth/config";
import logoIcon from "@/assets/images/logo-vitta.svg";
import { LoginForm } from "./LoginForm";

const LOGIN_ERRORS: Record<string, string> = {
  "conta-com-senha":
    "Já existe uma conta com esse email criada com senha. Entre com seu email e senha.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const session = await auth();
  if (session) {
    redirect(session.user.role ? "/dashboard" : "/cadastro/completar");
  }

  const { erro } = await searchParams;
  const loginError = erro ? LOGIN_ERRORS[erro] : undefined;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-64 bg-[#c8e1ff]"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 55%, 0 100%)" }}
      />

      <div className="relative z-10 w-full max-w-sm rounded-lg bg-card p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center gap-1">
          <Image src={logoIcon} alt="" width={40} height={37} priority />
          <span className="font-heading text-2xl font-semibold text-foreground">
            vitta
          </span>
        </div>

        {loginError ? (
          <p
            className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {loginError}
          </p>
        ) : null}

        <LoginForm />

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          Outras formas de login
          <span className="h-px flex-1 bg-border" />
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <Button
            type="submit"
            variant="outline"
            className="w-full rounded-lg"
          >
            <GoogleIcon className="size-4" />
            Google
          </Button>
        </form>

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
        Projeto de Glauber Margem, TCC UniRios
      </p>
    </main>
  );
}
