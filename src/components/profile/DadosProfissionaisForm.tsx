"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDoctorProfessionalData } from "@/lib/profile/actions";

export function DadosProfissionaisForm({
  crm,
  specialty,
}: {
  crm: string;
  specialty: string;
}) {
  const [error, formAction, isPending] = useActionState(
    updateDoctorProfessionalData,
    null
  );

  return (
    <section className="rounded-lg bg-card p-5 shadow-sm">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="crm">CRM</Label>
          <Input id="crm" name="crm" defaultValue={crm} required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="specialty">Especialidade</Label>
          <Input
            id="specialty"
            name="specialty"
            defaultValue={specialty}
            required
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending} className="rounded-lg">
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </section>
  );
}
