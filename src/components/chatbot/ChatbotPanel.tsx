import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, MessageCircle, X, Dog, Gift, Loader2 } from "lucide-react";
import { track } from "@/lib/tracker";
import { buildRegistrationWhatsappUrl } from "@/lib/whatsapp";
import { leadSchema, normalizePhoneInput } from "@/lib/validators";
import { supabase } from "@/integrations/supabase/client";
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

const REGISTRATION_COMPLETED_KEY = "heroican.registration.completed";
const LEGACY_SESSION_KEY = "heroican.session";

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

export function ChatbotPanel({ qrParams }: Props) {
  const [step, setStep] = useState<Step>("welcome");
  const [answers, setAnswers] = useState<SessionAnswers>({});
  const [leadForm, setLeadForm] = useState<LeadForm>(() => ({
    ...DEFAULT_LEAD_FORM,
    city: qrParams.ciudad_url ?? "",
  }));
  const [minimized, setMinimized] = useState(true);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [submitting, setSubmitting] = useState(false);

  // Solo persiste si el usuario ya completó el registro. El formulario en
  // progreso vive únicamente en React state y siempre inicia limpio.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(LEGACY_SESSION_KEY);
    const completed = window.localStorage.getItem(REGISTRATION_COMPLETED_KEY) === "1";
    setRegistrationCompleted(completed);
    if (completed) setStep("success");
    track("landing_panel_mounted", qrParams);
  }, [qrParams]);

  const resetTransientForm = () => {
    setAnswers({});
    setLeadForm({ ...DEFAULT_LEAD_FORM, city: qrParams.ciudad_url ?? "" });
    setErrors({});
    setCoords(undefined);
    setSubmitting(false);
    setStep("welcome");
  };

  const openCleanPanel = () => {
    if (registrationCompleted) {
      setStep("success");
    } else {
      resetTransientForm();
    }
    setMinimized(false);
  };

  // Apertura desde el hero u otros CTAs
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      openCleanPanel();
      track("panel_opened_external", qrParams);
    };
    window.addEventListener("heroican:open-chatbot", handler);
    return () => window.removeEventListener("heroican:open-chatbot", handler);
  }, [qrParams, registrationCompleted]);

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
    // Solo actualizamos el checkbox aquí. El prompt de geolocalización
    // ocurre en el submit para respetar el "solo pedir al enviar".
    setLeadForm((f) => ({ ...f, consentLocation: checked }));
  };

  const getGeolocation = (): Promise<{
    lat: number | null;
    lng: number | null;
    status: "granted" | "denied" | "unsupported";
  }> => {
    return new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        resolve({ lat: null, lng: null, status: "unsupported" });
        return;
      }
      track("geolocation_requested", qrParams);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          track("geolocation_granted", qrParams);
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            status: "granted",
          });
        },
        () => {
          track("geolocation_denied", qrParams);
          resolve({ lat: null, lng: null, status: "denied" });
        },
        { enableHighAccuracy: false, timeout: 8000 },
      );
    });
  };

  const submitRegistration = async () => {
    if (submitting) return;
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

    setSubmitting(true);

    // 1) Geolocalización condicional (solo al enviar)
    let lat: number | null = null;
    let lng: number | null = null;
    let geolocation_status:
      | "granted"
      | "denied"
      | "unsupported"
      | "not_requested" = "not_requested";

    if (leadForm.consentLocation) {
      const geo = await getGeolocation();
      lat = geo.lat;
      lng = geo.lng;
      geolocation_status = geo.status;
      if (geo.status === "granted" && geo.lat != null && geo.lng != null) {
        setCoords({ lat: geo.lat, lng: geo.lng });
      }
    }

    // 2) Insert en Supabase (id generado en cliente para no depender de SELECT como anon)
    const clientLeadId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let leadId: string | null = null;
    try {
      const { error } = await supabase.from("pet_registrations").insert({
        id: clientLeadId,
        tutor_name: parsed.data.tutorName,
        whatsapp: parsed.data.phone,
        city: parsed.data.city,
        pet_name: answers.petName,
        life_stage: answers.lifeStage,
        pet_size: answers.breedSize,
        consent_whatsapp: !!leadForm.consentWhatsApp,
        consent_terms: !!leadForm.consentTerms,
        consent_privacy: !!leadForm.consentData,
        consent_location: !!leadForm.consentLocation,
        latitude: lat,
        longitude: lng,
        geolocation_status,
        source: "heroican_landing",
        lead_status: "new",
      });

      if (error) throw error;
      leadId = clientLeadId;
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : String(err);
      console.error("[pet_registrations] insert failed", err);
      toast.error(`No pudimos guardar tu registro: ${msg}`);
    }

    try {
      track("lead_submitted", qrParams, { flow: "registration", leadId });
      track("whatsapp_clicked", qrParams, { flow: "registration" });
      track("session_completed", qrParams);
    } catch {
      // ignore
    }

    // 4) Construir URL de WhatsApp con Lead ID y abrir
    const url = buildRegistrationWhatsappUrl({
      tutorName: parsed.data.tutorName,
      phone: parsed.data.phone,
      city: parsed.data.city,
      petName: answers.petName,
      lifeStage: answers.lifeStage,
      breedSize: answers.breedSize,
      leadId,
    });

    setSubmitting(false);
    setRegistrationCompleted(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(REGISTRATION_COMPLETED_KEY, "1");
      window.localStorage.removeItem(LEGACY_SESSION_KEY);
    }
    goto("success");
    openWhatsappUrl(url);
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

  const resetFlow = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(REGISTRATION_COMPLETED_KEY);
      window.localStorage.removeItem(LEGACY_SESSION_KEY);
    }
    setRegistrationCompleted(false);
    resetTransientForm();
    track("registration_reset", qrParams);
  };




  const progressIndex = ORDER.indexOf(step);
  const progressPct = Math.round((progressIndex / (ORDER.length - 1)) * 100);

  // ===== Floating dog-bot button =====
  if (minimized) {
    const started = !registrationCompleted && progressIndex > 0;
    return (
      <button
        onClick={() => {
          openCleanPanel();
          track("panel_restored", qrParams);
        }}
        aria-label="Registrar mi mascota y obtener 10% de descuento"
        className="fixed bottom-5 right-5 z-50 group flex items-center gap-3"
      >
        <span className="hidden sm:flex items-center rounded-2xl rounded-br-sm border border-border bg-card/95 backdrop-blur px-3 py-2 text-xs font-semibold text-foreground shadow-md group-hover:-translate-x-0.5 transition-transform">
          {registrationCompleted
            ? "¡Ya estás registrado!"
            : started
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
            {answers.petName ? (
              <Bubble>
                🎉 ¡Listo, <strong>{answers.petName}</strong> quedó registrada!
                Tu <strong className="text-primary">10% de descuento</strong> te
                espera por WhatsApp.
              </Bubble>
            ) : (
              <Bubble>
                🎉 ¡Ya estás registrado! Tu{" "}
                <strong className="text-primary">10% de descuento</strong> ya fue
                generado.
              </Bubble>
            )}
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
          submitting={submitting}
          onStart={startFlow}
          onNext={(next) => {
            if (next === "consents") track("lead_form_viewed", qrParams);
            goto(next);
          }}
          onSubmitRegistration={() => {
            void submitRegistration();
          }}
          onOpenWhatsapp={openWhatsapp}
          onReset={resetFlow}
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
  submitting,
  onStart,
  onNext,
  onSubmitRegistration,
  onOpenWhatsapp,
  onReset,
}: {
  step: Step;
  answers: SessionAnswers;
  leadForm: LeadForm;
  submitting: boolean;
  onStart: () => void;
  onNext: (s: Step) => void;
  onSubmitRegistration: () => void;
  onOpenWhatsapp: () => void;
  onReset: () => void;
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
    const consentsReady =
      !!leadForm.consentWhatsApp &&
      !!leadForm.consentTerms &&
      !!leadForm.consentData &&
      !!answers.petName &&
      !!answers.lifeStage &&
      !!answers.breedSize;

    return (
      <Button
        className={cta}
        disabled={!consentsReady || submitting}
        onClick={onSubmitRegistration}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando…
          </>
        ) : (
          <>Generar mi 10% de descuento →</>
        )}
      </Button>
    );
  }
  if (step === "success")
    return (
      <div className="space-y-2">
        <Button
          className="w-full rounded-full h-11 font-bold bg-[#25D366] text-white hover:bg-[#1ebe57]"
          onClick={onOpenWhatsapp}
        >
          <MessageCircle className="mr-2 h-4 w-4" /> Solicitar descuento por
          WhatsApp
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-full h-10 font-semibold"
          onClick={onReset}
        >
          Registrar otra mascota
        </Button>
      </div>

    );
  return null;
}
