import type { Product } from "@/types/domain";

// Editable por el equipo comercial. Precios y URLs referenciales.
const STORE_URL = "https://heroican.com/tienda/";

export const PRODUCTS: Product[] = [
  {
    id: "adulto-grande",
    name: "Heroican Perro Adulto Raza Grande",
    lifeStage: "Adulto",
    breedSize: "Raza grande",
    presentations: [
      { sizeKg: 3, pricePen: 25 },
      { sizeKg: 15, pricePen: 115 },
      { sizeKg: 22, pricePen: 160 },
    ],
    benefits: ["Mínimo 20% de proteína", "Canela funcional", "Vitaminas y minerales"],
    ingredientsSummary:
      "Maíz, arroz, harina de carne, harina de pescado, trigo, torta de soja, aceite de pollo, hidrolizado enzimático de hígado de pollo, premezcla vitamínico mineral, canela, DL metionina.",
    storeUrl: STORE_URL,
    nutrition: {
      proteina: "20% mín.",
      grasa: "8% mín.",
      fibra: "4% máx.",
      humedad: "10% máx.",
      ceniza: "8% máx.",
      calcio: "1.2% mín.",
      fosforo: "0.9% mín.",
    },
  },
  {
    id: "adulto-pequena",
    name: "Heroican Perro Adulto Raza Pequeña",
    lifeStage: "Adulto",
    breedSize: "Raza pequeña",
    presentations: [
      { sizeKg: 3, pricePen: 25 },
      { sizeKg: 15, pricePen: 115 },
      { sizeKg: 22, pricePen: 160 },
    ],
    benefits: ["Proteína de alta digestibilidad", "Hidrolizados palatables", "Canela funcional"],
    ingredientsSummary:
      "Base nutricional con proteína animal, cereales, hidrolizados, vitaminas, minerales y canela funcional.",
    storeUrl: STORE_URL,
    nutrition: {
      proteina: "22% mín.",
      grasa: "9% mín.",
      fibra: "4% máx.",
      humedad: "10% máx.",
      ceniza: "8% máx.",
      calcio: "1.2% mín.",
      fosforo: "0.9% mín.",
    },
  },
  {
    id: "cachorro-grande",
    name: "Heroican Perro Cachorro Raza Grande",
    lifeStage: "Cachorro",
    breedSize: "Raza grande",
    presentations: [
      { sizeKg: 3, pricePen: 27 },
      { sizeKg: 15, pricePen: 120 },
    ],
    benefits: ["Soporte de crecimiento", "Leche incluida", "Canela funcional"],
    ingredientsSummary: ".",
    storeUrl: STORE_URL,
    nutrition: {
      proteina: "26% mín.",
      grasa: "12% mín.",
      fibra: "4% máx.",
      humedad: "10% máx.",
      ceniza: "8% máx.",
      calcio: "1.4% mín.",
      fosforo: "1.0% mín.",
    },
  },
  {
    id: "cachorro-pequena",
    name: "Heroican Perro Cachorro Raza Pequeña",
    lifeStage: "Cachorro",
    breedSize: "Raza pequeña",
    presentations: [
      { sizeKg: 3, pricePen: 27 },
      { sizeKg: 15, pricePen: 120 },
    ],
    benefits: ["Crecimiento saludable", "Hidrolizados palatables", "Leche incluida"],
    ingredientsSummary: "\n",
    storeUrl: STORE_URL,
    nutrition: {
      proteina: "28% mín.",
      grasa: "13% mín.",
      fibra: "4% máx.",
      humedad: "10% máx.",
      ceniza: "8% máx.",
      calcio: "1.4% mín.",
      fosforo: "1.0% mín.",
    },
  },
];
