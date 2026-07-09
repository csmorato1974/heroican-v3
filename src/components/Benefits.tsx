const items = [
  { n: "01", title: "Nutrición honesta", desc: "Ingredientes nobles seleccionados, sin rellenos innecesarios." },
  { n: "02", title: "Fórmulas por etapa", desc: "Cachorro y adulto, raza pequeña y grande. Cada perro, su fórmula." },
  { n: "03", title: "Hecho en Tacna", desc: "Elaborado localmente con estándares premium y cariño verdadero." },
  { n: "04", title: "Palatabilidad real", desc: "Hidrolizados que enamoran al paladar más exigente." },
  { n: "05", title: "Bienestar visible", desc: "Piel, pelaje y energía que se notan cada día." },
  { n: "06", title: "Precio justo", desc: "Calidad premium accesible para cada familia peruana." },
];

export function Benefits() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
        <div className="max-w-2xl">
          <span className="brand-chip">Por qué HEROICAN</span>
          <h2 className="mt-5 text-4xl sm:text-5xl">
            Lo que hay <span className="text-primary">detrás</span> de cada bocado
          </h2>
          <p className="italic-sub mt-3">
            Seis razones para confiar en una marca que ama a los perros tanto como tú.
          </p>
        </div>

        <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <article key={it.n} className="border-t border-border pt-6">
              <p className="font-display text-3xl font-black text-accent">{it.n}</p>
              <h3 className="mt-3 text-xl">{it.title}</h3>
              <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
                {it.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
