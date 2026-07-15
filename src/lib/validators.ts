import { z } from "zod";

export function normalizePhoneInput(value: string): string {
  return value.trim().replace(/[\s().-]/g, "");
}

// Acepta números PE móviles (9XXXXXXXX, con o sin +51) o formato intl +DDDDDDDD..
const PHONE_REGEX = /^(?:\+?51)?9\d{8}$|^\+\d{8,15}$/;

export const leadSchema = z.object({
  tutorName: z.string().trim().min(2, "Ingresa tu nombre").max(80),
  phone: z.preprocess(
    (value) => (typeof value === "string" ? normalizePhoneInput(value) : value),
    z
    .string()
    .trim()
    .min(8, "Ingresa un número válido")
    .max(20)
    .regex(PHONE_REGEX, "Usa 9XXXXXXXX (Perú) o formato internacional +..."),
  ),
  city: z.string().trim().min(2, "Ingresa tu ciudad").max(60),
  consentWhatsApp: z.boolean().refine((v) => v === true, {
    message: "Necesitamos tu consentimiento para contactarte",
  }),
  consentTerms: z.boolean().refine((v) => v === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
  consentData: z.boolean().refine((v) => v === true, {
    message: "Debes aceptar el tratamiento de datos",
  }),
  consentLocation: z.boolean().optional(),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
