import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Download, MessageCircle, ShieldCheck, Loader2 } from "lucide-react";
import { track } from "@/lib/tracker";
import { BLUEPRINT_BADGES, type BlueprintBadge } from "./badges";
import { PetInsightCard } from "./PetInsightCard";
import { PetScannerOverlay } from "./PetScannerOverlay";
import { analyzePet, type PetAnalysisResult } from "@/lib/petAnalysis";
import { trackPetEvent } from "@/lib/petEvents";
import type { QrParams } from "@/types/domain";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  qrParams: QrParams;
}

type AnalysisState =
  | { status: "idle" }
  | { status: "analyzing" }
  | { status: "done"; result: PetAnalysisResult };

export function BlueprintCamera({ open, onOpenChange, qrParams }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [activeBadge, setActiveBadge] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>({ status: "idle" });
  const [scanning, setScanning] = useState(false);

  async function runAnalysis(dataUrl: string) {
    setAnalysis({ status: "analyzing" });
    track("pet_analysis_started", qrParams);
    trackPetEvent("started");
    try {
      const result = await analyzePet(dataUrl);
      setAnalysis({ status: "done", result });
      track(
        result.fallback ? "pet_analysis_failed" : "pet_analysis_success",
        qrParams,
        { focus: result.analysis.recommended_focus },
      );
      if (result.fallback) {
        trackPetEvent("failed", {
          fallback_used: true,
          error_type: "analysis_fallback",
          recommended_focus: result.analysis.recommended_focus,
        });
      } else {
        trackPetEvent("success", {
          detected_animal: result.analysis.detected_animal,
          size_guess: result.analysis.size_guess,
          recommended_focus: result.analysis.recommended_focus,
          fallback_used: false,
        });
      }
    } catch {
      setAnalysis({
        status: "done",
        result: {
          analysis: {
            detected_animal: "no_identificado",
            size_guess: "desconocido",
            coat_color: "no_identificado",
            coat_length: "desconocido",
            visual_tags: [],
            short_comment:
              "No pudimos analizar la foto ahora mismo. Igual podemos orientarte con la nutrición ideal para tu mascota.",
            recommended_focus: "general",
          },
          fallback: true,
        },
      });
      track("pet_analysis_failed", qrParams);
      trackPetEvent("failed", {
        fallback_used: true,
        error_type: "exception",
      });
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhoto(dataUrl);
      track("blueprint_photo_captured", qrParams, { size: file.size });
      void runAnalysis(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function reset() {
    setPhoto(null);
    setActiveBadge(null);
    setAnalysis({ status: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  }

  async function download() {
    if (!photo || !imgRef.current) return;
    const img = new Image();
    img.src = photo;
    await new Promise((r) => (img.onload = r));
    const W = img.naturalWidth;
    const H = img.naturalHeight;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    const scale = W / 560;
    BLUEPRINT_BADGES.forEach((b) => {
      const px = (b.x / 100) * W;
      const py = (b.y / 100) * H;
      ctx.beginPath();
      ctx.arc(px, py, 16 * scale, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(193, 116, 60, 0.35)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px, py, 8 * scale, 0, Math.PI * 2);
      ctx.fillStyle = "#c1743c";
      ctx.fill();
      ctx.font = `bold ${14 * scale}px Nunito, system-ui, sans-serif`;
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "rgba(40,20,10,0.6)";
      ctx.lineWidth = 3 * scale;
      const label = `${b.code} · ${b.title}`;
      ctx.strokeText(label, px + 20 * scale, py + 5 * scale);
      ctx.fillText(label, px + 20 * scale, py + 5 * scale);
    });
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "heroican-mi-mascota.png";
      a.click();
      URL.revokeObjectURL(url);
      track("blueprint_photo_downloaded", qrParams);
    }, "image/png");
  }

  function shareWhatsapp() {
    const msg = "Hola Heroican, quiero asesoría personalizada para saber cómo cuidar a mi mascota";
    const url = `https://wa.me/51942799091?text=${encodeURIComponent(msg)}`;
    track("blueprint_share_whatsapp", qrParams);
    trackPetEvent("whatsapp_clicked");
    window.open(url, "_blank");
  }

  function shareWhatsappWithInsight() {
    if (analysis.status !== "done") return shareWhatsapp();
    const a = analysis.result.analysis;
    const parts = [
      "Hola Heroican, acabo de probar el análisis con la foto de mi mascota.",
      a.detected_animal && a.detected_animal !== "no_identificado"
        ? `Resultado: ${a.detected_animal}, ${a.size_guess}, pelaje ${a.coat_color} ${a.coat_length}.`
        : null,
      `Foco sugerido: ${a.recommended_focus}.`,
      "Me gustaría una recomendación personalizada.",
    ].filter(Boolean);
    const url = `https://wa.me/51942799091?text=${encodeURIComponent(parts.join(" "))}`;
    track("blueprint_share_whatsapp", qrParams, { from: "insight_card" });
    trackPetEvent("whatsapp_clicked", {
      detected_animal: a.detected_animal,
      size_guess: a.size_guess,
      recommended_focus: a.recommended_focus,
      fallback_used: analysis.result.fallback,
    });
    window.open(url, "_blank");
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-[560px] hud-panel p-3 sm:p-6 max-h-[95svh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg sm:text-xl pr-10">
            Mira cómo cuidamos a tu engreído&nbsp; 🐶
          </DialogTitle>
        </DialogHeader>

        {!photo ? (
          <div className="mt-4 rounded-2xl p-4 sm:p-6 text-center" style={{ background: "var(--gradient-hero)" }}>
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Camera className="h-7 w-7 text-primary" />
            </span>
            <p className="mt-4 font-display text-lg sm:text-xl text-balance">Toma una foto de tu mascota</p>
            <p className="mt-2 text-sm text-muted-foreground text-balance">
              Detectamos rasgos visibles y te damos una orientación nutricional breve y personalizada.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFile}
            />
            <Button
              className="mt-5 rounded-full h-11 sm:h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
              onClick={() => {
                track("blueprint_camera_opened", qrParams);
                setScanning(true);
              }}
            >
              <Camera className="mr-2 h-5 w-5" />
              Tomar foto
            </Button>
            <p className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-1.5 text-balance">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              Procesamos la foto solo para este análisis. No la guardamos.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="relative w-full rounded-2xl overflow-hidden border border-border" style={{ aspectRatio: "3 / 4", background: "#000" }}>
              <img
                ref={imgRef}
                src={photo}
                alt="Mi mascota"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {BLUEPRINT_BADGES.map((b) => (
                <Hotspot
                  key={b.code}
                  badge={b}
                  active={activeBadge === b.code}
                  onToggle={() => setActiveBadge((a) => (a === b.code ? null : b.code))}
                />
              ))}
              {analysis.status === "analyzing" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  <p className="mt-2 text-sm font-display text-foreground text-center px-4">
                    Analizando rasgos visibles de tu mascota…
                  </p>
                </div>
              )}
            </div>

            {analysis.status === "done" && (
              <PetInsightCard
                analysis={analysis.result.analysis}
                fallback={analysis.result.fallback}
                onProductClick={({ productName, productUrl }) => {
                  track("pet_recommendation_clicked", qrParams, {
                    productName,
                    productUrl,
                    recommended_focus:
                      analysis.result.analysis.recommended_focus,
                  });
                  trackPetEvent("whatsapp_clicked", {
                    detected_animal: analysis.result.analysis.detected_animal,
                    size_guess: analysis.result.analysis.size_guess,
                    recommended_focus:
                      analysis.result.analysis.recommended_focus,
                    fallback_used: analysis.result.fallback,
                  });
                }}
              />
            )}

            <div className="grid grid-cols-2 gap-2">
              {BLUEPRINT_BADGES.map((b) => (
                <button
                  key={b.code}
                  onClick={() => setActiveBadge(b.code)}
                  className={`hud-panel rounded-2xl p-2 sm:p-3 text-left transition ${
                    activeBadge === b.code ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary">{b.code}</span>
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <p className="mt-1 font-display text-sm leading-tight">{b.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-snug">{b.body}</p>
                </button>
              ))}
            </div>

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground text-center px-2 text-balance">
              <MessageCircle className="h-3 w-3 shrink-0" />
              Descarga la foto y compártela por WhatsApp para recibir consejos personalizados sobre tu mascota.
            </p>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                className="w-full sm:w-auto rounded-full font-bold"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Repetir
              </Button>
              <Button
                size="sm"
                onClick={download}
                className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Descargar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={shareWhatsapp}
                className="col-span-2 sm:col-span-1 w-full sm:w-auto rounded-full font-bold sm:ml-auto"
              >
                <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                WhatsApp
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    <PetScannerOverlay
      open={scanning}
      onCancel={() => setScanning(false)}
      onReady={() => {
        setScanning(false);
        inputRef.current?.click();
      }}
    />
    </>
  );
}

function Hotspot({
  badge,
  active,
  onToggle,
}: {
  badge: BlueprintBadge;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute -translate-x-1/2 -translate-y-1/2 group"
      style={{ left: `${badge.x}%`, top: `${badge.y}%` }}
      aria-label={badge.title}
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-primary/40 pulse-glow" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-primary border-2 border-white" />
      </span>
      <span
        className={`absolute top-1/2 -translate-y-1/2 ${
          badge.side === "right" ? "left-6" : "right-6"
        } max-w-[8rem] truncate text-[9px] sm:text-[10px] font-bold text-foreground bg-card/95 backdrop-blur px-2 py-1 rounded-full border border-border shadow-sm ${
          active ? "inline opacity-100" : "hidden sm:inline opacity-95 group-hover:opacity-100"
        }`}
      >
        {badge.title}
      </span>
    </button>
  );
}
