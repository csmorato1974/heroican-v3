## Plan

1. **Corregir el comportamiento del CTA final**
   - Evitar que el botón “Generar mi 10% de descuento” actúe como submit implícito de algún formulario padre o provoque refresh del modal.
   - Asegurar que los botones del asistente usen `type="button"` explícitamente.

2. **Hacer el envío más robusto**
   - Mantener la validación actual de nombre, WhatsApp, ciudad y consentimientos.
   - Si falta nombre de mascota, etapa o tamaño, mostrar un error claro en vez de “refrescar” silenciosamente.
   - Mantener la geolocalización solo cuando el checkbox opcional esté marcado al hacer clic en enviar.

3. **Asegurar guardado y WhatsApp con Lead ID**
   - Confirmar que el insert a `pet_registrations` se ejecute antes de pasar a éxito.
   - No marcar el registro como completado si el guardado falla.
   - Abrir WhatsApp solo con el Lead ID real generado para la fila insertada.

4. **Verificar el flujo completo**
   - Probar el asistente desde el inicio hasta el CTA final.
   - Confirmar que aparece una petición `pet_registrations` exitosa y que no hay refresh del modal.
   - Confirmar que WhatsApp se abre con el mensaje que incluye el Lead ID.