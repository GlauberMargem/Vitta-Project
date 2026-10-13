"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { revokeInviteCode } from "@/lib/doctor/actions";

function PendingCodeRow({ id, code }: { id: string; code: string }) {
  const [, formAction, isPending] = useActionState(revokeInviteCode, null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const formId = `revoke-code-${id}`;

  return (
    <li className="flex items-center justify-between gap-2 rounded-lg bg-muted px-4 py-2">
      <span className="font-mono text-sm tracking-widest text-foreground">
        {code}
      </span>

      <form id={formId} action={formAction}>
        <input type="hidden" name="linkId" value={id} />
      </form>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            className="h-auto px-2 py-1 text-xs text-destructive hover:text-destructive"
          >
            {isPending ? "Revogando..." : "Revogar"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revogar este código?</DialogTitle>
            <DialogDescription>
              Ninguém mais vai conseguir usar o código {code} pra se vincular
              a você. Se precisar, pode gerar um novo depois.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => setConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form={formId}
              variant="destructive"
              className="rounded-lg"
              onClick={() => setConfirmOpen(false)}
            >
              Sim, revogar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
}

export function PendingInviteCodes({
  codes,
}: {
  codes: { id: string; code: string }[];
}) {
  if (codes.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg bg-card p-5 shadow-sm">
      <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
        Códigos pendentes
      </h2>
      <ul className="flex flex-col gap-2">
        {codes.map((item) => (
          <PendingCodeRow key={item.id} id={item.id} code={item.code} />
        ))}
      </ul>
    </section>
  );
}
