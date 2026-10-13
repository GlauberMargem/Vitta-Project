"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/patient/format";
import { getMessages, sendMessage, type ChatMessage } from "@/lib/chat/actions";

const POLL_INTERVAL_MS = 4000;

export function ChatPanel({
  linkId,
  otherPersonLabel,
}: {
  linkId: string;
  otherPersonLabel: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, formAction, isPending] = useActionState(sendMessage, null);
  const formRef = useRef<HTMLFormElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const wasPendingRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const data = await getMessages(linkId);
      setMessages(data);
      setLoadError(null);
    } catch {
      setLoadError("Não foi possível carregar as mensagens.");
    }
  }, [linkId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    if (wasPendingRef.current && !isPending) {
      if (!sendError) {
        formRef.current?.reset();
      }
      refresh();
    }
    wasPendingRef.current = isPending;
  }, [isPending, sendError, refresh]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  return (
    <section className="flex flex-col gap-3 rounded-lg bg-card p-5 shadow-sm">
      <h2 className="font-heading text-base font-semibold text-foreground">
        Chat com {otherPersonLabel}
      </h2>

      <div
        ref={listRef}
        className="flex max-h-96 flex-col gap-2 overflow-y-auto rounded-lg bg-muted/40 p-3"
      >
        {messages === null ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma mensagem ainda. Escreva a primeira abaixo.
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                message.isMine
                  ? "self-end bg-primary text-primary-foreground"
                  : "self-start bg-card text-foreground"
              )}
            >
              <p className="whitespace-pre-wrap">{message.body}</p>
              <time
                className={cn(
                  "mt-1 block text-[10px]",
                  message.isMine
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                )}
                dateTime={message.createdAt}
              >
                {formatDateTime(new Date(message.createdAt))}
              </time>
            </div>
          ))
        )}
      </div>

      {loadError ? (
        <p className="text-sm text-destructive" role="alert">
          {loadError}
        </p>
      ) : null}

      <form ref={formRef} action={formAction} className="flex items-end gap-2">
        <input type="hidden" name="linkId" value={linkId} />
        <Textarea
          name="body"
          placeholder="Escreva uma mensagem..."
          required
          maxLength={2000}
          rows={1}
          className="min-h-11 flex-1 resize-none"
        />
        <Button type="submit" disabled={isPending} className="rounded-lg">
          {isPending ? "Enviando..." : "Enviar"}
        </Button>
      </form>
      {sendError ? (
        <p className="text-sm text-destructive" role="alert">
          {sendError}
        </p>
      ) : null}
    </section>
  );
}
