import { PRODUCTS } from "@/lib/products";
import type { Nutrition } from "@/types/domain";

const NUTRITION_LABELS: Array<[keyof Nutrition, string]> = [
  ["proteina", "Proteína"],
  ["grasa", "Grasa"],
  ["fibra", "Fibra"],
  ["humedad", "Humedad"],
  ["ceniza", "Ceniza"],
  ["calcio", "Calcio"],
  ["fosforo", "Fósforo"],
];

export function ProductsMatrix() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
        <div className="max-w-2xl">
          <span className="brand-chip">Nuestra familia</span>
          <h2 className="mt-5 text-4xl sm:text-5xl">
            La familia <span className="text-primary">HEROICAN</span>
          </h2>
          <p className="italic-sub mt-3">
            Una fórmula para cada etapa, un cariño para cada hogar.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {PRODUCTS.map((p) => (
            <article key={p.id} className="brand-card p-6 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg sm:text-xl leading-tight min-w-0">{p.name}</h3>
                <span className="shrink-0 border border-accent text-accent text-[10px] font-bold italic uppercase tracking-wider px-2 py-1 rounded-full">
                  {p.lifeStage} · {p.breedSize}
                </span>
              </div>

              <ul className="mt-6 space-y-2 text-sm">
                {p.presentations.map((pr) => (
                  <li
                    key={pr.sizeKg}
                    className="flex items-center justify-between border-b border-border py-2"
                  >
                    <span className="font-semibold text-foreground/80">
                      {pr.sizeKg} kg
                    </span>
                    <span className="font-display font-black text-primary text-lg">
                      S/ {pr.pricePen.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>

              {p.nutrition && (
                <div className="mt-6">
                  <span className="gold-rule block" aria-hidden />
                  <p className="mt-4 font-display text-[11px] font-black uppercase tracking-[0.15em] text-accent">
                    Análisis garantizado
                  </p>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {NUTRITION_LABELS.map(([key, label]) => (
                      <div
                        key={key}
                        className="flex items-baseline justify-between gap-2 border-b border-dashed border-border py-1.5 min-w-0"
                      >
                        <dt className="text-foreground/60 truncate">{label}</dt>
                        <dd className="font-display font-bold text-foreground text-right shrink-0">
                          {p.nutrition![key]}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

            </article>
          ))}
        </div>

        <div className="mt-12 brand-card p-6 sm:p-8">
          <span className="gold-rule block" aria-hidden />
          <p className="mt-4 font-display text-[11px] font-black uppercase tracking-[0.15em] text-accent">
            Ingredientes
          </p>
          <p className="mt-3 text-sm text-foreground/80 leading-relaxed">
            Maíz, arroz, harina de carne, harina de pescado, trigo, torta de soya, aceite de pollo, hidrolizado enzimático de hígado de pollo, premezcla vitamínico-mineral, canela y DL-metionina.
          </p>
          <p className="mt-4 text-sm text-foreground/70 leading-relaxed">
            Heroican combina proteína animal de alta digestibilidad con cereales seleccionados y aditivos funcionales, aportando un equilibrio completo de proteínas, grasas, fibra y minerales en todas sus presentaciones. Los valores nutricionales (proteína, grasa, fibra, humedad, ceniza, calcio y fósforo) varían levemente según la etapa de vida y el tamaño de la raza.
          </p>
        </div>

      </div>
    </section>
  );
}
