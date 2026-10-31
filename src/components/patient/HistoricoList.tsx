import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/patient/format";
import { glucoseAlertLabel } from "@/lib/patient/glucose";
import type { HistoryItem } from "@/lib/patient/history";
import { DeleteHistoryItemButton } from "./DeleteHistoryItemButton";

/** `editable` só pra visão do próprio paciente — o médico vê o mesmo
 * componente em modo somente leitura (sem botão de excluir), já que ele
 * nunca pode alterar dados de glicose/refeição do paciente. */
export function HistoricoList({
  history,
  editable = false,
}: {
  history: HistoryItem[];
  editable?: boolean;
}) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhum registro ainda.</p>
    );
  }

  return (
    <ul className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
      {history.map((item) => (
        <li
          key={`${item.kind}-${item.id}`}
          className={cn(
            "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm",
            item.alert ? "bg-alert/20" : undefined
          )}
        >
          <div>
            <p className="font-medium text-foreground">{item.label}</p>
            <p className="text-muted-foreground">{item.detail}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <div className="flex flex-col items-end gap-1">
              <time
                className="text-xs text-muted-foreground"
                dateTime={item.date.toISOString()}
              >
                {formatDateTime(item.date)}
              </time>
              {item.alert ? (
                <span className="text-xs font-medium text-alert-foreground">
                  {glucoseAlertLabel(item.alert)}
                </span>
              ) : null}
            </div>
            {editable ? (
              <DeleteHistoryItemButton kind={item.kind} id={item.id} />
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
