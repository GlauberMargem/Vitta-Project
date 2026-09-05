"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DadosPessoaisForm } from "./DadosPessoaisForm";
import { DadosClinicosForm } from "./DadosClinicosForm";
import { DadosProfissionaisForm } from "./DadosProfissionaisForm";
import { LimitesAlertaForm } from "./LimitesAlertaForm";
import type { DiabetesType } from "@/generated/prisma/client";

type Props =
  | {
      role: "PATIENT";
      name: string;
      email: string;
      birthDate: Date;
      diabetesType: DiabetesType;
      hypoThreshold: number;
      severeHypoThreshold: number;
      hyperFastingThreshold: number;
      hyperPostprandialThreshold: number;
    }
  | {
      role: "DOCTOR";
      name: string;
      email: string;
      crm: string;
      specialty: string;
    };

export function ProfileView(props: Props) {
  const [page, setPage] = useState<0 | 1>(0);
  const secondPageLabel =
    props.role === "PATIENT" ? "Dados clínicos" : "Dados profissionais";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 pb-28 pt-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Perfil</h1>
        <p className="text-sm text-muted-foreground">
          {page === 0 ? "Dados pessoais" : secondPageLabel}
        </p>
      </div>

      {page === 0 ? (
        <DadosPessoaisForm name={props.name} email={props.email} />
      ) : props.role === "PATIENT" ? (
        <>
          <DadosClinicosForm
            birthDate={props.birthDate}
            diabetesType={props.diabetesType}
          />
          <LimitesAlertaForm
            hypoThreshold={props.hypoThreshold}
            severeHypoThreshold={props.severeHypoThreshold}
            hyperFastingThreshold={props.hyperFastingThreshold}
            hyperPostprandialThreshold={props.hyperPostprandialThreshold}
          />
        </>
      ) : (
        <DadosProfissionaisForm
          crm={props.crm}
          specialty={props.specialty}
        />
      )}

      <div className="flex items-center justify-center gap-4">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => setPage(0)}
          disabled={page === 0}
        >
          Dados pessoais
        </Button>
        <div className="flex gap-1">
          <span
            className={`size-1.5 rounded-full ${page === 0 ? "bg-primary" : "bg-border"}`}
          />
          <span
            className={`size-1.5 rounded-full ${page === 1 ? "bg-primary" : "bg-border"}`}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => setPage(1)}
          disabled={page === 1}
        >
          {secondPageLabel}
        </Button>
      </div>
    </main>
  );
}
