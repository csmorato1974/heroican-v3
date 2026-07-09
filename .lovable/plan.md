## Reemplazar imagen del Hero por video subido

**Archivos:**
- Subir `user-uploads://Heroican_Reel_profesional_fade_H264.mp4` como asset CDN → `src/assets/hero-reel-profesional.mp4.asset.json`
- `src/components/Hero.tsx`

**Cambios en `Hero.tsx`:**
1. Quitar el import de `heroSeq01` y el `<img>`.
2. Importar el nuevo asset de video.
3. Reemplazar el bloque de imagen por un `<video>` con `autoPlay muted loop playsInline preload="metadata"` y `poster` opcional.
4. **Mobile-first (cubre toda la pantalla):**
   - En móvil el video se muestra a ancho completo (sin el contenedor `max-w-[300px]`), con `w-full` y proporción natural, apareciendo debajo del texto.
   - Alternativa considerada: full-bleed edge-to-edge rompiendo el `max-w-6xl` → se opta por full-width dentro del contenedor para mantener consistencia; si se quiere edge-to-edge total, se saca el video del `<div className="mx-auto max-w-6xl ...">` y se coloca como bloque aparte en móvil. **Voy con full-width dentro del padding actual** para no romper la rejilla; se puede ajustar si prefieres edge-to-edge.
5. **Desktop (lateral):**
   - Mantener el grid `lg:grid-cols-[1.15fr_1fr]`, el video ocupa la columna derecha con `lg:max-w-md`, bordes redondeados, `object-cover`, aspect ratio vertical (~3/4 o 4/5) para lucir bien al lado del texto.
6. Conservar el chip "Hecho en Tacna" superpuesto.
7. Mantener `border border-border rounded-2xl overflow-hidden bg-secondary`.

**Sin cambios** en branding, tipografía, colores, otros componentes ni lógica.

**Verificación:** build + revisión visual a 390px y desktop.
