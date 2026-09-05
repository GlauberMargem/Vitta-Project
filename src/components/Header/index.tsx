import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth/config";

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export async function Header() {
  const session = await auth();

  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <Link href="/dashboard" className="flex items-center">
        <Image
          src="/tittle.svg"
          alt="Vitta"
          width={100}
          height={32}
          priority
          className="h-6 w-auto object-contain"
        />
      </Link>

      {session ? (
        <Link
          href="/userConfig"
          aria-label="Perfil"
          className="flex size-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-80"
        >
          {initials(session.user.name)}
        </Link>
      ) : null}
    </header>
  );
}
