"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Utensils } from "lucide-react";
import { toast } from "sonner";
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
import { createMeal } from "@/lib/patient/actions";
import { formatDateTime } from "@/lib/patient/format";
import { MEAL_CARBS_MAX_G } from "@/lib/patient/limits";

type RecentGlucoseRecord = { id: string; valueMgdl: number; measuredAt: Date };

export function NovaRefeicaoDialog({
  mealNameSuggestions = [],
  recentGlucoseRecords = [],
  initialLinkedGlucoseRecordId,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: {
  mealNameSuggestions?: string[];
  recentGlucoseRecords?: RecentGlucoseRecord[];
  initialLinkedGlucoseRecordId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChangeProp ?? setInternalOpen;
  const [linkedGlucoseRecordId, setLinkedGlucoseRecordId] = useState(
    initialLinkedGlucoseRecordId ?? ""
  );
  const [errorMessage, formAction, isPending] = useActionState(
    createMeal,
    null
  );
  const wasPending = useRef(false);

  useEffect(() => {
    setLinkedGlucoseRecordId(initialLinkedGlucoseRecordId ?? "");
  }, [initialLinkedGlucoseRecordId]);

  useEffect(() => {
    if (wasPending.current && !isPending && !errorMessage) {
      toast.success("Refeição registrada");
      setOpen(false);
      setLinkedGlucoseRecordId("");
    }
    wasPending.current = isPending;
  }, [isPending, errorMessage, setOpen]);

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
            <Label htmlFor="name" className="font-support">
              Refeição
            </Label>
            <Input
              id="name"
              name="name"
              list="meal-suggestions"
              placeholder="Buscar refeição já registrada"
              className="font-support"
            />
            <datalist id="meal-suggestions">
              {mealNameSuggestions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="carbs" className="font-support">
              Carboidratos (g)
            </Label>
            <Input
              id="carbs"
              name="carbs"
              type="number"
              min={0}
              max={MEAL_CARBS_MAX_G}
              placeholder="Quantidade de carboidratos da refeição"
              required
              className="font-support"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="eatenAt" className="font-support">
              Horário da refeição
            </Label>
            <Input
              id="eatenAt"
              name="eatenAt"
              type="datetime-local"
              required
              className="font-support"
            />
          </div>

          {recentGlucoseRecords.length > 0 ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="linkedGlucoseRecordId" className="font-support">
                Vincular a uma glicose (opcional)
              </Label>
              <Select
                value={linkedGlucoseRecordId}
                onValueChange={setLinkedGlucoseRecordId}
              >
                <SelectTrigger
                  id="linkedGlucoseRecordId"
                  className="w-full font-support"
                >
                  <SelectValue placeholder="Nenhuma glicose vinculada" />
                </SelectTrigger>
                <SelectContent>
                  {recentGlucoseRecords.map((record) => (
                    <SelectItem key={record.id} value={record.id}>
                      {`${record.valueMgdl} mg/dL, ${formatDateTime(record.measuredAt)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="hidden"
                name="linkedGlucoseRecordId"
                value={linkedGlucoseRecordId}
              />
            </div>
          ) : null}

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
