
## Objetivo

Rehacer el sistema visual y el copy de la landing actual conservando su estructura funcional (Header, Hero, Beneficios, Experiencia con cámara, Productos, Footer, ChatbotPanel) para que se vea y lea como la marca oficial HEROICAN según el Brand Book. Concepto rector: **ALIMENTA TU LEALTAD**. Tono cálido, auténtico, cercano, premium accesible, orgullo local tacneño.

## 1. Sistema de diseño (src/styles.css)

Paleta corporativa exacta:
- `--background`: #FFFFFF
- `--foreground`: #000000
- `--primary` (rojo HEROICAN): #E41F32 → CTA, enlaces, acentos
- `--accent` (dorado): #C7A331 → detalles premium medidos
- `--secondary` / `--muted`: gris neutro (#F5F5F5)
- `--border`: #E6E6E6

Eliminar: gradientes (`--gradient-hero`, `--gradient-warm`), sombras pesadas (`--shadow-soft`, `--shadow-glow`), dot-pattern del body, utilidades decorativas (`neon-glow`, `pulse-glow`, `scan-line`, `hero-video-breathe`, `hero-sequence`, `scanline`, `hud-*`).

Tipografía: **Montserrat** (400/500/600i/700/800/900) cargada por `<link>` en `__root.tsx` como sustituto directo de Gilroy/Montserrat del Brand Book. Se retiran Fraunces y Nunito.

Reglas base:
- H1/H2: `font-display` peso 900 uppercase, tracking apretado, muy corto.
- Subtítulos: italic 600.
- Cuerpo: Montserrat 400/500, alineado a la izquierda.

Nuevas utilidades sobrias:
- `.brand-chip` (pill blanco, borde dorado, texto rojo italic uppercase).
- `.brand-card` (fondo blanco, borde 1px, radio 12px, sin sombra).
- `.gold-rule` (línea 1px dorada de separación editorial).
- `.italic-sub` (subtítulos italic 600 gris).

## 2. Copy nuevo

**Hero**
- H1: `ALIMENTA TU LEALTAD` ("lealtad" en rojo).
- Subtítulo italic: *Nutrición honesta hecha en Tacna, con el cariño que tu perro merece.*
- Párrafo: descubre en 60 segundos el HEROICAN ideal — fórmulas por etapa y raza, ingredientes nobles, precio justo.
- CTA rojo: "Descubre su alimento ideal".
- CTA secundario (link dorado italic): "Habla con nosotros por WhatsApp".

**Beneficios — "Por qué HEROICAN"**
Grilla editorial con número dorado 01–06, título display uppercase, descripción corta. Se retiran íconos circulares SaaS.
1. Nutrición honesta 2. Fórmulas por etapa 3. Hecho en Tacna 4. Palatabilidad real 5. Bienestar visible 6. Precio justo.

**Experiencia con cámara — "Conoce a tu compañero"**
- Subtítulo italic: *Una foto basta para orientarte.*
- CTA: "Tomar foto a mi perro".
- Microcopy dorado: "Orientativo. No reemplaza la evaluación de tu veterinario."

**Productos — "La familia HEROICAN"**
- Subtítulo italic: *Una fórmula para cada etapa, un cariño para cada hogar.*
- Cards blancas con borde, tag dorado (etapa · raza), precios en rojo display.

**Footer**
- Slogan italic: "Alimenta tu lealtad. Nutrición premium hecha en Tacna."
- Contacto, legales, microcopy: "Hecho con cariño en Tacna, Perú."

**ChatbotPanel**
- Se conserva toda la lógica (pasos, validaciones, WhatsApp, persistencia).
- Copy: botón flotante "Hola, soy HEROICAN. Encontremos su alimento ideal.", header "Asistente HEROICAN / Alimenta tu lealtad", welcome renovado.
- Reemplazo de clases `hud-*` → `brand-*`, retiro de `pulse-glow`.

## 3. Componentes a rediseñar

- **Header**: fondo blanco puro, borde inferior gris, logo horizontal, sin blur ni efectos. Tag italic dorado "Alimenta tu lealtad".
- **Hero**: dos columnas (texto / video), fondo blanco, sin parallax, sin gradiente, sin animación de respiración; chip "Hecho en Tacna" sobre el video.
- **Benefits**: 3 columnas desktop, grilla editorial con números dorados.
- **ARPreview**: fondo gris muy claro (`bg-secondary/40`), dos columnas texto + imagen del empaque con borde, sin panel con gradiente ni blur.
- **ProductsMatrix**: cards blancas planas.
- **Footer**: fondo blanco, línea superior dorada 1px, tipografía Montserrat.
- **HowItWorks**: no se toca (ya no se renderiza en `routes/index.tsx`).

## 4. Ajustes técnicos

- `src/routes/__root.tsx`: `<link>` Montserrat, actualizar meta title/description al nuevo tono ("HEROICAN · Alimenta tu lealtad"), quitar og:image obsoleta con URL de preview.
- `src/routes/index.tsx`: no requiere cambios estructurales; ya renderiza el orden correcto.
- Retirar imports no usados tras la limpieza (`hero-seq-01`, `useState/useEffect` de scrollY en Hero, íconos lucide que ya no se usan en Benefits).
- Se conservan todos los assets ya subidos (logo, video hero, empaque AR).
- Nada cambia en lógica de negocio, tracker, leads, recomendación, validators, server functions ni Supabase.

## Archivos a modificar

- `src/styles.css`
- `src/routes/__root.tsx`
- `src/routes/index.tsx` (sin cambios estructurales, verificación)
- `src/components/Header.tsx`
- `src/components/Hero.tsx`
- `src/components/Benefits.tsx`
- `src/components/ARPreview.tsx`
- `src/components/ProductsMatrix.tsx`
- `src/components/Footer.tsx`
- `src/components/chatbot/ChatbotPanel.tsx` (copy + swap `hud-*` → `brand-*`)

## Verificación

- Build (`bun run build`) sin errores.
- Preview móvil (≤ 640px): hero apilado, titular legible, video ancho completo, cards en una columna.
- Preview desktop (≥ 1024px): hero 2 col, beneficios 3 col, productos 2 col.
- Contraste AA: negro/blanco, blanco/rojo #E41F32, negro/dorado #C7A331.
- Sin sombras pesadas, gradientes, glassmorphism ni patrones de puntos.
