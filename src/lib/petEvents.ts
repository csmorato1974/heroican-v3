// Anonymous, fire-and-forget metrics for the camera trial.
// Never throws, never blocks the UI. No PII, no photos.

import { getDeviceLabel } from "./waTracking";

const SESSION_KEY = "heroican_pet_session";

export type PetEventType =
  | "started"
  | "success"
  | "failed"
  | "whatsapp_clicked";

export interface PetEventPayload {
  detected_animal?: string | null;
  size_guess?: string | null;
  recommended_focus?: string | null;
  fallback_used?: boolean | null;
  error_type?: string | null;
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = uuid();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return uuid();
  }
}

function getSourceCampaign(): { source?: string; campaign?: string } {
  if (typeof window === "undefined") return {};
  try {
    const sp = new URLSearchParams(window.location.search);
    const source =
      sp.get("source") ?? sp.get("utm_source") ?? sp.get("qr_id") ?? undefined;
    const campaign =
      sp.get("campaign") ??
      sp.get("utm_campaign") ??
      sp.get("campania") ??
      sp.get("campaña") ??
      undefined;
    return { source: source ?? undefined, campaign: campaign ?? undefined };
  } catch {
    return {};
  }
}

export function trackPetEvent(
  event_type: PetEventType,
  payload: PetEventPayload = {},
): void {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({
      session_id: getSessionId(),
      event_type,
      ...getSourceCampaign(),
      route: window.location.pathname.slice(0, 120),
      device: getDeviceLabel(),
      ...payload,
    });
    void fetch("/api/public/pet-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Silent: UX must not break if DB fails.
    });
  } catch {
    // Silent.
  }
}
