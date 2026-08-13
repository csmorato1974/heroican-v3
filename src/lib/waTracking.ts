// Registro anónimo y server-side de clics a WhatsApp.
// No guarda números, ni contenido del mensaje, ni datos personales.

const SESSION_KEY = "heroican_pet_session";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getAnonSessionId(): string {
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

/** Etiqueta genérica de dispositivo/navegador. Nunca el user-agent completo. */
export function getDeviceLabel(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  const isTablet = /iPad|Tablet/i.test(ua);
  const isMobile = !isTablet && /Mobi|Android|iPhone/i.test(ua);
  const device = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

  let browser = "other";
  if (/Edg\//i.test(ua)) browser = "edge";
  else if (/OPR\/|Opera/i.test(ua)) browser = "opera";
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "chrome";
  else if (/Firefox\//i.test(ua)) browser = "firefox";
  else if (/Safari\//i.test(ua)) browser = "safari";

  let os = "other";
  if (/Android/i.test(ua)) os = "android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "ios";
  else if (/Windows/i.test(ua)) os = "windows";
  else if (/Mac OS X/i.test(ua)) os = "macos";
  else if (/Linux/i.test(ua)) os = "linux";

  return `${device}/${os}/${browser}`.slice(0, 64);
}

function getSourceCampaign(): { source?: string; campaign?: string } {
  if (typeof window === "undefined") return {};
  try {
    const sp = new URLSearchParams(window.location.search);
    const source =
      sp.get("source") ?? sp.get("utm_source") ?? sp.get("qr_id") ?? undefined;
    const campaign =
      sp.get("campaign") ?? sp.get("utm_campaign") ?? sp.get("campania") ?? undefined;
    return { source: source ?? undefined, campaign: campaign ?? undefined };
  } catch {
    return {};
  }
}

/**
 * Registra un clic a WhatsApp. Fire-and-forget: nunca bloquea la navegación.
 * `place` describe el origen dentro de la página (ej. "header", "insight_card").
 */
export function trackWhatsappClick(place?: string): void {
  if (typeof window === "undefined") return;
  try {
    const route = `${window.location.pathname}${place ? `#${place}` : ""}`.slice(0, 120);
    const body = JSON.stringify({
      session_id: getAnonSessionId(),
      event_type: "whatsapp_clicked",
      route,
      device: getDeviceLabel(),
      ...getSourceCampaign(),
    });
    void fetch("/api/public/pet-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Silencioso: la navegación a WhatsApp nunca debe romperse.
  }
}
