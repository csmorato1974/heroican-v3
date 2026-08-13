export interface ChatbotMessageRow {
  id: string;
  createdAt: string;
  sessionId: string;
  route: string | null;
  device: string | null;
  userMessage: string | null;
  assistantResponse: string | null;
  model: string | null;
  totalTokens: number;
  cost: number;
  latencyMs: number | null;
  status: string;
  errorStatus: string | null;
}

export interface ChatbotDaily {
  date: string;
  messages: number;
  tokens: number;
  cost: number;
}

export interface ChatbotMessagesSummary {
  available: boolean;
  totalMessages: number;
  todayMessages: number;
  totalSessions: number;
  totalTokens: number;
  totalCost: number;
  avgTokensPerMessage: number;
  avgCostPerMessage: number;
  errors: number;
  daily: ChatbotDaily[];
  recent: ChatbotMessageRow[];
}
