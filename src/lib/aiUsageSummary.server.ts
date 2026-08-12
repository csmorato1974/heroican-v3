// Server-only: agrega el consumo de la API de OpenAI y calcula el coste estimado.
import {
  PRICING_DISCLAIMER,
  estimateCost,
  getModelPricing,
} from "./aiPricing.server";
import type {
  AiUsageCall,
  AiUsageGroup,
  AiUsageSummary,
} from "@/types/aiUsage";

export type { AiUsageSummary };

interface Row {
  id: string;
  created_at: string;
  model: string;
  route: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number | null;
  success: boolean;
  fallback: boolean;
  error_status: string | null;
}

export async function buildAiUsageSummary(): Promise<AiUsageSummary> {
  const { supabaseAdmin } = await import(
    "@/integrations/heroican/client.server"
  );
  const { data, error } = await supabaseAdmin
    .from("ai_usage_events")
    .select(
      "id, created_at, model, route, prompt_tokens, completion_tokens, total_tokens, latency_ms, success, fallback, error_status",
    )
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Row[];

  const today = new Date().toISOString().slice(0, 10);
  const byRoute = new Map<string, AiUsageGroup>();
  const byModel = new Map<string, AiUsageGroup>();
  const daily = new Map<
    string,
    { date: string; calls: number; tokens: number; cost: number }
  >();
  const unpriced = new Set<string>();

  let totalCost = 0;
  let todayCost = 0;
  let todayCalls = 0;
  let inputCost = 0;
  let outputCost = 0;

  const recent: AiUsageCall[] = [];

  for (const row of rows) {
    const cost = estimateCost(row.model, row.prompt_tokens, row.completion_tokens);
    if (!cost.priced) unpriced.add(row.model);
    totalCost += cost.totalCost;
    inputCost += cost.inputCost;
    outputCost += cost.outputCost;

    const date = row.created_at.slice(0, 10);
    if (date === today) {
      todayCost += cost.totalCost;
      todayCalls += 1;
    }

    const addTo = (map: Map<string, AiUsageGroup>, key: string) => {
      const entry = map.get(key) ?? {
        key,
        calls: 0,
        tokens: 0,
        cost: 0,
        priced: true,
      };
      entry.calls += 1;
      entry.tokens += row.total_tokens;
      entry.cost += cost.totalCost;
      if (!cost.priced) entry.priced = false;
      map.set(key, entry);
    };
    addTo(byRoute, row.route);
    addTo(byModel, row.model);

    const day = daily.get(date) ?? { date, calls: 0, tokens: 0, cost: 0 };
    day.calls += 1;
    day.tokens += row.total_tokens;
    day.cost += cost.totalCost;
    daily.set(date, day);

    if (recent.length < 20) {
      recent.push({
        id: row.id,
        createdAt: row.created_at,
        model: row.model,
        route: row.route,
        promptTokens: row.prompt_tokens,
        completionTokens: row.completion_tokens,
        totalTokens: row.total_tokens,
        latencyMs: row.latency_ms,
        success: row.success,
        fallback: row.fallback,
        errorStatus: row.error_status,
        cost: cost.totalCost,
        priced: cost.priced,
      });
    }
  }

  return {
    disclaimer: PRICING_DISCLAIMER,
    currency: "USD",
    totalCalls: rows.length,
    totalCost,
    todayCost,
    todayCalls,
    avgCostPerCall: rows.length ? totalCost / rows.length : 0,
    inputCost,
    outputCost,
    unpricedModels: [...unpriced].filter((m) => !getModelPricing(m)),
    byRoute: [...byRoute.values()].sort((a, b) => b.cost - a.cost),
    byModel: [...byModel.values()].sort((a, b) => b.cost - a.cost),
    daily: [...daily.values()].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 30),
    recent,
  };
}
