"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NovaGlicoseDialog } from "@/components/patient/NovaGlicoseDialog";
import { NovaRefeicaoDialog } from "@/components/patient/NovaRefeicaoDialog";

type RecentMeal = { id: string; name: string | null; eatenAt: Date };
type RecentGlucoseRecord = { id: string; valueMgdl: number; measuredAt: Date };

export function AcoesRapidas({
  recentMeals,
  recentGlucoseRecords,
  mealNameSuggestions,
}: {
  recentMeals: RecentMeal[];
  recentGlucoseRecords: RecentGlucoseRecord[];
  mealNameSuggestions: string[];
}) {
  const [promptOpen, setPromptOpen] = useState(false);
  const [refeicaoOpen, setRefeicaoOpen] = useState(false);
  const [refeicaoPreselectId, setRefeicaoPreselectId] = useState<
    string | undefined
  >(undefined);
  const [suggestedRecordId, setSuggestedRecordId] = useState<string | null>(
    null
  );

  function handleSuggestMealLink(glucoseRecordId: string) {
    setSuggestedRecordId(glucoseRecordId);
    setPromptOpen(true);
  }

  function handleConfirmMealPrompt() {
    setPromptOpen(false);
    setRefeicaoPreselectId(suggestedRecordId ?? undefined);
    setRefeicaoOpen(true);
  }

  return (
    <>
      <div className="flex gap-3">
        <NovaGlicoseDialog
          recentMeals={recentMeals}
          onSuggestMealLink={handleSuggestMealLink}
        />
        <NovaRefeicaoDialog
          open={refeicaoOpen}
          onOpenChange={setRefeicaoOpen}
          initialLinkedGlucoseRecordId={refeicaoPreselectId}
          recentGlucoseRecords={recentGlucoseRecords}
          mealNameSuggestions={mealNameSuggestions}
        />
      </div>

      <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Que tal registrar sua refeição?</DialogTitle>
            <DialogDescription>
              Você comeu alguma coisa nas últimas 2 horas? Vamos registrar
              isso também!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => setPromptOpen(false)}
            >
              Agora não
            </Button>
            <Button
              type="button"
              className="rounded-lg"
              onClick={handleConfirmMealPrompt}
            >
              Sim, registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
