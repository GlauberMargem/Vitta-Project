"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import type { DiabetesType, Role } from "@/generated/prisma/client";

async function requireUser(): Promise<{ id: string; role: Role }> {
  const session = await auth();
  if (!session || !session.user.role) {
    throw new Error("Não autorizado.");
  }
  return { id: session.user.id, role: session.user.role };
}

export async function updateBasicInfo(
  _previousState: string | null,
  formData: FormData
): Promise<string | null> {
  const { id } = await requireUser();

  const name = formData.get("name");
  const email = formData.get("email");

  if (typeof name !== "string" || !name.trim()) {
    return "Informe o nome completo.";
  }
  if (typeof email !== "string" || !email.trim()) {
    return "Informe um email válido.";
  }
  const trimmedEmail = email.trim();

  const existing = await db.user.findUnique({ where: { email: trimmedEmail } });
  if (existing && existing.id !== id) {
    return "Já existe uma conta com esse email.";
  }

  await db.user.update({
    where: { id },
    data: { name: name.trim(), email: trimmedEmail },
  });

  revalidatePath("/userConfig");
  return null;
}

export async function changePassword(
  _previousState: string | null,
  formData: FormData
): Promise<string | null> {
  const { id } = await requireUser();

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmNewPassword = formData.get("confirmNewPassword");

  if (typeof currentPassword !== "string" || !currentPassword) {
    return "Informe a senha atual.";
  }
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return "A nova senha precisa ter pelo menos 8 caracteres.";
  }
  if (newPassword !== confirmNewPassword) {
    return "As senhas não coincidem.";
  }

  const user = await db.user.findUnique({ where: { id } });
  if (!user || !user.passwordHash) {
    return "Não foi possível alterar a senha.";
  }

  const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    return "Senha atual incorreta.";
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.user.update({ where: { id }, data: { passwordHash } });

  return null;
}

export async function updatePatientClinicalData(
  _previousState: string | null,
  formData: FormData
): Promise<string | null> {
  const { id, role } = await requireUser();
  if (role !== "PATIENT") {
    throw new Error("Não autorizado.");
  }

  const birthDateRaw = formData.get("birthDate");
  const diabetesType = formData.get("diabetesType");

  if (typeof birthDateRaw !== "string" || !birthDateRaw) {
    return "Informe a data de nascimento.";
  }
  const birthDate = new Date(birthDateRaw);
  if (Number.isNaN(birthDate.getTime())) {
    return "Data de nascimento inválida.";
  }
  if (
    diabetesType !== "TIPO_1" &&
    diabetesType !== "TIPO_2" &&
    diabetesType !== "GESTACIONAL" &&
    diabetesType !== "OUTRO"
  ) {
    return "Selecione o tipo de diabetes.";
  }

  await db.patientProfile.update({
    where: { userId: id },
    data: { birthDate, diabetesType: diabetesType as DiabetesType },
  });

  revalidatePath("/userConfig");
  return null;
}

const MIN_THRESHOLD_MGDL = 50;
const MAX_THRESHOLD_MGDL = 500;

/** RF05 — paciente pode ajustar os limites de alerta a partir do padrão da
 * literatura (ver DEFAULT_GLUCOSE_THRESHOLDS em glucose.ts). Faixa 50-500
 * mg/dL reaproveita o mesmo domínio já usado no eixo Y do gráfico
 * (08-design-system.md), não é um novo valor clínico. */
export async function updateGlucoseThresholds(
  _previousState: string | null,
  formData: FormData
): Promise<string | null> {
  const { id, role } = await requireUser();
  if (role !== "PATIENT") {
    throw new Error("Não autorizado.");
  }

  const hypoThreshold = Number(formData.get("hypoThreshold"));
  const severeHypoThreshold = Number(formData.get("severeHypoThreshold"));
  const hyperFastingThreshold = Number(formData.get("hyperFastingThreshold"));
  const hyperPostprandialThreshold = Number(
    formData.get("hyperPostprandialThreshold")
  );

  const values = [
    hypoThreshold,
    severeHypoThreshold,
    hyperFastingThreshold,
    hyperPostprandialThreshold,
  ];
  if (
    values.some(
      (value) =>
        !Number.isInteger(value) ||
        value < MIN_THRESHOLD_MGDL ||
        value > MAX_THRESHOLD_MGDL
    )
  ) {
    return `Os limites devem ser números inteiros entre ${MIN_THRESHOLD_MGDL} e ${MAX_THRESHOLD_MGDL} mg/dL.`;
  }
  if (severeHypoThreshold >= hypoThreshold) {
    return "O limite de hipoglicemia grave precisa ser menor que o de hipoglicemia.";
  }
  if (hypoThreshold >= hyperFastingThreshold) {
    return "O limite de hiperglicemia em jejum/antes de dormir precisa ser maior que o de hipoglicemia.";
  }
  if (hypoThreshold >= hyperPostprandialThreshold) {
    return "O limite de hiperglicemia pós-prandial precisa ser maior que o de hipoglicemia.";
  }

  await db.patientProfile.update({
    where: { userId: id },
    data: {
      hypoThreshold,
      severeHypoThreshold,
      hyperFastingThreshold,
      hyperPostprandialThreshold,
    },
  });

  revalidatePath("/userConfig");
  revalidatePath("/dashboard");
  return null;
}

export async function updateDoctorProfessionalData(
  _previousState: string | null,
  formData: FormData
): Promise<string | null> {
  const { id, role } = await requireUser();
  if (role !== "DOCTOR") {
    throw new Error("Não autorizado.");
  }

  const crm = formData.get("crm");
  const specialty = formData.get("specialty");

  if (typeof crm !== "string" || !crm.trim()) {
    return "Informe o CRM.";
  }
  if (typeof specialty !== "string" || !specialty.trim()) {
    return "Informe a especialidade.";
  }

  await db.doctorProfile.update({
    where: { userId: id },
    data: { crm: crm.trim(), specialty: specialty.trim() },
  });

  revalidatePath("/userConfig");
  return null;
}
