"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateBasicInfo, changePassword } from "@/lib/profile/actions";

export function DadosPessoaisForm({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [error, formAction, isPending] = useActionState(
    updateBasicInfo,
    null
  );
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordError, passwordFormAction, isPasswordPending] =
    useActionState(changePassword, null);

  return (
    <section className="rounded-lg bg-card p-5 shadow-sm">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" name="name" defaultValue={name} required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={email}
            required
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending} className="rounded-lg">
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </form>

      <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <Label>Senha</Label>
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            onClick={() => setShowPasswordForm((value) => !value)}
          >
            {showPasswordForm ? "Cancelar" : "Alterar senha"}
          </Button>
        </div>

        {!showPasswordForm ? (
          <p className="text-sm text-muted-foreground">••••••••</p>
        ) : (
          <form action={passwordFormAction} className="flex flex-col gap-3">
            <Input
              name="currentPassword"
              type="password"
              placeholder="Senha atual"
              required
            />
            <Input
              name="newPassword"
              type="password"
              placeholder="Nova senha"
              minLength={8}
              required
            />
            <Input
              name="confirmNewPassword"
              type="password"
              placeholder="Confirme a nova senha"
              minLength={8}
              required
            />
            {passwordError ? (
              <p className="text-sm text-destructive" role="alert">
                {passwordError}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={isPasswordPending}
              className="rounded-lg"
            >
              {isPasswordPending ? "Alterando..." : "Alterar senha"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
