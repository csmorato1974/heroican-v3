// Registro anónimo de los mensajes del chatbot.
// Envía solo texto del flujo conversacional: nunca imágenes, claves ni datos técnicos.
import { getAnonSessionId, getDeviceLabel } from "@/lib/waTracking";

export interface ChatbotLogInput {
  userMessage?: string | null;
  assistantResponse?: string | null;
  status?: "ok" | "error";
  errorStatus?: string | null;
  latencyMs?: number | null;
  model?: string | null;
}

/** Fire-and-forget: nunca bloquea ni rompe el flujo del chatbot. */
export function logChatbotMessage(input: ChatbotLogInput): void {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({
      session_id: getAnonSessionId(),
      route: window.location.pathname.slice(0, 120),
      device: getDeviceLabel(),
      user_message: input.userMessage?.slice(0, 2000) ?? null,
      assistant_response: input.assistantResponse?.slice(0, 4000) ?? null,
      model: input.model ?? "heroican-chatbot-scripted",
      status: input.status ?? "ok",
      error_status: input.errorStatus?.slice(0, 64) ?? null,
      latency_ms: input.latencyMs ?? null,
    });
    void fetch("/api/chatbot-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // silencioso
  }
}
