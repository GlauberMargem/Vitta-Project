"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createMeal } from "@/lib/patient/actions";

export function NovaRefeicaoDialog({
  mealNameSuggestions = [],
}: {
  mealNameSuggestions?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [errorMessage, formAction, isPending] = useActionState(
    createMeal,
    null
  );
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !errorMessage) {
      setOpen(false);
    }
    wasPending.current = isPending;
  }, [isPending, errorMessage]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="icon-lg"
          variant="secondary"
          className="rounded-lg"
          aria-label="Nova refeição"
        >
          <Utensils />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Refeição</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Refeição</Label>
            <Input
              id="name"
              name="name"
              list="meal-suggestions"
              placeholder="Buscar refeição já registrada"
            />
            <datalist id="meal-suggestions">
              {mealNameSuggestions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="carbs">Carboidratos (g)</Label>
            <Input
              id="carbs"
              name="carbs"
              type="number"
              min={0}
              placeholder="Quantidade de carboidratos da refeição"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="eatenAt">Horário da refeição</Label>
            <Input
              id="eatenAt"
              name="eatenAt"
              type="datetime-local"
              required
            />
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <Button type="submit" disabled={isPending} className="w-full rounded-lg">
            {isPending ? "Salvando..." : "Inserir refeição"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
