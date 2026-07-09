import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
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
            <span className="brand-chip">Nutrición premium · Tacna</span>

            <h1 className="mt-6 font-display font-black uppercase tracking-tight text-5xl leading-[0.95] sm:text-7xl">
              Alimenta
              <br />
              tu <span className="text-primary">lealtad</span>
            </h1>

            <p className="italic-sub mt-6 max-w-lg text-lg sm:text-xl">
              Nutrición honesta hecha en Tacna, con el cariño que tu perro merece.
            </p>

            <p className="mt-4 max-w-lg text-base text-foreground/80">
              Descubre en menos de 60 segundos el HEROICAN ideal para tu compañero:
              fórmulas balanceadas por etapa de vida y tamaño de raza, con
              ingredientes nobles y precio justo.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Button
                asChild
                className="h-12 rounded-md bg-primary px-6 font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
              >
                <a href="#foto-mascota">
                  <Camera className="mr-2 h-5 w-5" />
                  Descubre su alimento ideal
                </a>
              </Button>
              <a
                href="https://wa.me/59161212107"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold italic text-accent underline decoration-accent/60 underline-offset-4 hover:text-primary hover:decoration-primary/60"
              >
                Habla con nosotros por WhatsApp
              </a>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[300px] sm:max-w-sm lg:max-w-md">
            <div className="relative border border-border rounded-2xl overflow-hidden bg-secondary">
              <img
                src={heroSeq01.url}
                alt="HEROICAN — bolsa de alimento premium"
                className="block h-auto w-full"
              />
              <span className="absolute left-3 top-3 brand-chip">
                Hecho en Tacna
              </span>
            </div>
          </div>
        </div>
      </div>
      <span className="gold-rule" aria-hidden />
    </section>
  );
}
