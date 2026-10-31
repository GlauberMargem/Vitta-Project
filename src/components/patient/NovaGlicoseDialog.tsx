"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { HelpPopover } from "@/components/HelpPopover";
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
import {
  GLUCOSE_VALUE_MAX_MGDL,
  GLUCOSE_VALUE_MIN_MGDL,
} from "@/lib/patient/limits";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

type RecentMeal = { id: string; name: string | null; eatenAt: Date };

function toDateTimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

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
  const [timeMode, setTimeMode] = useState<"now" | "past">("now");
  const [measuredAt, setMeasuredAt] = useState("");
  const submittedAtRef = useRef<Date | null>(null);
  const [state, formAction, isPending] = useActionState(createGlucoseRecord, {
    error: null,
  });
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !state.error && state.recordId) {
      const submittedAt = submittedAtRef.current ?? new Date(NaN);
      const hasNearbyMeal = recentMeals.some(
        (meal) =>
          Math.abs(meal.eatenAt.getTime() - submittedAt.getTime()) <=
          TWO_HOURS_MS
      );
      if (
        !linkedMealId &&
        !hasNearbyMeal &&
        context !== "JEJUM" &&
        !Number.isNaN(submittedAt.getTime())
      ) {
        onSuggestMealLink?.(state.recordId, submittedAt);
      }
      toast.success("Glicose registrada");
      setOpen(false);
      setContext("");
      setLinkedMealId("");
      setTimeMode("now");
      setMeasuredAt("");
    }
    wasPending.current = isPending;
  }, [isPending, state, recentMeals, linkedMealId, context, onSuggestMealLink]);

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
        <form
          action={formAction}
          onSubmit={(event) => {
            const input = event.currentTarget.elements.namedItem(
              "measuredAt"
            ) as HTMLInputElement;
            if (timeMode === "now") {
              const now = new Date();
              input.value = toDateTimeLocalValue(now);
              submittedAtRef.current = now;
            } else {
              submittedAtRef.current = new Date(measuredAt);
            }
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="value" className="font-support">
              Valor (mg/dL)
            </Label>
            <Input
              id="value"
              name="value"
              type="number"
              min={GLUCOSE_VALUE_MIN_MGDL}
              max={GLUCOSE_VALUE_MAX_MGDL}
              placeholder="Digite o valor da sua glicose"
              required
              className="font-support"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="font-support">Que horas você mediu?</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={timeMode === "now" ? "default" : "outline"}
                aria-pressed={timeMode === "now"}
                onClick={() => setTimeMode("now")}
                className="h-11 rounded-lg font-support"
              >
                Agora
              </Button>
              <Button
                type="button"
                variant={timeMode === "past" ? "default" : "outline"}
                aria-pressed={timeMode === "past"}
                onClick={() => {
                  setTimeMode("past");
                  if (!measuredAt) setMeasuredAt(toDateTimeLocalValue(new Date()));
                }}
                className="h-11 rounded-lg font-support"
              >
                Outro horário
              </Button>
            </div>
            {timeMode === "past" ? (
              <Input
                id="measuredAt"
                name="measuredAt"
                type="datetime-local"
                aria-label="Data e horário da medição"
                value={measuredAt}
                max={toDateTimeLocalValue(new Date())}
                onChange={(event) => setMeasuredAt(event.target.value)}
                required
                className="font-support"
              />
            ) : (
              <input type="hidden" name="measuredAt" />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="context" className="flex items-center gap-1.5 font-support">
              Contexto
              <HelpPopover>
                <p>
                  <strong>Jejum</strong>: sem comer nada nas últimas horas
                  (geralmente ao acordar).
                </p>
                <p className="mt-2">
                  <strong>Depois de comer</strong>: até cerca de 2h depois de
                  uma refeição.
                </p>
                <p className="mt-2">
                  <strong>Antes de dormir</strong>: medição feita perto da
                  hora de deitar.
                </p>
              </HelpPopover>
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
                        ", " +
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
