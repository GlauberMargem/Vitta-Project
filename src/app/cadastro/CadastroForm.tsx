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
import { registerUser } from "@/lib/auth/actions";
import doctorIllustration from "@/assets/illustrations/doctor-pana.svg";

type Role = "PATIENT" | "DOCTOR" | "";
type DiabetesType = "TIPO_1" | "TIPO_2" | "GESTACIONAL" | "OUTRO" | "";

export function CadastroForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>("");
  const [diabetesType, setDiabetesType] = useState<DiabetesType>("");
  const [stepOneError, setStepOneError] = useState<string | null>(null);
  const [errorMessage, formAction, isPending] = useActionState(
    registerUser,
    undefined
  );

  function handleNext(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    if (form && !form.reportValidity()) {
      return;
    }
    if (!role) {
      setStepOneError("Selecione o perfil (paciente ou médico).");
      return;
    }
    setStepOneError(null);
    setStep(2);
  }

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className={step === 1 ? "flex flex-col gap-4" : "hidden"}>
        <p className="text-sm text-muted-foreground">
          Preencha os campos com seus dados pessoais.
        </p>

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" name="name" placeholder="Nome completo" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Digite seu email"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Digite sua senha"
            minLength={8}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirme sua senha"
            minLength={8}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="role">Paciente/Médico</Label>
          <Select
            value={role}
            onValueChange={(value) => setRole(value as Role)}
          >
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

        {stepOneError ? (
          <p className="text-sm text-destructive" role="alert">
            {stepOneError}
          </p>
        ) : null}

        <Button
          type="button"
          onClick={handleNext}
          className="w-full rounded-lg"
        >
          Próxima etapa
        </Button>
      </div>

      <div className={step === 2 ? "flex flex-col gap-4" : "hidden"}>
        <p className="text-sm text-muted-foreground">
          {role === "DOCTOR"
            ? "Preencha os campos com seus documentos."
            : "Preencha os campos com suas especificidades."}
        </p>

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
              <Input
                id="crm"
                name="crm"
                placeholder="CRM"
                required={step === 2}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="specialty">Especialidade</Label>
              <Input
                id="specialty"
                name="specialty"
                placeholder="Digite sua especialidade"
                required={step === 2}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="birthDate">Data de nascimento</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                required={step === 2}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="diabetesType">Tipo de diabetes</Label>
              <Select
                value={diabetesType}
                onValueChange={(value) =>
                  setDiabetesType(value as DiabetesType)
                }
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
              <input
                type="hidden"
                name="diabetesType"
                value={diabetesType}
              />
            </div>
          </>
        )}

        {errorMessage ? (
          <p className="text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(1)}
            className="rounded-lg"
          >
            Voltar
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            {isPending ? "Enviando..." : "Finalizar cadastro"}
          </Button>
        </div>
      </div>

      <div className="flex justify-center gap-1 pt-2">
        <span
          className={`size-1.5 rounded-full ${step === 1 ? "bg-primary" : "bg-border"}`}
        />
        <span
          className={`size-1.5 rounded-full ${step === 2 ? "bg-primary" : "bg-border"}`}
        />
      </div>
    </form>
  );
}
