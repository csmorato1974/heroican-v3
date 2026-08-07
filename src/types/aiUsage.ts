export interface AiUsageCall {
  id: string;
  createdAt: string;
  model: string;
  route: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number | null;
  success: boolean;
  fallback: boolean;
  errorStatus: string | null;
  cost: number;
  priced: boolean;
}

export interface AiUsageGroup {
  key: string;
  calls: number;
  tokens: number;
  cost: number;
  priced: boolean;
}

export interface AiUsageDaily {
  date: string;
  calls: number;
  tokens: number;
  cost: number;
}

export interface AiUsageSummary {
  disclaimer: string;
  currency: "USD";
  totalCalls: number;
  totalCost: number;
  todayCost: number;
  todayCalls: number;
  avgCostPerCall: number;
  inputCost: number;
  outputCost: number;
  unpricedModels: string[];
  byRoute: AiUsageGroup[];
  byModel: AiUsageGroup[];
  daily: AiUsageDaily[];
  recent: AiUsageCall[];
}
