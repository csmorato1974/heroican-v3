export interface BlueprintBadge {
  code: string;
  title: string;
  body: string;
  /** Position on the photo, percentage (0-100) */
  x: number;
  y: number;
  /** Side of the card relative to the hotspot */
  side: "left" | "right";
}

export const BLUEPRINT_BADGES: BlueprintBadge[] = [
  {
    code: "F01",
    title: "Digestión",
    body: "Canela funcional con efecto carminativo: una referencia para acompañar el confort digestivo.",
    x: 50,
    y: 68,
    side: "right",
  },
  {
    code: "F02",
    title: "Fuerza y vitalidad",
    body: "Proteína de calidad para apoyar la energía diaria y el mantenimiento muscular.",
    x: 50,
    y: 82,
    side: "left",
  },
  {
    code: "F03",
    title: "Pelaje",
    body: "Aceites, vitaminas y minerales que acompañan el cuidado de un manto brillante.",
    x: 65,
    y: 40,
    side: "right",
  },
  {
    code: "F04",
    title: "Palatabilidad",
    body: "Hidrolizado enzimático de hígado de pollo para una receta especialmente sabrosa.",
    x: 50,
    y: 22,
    side: "left",
  },
];
