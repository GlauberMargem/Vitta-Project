import { describe, expect, it } from "vitest";
import {
  GLUCOSE_VALUE_MAX_MGDL,
  GLUCOSE_VALUE_MIN_MGDL,
  MEAL_CARBS_MAX_G,
  isGlucoseValueInRange,
  isMealCarbsInRange,
} from "./limits";

/** Matriz de valor-limite (BVA) pra inserção de glicose — adaptada do
 * documento de referência técnica trazido pelo Glauber em 2026-10-10, mas
 * só a faixa física de leitura (10-600 mg/dL): o Vitta não integra com
 * glicosímetro, então não existem os tokens de hardware "LO"/"HI" do
 * documento original (ver specs/04-modelo-de-dados.md, "Fora do escopo do
 * Vitta"). */
describe("isGlucoseValueInRange", () => {
  it(`rejeita um mg/dL abaixo do mínimo físico (${GLUCOSE_VALUE_MIN_MGDL - 1})`, () => {
    expect(isGlucoseValueInRange(GLUCOSE_VALUE_MIN_MGDL - 1)).toBe(false);
  });

  it(`aceita exatamente o limite mínimo (${GLUCOSE_VALUE_MIN_MGDL})`, () => {
    expect(isGlucoseValueInRange(GLUCOSE_VALUE_MIN_MGDL)).toBe(true);
  });

  it("aceita um valor típico dentro da faixa (100 mg/dL)", () => {
    expect(isGlucoseValueInRange(100)).toBe(true);
  });

  it(`aceita exatamente o limite máximo (${GLUCOSE_VALUE_MAX_MGDL})`, () => {
    expect(isGlucoseValueInRange(GLUCOSE_VALUE_MAX_MGDL)).toBe(true);
  });

  it(`rejeita um mg/dL acima do máximo físico (${GLUCOSE_VALUE_MAX_MGDL + 1})`, () => {
    expect(isGlucoseValueInRange(GLUCOSE_VALUE_MAX_MGDL + 1)).toBe(false);
  });

  it("rejeita zero", () => {
    expect(isGlucoseValueInRange(0)).toBe(false);
  });

  it("rejeita valor negativo", () => {
    expect(isGlucoseValueInRange(-50)).toBe(false);
  });

  it("rejeita NaN (campo vazio ou não numérico no formulário)", () => {
    expect(isGlucoseValueInRange(NaN)).toBe(false);
  });

  it("rejeita Infinity", () => {
    expect(isGlucoseValueInRange(Infinity)).toBe(false);
  });
});

describe("isMealCarbsInRange", () => {
  it("aceita exatamente zero (refeição sem carboidrato)", () => {
    expect(isMealCarbsInRange(0)).toBe(true);
  });

  it("rejeita valor negativo", () => {
    expect(isMealCarbsInRange(-1)).toBe(false);
  });

  it(`aceita exatamente o teto (${MEAL_CARBS_MAX_G})`, () => {
    expect(isMealCarbsInRange(MEAL_CARBS_MAX_G)).toBe(true);
  });

  it(`rejeita um grama acima do teto (${MEAL_CARBS_MAX_G + 1})`, () => {
    expect(isMealCarbsInRange(MEAL_CARBS_MAX_G + 1)).toBe(false);
  });

  it("rejeita NaN", () => {
    expect(isMealCarbsInRange(NaN)).toBe(false);
  });
});
