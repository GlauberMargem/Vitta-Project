"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import {
  GLUCOSE_VALUE_MAX_MGDL,
  GLUCOSE_VALUE_MIN_MGDL,
  MEAL_CARBS_MAX_G,
  isGlucoseValueInRange,
  isMealCarbsInRange,
} from "@/lib/patient/limits";

async function requirePatientId(): Promise<string> {
  const session = await auth();
  if (!session || session.user.role !== "PATIENT") {
    throw new Error("Não autorizado.");
  }
  return session.user.id;
}

export type CreateGlucoseRecordState = {
  error: string | null;
  recordId?: string;
};

export async function createGlucoseRecord(
  _previousState: CreateGlucoseRecordState,
  formData: FormData
): Promise<CreateGlucoseRecordState> {
  const patientId = await requirePatientId();

  const valueRaw = formData.get("value");
  const measuredAtRaw = formData.get("measuredAt");
  const context = formData.get("context");
  const linkedMealIdRaw = formData.get("linkedMealId");

  const valueMgdl = Number(valueRaw);
  if (!isGlucoseValueInRange(valueMgdl)) {
    return {
      error: `Informe um valor de glicose entre ${GLUCOSE_VALUE_MIN_MGDL} e ${GLUCOSE_VALUE_MAX_MGDL} mg/dL.`,
    };
  }
  if (typeof measuredAtRaw !== "string" || !measuredAtRaw) {
    return { error: "Informe o horário da aferição." };
  }
  const measuredAt = new Date(measuredAtRaw);
  if (Number.isNaN(measuredAt.getTime())) {
    return { error: "Horário inválido." };
  }
  if (
    context !== "JEJUM" &&
    context !== "POS_PRANDIAL" &&
    context !== "ANTES_DE_DORMIR" &&
    context !== "OUTRO"
  ) {
    return { error: "Selecione o contexto da medição." };
  }

  let linkedMealId: string | null = null;
  if (typeof linkedMealIdRaw === "string" && linkedMealIdRaw) {
    const meal = await db.meal.findFirst({
      where: { id: linkedMealIdRaw, patientId },
      select: { id: true },
    });
    if (!meal) {
      return { error: "Refeição selecionada para vincular não encontrada." };
    }
    linkedMealId = meal.id;
  }

  const record = await db.glucoseRecord.create({
    data: {
      patientId,
      valueMgdl: Math.round(valueMgdl),
      measuredAt,
      context,
      linkedMealId,
    },
  });

  revalidatePath("/dashboard");
  return { error: null, recordId: record.id };
}

export async function createMeal(
  _previousState: string | null,
  formData: FormData
): Promise<string | null> {
  const patientId = await requirePatientId();

  const carbsRaw = formData.get("carbs");
  const eatenAtRaw = formData.get("eatenAt");
  const name = formData.get("name");
  const linkedGlucoseRecordIdRaw = formData.get("linkedGlucoseRecordId");

  const carbsG = Number(carbsRaw);
  if (!isMealCarbsInRange(carbsG)) {
    return `Informe uma quantidade de carboidratos entre 0 e ${MEAL_CARBS_MAX_G} g.`;
  }
  if (typeof eatenAtRaw !== "string" || !eatenAtRaw) {
    return "Informe o horário da refeição.";
  }
  const eatenAt = new Date(eatenAtRaw);
  if (Number.isNaN(eatenAt.getTime())) {
    return "Horário inválido.";
  }

  let linkedGlucoseRecordId: string | null = null;
  if (
    typeof linkedGlucoseRecordIdRaw === "string" &&
    linkedGlucoseRecordIdRaw
  ) {
    const record = await db.glucoseRecord.findFirst({
      where: { id: linkedGlucoseRecordIdRaw, patientId },
      select: { id: true },
    });
    if (!record) {
      return "Glicose selecionada para vincular não encontrada.";
    }
    linkedGlucoseRecordId = record.id;
  }

  const meal = await db.meal.create({
    data: {
      patientId,
      carbsG: Math.round(carbsG),
      eatenAt,
      name: typeof name === "string" && name.trim() ? name.trim() : null,
    },
  });

  if (linkedGlucoseRecordId) {
    await db.glucoseRecord.update({
      where: { id: linkedGlucoseRecordId },
      data: { linkedMealId: meal.id },
    });
  }

  revalidatePath("/dashboard");
  return null;
}

export async function deleteGlucoseRecord(
  _previousState: string | null,
  formData: FormData
): Promise<string | null> {
  const patientId = await requirePatientId();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return "Registro inválido.";
  }

  await db.glucoseRecord.deleteMany({ where: { id, patientId } });

  revalidatePath("/dashboard");
  return null;
}

export async function deleteMeal(
  _previousState: string | null,
  formData: FormData
): Promise<string | null> {
  const patientId = await requirePatientId();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return "Registro inválido.";
  }

  await db.meal.deleteMany({ where: { id, patientId } });

  revalidatePath("/dashboard");
  return null;
}

export async function consumeInviteCode(
  _previousState: string | null,
  formData: FormData
): Promise<string | null> {
  const patientId = await requirePatientId();

  const rawCode = formData.get("code");
  if (typeof rawCode !== "string" || !rawCode.trim()) {
    return "Informe o código de convite.";
  }
  const inviteCode = rawCode.trim().toUpperCase();

  const existingActiveLink = await db.patientDoctorLink.findFirst({
    where: { patientId, status: "ACTIVE" },
  });
  if (existingActiveLink) {
    return "Você já está vinculado a um médico. Revogue o vínculo atual antes de usar outro código.";
  }

  const link = await db.patientDoctorLink.findUnique({
    where: { inviteCode },
  });
  if (!link || link.status !== "PENDING" || link.patientId) {
    return "Código inválido ou já utilizado.";
  }

  await db.patientDoctorLink.update({
    where: { id: link.id },
    data: { patientId, status: "ACTIVE" },
  });

  revalidatePath("/dashboard");
  return null;
}

export async function revokeLink(
  _previousState: string | null,
  formData: FormData
): Promise<string | null> {
  const patientId = await requirePatientId();

  const linkId = formData.get("linkId");
  if (typeof linkId !== "string" || !linkId) {
    return "Vínculo inválido.";
  }

  await db.patientDoctorLink.updateMany({
    where: { id: linkId, patientId, status: "ACTIVE" },
    data: { status: "REVOKED" },
  });

  revalidatePath("/dashboard");
  return null;
}
