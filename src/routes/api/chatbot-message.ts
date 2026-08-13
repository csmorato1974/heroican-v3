import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const MessageSchema = z.object({
  session_id: z.string().min(1).max(64),
  route: z.string().max(120).optional().nullable(),
  device: z.string().max(64).optional().nullable(),
  user_message: z.string().max(2000).optional().nullable(),
  assistant_response: z.string().max(4000).optional().nullable(),
  model: z.string().max(80).optional().nullable(),
  prompt_tokens: z.number().int().min(0).max(1_000_000).optional().nullable(),
  completion_tokens: z.number().int().min(0).max(1_000_000).optional().nullable(),
  total_tokens: z.number().int().min(0).max(2_000_000).optional().nullable(),
  latency_ms: z.number().int().min(0).max(600_000).optional().nullable(),
  status: z.enum(["ok", "error"]).optional(),
  error_status: z.string().max(64).optional().nullable(),
  request_id: z.string().max(120).optional().nullable(),
});

// Rate limit por IP (best-effort, se reinicia en cold start).
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || entry.resetAt < now) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function isAllowedOrigin(request: Request): boolean {
  const source = request.headers.get("origin") ?? request.headers.get("referer");
  if (!source) return false;
  try {
    const host = new URL(source).hostname;
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith(".lovable.app") ||
      host.endsWith(".lovableproject.com") ||
      host.endsWith("heroican.com") ||
      host.endsWith("vinculovirtual.com")
    );
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/chatbot-message")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAllowedOrigin(request)) return new Response(null, { status: 403 });

        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";
        if (rateLimited(ip)) return new Response(null, { status: 429 });

        try {
          const parsed = MessageSchema.safeParse(await request.json());
          if (!parsed.success) return new Response(null, { status: 204 });
          const d = parsed.data;

          const promptTokens = d.prompt_tokens ?? 0;
          const completionTokens = d.completion_tokens ?? 0;
          const totalTokens = d.total_tokens ?? promptTokens + completionTokens;

          const { estimateCost } = await import("@/lib/aiPricing.server");
          const model = d.model ?? "heroican-chatbot-scripted";
          const cost = estimateCost(model, promptTokens, completionTokens);

          const { supabaseAdmin } = await import(
            "@/integrations/heroican/client.server"
          );
          // La tabla es específica del proyecto Heroican y no está en los tipos generados.
          const table = (
            supabaseAdmin as unknown as {
              from: (t: string) => {
                insert: (v: unknown) => Promise<{ error: { message: string } | null }>;
              };
            }
          ).from("chatbot_messages");
          const { error } = await table.insert({
            session_id: d.session_id,
            route: d.route ?? null,
            device: d.device ?? null,
            user_message: d.user_message ?? null,
            assistant_response: d.assistant_response ?? null,
            model,
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: totalTokens,
            estimated_cost_usd: cost.priced ? cost.totalCost : 0,
            latency_ms: d.latency_ms ?? null,
            status: d.status ?? "ok",
            error_status: d.error_status ?? null,
            request_id: d.request_id ?? null,
          });
          if (error) console.error("[chatbot-message] insert failed", error.message);
        } catch (err) {
          console.error("[chatbot-message] handler error", err);
        }
        return new Response(null, { status: 204 });
      },
    },
  },
});
