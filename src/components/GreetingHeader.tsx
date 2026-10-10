"use client";

import { useEffect, useState } from "react";

function greetingForHour(hour: number): string {
  if (hour < 5) return "Boa noite!";
  if (hour < 12) return "Bom dia!";
  if (hour < 18) return "Boa tarde!";
  return "Boa noite!";
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Saudação + nome + horário atual, no topo do dashboard (paciente e
 * médico). Horário calculado no cliente (useEffect) pra bater com o
 * relógio local do usuário, não o fuso do servidor — por isso só aparece
 * depois da hidratação; "Bom dia!" fixo é o fallback até lá. */
export function GreetingHeader({ name }: { name: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          {now ? greetingForHour(now.getHours()) : "Bom dia!"}
        </p>
        <h1 className="text-xl font-semibold text-foreground">{name}</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        {now ? formatTime(now) : ""}
      </p>
    </div>
  );
}
