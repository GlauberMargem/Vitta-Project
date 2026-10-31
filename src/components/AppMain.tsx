import { cn } from "@/lib/utils";

/** Container padrão das telas da área logada (dashboard, perfil): fundo
 * bege (#f2ecde, mais contraste com os cards brancos que o antigo
 * --background global) e a mesma faixa diagonal azul clara usada em
 * login/cadastro, atrás do conteúdo do topo. */
export function AppMain({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f2ecde] px-4 pb-28 pt-6">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 bg-[#c8e1ff]"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 55%, 0 100%)" }}
      />
      <div
        className={cn(
          "relative z-10 mx-auto flex max-w-md flex-col gap-6",
          className
        )}
      >
        {children}
      </div>
    </main>
  );
}
