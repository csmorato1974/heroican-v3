export const WA_NUMBER = "51942799091";

export interface WaTemplateVars {
  petName: string;
  lifeStage: string;
  breedSize: string;
  recommendedProduct: string;
  leadName: string;
  city: string;
}

/**
 * Legacy: se mantiene para no romper la cámara (BlueprintCamera) ni otros módulos
 * que ya envían un mensaje de asesoría genérica.
 */
export function buildWhatsappUrl(vars: WaTemplateVars): string {
  const msg = `Hola Heroican, quiero asesoría personalizada para saber cómo cuidar a mi mascota. Es ${vars.petName}, etapa ${vars.lifeStage}, tamaño ${vars.breedSize}. Soy ${vars.leadName}${vars.city ? ` de ${vars.city}` : ""}.`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export interface RegistrationWaVars {
  tutorName: string;
  phone: string;
  city: string;
  petName: string;
  lifeStage: string;
  breedSize: string;
  leadId?: string | null;
}

/**
 * Mensaje de registro promocional (10% dto. por primer registro).
 */
export function buildRegistrationWhatsappUrl(v: RegistrationWaVars): string {
  const msg = [
    "Hola Heroican, ya registré a mi mascota y quiero solicitar mi 10% de descuento por primer registro.",
    "",
    `Tutor: ${v.tutorName}`,
    `WhatsApp: ${v.phone}`,
    `Ciudad: ${v.city}`,
    `Mascota: ${v.petName}`,
    `Etapa: ${v.lifeStage}`,
    `Tamaño: ${v.breedSize}`,
    `Lead ID: ${v.leadId || "N/A"}`,
  ].join("\n");
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}
