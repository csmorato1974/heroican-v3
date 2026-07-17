## Diagnóstico

Reproduje el flujo del asistente hasta el CTA "Generar mi 10% de descuento":

- El `INSERT` a `pet_registrations` funciona (Supabase responde `201`).
- El problema es que **WhatsApp no se abre**: `openWhatsappUrl` llama a `window.open(url, "_blank")` **después de varios `await`** (geolocalización + insert). Los navegadores (especialmente móviles/Safari) sólo permiten `window.open` dentro del gesto directo del usuario. Al ejecutarse tras `await`, se pierde el "user activation" y el popup se bloquea silenciosamente → el usuario percibe "no se envía nada".

## Corrección

En `src/components/chatbot/ChatbotPanel.tsx`:

1. Dentro de `submitRegistration`, **antes** de cualquier `await`, abrir una pestaña placeholder sincrónicamente:
   ```ts
   const waTab = typeof window !== "undefined" ? window.open("", "_blank") : null;
   if (waTab) waTab.opener = null;
   ```
2. Después de construir la URL final de WhatsApp, redirigir esa pestaña:
   ```ts
   if (waTab && !waTab.closed) waTab.location.href = url;
   else window.location.assign(url); // fallback si el navegador bloqueó el popup
   ```
3. Eliminar la llamada final a `openWhatsappUrl(url)` (queda reemplazada por lo anterior).
4. Si la validación falla antes de los `await` (schema o campos faltantes), cerrar `waTab` para no dejar pestañas vacías.

Esto preserva el user gesture, garantiza que WhatsApp abra tras un insert exitoso, y mantiene la lógica existente de guardado, geolocalización y Lead ID.

## Verificación

Reejecutar el flujo con Playwright y confirmar que:
- `pet_registrations` recibe la fila (ya confirmado 201).
- Se abre una pestaña con `wa.me/...` incluyendo el `Lead ID`.
