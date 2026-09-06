"use client";

import { useActionState, useState } from "react";
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
import { updatePatientClinicalData } from "@/lib/profile/actions";
import type { DiabetesType } from "@/generated/prisma/client";

export function DadosClinicosForm({
  birthDate,
  diabetesType,
}: {
  birthDate: Date;
  diabetesType: DiabetesType;
}) {
  const [error, formAction, isPending] = useActionState(
    updatePatientClinicalData,
    null
  );
  const [selectedType, setSelectedType] = useState<DiabetesType>(diabetesType);

  return (
    <section className="rounded-lg bg-card p-5 shadow-sm">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="birthDate" className="font-support">
            Data de nascimento
          </Label>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            defaultValue={birthDate.toISOString().slice(0, 10)}
            required
            className="font-support"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="diabetesType" className="font-support">
            Tipo de diabetes
          </Label>
          <Select
            value={selectedType}
            onValueChange={(value) => setSelectedType(value as DiabetesType)}
          >
            <SelectTrigger id="diabetesType" className="w-full font-support">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TIPO_1">Tipo 1</SelectItem>
              <SelectItem value="TIPO_2">Tipo 2</SelectItem>
              <SelectItem value="GESTACIONAL">Gestacional</SelectItem>
              <SelectItem value="OUTRO">Outro</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="diabetesType" value={selectedType} />
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
