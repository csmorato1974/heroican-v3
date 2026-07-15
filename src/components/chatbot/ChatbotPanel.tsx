import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, MessageCircle, X, Dog, Gift } from "lucide-react";
import { track, getSessionId } from "@/lib/tracker";
import { saveLead } from "@/lib/leads";
import { buildRegistrationWhatsappUrl } from "@/lib/whatsapp";
import { leadSchema, normalizePhoneInput } from "@/lib/validators";
import {
  type BreedSize,
  type LifeStage,
  type QrParams,
  type SessionAnswers,
} from "@/types/domain";

type Step =
  | "welcome"
  | "petName"
  | "lifeStage"
  | "breedSize"
  | "tutor"
  | "consents"
  | "success";

interface Props {
  qrParams: QrParams;
}

const ORDER: Step[] = [
  "welcome",
  "petName",
  "lifeStage",
  "breedSize",
  "tutor",
  "consents",
  "success",
];

const SESSION_KEY = "heroican.session";
const MINIMIZED_KEY = "heroican.panel.minimized";

interface LeadForm {
  tutorName: string;
  phone: string;
  city: string;
  consentWhatsApp: boolean;
  consentTerms: boolean;
  consentData: boolean;
  consentLocation: boolean;
}

const DEFAULT_LEAD_FORM: LeadForm = {
  tutorName: "",
  phone: "",
  city: "",
  consentWhatsApp: false,
  consentTerms: false,
  consentData: false,
  consentLocation: false,
};

interface Persisted {
  step: Step;
  answers: SessionAnswers;
  leadForm: LeadForm;
}

function loadPersisted(defaultCity: string): Persisted {
  const base: Persisted = {
    step: "welcome",
    answers: {},
    leadForm: { ...DEFAULT_LEAD_FORM, city: defaultCity },
  };
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    // Merge con defaults: si faltan campos nuevos en sesiones antiguas,
    // se completan en lugar de descartar todo el blob.
    const validStep = (ORDER as string[]).includes(parsed.step as string)
      ? (parsed.step as Step)
      : "welcome";
    return {
      step: validStep,
      answers: { ...base.answers, ...(parsed.answers ?? {}) },
      leadForm: { ...base.leadForm, ...(parsed.leadForm ?? {}) },
    };
  } catch {
    return base;
  }
}

