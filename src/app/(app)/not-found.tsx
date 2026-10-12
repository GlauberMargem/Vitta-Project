import Link from "next/link";
import { AppMain } from "@/components/AppMain";

/** 404 dentro da área logada — renderiza com Header/Navbar (herdados de
 * `(app)/layout.tsx`), diferente do 404 global da raiz. Disparado pelo
 * catch-all em `(app)/[...slug]/page.tsx` quando a rota não existe de
 * verdade (sessão válida, mas caminho sem página correspondente). */
export default function AppNotFound() {
  return (
    <AppMain>
      <div className="flex flex-col items-center gap-2 rounded-lg bg-card p-8 text-center shadow-sm">
        <p className="text-5xl font-bold text-foreground">404</p>
        <h1 className="text-base font-semibold text-foreground">
          Página não encontrada
        </h1>
        <p className="mb-2 text-sm text-muted-foreground">
          O endereço que você tentou acessar não existe.
        </p>
        <Link
          href="/dashboard"
          className="font-medium text-foreground hover:underline"
        >
          Voltar para o início
        </Link>
      </div>
    </AppMain>
  );
}
