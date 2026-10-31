"use client";

import { useActionState, useRef } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { initials } from "@/lib/utils";
import { updateAvatar } from "@/lib/profile/actions";

export function AvatarUpload({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const [error, formAction, isPending] = useActionState(updateAvatar, null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex flex-col items-center gap-1">
      <form ref={formRef} action={formAction}>
        <input
          ref={inputRef}
          type="file"
          name="avatar"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={() => formRef.current?.requestSubmit()}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          aria-label="Trocar foto de perfil"
          className="relative flex size-20 disabled:opacity-60"
        >
          <span className="relative flex size-20 items-center justify-center overflow-hidden rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              initials(name)
            )}
          </span>
          <span className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full border-2 border-card bg-foreground text-card">
            <Camera className="size-3.5" aria-hidden />
          </span>
        </button>
      </form>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
