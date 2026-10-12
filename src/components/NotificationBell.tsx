"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/patient/format";
import {
  trendAlertDetail,
  trendAlertLabel,
  type TrendAlert,
} from "@/lib/patient/trend";

const MAX_READINGS_SHOWN = 6;

/** Sino de notificação do Header — reúne o que antes eram cards fixos no
 * dashboard (motivação RF12, tendência RF13) numa sobreposição que só
 * aparece quando o paciente clica, igual o pedido do Glauber em
 * 2026-10-12. Só renderizado pro paciente (as duas mensagens nunca
 * existiram pro médico). */
export function NotificationBell({
  motivationMessage,
  trend,
}: {
  motivationMessage: string;
  trend: TrendAlert;
}) {
  const [open, setOpen] = useState(false);
  const extraReadings = trend
    ? trend.readings.length - MAX_READINGS_SHOWN
    : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Notificações"
          className="relative flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
        >
          <Bell className="size-5" />
          {trend ? (
            <span
              aria-hidden
              className="absolute right-2 top-2 size-2 rounded-full bg-destructive"
            />
          ) : null}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notificações</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-foreground">{motivationMessage}</p>
          </div>

          {trend ? (
            <div className="rounded-lg bg-alert/20 p-4">
              <p className="text-sm font-medium text-foreground">
                {trendAlertLabel(trend)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {trendAlertDetail(trend)}
              </p>
              <ul className="mt-2 flex flex-col gap-1">
                {trend.readings.slice(0, MAX_READINGS_SHOWN).map((reading, index) => (
                  <li
                    key={index}
                    className="flex justify-between text-xs text-muted-foreground"
                  >
                    <span>{formatDateTime(reading.measuredAt)}</span>
                    <span className="font-medium text-foreground">
                      {reading.valueMgdl} mg/dL
                    </span>
                  </li>
                ))}
              </ul>
              {extraReadings > 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  e mais {extraReadings}{" "}
                  {extraReadings === 1 ? "medição" : "medições"} nesse período.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
