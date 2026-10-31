"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";

export type ChatMessage = {
  id: string;
  body: string;
  createdAt: string;
  isMine: boolean;
};

const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES = 200;

async function requireActiveLink(linkId: string) {
  const session = await auth();
  if (!session || !session.user.role) {
    throw new Error("Não autorizado.");
  }

  const link = await db.patientDoctorLink.findUnique({ where: { id: linkId } });
  if (
    !link ||
    link.status !== "ACTIVE" ||
    (link.patientId !== session.user.id && link.doctorId !== session.user.id)
  ) {
    throw new Error("Conversa inválida ou vínculo não está mais ativo.");
  }

  return { userId: session.user.id, link };
}

export async function getMessages(linkId: string): Promise<ChatMessage[]> {
  const { userId } = await requireActiveLink(linkId);

  const messages = await db.message.findMany({
    where: { linkId },
    orderBy: { createdAt: "asc" },
    take: MAX_MESSAGES,
  });

  return messages.map((message) => ({
    id: message.id,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
    isMine: message.senderId === userId,
  }));
}

export async function sendMessage(
  _previousState: string | null,
  formData: FormData
): Promise<string | null> {
  const linkId = formData.get("linkId");
  const body = formData.get("body");

  if (typeof linkId !== "string" || !linkId) {
    return "Conversa inválida.";
  }
  if (typeof body !== "string" || !body.trim()) {
    return "Escreva uma mensagem.";
  }
  if (body.length > MAX_MESSAGE_LENGTH) {
    return `A mensagem pode ter no máximo ${MAX_MESSAGE_LENGTH} caracteres.`;
  }

  const { userId } = await requireActiveLink(linkId);

  await db.message.create({
    data: { linkId, senderId: userId, body: body.trim() },
  });

  return null;
}
