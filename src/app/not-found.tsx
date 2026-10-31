import Link from "next/link";

/** 404 global — cobre qualquer rota fora da área logada (ex.: URL
 * digitada errada antes de logar). Dentro da área logada,
 * `src/app/(app)/not-found.tsx` mostra uma versão com Header/Navbar. */
export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-64 bg-[#c8e1ff]"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 55%, 0 100%)" }}
      />

      <div className="relative z-10 w-full max-w-sm rounded-lg bg-card p-8 text-center shadow-lg">
        <p className="mb-1 text-5xl font-bold text-foreground">404</p>
        <h1 className="mb-1 text-base font-semibold text-foreground">
          Página não encontrada
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          O endereço que você tentou acessar não existe.
        </p>
        <Link
          href="/login"
          className="font-medium text-foreground hover:underline"
        >
          Voltar para o login
        </Link>
      </div>
    </main>
  );
}
