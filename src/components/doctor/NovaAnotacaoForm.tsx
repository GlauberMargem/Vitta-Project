"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClinicalNote } from "@/lib/doctor/actions";

export function NovaAnotacaoForm({ linkId }: { linkId: string }) {
  const [error, formAction, isPending] = useActionState(
    createClinicalNote,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !error) {
      formRef.current?.reset();
    }
    wasPending.current = isPending;
  }, [isPending, error]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="linkId" value={linkId} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="note">Nova anotação</Label>
        <textarea
          id="note"
          name="note"
          rows={3}
          required
          placeholder="Observação clínica visível só para você"
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={isPending}
        className="self-start rounded-full"
      >
        {isPending ? "Salvando..." : "Salvar anotação"}
      </Button>
    </form>
  );
}
