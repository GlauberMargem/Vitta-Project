import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";

/** Pega qualquer caminho dentro da área logada que não bate com nenhuma
 * rota real (ex.: `/foo`, `/dashboard/coisa-que-nao-existe`). Pedido do
 * Glauber em 2026-10-13: sem sessão, manda pro login em vez de um 404 seco
 * — nesse caso não dá pra saber se a rota existiria de verdade, então
 * tratar como "você precisa entrar primeiro" é mais útil (e não revela se
 * a rota é privada ou simplesmente não existe). Com sessão válida, mostra
 * o 404 de verdade (`(app)/not-found.tsx`).
 *
 * Rotas conhecidas (`/dashboard`, `/userConfig`, `/relatorios` e
 * subrotas) sempre têm prioridade sobre esse catch-all — o Next.js só
 * cai aqui quando nada mais bate. */
export default async function CatchAllPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }
  notFound();
}
