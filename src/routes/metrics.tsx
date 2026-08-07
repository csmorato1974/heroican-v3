import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { readEvents, clearEvents } from "@/lib/tracker";
import { readLeads } from "@/lib/leads";
import { getAiUsageSummary } from "@/lib/api/aiUsage.functions";
import type { AiUsageSummary } from "@/types/aiUsage";
import type { Lead, TrackedEvent } from "@/types/domain";

export const Route = createFileRoute("/metrics")({
  head: () => ({
    meta: [
      { title: "Métricas del piloto · Heroican" },
      { name: "description", content: "Panel interno del piloto Heroican Entry." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Metrics,
});

function download(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const usd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: n < 1 ? 4 : 2, maximumFractionDigits: n < 1 ? 6 : 2 })}`;

function Metrics() {
  const [events, setEvents] = useState<TrackedEvent[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [usage, setUsage] = useState<AiUsageSummary | null>(null);
  const [usageError, setUsageError] = useState<string | null>(null);

  useEffect(() => {
    setEvents(readEvents());
    setLeads(readLeads());
    getAiUsageSummary()
      .then((data) => setUsage(data as AiUsageSummary))
      .catch((err: unknown) =>
        setUsageError(err instanceof Error ? err.message : "Error desconocido"),
      );
  }, []);

  const sessions = new Set(events.map((e) => e.sessionId)).size;
  const diagnoses = events.filter((e) => e.eventName === "recommendation_generated").length;
  const whatsappClicks = events.filter((e) => e.eventName === "whatsapp_clicked").length;
  const geoGranted = events.filter((e) => e.eventName === "geolocation_granted").length;

  const productCounts = events
    .filter((e) => e.eventName === "recommendation_generated")
    .reduce<Record<string, number>>((acc, e) => {
      const id = (e.metadata?.product as string) ?? "n/a";
      acc[id] = (acc[id] ?? 0) + 1;
      return acc;
    }, {});
  const topProduct =
    Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Métricas del piloto</h1>
          <p className="text-sm text-muted-foreground">
            Datos almacenados localmente en este navegador.
          </p>
        </div>
        <Link to="/" className="text-sm text-primary hover:underline">← Volver</Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Card label="Sesiones" value={sessions} />
        <Card label="Diagnósticos" value={diagnoses} />
        <Card label="Leads" value={leads.length} />
        <Card label="Clicks WhatsApp" value={whatsappClicks} />
        <Card label="Ubicaciones permitidas" value={geoGranted} />
        <Card label="Producto top" value={topProduct} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => download("heroican-events.json", events)}>Exportar eventos JSON</Button>
        <Button variant="outline" onClick={() => download("heroican-leads.json", leads)}>
          Exportar leads JSON
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            if (confirm("¿Borrar todos los eventos locales?")) {
              clearEvents();
              setEvents([]);
            }
          }}
        >
          Limpiar eventos
        </Button>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Gastos estimados de API (OpenAI)</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Moneda: USD. {usage?.disclaimer ??
            "Estimación basada en precios configurados; el importe final se confirma en OpenAI."}
        </p>

        {usageError && (
          <p className="mt-4 text-sm text-destructive">No se pudo cargar el consumo: {usageError}</p>
        )}
        {!usage && !usageError && (
          <p className="mt-4 text-sm text-muted-foreground">Cargando consumo…</p>
        )}

        {usage && (
          <>
            {usage.unpricedModels.length > 0 && (
              <p className="mt-3 text-xs text-amber-600">
                Precio no configurado para: {usage.unpricedModels.join(", ")}
              </p>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Card label="Gasto total acumulado" value={usd(usage.totalCost)} />
              <Card label="Gasto de hoy" value={usd(usage.todayCost)} />
              <Card label="Promedio por llamada" value={usd(usage.avgCostPerCall)} />
              <Card label="Llamadas totales" value={usage.totalCalls} />
              <Card label="Coste de entrada" value={usd(usage.inputCost)} />
              <Card label="Coste de salida" value={usd(usage.outputCost)} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <UsageTable title="Coste por ruta" rows={usage.byRoute} />
              <UsageTable title="Coste por modelo" rows={usage.byModel} />
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
              <h3 className="px-3 py-2 text-sm font-semibold bg-muted">Consumo diario</h3>
              <table className="w-full text-xs">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Fecha</th>
                    <th className="px-3 py-2">Llamadas</th>
                    <th className="px-3 py-2">Tokens</th>
                    <th className="px-3 py-2">Coste</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.daily.map((d) => (
                    <tr key={d.date} className="border-t border-border">
                      <td className="px-3 py-2 font-mono">{d.date}</td>
                      <td className="px-3 py-2">{d.calls}</td>
                      <td className="px-3 py-2">{d.tokens.toLocaleString("en-US")}</td>
                      <td className="px-3 py-2">{usd(d.cost)}</td>
                    </tr>
                  ))}
                  {usage.daily.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                        Aún no hay llamadas registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card overflow-x-auto">
              <h3 className="px-3 py-2 text-sm font-semibold bg-muted">Últimas llamadas</h3>
              <table className="w-full text-xs">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Fecha</th>
                    <th className="px-3 py-2">Ruta</th>
                    <th className="px-3 py-2">Modelo</th>
                    <th className="px-3 py-2">In</th>
                    <th className="px-3 py-2">Out</th>
                    <th className="px-3 py-2">ms</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Coste</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.recent.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="px-3 py-2 whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 font-mono">{c.route}</td>
                      <td className="px-3 py-2 font-mono">{c.model}</td>
                      <td className="px-3 py-2">{c.promptTokens}</td>
                      <td className="px-3 py-2">{c.completionTokens}</td>
                      <td className="px-3 py-2">{c.latencyMs ?? "—"}</td>
                      <td className="px-3 py-2">
                        {c.success ? (c.fallback ? "fallback" : "ok") : (c.errorStatus ?? "error")}
                      </td>
                      <td className="px-3 py-2">
                        {c.priced ? usd(c.cost) : "precio no configurado"}
                      </td>
                    </tr>
                  ))}
                  {usage.recent.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                        Aún no hay llamadas registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>


      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Últimos eventos</h2>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-3 py-2">Evento</th>
                <th className="px-3 py-2">Sesión</th>
                <th className="px-3 py-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {events
                .slice(-20)
                .reverse()
                .map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-3 py-2 font-mono">{e.eventName}</td>
                    <td className="px-3 py-2 font-mono">{e.sessionId.slice(0, 8)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{e.timestamp}</td>
                  </tr>
                ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                    Aún no hay eventos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Card({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
