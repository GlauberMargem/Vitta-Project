"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  generateInviteCode,
  type GenerateInviteCodeState,
} from "@/lib/doctor/actions";

const initialState: GenerateInviteCodeState = { code: null, error: null };

export function GerarConviteCard() {
  const [state, formAction, isPending] = useActionState(
    generateInviteCode,
    initialState
  );

  return (
    <section className="rounded-lg bg-card p-5 shadow-sm">
      <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
        Vincular paciente
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">
        Gere um código e compartilhe com o paciente. Ele usa esse código pra
        se vincular a você.
      </p>
      <form action={formAction}>
        <Button type="submit" disabled={isPending} className="rounded-lg">
          {isPending ? "Gerando..." : "Gerar código de convite"}
        </Button>
      </form>
      {state.error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.code ? (
        <p className="mt-3 rounded-lg bg-muted px-4 py-3 text-center font-mono text-lg tracking-widest text-foreground">
          {state.code}
        </p>
      ) : null}
    </section>
  );
}