export function ChatbotPanel({ qrParams }: Props) {
  const [step, setStep] = useState<Step>("welcome");
  const [answers, setAnswers] = useState<SessionAnswers>({});
  const [leadForm, setLeadForm] = useState<LeadForm>(() => ({
    ...DEFAULT_LEAD_FORM,
    city: qrParams.ciudad_url ?? "",
  }));
  const [minimized, setMinimized] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>();

  // Hydrate persisted state client-side only (avoids SSR mismatch)
  useEffect(() => {
    const p = loadPersisted(qrParams.ciudad_url ?? "");
    setStep(p.step);
    setAnswers(p.answers);
    setLeadForm(p.leadForm);
    setHydrated(true);
  }, [qrParams.ciudad_url]);

  // Persist
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ step, answers, leadForm }),
    );
  }, [hydrated, step, answers, leadForm]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(MINIMIZED_KEY);
    setMinimized(stored !== "0");
    track("landing_panel_mounted", qrParams);
  }, [qrParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MINIMIZED_KEY, minimized ? "1" : "0");
  }, [minimized]);

  // Apertura desde el hero u otros CTAs
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      setMinimized(false);
      track("panel_opened_external", qrParams);
    };
    window.addEventListener("heroican:open-chatbot", handler);
    return () => window.removeEventListener("heroican:open-chatbot", handler);
  }, [qrParams]);

  const goto = (s: Step) => setStep(s);
  const answer = (
    field: keyof SessionAnswers,
    value: SessionAnswers[keyof SessionAnswers],
  ) => {
    setAnswers((a) => ({ ...a, [field]: value }));
    track("question_answered", qrParams, { field, value });
  };

  const startFlow = () => {
    track("quiz_started", qrParams, { flow: "registration" });
    goto("petName");
  };

  const requestLocation = (checked: boolean) => {
    setLeadForm((f) => ({ ...f, consentLocation: checked }));
    if (!checked) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    track("geolocation_requested", qrParams);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        track("geolocation_granted", qrParams);
      },
      () => track("geolocation_denied", qrParams),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  const submitRegistration = (navigateToWhatsapp = true) => {
    const formForSubmit = {
      ...leadForm,
      tutorName: leadForm.tutorName.trim(),
      phone: normalizePhoneInput(leadForm.phone),
      city: leadForm.city.trim(),
    };
    const parsed = leadSchema.safeParse(formForSubmit);
    if (!parsed.success) {
      const e: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        e[i.path[0] as string] = i.message;
      });
      setErrors(e);
      return;
    }
    setErrors({});
    if (!answers.petName || !answers.lifeStage || !answers.breedSize) return;

    const url = buildRegistrationWhatsappUrl({
      tutorName: parsed.data.tutorName,
      phone: parsed.data.phone,
      city: parsed.data.city,
      petName: answers.petName,
      lifeStage: answers.lifeStage,
      breedSize: answers.breedSize,
    });

    const leadId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    try {
      saveLead({
        id: leadId,
        sessionId: getSessionId(),
        tutorName: parsed.data.tutorName,
        phone: parsed.data.phone,
        city: parsed.data.city,
        petName: answers.petName,
        lifeStage: answers.lifeStage,
        breedSize: answers.breedSize,
        needs: [],
        recommendedProduct: "Registro promocional 10%",
        consentWhatsApp: true,
        consentLocation: !!leadForm.consentLocation,
        locationLat: coords?.lat,
        locationLng: coords?.lng,
        createdAt: new Date().toISOString(),
        qrParams,
      });
    } catch {
      // WhatsApp debe abrir aunque falle el guardado local.
    }

    try {
      track("lead_submitted", qrParams, { flow: "registration" });
      track("whatsapp_clicked", qrParams, { flow: "registration" });
      track("session_completed", qrParams);
    } catch {
      // El tracking no debe bloquear la solicitud por WhatsApp.
    }

    if (navigateToWhatsapp) {
      openWhatsappUrl(url);
    }
    goto("success");
  };

  const openWhatsapp = () => {
    if (!answers.petName || !answers.lifeStage || !answers.breedSize) return;
    const url = buildRegistrationWhatsappUrl({
      tutorName: leadForm.tutorName.trim(),
      phone: normalizePhoneInput(leadForm.phone),
      city: leadForm.city.trim(),
      petName: answers.petName,
      lifeStage: answers.lifeStage,
      breedSize: answers.breedSize,
    });
    track("whatsapp_clicked", qrParams, { flow: "registration" });
    track("session_completed", qrParams);
    openWhatsappUrl(url);
  };

  const progressIndex = ORDER.indexOf(step);
  const progressPct = Math.round((progressIndex / (ORDER.length - 1)) * 100);

  // ===== Floating dog-bot button =====
  if (minimized) {
    const started = progressIndex > 0;
    return (
      <button
        onClick={() => {
          setMinimized(false);
          track("panel_restored", qrParams);
        }}
        aria-label="Registrar mi mascota y obtener 10% de descuento"
        className="fixed bottom-5 right-5 z-50 group flex items-center gap-3"
      >
        <span className="hidden sm:flex items-center rounded-2xl rounded-br-sm border border-border bg-card/95 backdrop-blur px-3 py-2 text-xs font-semibold text-foreground shadow-md group-hover:-translate-x-0.5 transition-transform">
          {started
            ? `Continuar registro · ${progressPct}%`
            : "Regístrala y obtén 10% dto."}
        </span>
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg group-hover:scale-105 transition-transform">
          <Dog className="h-8 w-8" strokeWidth={2.2} />
          {started ? (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground border-2 border-background">
              {progressPct}%
            </span>
          ) : (
            <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground border-2 border-background">
              10%
            </span>
          )}
        </span>
      </button>
    );
  }

  // ===== Full panel =====
  return (
    <aside
      className="brand-card fixed z-50 flex flex-col overflow-hidden shadow-2xl
        inset-x-3 bottom-3 top-auto h-[80svh] rounded-2xl
        sm:inset-x-auto sm:right-5 sm:bottom-24 sm:top-auto sm:w-[380px] sm:h-[600px] sm:max-h-[calc(100svh-7rem)]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-secondary/50">
        {step !== "welcome" && step !== "success" && (
          <button
            aria-label="Atrás"
            onClick={() => {
              const i = ORDER.indexOf(step);
              if (i > 0) goto(ORDER[i - 1]);
            }}
            className="rounded p-1 hover:bg-muted text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-display">
          H
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
            Asistente HEROICAN
          </p>
          <p className="text-xs text-muted-foreground truncate">
            10% dto. por primer registro
          </p>
        </div>
        <button
          aria-label="Cerrar panel"
          onClick={() => {
            setMinimized(true);
            track("panel_minimized", qrParams);
          }}
          className="rounded p-1.5 hover:bg-muted text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-border">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {step === "welcome" && (
          <>
            <Bubble>
              ¡Hola! Aquí puedes{" "}
              <strong className="text-primary">registrar a tu mascota</strong> y
              recibir{" "}
              <strong className="text-primary">10% de descuento</strong> por tu
              primer registro. 🐾
            </Bubble>
            <div className="rounded-2xl border border-accent/40 bg-accent/10 p-3 text-xs text-foreground/80">
              <p className="flex items-center gap-2 font-bold text-primary">
                <Gift className="h-4 w-4" /> Beneficio de bienvenida
              </p>
              <p className="mt-1">
                Tomamos 4 datos rápidos, generamos tu cupón y te derivamos por
                WhatsApp al equipo Heroican.
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                ¿Buscas orientación sobre qué alimento darle? Cierra este panel
                y usa la experiencia con cámara más abajo.
              </p>
            </div>
          </>
        )}

        {step === "petName" && (
          <>
            <Bubble>¿Cómo se llama tu mascota?</Bubble>
            <Input
              autoFocus
              placeholder="Nombre de tu mascota"
              value={answers.petName ?? ""}
              onChange={(e) =>
                setAnswers((a) => ({ ...a, petName: e.target.value }))
              }
            />
          </>
        )}

        {step === "lifeStage" && (
          <>
            <Bubble>¿En qué etapa está {answers.petName ?? "tu mascota"}?</Bubble>
            <OptionGrid
              options={["Cachorro", "Adulto"]}
              value={answers.lifeStage}
              onSelect={(v) => answer("lifeStage", v as LifeStage)}
            />
          </>
        )}

        {step === "breedSize" && (
          <>
            <Bubble>¿Qué tamaño de raza tiene?</Bubble>
            <OptionGrid
              options={["Raza pequeña", "Raza grande"]}
              value={answers.breedSize}
              onSelect={(v) => answer("breedSize", v as BreedSize)}
            />
          </>
        )}

        {step === "tutor" && (
          <>
            <Bubble>
              Para preparar tu cupón, necesitamos tus datos de contacto.
            </Bubble>
            <div className="space-y-3">
              <Field label="Nombre" error={errors.tutorName}>
                <Input
                  value={leadForm.tutorName}
                  onChange={(e) =>
                    setLeadForm((f) => ({ ...f, tutorName: e.target.value }))
                  }
                  placeholder="Tu nombre"
                />
              </Field>
              <Field label="WhatsApp" error={errors.phone}>
                <Input
                  inputMode="tel"
                  value={leadForm.phone}
                  onChange={(e) =>
                    setLeadForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="9XXXXXXXX o +51..."
                />
              </Field>
              <Field label="Ciudad" error={errors.city}>
                <Input
                  value={leadForm.city}
                  onChange={(e) =>
                    setLeadForm((f) => ({ ...f, city: e.target.value }))
                  }
                  placeholder="Tu ciudad"
                />
              </Field>
            </div>
          </>
        )}

        {step === "consents" && (
          <>
            <Bubble>Un último paso antes de generar tu cupón 🎁</Bubble>
            <div className="space-y-2">
              <label className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
                <Checkbox
                  checked={leadForm.consentWhatsApp}
                  onCheckedChange={(v) =>
                    setLeadForm((f) => ({ ...f, consentWhatsApp: v === true }))
                  }
                />
                <span className="text-xs">
                  Acepto que Heroican me contacte por WhatsApp para enviarme mi
                  cupón y novedades relacionadas.
                </span>
              </label>
              {errors.consentWhatsApp && (
                <p className="text-xs text-destructive">
                  {errors.consentWhatsApp}
                </p>
              )}

              <label className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
                <Checkbox
                  checked={leadForm.consentTerms}
                  onCheckedChange={(v) =>
                    setLeadForm((f) => ({ ...f, consentTerms: v === true }))
                  }
                />
                <span className="text-xs">
                  Acepto los{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-primary"
                  >
                    términos y condiciones
                  </a>{" "}
                  de la promoción.
                </span>
              </label>
              {errors.consentTerms && (
                <p className="text-xs text-destructive">{errors.consentTerms}</p>
              )}

              <label className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
                <Checkbox
                  checked={leadForm.consentData}
                  onCheckedChange={(v) =>
                    setLeadForm((f) => ({ ...f, consentData: v === true }))
                  }
                />
                <span className="text-xs">
                  Acepto el tratamiento de mis datos personales según la{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-primary"
                  >
                    política de privacidad
                  </a>
                  .
                </span>
              </label>
              {errors.consentData && (
                <p className="text-xs text-destructive">{errors.consentData}</p>
              )}

              <label className="flex items-start gap-3 rounded-md border border-dashed border-border bg-secondary/40 p-3">
                <Checkbox
                  checked={leadForm.consentLocation}
                  onCheckedChange={(v) => requestLocation(v === true)}
                />
                <span className="text-xs">
                  (Opcional) Compartir mi ubicación aproximada para mapas de
                  demanda.
                </span>
              </label>

              <p className="text-[10px] text-muted-foreground">
                Promoción sujeta a términos y condiciones. Válida solo para
                primer registro por mascota.
              </p>
            </div>
          </>
        )}

        {step === "success" && (
          <>
            <Bubble>
              🎉 ¡Listo, <strong>{answers.petName}</strong> quedó registrada!
              Tu <strong className="text-primary">10% de descuento</strong> te
              espera por WhatsApp.
            </Bubble>
            <div className="brand-card rounded-md p-4 text-sm space-y-2">
              <p>
                Presiona el botón para abrir WhatsApp con el equipo Heroican y
                canjear tu cupón de bienvenida.
              </p>
              <p className="text-[11px] text-muted-foreground">
                ¿Quieres además orientación sobre qué alimento darle? Cierra
                este panel y usa la experiencia con cámara.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t border-border px-4 py-3 bg-card">
        <FooterActions
          step={step}
          answers={answers}
          leadForm={leadForm}
          onStart={startFlow}
          onNext={(next) => {
            if (next === "consents") track("lead_form_viewed", qrParams);
            goto(next);
          }}
          onSubmitRegistration={(navigateToWhatsapp) =>
            submitRegistration(navigateToWhatsapp)
          }
          onOpenWhatsapp={openWhatsapp}
        />
      </div>
    </aside>
  );
}

function openWhatsappUrl(url: string) {
  const opened = window.open(url, "_blank");
  if (opened) {
    opened.opener = null;
    return;
  }
  window.location.assign(url);
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[92%] rounded-2xl rounded-tl-sm border border-border bg-secondary/60 px-4 py-3 text-sm leading-relaxed">
      {children}
    </div>
  );
}

function OptionGrid({
  options,
  value,
  onSelect,
}: {
  options: string[];
  value: string | undefined;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="grid gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onSelect(o)}
          className={`text-left rounded-2xl border px-4 py-3 transition text-sm font-semibold ${
            value === o
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border bg-card hover:bg-secondary"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function FooterActions({
  step,
  answers,
  leadForm,
  onStart,
  onNext,
  onSubmitRegistration,
  onOpenWhatsapp,
}: {
  step: Step;
  answers: SessionAnswers;
  leadForm: LeadForm;
  onStart: () => void;
  onNext: (s: Step) => void;
  onSubmitRegistration: (navigateToWhatsapp?: boolean) => void;
  onOpenWhatsapp: () => void;
}) {
  const cta =
    "w-full rounded-full h-11 font-bold bg-primary text-primary-foreground hover:bg-primary/90";

  if (step === "welcome")
    return (
      <Button className={cta} onClick={onStart}>
        Registrar y obtener 10% dto. →
      </Button>
    );
  if (step === "petName")
    return (
      <Button
        className={cta}
        disabled={!answers.petName?.trim()}
        onClick={() => onNext("lifeStage")}
      >
        Continuar ▸
      </Button>
    );
  if (step === "lifeStage")
    return (
      <Button
        className={cta}
        disabled={!answers.lifeStage}
        onClick={() => onNext("breedSize")}
      >
        Continuar ▸
      </Button>
    );
  if (step === "breedSize")
    return (
      <Button
        className={cta}
        disabled={!answers.breedSize}
        onClick={() => onNext("tutor")}
      >
        Continuar ▸
      </Button>
    );
  if (step === "tutor") {
    const ready =
      leadForm.tutorName.trim().length >= 2 &&
      leadForm.phone.trim().length >= 8 &&
      leadForm.city.trim().length >= 2;
    return (
      <Button
        className={cta}
        disabled={!ready}
        onClick={() => onNext("consents")}
      >
        Continuar ▸
      </Button>
    );
  }
  if (step === "consents") {
    const whatsappHref =
      answers.petName && answers.lifeStage && answers.breedSize
        ? buildRegistrationWhatsappUrl({
            tutorName: leadForm.tutorName.trim(),
            phone: normalizePhoneInput(leadForm.phone),
            city: leadForm.city.trim(),
            petName: answers.petName,
            lifeStage: answers.lifeStage,
            breedSize: answers.breedSize,
          })
        : undefined;

    return (
      <Button className={cta} asChild>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => {
            if (
              !whatsappHref ||
              !leadForm.consentWhatsApp ||
              !leadForm.consentTerms ||
              !leadForm.consentData
            ) {
              event.preventDefault();
              onSubmitRegistration(false);
            } else {
              onSubmitRegistration(false);
            }
          }}
        >
          Generar mi 10% de descuento →
        </a>
      </Button>
    );
  }
  if (step === "success")
    return (
      <Button
        className="w-full rounded-full h-11 font-bold bg-[#25D366] text-white hover:bg-[#1ebe57]"
        onClick={onOpenWhatsapp}
      >
        <MessageCircle className="mr-2 h-4 w-4" /> Solicitar descuento por
        WhatsApp
      </Button>
    );
  return null;
}
