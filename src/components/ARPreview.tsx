import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { track } from "@/lib/tracker";
import { BlueprintCamera } from "./blueprint/BlueprintCamera";
import type { QrParams } from "@/types/domain";
import heroicanPack from "@/assets/heroican-ar-phone-v2.png.asset.json";

const facets = [
  { title: "Confort digestivo", desc: "Tránsito tranquilo, gases bajo control." },
  { title: "Vitalidad y energía", desc: "Para caminatas, juegos y siestas felices." },
  { title: "Piel y pelaje", desc: "Brillo y suavidad que se acarician." },
  { title: "Palatabilidad", desc: "Sabor honesto que su olfato reconoce." },
];

export function ARPreview({ qrParams }: { qrParams: QrParams }) {
  const [open, setOpen] = useState(false);

  return (
    <section
      id="experiencia-camara"
      className="scroll-mt-20 bg-secondary/40 border-y border-border"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="brand-chip">Experiencia con cámara</span>
            <h2 className="mt-5 text-4xl sm:text-5xl">
              Conoce a tu <span className="text-primary">compañero</span>
            </h2>
            <p className="italic-sub mt-3">Una foto basta para orientarte.</p>
            <p className="mt-4 max-w-xl text-base text-foreground/80">
              Toma una foto a tu perro y te damos una lectura visual con una
              recomendación cálida y honesta, pensada para su etapa de vida.
            </p>

            <div className="mt-8 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              {facets.map((f) => (
                <div key={f.title} className="border-t border-border pt-4">
                  <h3 className="text-base">{f.title}</h3>
                  <p className="mt-1 text-sm text-foreground/70">{f.desc}</p>
                </div>
              ))}
            </div>

            <div id="foto-mascota" className="mt-10 scroll-mt-24">
              <Button
                className="rounded-md bg-primary px-6 h-12 font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  setOpen(true);
                  track("blueprint_camera_opened", qrParams);
                }}
              >
                <Camera className="mr-2 h-5 w-5" />
                Tomar foto a mi perro
              </Button>
              <p className="mt-3 text-xs italic text-accent">
                Orientativo. No reemplaza la evaluación de tu veterinario.
              </p>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroicanPack.url}
              alt="Empaque HEROICAN con análisis visual de la mascota"
              className="w-full h-auto rounded-2xl border border-border bg-background"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <BlueprintCamera open={open} onOpenChange={setOpen} qrParams={qrParams} />
    </section>
  );
}
