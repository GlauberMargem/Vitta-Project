"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HelpPopover } from "@/components/HelpPopover";
import { updateGlucoseThresholds } from "@/lib/profile/actions";
import { DEFAULT_GLUCOSE_THRESHOLDS } from "@/lib/patient/glucose";

type Thresholds = {
  hypoThreshold: number;
  severeHypoThreshold: number;
  hyperFastingThreshold: number;
  hyperPostprandialThreshold: number;
};

export function LimitesAlertaForm(props: Thresholds) {
  const [error, formAction, isPending] = useActionState(
    updateGlucoseThresholds,
    null
  );
  const [values, setValues] = useState<Thresholds>(props);

  function updateField(field: keyof Thresholds, rawValue: string) {
    setValues((current) => ({ ...current, [field]: Number(rawValue) }));
  }

  function restoreDefaults() {
    setValues({
      hypoThreshold: DEFAULT_GLUCOSE_THRESHOLDS.hypo,
      severeHypoThreshold: DEFAULT_GLUCOSE_THRESHOLDS.severeHypo,
      hyperFastingThreshold: DEFAULT_GLUCOSE_THRESHOLDS.hyperFasting,
      hyperPostprandialThreshold: DEFAULT_GLUCOSE_THRESHOLDS.hyperPostprandial,
    });
  }

  return (
    <section className="rounded-lg bg-card p-5 shadow-sm">
      <h2 className="mb-1 flex items-center gap-1.5 font-heading text-base font-semibold text-foreground">
        Limites de alerta
        <HelpPopover>
          <p>
            <strong>Hipoglicemia</strong> é quando a glicose fica baixa
            demais; <strong>hiperglicemia</strong>, alta demais. Os dois
            trazem risco à saúde se acontecerem com frequência.
          </p>
          <p className="mt-2">
            Os limites abaixo definem a partir de que valor um registro
            aparece marcado como alerta no histórico e nos gráficos.
          </p>
        </HelpPopover>
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">
        Usados para marcar seus registros como hipo/hiperglicemia no
        histórico e nos gráficos. O padrão segue as diretrizes da Sociedade
        Brasileira de Diabetes. Ajuste só se seu médico recomendar valores
        diferentes.
      </p>
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="severeHypoThreshold" className="font-support">
            Hipoglicemia grave (abaixo de, mg/dL)
          </Label>
          <Input
            id="severeHypoThreshold"
            name="severeHypoThreshold"
            type="number"
            value={values.severeHypoThreshold}
            onChange={(event) =>
              updateField("severeHypoThreshold", event.target.value)
            }
            required
            className="font-support"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="hypoThreshold" className="font-support">
            Hipoglicemia (abaixo de, mg/dL)
          </Label>
          <Input
            id="hypoThreshold"
            name="hypoThreshold"
            type="number"
            value={values.hypoThreshold}
            onChange={(event) =>
              updateField("hypoThreshold", event.target.value)
            }
            required
            className="font-support"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="hyperFastingThreshold" className="font-support">
            Hiperglicemia em jejum/antes de dormir (acima de, mg/dL)
          </Label>
          <Input
            id="hyperFastingThreshold"
            name="hyperFastingThreshold"
            type="number"
            value={values.hyperFastingThreshold}
            onChange={(event) =>
              updateField("hyperFastingThreshold", event.target.value)
            }
            required
            className="font-support"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="hyperPostprandialThreshold" className="font-support">
            Hiperglicemia pós-prandial (acima de, mg/dL)
          </Label>
          <Input
            id="hyperPostprandialThreshold"
            name="hyperPostprandialThreshold"
            type="number"
            value={values.hyperPostprandialThreshold}
            onChange={(event) =>
              updateField("hyperPostprandialThreshold", event.target.value)
            }
            required
            className="font-support"
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            onClick={restoreDefaults}
          >
            Restaurar padrão
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-lg"
          >
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </section>
  );
}
