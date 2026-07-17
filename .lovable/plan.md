## Diagnóstico

Revisé la tabla `pet_analysis_events` en la base de datos y sí está recibiendo actividad reciente:

- `started`: 24 eventos, último hoy 05:37 UTC
- `success`: 24 eventos, último hoy 05:37 UTC
- `whatsapp_clicked`: 7 eventos, **último el 17/07 a las 02:20 UTC** — estancado

El flujo "iniciar cámara" y "análisis exitoso" sigue registrándose sin problema. Lo que dejó de registrarse es la **conversión final**, y la causa es un cambio de UX previo:

- Antes, en el resultado del análisis se mostraba un CTA "Compartir por WhatsApp" que llamaba a `trackPetEvent("whatsapp_clicked", …)`.
- Ahora, `PetInsightCard` muestra un CTA que lleva directo a la tienda / producto recomendado (`recommendation.productUrl`). El `onClick` solo llama a `track("pet_recommendation_clicked", …)`, que escribe en `localStorage` vía `src/lib/tracker.ts` — nunca llega a Supabase.

Resultado: en el panel se ve como si "ya no llega actividad de conversión", aunque las etapas iniciales sí llegan.

## Cambios propuestos

1. **Registrar el clic del CTA de recomendación en Supabase.**
   - En `src/components/blueprint/BlueprintCamera.tsx`, dentro del `onProductClick` que ya se pasa a `PetInsightCard`, añadir una llamada a `trackPetEvent("whatsapp_clicked", { detected_animal, size_guess, recommended_focus, fallback_used })` además del `track()` local existente.
   - Se reusa el `event_type = "whatsapp_clicked"` (que en la práctica ya representa "conversión final del flujo cámara") para no romper el enum de la tabla ni requerir migración.

2. **Mantener el tracking de WhatsApp existente** en `shareWhatsapp` y `shareWhatsappWithInsight` sin cambios — si el usuario aún usa esos botones, se registran igual.

3. **Verificar** con una nueva consulta a `pet_analysis_events` que después del cambio vuelven a aparecer eventos de conversión con `max(created_at)` reciente.

## Fuera de alcance

- No se toca la tabla `pet_registrations` (registro del asistente): tiene 12 filas, última hoy 04:52 UTC, funciona bien.
- No se modifican políticas RLS ni el endpoint `/api/public/pet-event`.
- No se agrega un nuevo `event_type` al enum para evitar migración; si más adelante quieres separar "clic recomendación" de "clic WhatsApp", lo hacemos en un cambio posterior.
