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
import { formatDateTime } from "@/lib/patient/format";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

type RecentMeal = { id: string; name: string | null; eatenAt: Date };

export function NovaGlicoseDialog({
  recentMeals = [],
  onSuggestMealLink,
}: {
  recentMeals?: RecentMeal[];
  onSuggestMealLink?: (glucoseRecordId: string, measuredAt: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState("");
  const [linkedMealId, setLinkedMealId] = useState("");
  const [measuredAt, setMeasuredAt] = useState("");
  const [state, formAction, isPending] = useActionState(createGlucoseRecord, {
    error: null,
  });
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !state.error && state.recordId) {
      const submittedAt = new Date(measuredAt);
      const hasNearbyMeal = recentMeals.some(
        (meal) =>
          Math.abs(meal.eatenAt.getTime() - submittedAt.getTime()) <=
          TWO_HOURS_MS
      );
      if (!linkedMealId && !hasNearbyMeal && !Number.isNaN(submittedAt.getTime())) {
        onSuggestMealLink?.(state.recordId, submittedAt);
      }
      setOpen(false);
      setContext("");
      setLinkedMealId("");
      setMeasuredAt("");
    }
    wasPending.current = isPending;
  }, [isPending, state, recentMeals, linkedMealId, measuredAt, onSuggestMealLink]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="icon-lg"
          className="rounded-lg"
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
            <Label htmlFor="value" className="font-support">
              Valor (mg/dL)
            </Label>
            <Input
              id="value"
              name="value"
              type="number"
              min={1}
              placeholder="Digite o valor da sua glicose"
              required
              className="font-support"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="measuredAt" className="font-support">
              Que horas você mediu?
            </Label>
            <Input
              id="measuredAt"
              name="measuredAt"
              type="datetime-local"
              value={measuredAt}
              onChange={(event) => setMeasuredAt(event.target.value)}
              required
              className="font-support"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="context" className="font-support">
              Contexto
            </Label>
            <Select value={context} onValueChange={setContext}>
              <SelectTrigger id="context" className="w-full font-support">
                <SelectValue placeholder="Selecione o contexto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JEJUM">Jejum</SelectItem>
                <SelectItem value="POS_PRANDIAL">Depois de comer</SelectItem>
                <SelectItem value="ANTES_DE_DORMIR">Antes de dormir</SelectItem>
                <SelectItem value="OUTRO">Outro</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="context" value={context} />
          </div>

          {recentMeals.length > 0 ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="linkedMealId" className="font-support">
                Vincular a uma refeição (opcional)
              </Label>
              <Select value={linkedMealId} onValueChange={setLinkedMealId}>
                <SelectTrigger id="linkedMealId" className="w-full font-support">
                  <SelectValue placeholder="Nenhuma refeição vinculada" />
                </SelectTrigger>
                <SelectContent>
                  {recentMeals.map((meal) => (
                    <SelectItem key={meal.id} value={meal.id}>
                      {(meal.name ?? "Refeição") +
                        " — " +
                        formatDateTime(meal.eatenAt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="linkedMealId" value={linkedMealId} />
            </div>
          ) : null}

          {state.error ? (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}

          <Button type="submit" disabled={isPending} className="w-full rounded-lg">
            {isPending ? "Salvando..." : "Inserir glicose"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
