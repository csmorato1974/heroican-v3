// Server-only: agrega los clics a WhatsApp registrados en pet_analysis_events.

export interface WaClickDaily {
  date: string;
  clicks: number;
}

export interface WaClickGroup {
  key: string;
  clicks: number;
}

export interface WaClickSummary {
  total: number;
  today: number;
  last7Days: number;
  daily: WaClickDaily[];
  byRoute: WaClickGroup[];
  byDevice: WaClickGroup[];
}

interface Row {
  created_at: string;
  route?: string | null;
  device?: string | null;
}

const EMPTY: WaClickSummary = {
  total: 0,
  today: 0,
  last7Days: 0,
  daily: [],
  byRoute: [],
  byDevice: [],
};

export async function buildWaClickSummary(): Promise<WaClickSummary> {
  const { supabaseAdmin } = await import("@/integrations/heroican/client.server");

  let rows: Row[] | null = null;
  const rich = await supabaseAdmin
    .from("pet_analysis_events")
    .select("created_at, route, device")
    .eq("event_type", "whatsapp_clicked")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (rich.error) {
    const basic = await supabaseAdmin
      .from("pet_analysis_events")
      .select("created_at")
      .eq("event_type", "whatsapp_clicked")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (basic.error) return EMPTY;
    rows = (basic.data ?? []) as Row[];
  } else {
    rows = (rich.data ?? []) as Row[];
  }

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const daily = new Map<string, number>();
  const byRoute = new Map<string, number>();
  const byDevice = new Map<string, number>();
  let todayCount = 0;
  let weekCount = 0;

  for (const row of rows) {
    const date = row.created_at.slice(0, 10);
    daily.set(date, (daily.get(date) ?? 0) + 1);
    if (date === today) todayCount += 1;
    if (new Date(row.created_at).getTime() >= weekAgo) weekCount += 1;
    const route = row.route || "—";
    byRoute.set(route, (byRoute.get(route) ?? 0) + 1);
    const device = row.device || "—";
    byDevice.set(device, (byDevice.get(device) ?? 0) + 1);
  }

  const toGroups = (m: Map<string, number>): WaClickGroup[] =>
    [...m.entries()]
      .map(([key, clicks]) => ({ key, clicks }))
      .sort((a, b) => b.clicks - a.clicks);

  return {
    total: rows.length,
    today: todayCount,
    last7Days: weekCount,
    daily: [...daily.entries()]
      .map(([date, clicks]) => ({ date, clicks }))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 30),
    byRoute: toGroups(byRoute),
    byDevice: toGroups(byDevice),
  };
}
