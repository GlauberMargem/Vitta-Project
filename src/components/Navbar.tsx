"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, MessageCircle, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/generated/prisma/client";

const BASE_ITEMS = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/userConfig", label: "Perfil", icon: UserCog },
];

/** "Relatórios"/"Chat" só pro paciente — o médico já baixa relatório e
 * conversa com cada paciente dentro da própria tela de histórico
 * individual, não precisam de rota própria. Pedido do Glauber em
 * 2026-10-12: botão de relatório sai do meio do dashboard e vira item de
 * navegação de verdade. Chat ganhou o mesmo tratamento em 2026-10-30
 * (achado na avaliação heurística: ficava só dentro do Perfil, H6). Os
 * dois aparecem sempre pro paciente, mesmo sem vínculo/sem dado — a
 * própria rota explica o estado vazio, igual já acontecia com Relatórios. */
const PATIENT_ITEMS = [
  { href: "/relatorios", label: "Relatórios", icon: FileText },
  { href: "/chat", label: "Chat", icon: MessageCircle },
];

export function Navbar({ role }: { role: Role | null }) {
  const pathname = usePathname();
  const items = role === "PATIENT" ? [...BASE_ITEMS, ...PATIENT_ITEMS] : BASE_ITEMS;

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-border bg-card p-1.5 shadow-lg">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex size-11 items-center justify-center rounded-lg transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Icon className="size-6" />
          </Link>
        );
      })}
    </nav>
  );
}
