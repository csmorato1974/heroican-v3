import { PRODUCTS } from "@/lib/products";

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
                <h3 className="text-xl leading-tight">{p.name}</h3>
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

              <p className="mt-5 text-xs text-foreground/60 leading-relaxed">
                {p.ingredientsSummary}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
