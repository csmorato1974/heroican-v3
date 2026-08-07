// Precios centralizados de modelos (USD por 1.000.000 de tokens).
// Añade aquí nuevos modelos o versiones cuando se instrumenten más llamadas.

export interface ModelPricing {
  /** USD por 1M tokens de entrada */
  inputPerMillion: number;
  /** USD por 1M tokens de salida */
  outputPerMillion: number;
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  "gpt-4o-mini": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
};

export function getModelPricing(model: string): ModelPricing | null {
  if (MODEL_PRICING[model]) return MODEL_PRICING[model];
  // Tolera sufijos de versión, p. ej. "gpt-4o-mini-2024-07-18".
  const base = Object.keys(MODEL_PRICING).find((key) => model.startsWith(key));
  return base ? MODEL_PRICING[base]! : null;
}

export interface EstimatedCost {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  priced: boolean;
}

export function estimateCost(
  model: string,
  promptTokens: number,
  completionTokens: number,
): EstimatedCost {
  const pricing = getModelPricing(model);
  if (!pricing) {
    return { inputCost: 0, outputCost: 0, totalCost: 0, priced: false };
  }
  const inputCost = (promptTokens / 1_000_000) * pricing.inputPerMillion;
  const outputCost = (completionTokens / 1_000_000) * pricing.outputPerMillion;
  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    priced: true,
  };
}

export const PRICING_DISCLAIMER =
  "Estimación basada en precios configurados; el importe final se confirma en OpenAI.";
