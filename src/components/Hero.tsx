import { ScanLine } from "lucide-react";
import type { QrParams } from "@/types/domain";
import heroReel from "@/assets/hero-reel-profesional.mp4.asset.json";

interface Props {
  qrParams: QrParams;
}

export function Hero({ qrParams: _qrParams }: Props) {
  return (
    <section className="relative bg-background">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16">
          <div>
            {/* Pre-CTA visible y clickeable → cámara */}
            <a
              href="#foto-mascota"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-accent bg-accent/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary transition hover:bg-accent hover:text-accent-foreground"
            >
              <ScanLine className="h-4 w-4" />
              Escanea a tu mascota con la cámara
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </a>

            <h1 className="mt-6 font-display font-black uppercase tracking-tight text-5xl leading-[0.95] sm:text-7xl">
              Alimenta
              <br />
              tu <span className="text-primary">lealtad</span>
            </h1>

            <p className="italic-sub mt-6 max-w-lg text-lg sm:text-xl">
              Registra a tu mascota y llévate{" "}
              <strong className="not-italic text-primary">
                10% de descuento
              </strong>{" "}
              por primer registro.
            </p>

            <p className="mt-4 max-w-lg text-base text-foreground/80">
              ¿Aún no sabes qué alimento le conviene? Usa nuestra experiencia
              con cámara: te orienta en segundos según los rasgos de tu perro.
              Dos caminos, un mismo cariño.
            </p>

          </div>

          <div className="mx-auto w-full max-w-full sm:max-w-md lg:max-w-md">
            <div className="relative border border-border rounded-2xl overflow-hidden bg-secondary aspect-[9/16] sm:aspect-[4/5] lg:aspect-[3/4]">
              <video
                src={heroReel.url}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="absolute left-3 top-3 brand-chip">
                Hecho en Tacna
              </span>
            </div>
            <p className="mt-4 text-center text-sm font-semibold uppercase tracking-wide text-primary sm:text-base">
              Ahora también nos encuentran en Moquegua y Arequipa
            </p>
          </div>

        </div>
      </div>
      <span className="gold-rule" aria-hidden />
    </section>
  );
}
