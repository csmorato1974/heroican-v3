// Server-only: agrega los mensajes del chatbot guardados en chatbot_messages.
import type {
  ChatbotMessageRow,
  ChatbotMessagesSummary,
} from "@/types/chatbotMessages";

export type { ChatbotMessagesSummary };

interface Row {
  id: string;
  created_at: string;
  session_id: string;
  route: string | null;
  device: string | null;
  user_message: string | null;
  assistant_response: string | null;
  model: string | null;
  total_tokens: number | null;
  estimated_cost_usd: number | string | null;
  latency_ms: number | null;
  status: string | null;
  error_status: string | null;
}

const EMPTY: ChatbotMessagesSummary = {
  available: false,
  totalMessages: 0,
  todayMessages: 0,
  totalSessions: 0,
  totalTokens: 0,
  totalCost: 0,
  avgTokensPerMessage: 0,
  avgCostPerMessage: 0,
  errors: 0,
  daily: [],
  recent: [],
};

const truncate = (v: string | null, n: number) =>
  v == null ? null : v.length > n ? `${v.slice(0, n)}…` : v;

export async function buildChatbotMessagesSummary(): Promise<ChatbotMessagesSummary> {
  const { supabaseAdmin } = await import("@/integrations/heroican/client.server");

  const client = supabaseAdmin as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        order: (
          c: string,
          o: { ascending: boolean },
        ) => {
          limit: (n: number) => Promise<{ data: Row[] | null; error: unknown }>;
        };
      };
    };
  };

  const { data, error } = await client
    .from("chatbot_messages")
    .select(
      "id, created_at, session_id, route, device, user_message, assistant_response, model, total_tokens, estimated_cost_usd, latency_ms, status, error_status",
    )
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error) return EMPTY;
  const rows = data ?? [];

  const today = new Date().toISOString().slice(0, 10);
  const daily = new Map<string, { messages: number; tokens: number; cost: number }>();
  const sessions = new Set<string>();
  let totalTokens = 0;
  let totalCost = 0;
  let todayMessages = 0;
  let errors = 0;

  for (const r of rows) {
    const date = r.created_at.slice(0, 10);
    const tokens = r.total_tokens ?? 0;
    const cost = Number(r.estimated_cost_usd ?? 0) || 0;
    totalTokens += tokens;
    totalCost += cost;
    if (date === today) todayMessages += 1;
    if (r.status && r.status !== "ok") errors += 1;
    sessions.add(r.session_id);
    const d = daily.get(date) ?? { messages: 0, tokens: 0, cost: 0 };
    d.messages += 1;
    d.tokens += tokens;
    d.cost += cost;
    daily.set(date, d);
  }

  const recent: ChatbotMessageRow[] = rows.slice(0, 25).map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    sessionId: r.session_id,
    route: r.route,
    device: r.device,
    userMessage: truncate(r.user_message, 90),
    assistantResponse: truncate(r.assistant_response, 120),
    model: r.model,
    totalTokens: r.total_tokens ?? 0,
    cost: Number(r.estimated_cost_usd ?? 0) || 0,
    latencyMs: r.latency_ms,
    status: r.status ?? "ok",
    errorStatus: r.error_status,
  }));

  return {
    available: true,
    totalMessages: rows.length,
    todayMessages,
    totalSessions: sessions.size,
    totalTokens,
    totalCost,
    avgTokensPerMessage: rows.length ? totalTokens / rows.length : 0,
    avgCostPerMessage: rows.length ? totalCost / rows.length : 0,
    errors,
    daily: [...daily.entries()]
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 30),
    recent,
  };
}
