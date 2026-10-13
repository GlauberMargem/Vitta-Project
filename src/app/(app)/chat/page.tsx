import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { AppMain } from "@/components/AppMain";
import { ChatPanel } from "@/components/chat/ChatPanel";

export default async function ChatPage() {
  const session = await auth();
  if (!session || session.user.role !== "PATIENT") {
    return null;
  }

  const link = await db.patientDoctorLink.findFirst({
    where: { patientId: session.user.id, status: "ACTIVE" },
    include: { doctor: { include: { user: { select: { name: true } } } } },
  });

  if (!link) {
    return (
      <AppMain>
        <p className="text-sm text-muted-foreground">
          Você precisa estar vinculado a um médico pra usar o chat. Vincule-se
          pela tela de Perfil.
        </p>
      </AppMain>
    );
  }

  return (
    <AppMain>
      <Link
        href="/userConfig"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Perfil
      </Link>
      <ChatPanel
        linkId={link.id}
        otherPersonLabel={`Dr(a). ${link.doctor.user.name}`}
      />
    </AppMain>
  );
}
