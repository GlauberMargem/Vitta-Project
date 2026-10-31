"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { auth, signIn, signOut } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import type { DiabetesType } from "@/generated/prisma/client";

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

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

/** Valida e extrai os campos específicos de paciente/médico (etapa 2 do
 * cadastro) — compartilhado entre `registerUser` (cadastro normal) e
 * `completeGoogleSignup` (completar cadastro depois de login social), já
 * que a partir daqui os dois fluxos pedem exatamente os mesmos campos. */
function parseProfileInput(
  role: "PATIENT" | "DOCTOR",
  formData: FormData
): ProfileInput | string {
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

    return { role: "PATIENT", birthDate, diabetesType };
  }

  const crm = formData.get("crm");
  const specialty = formData.get("specialty");

  if (typeof crm !== "string" || !crm.trim()) {
    return "Informe o CRM.";
  }
  if (typeof specialty !== "string" || !specialty.trim()) {
    return "Informe a especialidade.";
  }

  return { role: "DOCTOR", crm: crm.trim(), specialty: specialty.trim() };
}

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

  const profile = parseProfileInput(role, formData);
  if (typeof profile === "string") {
    return profile;
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

/** Completa o cadastro depois de um primeiro login via Google (nome/email
 * já vieram do Google, sem senha) — exige perfil + dados específicos,
 * iguais à etapa 2 do cadastro normal. Ver
 * specs/05-arquitetura.md, "Login social Google". */
export async function completeGoogleSignup(
  _previousState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const session = await auth();
  if (!session || session.user.role) {
    throw new Error("Não autorizado.");
  }

  const role = formData.get("role");
  if (role !== "PATIENT" && role !== "DOCTOR") {
    return "Selecione o perfil (paciente ou médico).";
  }

  const profile = parseProfileInput(role, formData);
  if (typeof profile === "string") {
    return profile;
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
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
    // Reautentica com o Google — o consentimento já existe, então isso é
    // só um redirecionamento rápido de ida e volta, não mostra tela de
    // novo. Necessário pra sessão pegar o `role` que acabou de ser salvo
    // (o JWT antigo ainda tem `role: null` em cache).
    await signIn("google", { redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Perfil salvo, mas não foi possível entrar automaticamente. Tente entrar com Google de novo.";
    }
    throw error;
  }
}
