import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth/config";
import { initials } from "@/lib/utils";
import wordmark from "@/assets/images/tittle.svg";

export async function Header() {
  const session = await auth();

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
        <Link
          href="/userConfig"
          aria-label="Perfil"
          className="flex size-11 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-80"
        >
          {initials(session.user.name)}
        </Link>
      ) : null}
    </header>
  );
}
