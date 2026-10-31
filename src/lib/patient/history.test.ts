import { describe, expect, it } from "vitest";
import { groupHistoryByDay, type HistoryItem } from "./history";

function item(dateIso: string, id: string): HistoryItem {
  return {
    kind: "glucose",
    id,
    date: new Date(dateIso),
    label: "100 mg/dL",
    detail: "Jejum",
    alert: null,
  };
}

describe("groupHistoryByDay", () => {
  it("agrupa itens do mesmo dia corrido, preservando a ordem", () => {
    const history = [
      item("2026-10-12T20:00:00", "a"),
      item("2026-10-12T08:00:00", "b"),
      item("2026-10-11T08:00:00", "c"),
    ];

    const groups = groupHistoryByDay(history);

    expect(groups).toHaveLength(2);
    expect(groups[0].items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(groups[1].items.map((i) => i.id)).toEqual(["c"]);
  });

  it("devolve lista vazia pra histórico vazio", () => {
    expect(groupHistoryByDay([])).toEqual([]);
  });

  it("não agrupa dias diferentes mesmo com menos de 24h de intervalo", () => {
    const history = [
      item("2026-10-12T00:30:00", "a"),
      item("2026-10-11T23:30:00", "b"),
    ];

    const groups = groupHistoryByDay(history);

    expect(groups).toHaveLength(2);
  });
});
