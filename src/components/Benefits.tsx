import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const items = [
  {
    n: "01",
    title: "Nutrición honesta",
    desc: "Ingredientes nobles seleccionados, sin rellenos innecesarios.",
    long: "Cada fórmula parte de proteínas animales de calidad, cereales seleccionados y grasas nobles. Sin colorantes artificiales ni ingredientes de relleno que no aporten valor real a tu compañero.",
  },
  {
    n: "02",
    title: "Fórmulas por etapa",
    desc: "Cachorro y adulto, raza pequeña y grande. Cada perro, su fórmula.",
    long: "Los requerimientos de un cachorro no son los de un adulto, ni los de una raza pequeña iguales a los de una grande. Balanceamos proteína, grasa, calcio y fósforo para cada etapa y tamaño.",
  },
  {
    n: "03",
    title: "Hecho en Tacna",
    desc: "Elaborado localmente con estándares premium y cariño verdadero.",
    long: "Producimos en Tacna con controles de calidad estrictos y trazabilidad de lote. Cuidamos cada bolsa como si fuera para nuestros propios perros.",
  },
  {
    n: "04",
    title: "Palatabilidad real",
    desc: "Hidrolizados que enamoran al paladar más exigente.",
    long: "Incorporamos hidrolizado enzimático de hígado de pollo, un potenciador natural del sabor que logra aceptación superior incluso en perros selectivos.",
  },
  {
    n: "05",
    title: "Bienestar visible",
    desc: "Piel, pelaje y energía que se notan cada día.",
    long: "Aceites, vitaminas y minerales apoyan un manto brillante, piel sana y niveles estables de energía. Los cambios se notan en pocas semanas de consumo constante.",
  },
  {
    n: "06",
    title: "Precio justo",
    desc: "Calidad premium accesible para cada familia peruana.",
    long: "Producimos localmente y trabajamos con cadenas cortas, para ofrecer una calidad premium a un precio realista para el hogar peruano.",
  },
];

export function Benefits() {
  const [open, setOpen] = useState<string | null>(null);

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

        <div className="mt-12 grid gap-x-10 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const isOpen = open === it.n;
            const panelId = `benefit-panel-${it.n}`;
            return (
              <article key={it.n} className="border-t border-border">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : it.n)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full text-left pt-5 pb-4 min-h-[56px] flex items-start gap-4"
                >
                  <p className="font-display text-3xl font-black text-accent shrink-0 leading-none">
                    {it.n}
                  </p>
                  <h3 className="flex-1 min-w-0 text-lg sm:text-xl leading-tight mt-1">
                    {it.title}
                  </h3>
                  <span
                    aria-hidden
                    className="shrink-0 mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-accent"
                  >
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                <div
                  id={panelId}
                  hidden={!isOpen}
                  className="pl-0 sm:pl-[3.25rem] pb-5 space-y-2"
                >
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    {it.desc}
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {it.long}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
