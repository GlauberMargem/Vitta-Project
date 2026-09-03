"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";

async function requirePatientId(): Promise<string> {
  const session = await auth();
  if (!session || session.user.role !== "PATIENT") {
    throw new Error("Não autorizado.");
  }
  return session.user.id;
}

export async function createGlucoseRecord(
  _previousState: string | null,
  formData: FormData
): Promise<string | null> {
  const patientId = await requirePatientId();

  const valueRaw = formData.get("value");
  const measuredAtRaw = formData.get("measuredAt");
  const context = formData.get("context");

  const valueMgdl = Number(valueRaw);
  if (!Number.isFinite(valueMgdl) || valueMgdl <= 0) {
    return "Informe um valor de glicose válido.";
  }
  if (typeof measuredAtRaw !== "string" || !measuredAtRaw) {
    return "Informe o horário da aferição.";
  }
  const measuredAt = new Date(measuredAtRaw);
  if (Number.isNaN(measuredAt.getTime())) {
    return "Horário inválido.";
  }
  if (
    context !== "JEJUM" &&
    context !== "POS_PRANDIAL" &&
    context !== "ANTES_DE_DORMIR" &&
    context !== "OUTRO"
  ) {
    return "Selecione o contexto da medição.";
  }

  await db.glucoseRecord.create({
    data: {
      patientId,
      valueMgdl: Math.round(valueMgdl),
      measuredAt,
      context,
    },
  });

  revalidatePath("/dashboard");
  return null;
}

export async function createMeal(
  _previousState: string | null,
  formData: FormData
): Promise<string | null> {
  const patientId = await requirePatientId();

  const carbsRaw = formData.get("carbs");
  const eatenAtRaw = formData.get("eatenAt");
  const name = formData.get("name");

  const carbsG = Number(carbsRaw);
  if (!Number.isFinite(carbsG) || carbsG < 0) {
    return "Informe a quantidade de carboidratos.";
  }
  if (typeof eatenAtRaw !== "string" || !eatenAtRaw) {
    return "Informe o horário da refeição.";
  }
  const eatenAt = new Date(eatenAtRaw);
  if (Number.isNaN(eatenAt.getTime())) {
    return "Horário inválido.";
  }

  await db.meal.create({
    data: {
      patientId,
      carbsG: Math.round(carbsG),
      eatenAt,
      name: typeof name === "string" && name.trim() ? name.trim() : null,
    },
  });

  revalidatePath("/dashboard");
  return null;
}
