# Ajustes funcionales HEROICAN (mobile-first)

Conservando branding, línea gráfica y estructura general. Prioridad: móvil (375–430 px).

## 1. Precios (`src/lib/products.ts`)
- Cachorro Raza Grande → eliminar 22 kg (quedan 3 kg y 15 kg).
- Cachorro Raza Pequeña → eliminar 22 kg (quedan 3 kg y 15 kg).
- Adulto Raza Pequeña → 22 kg pasa de S/ 150.00 a **S/ 160.00**.
- Adulto Raza Grande: sin cambios.

## 2. Valores nutricionales
- `src/types/domain.ts`: agregar `Nutrition` (`proteina`, `grasa`, `fibra`, `humedad`, `ceniza`, `calcio`, `fosforo` como strings con "%") y campo opcional `nutrition` en `Product`.
- `src/lib/products.ts`: agregar bloque `nutrition` a los 4 productos con valores coherentes al brand (adulto grande 20% prot. mín., cachorros 26–28% prot. mín., etc.).
- `src/components/ProductsMatrix.tsx`: bajo la lista de precios y sobre los ingredientes, insertar bloque **"Análisis garantizado"**:
  - `gold-rule` como separador.
  - Título uppercase, tracking amplio, color acento dorado.
  - `<dl>` en grid 2 columnas con etiqueta (gris) + valor (`font-display` negro), filas separadas por borde punteado.
  - Compacto para no inflar la card en móvil.

## 3. Beneficios expandibles (`src/components/Benefits.tsx`)
- Cada ítem se convierte en acordeón independiente (`useState<string | null>`).
- Header = `<button>` con número dorado, título y a la derecha ícono `Plus` / `Minus` (lucide) dentro de un círculo con borde.
- `aria-expanded`, `aria-controls`, altura mínima táctil 44 px.
- Contenido colapsado por defecto; al expandir muestra `desc` + nuevo párrafo `long` (más detallado) por ítem.
- Conserva `border-t border-border`; sin cambios de paleta ni tipografía.
- En móvil grid de una columna, gap vertical suave para evitar saltos.

## 4. CTAs finales en chatbot (`src/components/chatbot/ChatbotPanel.tsx`, `step === "result"`)
Reemplazar el único botón por dos CTAs apilados, ambos `w-full h-11`:
1. **Comprar por Web** — primario rojo (`bg-primary`), ícono `ShoppingBag`, `href={recommended.storeUrl}`, `track("store_link_clicked", ...)`.
2. **Comprar por WhatsApp** — borde acento dorado + texto rojo (`border-2 border-accent text-primary bg-background`), ícono `MessageCircle`, usa `buildWhatsappUrl` con los datos ya recopilados, `track("whatsapp_clicked", ...)`.
Ambos dentro del mismo `brand-card` del resultado, con `gap-2`.

## Archivos a modificar
- `src/types/domain.ts`
- `src/lib/products.ts`
- `src/components/ProductsMatrix.tsx`
- `src/components/Benefits.tsx`
- `src/components/chatbot/ChatbotPanel.tsx`

## Verificación
- Build limpio.
- Cachorros: 2 filas de precios; Adulto Pequeña 22 kg = S/ 160.00.
- Cards de producto con bloque de nutrición legible en móvil.
- Beneficios: toggle abre/cierra, ícono cambia, sin overflow.
- Chatbot result: ambos CTAs visibles, táctiles, sin apretarse.
- Sin overflow horizontal ni cortes de texto en 375 px.

## Fuera de alcance
- Sin cambios de branding, tipografía, paleta ni estructura de secciones.
- Sin cambios en lógica de recomendación, leads, tracking ni backend.
