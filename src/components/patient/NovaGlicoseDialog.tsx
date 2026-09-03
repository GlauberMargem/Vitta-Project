"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createGlucoseRecord } from "@/lib/patient/actions";

export function NovaGlicoseDialog() {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState("");
  const [errorMessage, formAction, isPending] = useActionState(
    createGlucoseRecord,
    null
  );
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !errorMessage) {
      setOpen(false);
      setContext("");
    }
    wasPending.current = isPending;
  }, [isPending, errorMessage]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="icon-lg"
          className="rounded-2xl"
          aria-label="Nova glicose"
        >
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Glicose</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="value">Valor (mg/dL)</Label>
            <Input
              id="value"
              name="value"
              type="number"
              min={1}
              placeholder="Digite o valor da sua glicose"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="measuredAt">Horário da aferição</Label>
            <Input
              id="measuredAt"
              name="measuredAt"
              type="datetime-local"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="context">Contexto</Label>
            <Select value={context} onValueChange={setContext}>
              <SelectTrigger id="context" className="w-full">
                <SelectValue placeholder="Selecione o contexto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JEJUM">Jejum</SelectItem>
                <SelectItem value="POS_PRANDIAL">Pós-prandial</SelectItem>
                <SelectItem value="ANTES_DE_DORMIR">Antes de dormir</SelectItem>
                <SelectItem value="OUTRO">Outro</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="context" value={context} />
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <Button type="submit" disabled={isPending} className="w-full rounded-full">
            {isPending ? "Salvando..." : "Inserir glicose"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
