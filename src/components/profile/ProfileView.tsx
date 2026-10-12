"use client";

import { useState } from "react";
import { AppMain } from "@/components/AppMain";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";
import { DadosPessoaisForm } from "./DadosPessoaisForm";
import { DadosClinicosForm } from "./DadosClinicosForm";
import { DadosProfissionaisForm } from "./DadosProfissionaisForm";
import { LimitesAlertaForm } from "./LimitesAlertaForm";
import { VinculoMedicoCard } from "@/components/patient/VinculoMedicoCard";
import { logout } from "@/lib/auth/actions";
import type { DiabetesType } from "@/generated/prisma/client";

type Props =
  | {
      role: "PATIENT";
      name: string;
      email: string;
      hasPassword: boolean;
      birthDate: Date;
      diabetesType: DiabetesType;
      hypoThreshold: number;
      severeHypoThreshold: number;
      hyperFastingThreshold: number;
      hyperPostprandialThreshold: number;
      activeLink: { id: string; doctorName: string } | null;
    }
  | {
      role: "DOCTOR";
      name: string;
      email: string;
      hasPassword: boolean;
      crm: string;
      specialty: string;
    };

export function ProfileView(props: Props) {
  const [page, setPage] = useState<0 | 1>(0);
  const secondPageLabel =
    props.role === "PATIENT" ? "Dados clínicos" : "Dados profissionais";

  return (
    <AppMain>
      <div className="flex flex-col items-center gap-2">
        <div
          aria-hidden
          className="flex size-20 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground"
        >
          {initials(props.name)}
        </div>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground">Perfil</h1>
          <p className="text-sm text-muted-foreground">
            {page === 0 ? "Dados pessoais" : secondPageLabel}
          </p>
        </div>
      </div>

      {page === 0 ? (
        <DadosPessoaisForm
          name={props.name}
          email={props.email}
          hasPassword={props.hasPassword}
        />
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
          className="rounded-lg"
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
          className="rounded-lg"
          onClick={() => setPage(1)}
          disabled={page === 1}
        >
          {secondPageLabel}
        </Button>
      </div>

      {props.role === "PATIENT" ? (
        <VinculoMedicoCard activeLink={props.activeLink} />
      ) : null}

      <form action={logout}>
        <Button type="submit" variant="outline" className="w-full rounded-lg">
          Sair
        </Button>
      </form>
    </AppMain>
  );
}
