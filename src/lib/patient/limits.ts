/** Limites de inserção de dados do paciente — validados tanto no cliente
 * (atributos `min`/`max` dos inputs, feedback imediato) quanto no servidor
 * (`src/lib/patient/actions.ts`, fonte da verdade — nunca confiar só na
 * validação do navegador). Centralizados aqui pra não duplicar o número em
 * mais de um lugar. */

/** Faixa física plausível de uma leitura de glicemia capilar — não é um
 * limite de alerta clínico (isso é `GlucoseThresholds` em `glucose.ts`,
 * configurável por paciente), é o intervalo de valores que um glicosímetro
 * é capaz de medir. Glicosímetros comerciais tipicamente leem de 10 a 600
 * mg/dL (abaixo/acima disso o aparelho mostra "LO"/"HI" em vez de um
 * número) — ver ISO 15197. Usado só pra rejeitar erro de digitação óbvio
 * (ex.: "6000" em vez de "600"), não é um valor clínico ajustável.
 * Confirmado com o Glauber em 2026-10-10, a partir de documento de
 * referência técnica que ele trouxe. */
export const GLUCOSE_VALUE_MIN_MGDL = 10;
export const GLUCOSE_VALUE_MAX_MGDL = 600;

/** Teto de carboidratos por refeição — não é valor clínico (o documento de
 * referência só cobre glicemia), é só um limite de sanidade de dado: acima
 * disso é praticamente certo que foi erro de digitação. */
export const MEAL_CARBS_MAX_G = 999;

/** Funções puras (sem I/O) usadas tanto pela validação real em
 * `actions.ts` quanto pelos testes — garante que o teste exercita a mesma
 * regra usada em produção, não uma reimplementação que pode divergir. */

export function isGlucoseValueInRange(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= GLUCOSE_VALUE_MIN_MGDL &&
    value <= GLUCOSE_VALUE_MAX_MGDL
  );
}

export function isMealCarbsInRange(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= MEAL_CARBS_MAX_G;
}
