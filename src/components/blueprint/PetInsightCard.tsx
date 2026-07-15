import { Sparkles } from "lucide-react";
import { type PetAnalysis } from "@/lib/petAnalysis";
import {
  getHeroicanRecommendation,
  inferRecommendationInput,
} from "@/lib/heroicanRecommendation";

interface Props {
  analysis: PetAnalysis;
  fallback: boolean;
  onProductClick?: (info: { productName: string | null; productUrl: string }) => void;
}

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function PetInsightCard({ analysis, fallback, onProductClick }: Props) {
  const recommendation = getHeroicanRecommendation(
    inferRecommendationInput(analysis),
  );
  const ctaText = recommendation.productName
    ? "ver recomendación para tu consentido"
    : "explora nuestras recomendaciones para tu consentido";

  const chips = [
    analysis.detected_animal,
    analysis.size_guess,
    analysis.coat_color,
    analysis.coat_length,
  ]
    .filter((v) => v && v !== "desconocido" && v !== "no_identificado")
    .map(capitalize);

  return (
    <div className="hud-panel rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </span>
        <p className="font-display text-base leading-tight">
          {fallback ? "Orientación general" : "Lo que observamos en tu mascota"}
        </p>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c, i) => (
            <span
              key={`${c}-${i}`}
              className="text-[11px] font-bold text-foreground bg-card/80 border border-border rounded-full px-2.5 py-1"
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {analysis.visual_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {analysis.visual_tags.slice(0, 6).map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="text-[10px] text-primary bg-primary/10 rounded-full px-2 py-0.5"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-foreground leading-snug">{analysis.short_comment}</p>

      <div className="rounded-2xl border border-[#f1d7db] bg-[#fff4f5] p-4">
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#c63d4f]">
          {recommendation.title}
        </p>
        <p className="text-base text-[#4b3d3f]">{recommendation.text}</p>
      </div>

      <a
        href={recommendation.productUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          try {
            onProductClick?.({
              productName: recommendation.productName,
              productUrl: recommendation.productUrl,
            });
          } catch {
            // tracking no debe bloquear la navegación
          }
        }}
        className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-[#ef233c] px-6 py-4 text-white font-semibold hover:bg-[#d81f36] transition"
      >
        {ctaText}
      </a>

      <p className="text-[10px] text-muted-foreground text-center">
        Orientación informativa basada en rasgos visibles. No reemplaza la
        evaluación de un veterinario.
      </p>
    </div>
  );
}
