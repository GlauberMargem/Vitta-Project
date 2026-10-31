import { describe, expect, it } from "vitest";
import {
  DEFAULT_GLUCOSE_THRESHOLDS,
  HBA1C_TARGET_PERCENT,
  estimateHbA1c,
  glucoseAlert,
  hba1cColor,
} from "./glucose";

/** Matriz de valor-limite (BVA) pro motor de alertas de glicose — mesmo
 * espírito do documento de referência técnica trazido pelo Glauber em
 * 2026-10-10 (hipoglicemia nível 1/2, hiperglicemia), mas usando os
 * limiares já implementados e configuráveis por paciente
 * (DEFAULT_GLUCOSE_THRESHOLDS: hipo 70, hipo grave 54, hiper jejum 130,
 * hiper pós-prandial 180 — fonte SBD, ver specs/04-modelo-de-dados.md), não
 * os valores fixos do documento (que coincidem com os nossos, por sinal). */
describe("glucoseAlert", () => {
  it("53 mg/dL em jejum é HIPOGLICEMIA_GRAVE (um abaixo do limite grave)", () => {
    expect(glucoseAlert(53, "JEJUM", DEFAULT_GLUCOSE_THRESHOLDS)).toBe(
      "HIPOGLICEMIA_GRAVE"
    );
  });

  it("54 mg/dL em jejum é HIPOGLICEMIA (limite inferior grave, já não é mais grave)", () => {
    expect(glucoseAlert(54, "JEJUM", DEFAULT_GLUCOSE_THRESHOLDS)).toBe(
      "HIPOGLICEMIA"
    );
  });

  it("69 mg/dL em jejum é HIPOGLICEMIA (limite superior da faixa de hipoglicemia)", () => {
    expect(glucoseAlert(69, "JEJUM", DEFAULT_GLUCOSE_THRESHOLDS)).toBe(
      "HIPOGLICEMIA"
    );
  });

  it("70 mg/dL em jejum não gera alerta (limite inferior da normoglicemia)", () => {
    expect(glucoseAlert(70, "JEJUM", DEFAULT_GLUCOSE_THRESHOLDS)).toBeNull();
  });

  it("130 mg/dL em jejum não gera alerta (limite superior do alvo de jejum)", () => {
    expect(glucoseAlert(130, "JEJUM", DEFAULT_GLUCOSE_THRESHOLDS)).toBeNull();
  });

  it("131 mg/dL em jejum é HIPERGLICEMIA (acima do alvo de jejum)", () => {
    expect(glucoseAlert(131, "JEJUM", DEFAULT_GLUCOSE_THRESHOLDS)).toBe(
      "HIPERGLICEMIA"
    );
  });

  it("131 mg/dL antes de dormir também é HIPERGLICEMIA (mesmo limite do jejum)", () => {
    expect(
      glucoseAlert(131, "ANTES_DE_DORMIR", DEFAULT_GLUCOSE_THRESHOLDS)
    ).toBe("HIPERGLICEMIA");
  });

  it("179 mg/dL pós-prandial não gera alerta (dentro do alvo pós-prandial)", () => {
    expect(
      glucoseAlert(179, "POS_PRANDIAL", DEFAULT_GLUCOSE_THRESHOLDS)
    ).toBeNull();
  });

  it("180 mg/dL pós-prandial é HIPERGLICEMIA (limite do alvo, inclusive)", () => {
    expect(
      glucoseAlert(180, "POS_PRANDIAL", DEFAULT_GLUCOSE_THRESHOLDS)
    ).toBe("HIPERGLICEMIA");
  });

  it("180 mg/dL em contexto OUTRO usa o mesmo limite pós-prandial", () => {
    expect(glucoseAlert(180, "OUTRO", DEFAULT_GLUCOSE_THRESHOLDS)).toBe(
      "HIPERGLICEMIA"
    );
  });

  it("hipoglicemia tem prioridade sobre hiperglicemia quando ambos fariam sentido isoladamente", () => {
    // valor bem abaixo do limite de hipo grave, contexto que teria limite de hiper baixo
    expect(glucoseAlert(40, "POS_PRANDIAL", DEFAULT_GLUCOSE_THRESHOLDS)).toBe(
      "HIPOGLICEMIA_GRAVE"
    );
  });
});

describe("estimateHbA1c", () => {
  it("retorna null sem nenhum registro (sem dado suficiente pra estimar)", () => {
    expect(estimateHbA1c([])).toBeNull();
  });

  it("aplica a fórmula ADAG (Nathan et al. 2008) sobre a média dos valores", () => {
    // media = 154 mg/dL -> (154 + 46.7) / 28.7 = 7.0%, a mesma relação
    // citada no documento de referência pra meta de HbA1c < 7%
    const hba1c = estimateHbA1c([{ valueMgdl: 154 }]);
    expect(hba1c).not.toBeNull();
    expect(hba1c).toBeCloseTo(7.0, 1);
  });
});

describe("hba1cColor", () => {
  it(`na meta (${HBA1C_TARGET_PERCENT}%) é verde puro`, () => {
    expect(hba1cColor(HBA1C_TARGET_PERCENT)).toBe("rgb(46, 125, 50)");
  });

  it("abaixo da meta continua verde puro (não existe \"verde demais\")", () => {
    expect(hba1cColor(5)).toBe("rgb(46, 125, 50)");
  });

  it("no pior ponto da escala (10%) é laranja pastel puro", () => {
    expect(hba1cColor(10)).toBe("rgb(255, 214, 165)");
  });

  it("acima do pior ponto da escala satura em laranja puro, não ultrapassa", () => {
    expect(hba1cColor(15)).toBe("rgb(255, 214, 165)");
  });
});
