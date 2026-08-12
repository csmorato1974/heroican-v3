// Registro server-side del consumo de la API de OpenAI.
// Nunca persiste imágenes, prompts, respuestas ni claves: solo metadatos y tokens.

export interface AiUsageRecord {
  model: string;
  route: string;
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  latencyMs?: number | null;
  success: boolean;
  fallback: boolean;
  errorStatus?: string | null;
  requestId?: string | null;
}

export async function recordAiUsage(record: AiUsageRecord): Promise<void> {
  try {
    const { supabaseAdmin } = await import(
      "@/integrations/heroican/client.server"
    );
    const prompt = Math.max(0, Math.round(record.promptTokens ?? 0));
    const completion = Math.max(0, Math.round(record.completionTokens ?? 0));
    const total = Math.max(
      0,
      Math.round(record.totalTokens ?? prompt + completion),
    );

    const { error } = await supabaseAdmin.from("ai_usage_events").insert({
      provider: "openai",
      model: record.model.slice(0, 80),
      route: record.route.slice(0, 120),
      prompt_tokens: prompt,
      completion_tokens: completion,
      total_tokens: total,
      latency_ms:
        record.latencyMs == null ? null : Math.max(0, Math.round(record.latencyMs)),
      success: record.success,
      fallback: record.fallback,
      error_status: record.errorStatus ? record.errorStatus.slice(0, 64) : null,
      request_id: record.requestId ? record.requestId.slice(0, 120) : null,
    });
    if (error) console.error("[ai-usage] insert failed", error.message);
  } catch (err) {
    console.error("[ai-usage] record error", err);
  }
}
