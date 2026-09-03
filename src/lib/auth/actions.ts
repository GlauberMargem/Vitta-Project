"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import type { DiabetesType } from "@/generated/prisma/client";

export async function authenticate(
  _previousState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Email ou senha incorretos.";
        default:
          return "Não foi possível entrar. Tente novamente.";
      }
    }
    throw error;
  }
}

type ProfileInput =
  | { role: "PATIENT"; birthDate: Date; diabetesType: DiabetesType }
  | { role: "DOCTOR"; crm: string; specialty: string };

export async function registerUser(
  _previousState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const role = formData.get("role");

  if (typeof name !== "string" || !name.trim()) {
    return "Informe o nome completo.";
  }
  if (typeof email !== "string" || !email.trim()) {
    return "Informe um email válido.";
  }
  if (typeof password !== "string" || password.length < 8) {
    return "A senha precisa ter pelo menos 8 caracteres.";
  }
  if (password !== confirmPassword) {
    return "As senhas não coincidem.";
  }
  if (role !== "PATIENT" && role !== "DOCTOR") {
    return "Selecione o perfil (paciente ou médico).";
  }

  const trimmedEmail = email.trim();
  const existing = await db.user.findUnique({ where: { email: trimmedEmail } });
  if (existing) {
    return "Já existe uma conta com esse email.";
  }

  let profile: ProfileInput;

  if (role === "PATIENT") {
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

    profile = { role: "PATIENT", birthDate, diabetesType };
  } else {
    const crm = formData.get("crm");
    const specialty = formData.get("specialty");

    if (typeof crm !== "string" || !crm.trim()) {
      return "Informe o CRM.";
    }
    if (typeof specialty !== "string" || !specialty.trim()) {
      return "Informe a especialidade.";
    }

    profile = { role: "DOCTOR", crm: crm.trim(), specialty: specialty.trim() };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.user.create({
    data: {
      name: name.trim(),
      email: trimmedEmail,
      passwordHash,
      role: profile.role,
      ...(profile.role === "PATIENT"
        ? {
            patientProfile: {
              create: {
                birthDate: profile.birthDate,
                diabetesType: profile.diabetesType,
              },
            },
          }
        : {
            doctorProfile: {
              create: { crm: profile.crm, specialty: profile.specialty },
            },
          }),
    },
  });

  try {
    await signIn("credentials", {
      email: trimmedEmail,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Conta criada, mas não foi possível entrar automaticamente. Faça login.";
    }
    throw error;
  }
}
