"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { Prisma } from "@/generated/prisma/client";

async function requireDoctorId(): Promise<string> {
  const session = await auth();
  if (!session || session.user.role !== "DOCTOR") {
    throw new Error("Não autorizado.");
  }
  return session.user.id;
}

// Sem 0/O e 1/I/L, pra reduzir erro ao digitar/ditar o código em voz alta.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;
const MAX_GENERATION_ATTEMPTS = 5;

function randomInviteCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

export type GenerateInviteCodeState = {
  code: string | null;
  error: string | null;
};

export async function generateInviteCode(
  _previousState: GenerateInviteCodeState,
  _formData: FormData
): Promise<GenerateInviteCodeState> {
  const doctorId = await requireDoctorId();

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const inviteCode = randomInviteCode();
    try {
      await db.patientDoctorLink.create({
        data: { doctorId, inviteCode, status: "PENDING" },
      });
      revalidatePath("/dashboard");
      return { code: inviteCode, error: null };
    } catch (error) {
      const isCollision =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002";
      if (!isCollision) {
        throw error;
      }
    }
  }

  return {
    code: null,
    error: "Não foi possível gerar um código único. Tente novamente.",
  };
}
