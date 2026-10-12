"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/generated/prisma/client";

const BASE_ITEMS = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/userConfig", label: "Perfil", icon: UserCog },
];

/** "Relatórios" só pro paciente — o médico já baixa relatório de cada
 * paciente na tela de histórico individual, não precisa de rota própria.
 * Pedido do Glauber em 2026-10-12: botão de relatório sai do meio do
 * dashboard e vira item de navegação de verdade. */
const PATIENT_ITEM = { href: "/relatorios", label: "Relatórios", icon: FileText };

export function Navbar({ role }: { role: Role | null }) {
  const pathname = usePathname();
  const items = role === "PATIENT" ? [...BASE_ITEMS, PATIENT_ITEM] : BASE_ITEMS;

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
