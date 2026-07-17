## Problema detectado

1. **Pestaña `about:blank` visible**: abrimos `window.open("", "_blank")` sincrónicamente y luego, tras los `await` (geolocalización + insert Supabase), intentamos redirigirla con `waTab.location.href = url`. El navegador pierde la relación cross-origin y bloquea la asignación (runtime error: *"does not have permission to navigate the target frame to https://wa.me/..."*), dejando al usuario mirando `about:blank`.
2. **Geolocalización sin permiso**: `getGeolocation()` se llama después del `window.open`, ya dentro de una cadena `async`. En algunos navegadores móviles esto rompe la "user activation" y el prompt nativo nunca aparece → siempre cae a `not_requested`/`denied` silencioso.

## Plan de corrección (solo `src/components/chatbot/ChatbotPanel.tsx`)

1. **Eliminar la pestaña placeholder `about:blank`**
   - Quitar `window.open("", "_blank")` y toda la lógica de `waTab`.
   - Al terminar el guardado, navegar en la misma pestaña con `window.location.href = url`. WhatsApp Web/App maneja bien esta navegación y evita el bloqueo de popups y el error de permisos.

2. **Pedir geolocalización de forma sincrónica dentro del gesto**
   - Al hacer clic en "Generar mi 10% de descuento", si `consentLocation` está marcado, invocar `navigator.geolocation.getCurrentPosition(...)` **antes de cualquier `await`**, envuelto en una `Promise` local.
   - Hacer un `Promise.allSettled([geoPromise, insertPromise])` o esperar primero la geolocalización (con timeout corto ~8s) y luego el insert. Así el prompt de permisos aparece inmediatamente ligado al gesto del usuario.
   - Detectar `PERMISSION_DENIED`, `POSITION_UNAVAILABLE` y `TIMEOUT` con mensajes de estado claros (`granted` / `denied` / `unsupported`). Si el usuario deniega o expira, continuar el flujo sin coordenadas (no bloquear el registro).

3. **Usar el Lead ID recién generado, no el estado previo**
   - Corregir el bug donde `buildRegistrationWhatsappUrl` recibe `submittedLeadId` (aún `null` en ese tick) en vez del `clientLeadId` acabado de insertar. Pasar `leadId: clientLeadId` directamente.

4. **Feedback visual mientras se pide permiso**
   - Mantener `submitting = true` durante la solicitud de geolocalización y el insert, con el texto "Guardando..." ya existente, para que no se sienta como "delay muerto".

5. **Verificación**
   - Reproducir con Playwright: clic en CTA → confirmar que **no** aparece `about:blank`, que el insert a `pet_registrations` devuelve 201, y que la navegación final es directa a `wa.me/...` con el `Lead ID` correcto.
   - Verificar en consola que ya no aparece el error *"Failed to set the 'href' property on 'Location'"*.

### Detalles técnicos

```ts
// Pseudocódigo del nuevo submitRegistration
const geoPromise: Promise<GeoResult> = leadForm.consentLocation
  ? new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ status: "unsupported", lat: null, lng: null });
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ status: "granted", lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => resolve({ status: err.code === err.PERMISSION_DENIED ? "denied" : "not_requested", lat: null, lng: null }),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );
    })
  : Promise.resolve({ status: "not_requested", lat: null, lng: null });

const geo = await geoPromise;                       // ligado al gesto
const { error } = await supabase.from(...).insert({ ... });
if (error) { toast.error(...); setSubmitting(false); return; }

setSubmittedLeadId(clientLeadId);
setRegistrationCompleted(true);
goto("success");
window.location.href = buildRegistrationWhatsappUrl({ ..., leadId: clientLeadId });
```

Sin cambios en Supabase, validators, ni otros componentes.