"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
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
import { completeGoogleSignup } from "@/lib/auth/actions";
import doctorIllustration from "@/assets/illustrations/doctor-pana.svg";
import patientIllustration from "@/assets/illustrations/medical-care-rafiki.svg";

type Role = "PATIENT" | "DOCTOR" | "";
type DiabetesType = "TIPO_1" | "TIPO_2" | "GESTACIONAL" | "OUTRO" | "";

export function CompletarCadastroForm() {
  const [role, setRole] = useState<Role>("");
  const [diabetesType, setDiabetesType] = useState<DiabetesType>("");
  const [errorMessage, formAction, isPending] = useActionState(
    completeGoogleSignup,
    undefined
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="role">Paciente/Médico</Label>
        <Select value={role} onValueChange={(value) => setRole(value as Role)}>
          <SelectTrigger id="role" className="w-full">
            <SelectValue placeholder="Selecione o perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PATIENT">Paciente</SelectItem>
            <SelectItem value="DOCTOR">Médico</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="role" value={role} />
      </div>

      {role === "DOCTOR" ? (
        <>
          <div className="flex flex-col items-center gap-1">
            <Image
              src={doctorIllustration}
              alt=""
              className="h-48 w-auto"
              priority
            />
            <a
              href="https://storyset.com/work"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-muted-foreground hover:underline"
            >
              Work illustrations by Storyset
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="crm">CRM</Label>
            <Input id="crm" name="crm" placeholder="CRM" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="specialty">Especialidade</Label>
            <Input
              id="specialty"
              name="specialty"
              placeholder="Digite sua especialidade"
              required
            />
          </div>
        </>
      ) : role === "PATIENT" ? (
        <>
          <div className="flex flex-col items-center gap-1">
            <Image
              src={patientIllustration}
              alt=""
              className="h-64 w-auto"
              priority
            />
            <a
              href="https://storyset.com/work"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-muted-foreground hover:underline"
            >
              Work illustrations by Storyset
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="birthDate">Data de nascimento</Label>
            <Input id="birthDate" name="birthDate" type="date" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="diabetesType">Tipo de diabetes</Label>
            <Select
              value={diabetesType}
              onValueChange={(value) => setDiabetesType(value as DiabetesType)}
            >
              <SelectTrigger id="diabetesType" className="w-full">
                <SelectValue placeholder="Tipo de diabetes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TIPO_1">Tipo 1</SelectItem>
                <SelectItem value="TIPO_2">Tipo 2</SelectItem>
                <SelectItem value="GESTACIONAL">Gestacional</SelectItem>
                <SelectItem value="OUTRO">Outro</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="diabetesType" value={diabetesType} />
          </div>
        </>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isPending || !role}
        className="w-full rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
      >
        {isPending ? "Enviando..." : "Finalizar cadastro"}
      </Button>
    </form>
  );
}
