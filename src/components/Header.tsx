import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { initials } from "@/lib/utils";
import { countDaysWithGlucoseRecord, motivationalMessage } from "@/lib/patient/motivation";
import { detectGlucoseTrend } from "@/lib/patient/trend";
import { NotificationBell } from "@/components/NotificationBell";
import wordmark from "@/assets/images/tittle.svg";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function Header() {
  const session = await auth();

  const notifications =
    session?.user.role === "PATIENT"
      ? await (async () => {
          const records30d = await db.glucoseRecord.findMany({
            where: {
              patientId: session.user.id,
              measuredAt: { gte: new Date(Date.now() - THIRTY_DAYS_MS) },
            },
            select: { valueMgdl: true, measuredAt: true },
          });
          return {
            motivationMessage: motivationalMessage(
              countDaysWithGlucoseRecord(records30d)
            ),
            trend: detectGlucoseTrend(records30d),
          };
        })()
      : null;

  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <Link href="/dashboard" className="flex items-center">
        <Image
          src={wordmark}
          alt="Vitta"
          priority
          className="h-6 w-auto object-contain"
        />
      </Link>

      {session ? (
        <div className="flex items-center gap-2">
          {notifications ? (
            <NotificationBell
              motivationMessage={notifications.motivationMessage}
              trend={notifications.trend}
            />
          ) : null}
          <Link
            href="/userConfig"
            aria-label="Perfil"
            className="flex size-11 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-80"
          >
            {initials(session.user.name)}
          </Link>
        </div>
      ) : null}
    </header>
  );
}
