"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { consumeInviteCode, revokeLink } from "@/lib/patient/actions";

type ActiveLink = {
  id: string;
  doctorName: string;
};

function ConsumeCodeForm() {
  const [error, formAction, isPending] = useActionState(
    consumeInviteCode,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="code">Código de convite</Label>
        <Input
          id="code"
          name="code"
          placeholder="Digite o código recebido do médico"
          autoCapitalize="characters"
          required
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending} className="rounded-lg">
        {isPending ? "Vinculando..." : "Vincular"}
      </Button>
    </form>
  );
}

function RevokeLinkForm({ link }: { link: ActiveLink }) {
  const [error, formAction, isPending] = useActionState(revokeLink, null);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-foreground">
        Vinculado a{" "}
        <span className="font-semibold">Dr(a). {link.doctorName}</span>
      </p>
      <form action={formAction}>
        <input type="hidden" name="linkId" value={link.id} />
        {error ? (
          <p className="mb-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          variant="secondary"
          disabled={isPending}
          className="rounded-lg"
        >
          {isPending ? "Revogando..." : "Revogar vínculo"}
        </Button>
      </form>
    </div>
  );
}

export function VinculoMedicoCard({
  activeLink,
}: {
  activeLink: ActiveLink | null;
}) {
  return (
    <section className="rounded-lg bg-card p-5 shadow-sm">
      <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
        Vínculo com médico
      </h2>
      {activeLink ? (
        <RevokeLinkForm link={activeLink} />
      ) : (
        <ConsumeCodeForm />
      )}
    </section>
  );
}
