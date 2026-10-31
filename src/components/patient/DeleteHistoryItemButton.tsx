"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
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
import { deleteGlucoseRecord, deleteMeal } from "@/lib/patient/actions";

export function DeleteHistoryItemButton({
  kind,
  id,
}: {
  kind: "glucose" | "meal";
  id: string;
}) {
  const action = kind === "glucose" ? deleteGlucoseRecord : deleteMeal;
  const [error, formAction, isPending] = useActionState(action, null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const formId = `delete-history-item-${kind}-${id}`;
  const wasPendingRef = useRef(false);

  useEffect(() => {
    if (wasPendingRef.current && !isPending && !error) {
      setConfirmOpen(false);
    }
    wasPendingRef.current = isPending;
  }, [isPending, error]);

  return (
    <>
      <form id={formId} action={formAction}>
        <input type="hidden" name="id" value={id} />
      </form>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isPending}
            aria-label="Excluir registro"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir este registro?</DialogTitle>
            <DialogDescription>
              Essa ação não pode ser desfeita. O registro some do histórico,
              do gráfico e da estimativa de HbA1c.
            </DialogDescription>
          </DialogHeader>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
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
              disabled={isPending}
              className="rounded-lg"
            >
              {isPending ? "Excluindo..." : "Sim, excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
