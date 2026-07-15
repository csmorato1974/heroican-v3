export interface HeroicanRecommendationInput {
  petType?: string | null;
  size?: string | null;
  coatLength?: string | null;
  lifeStage?: string | null;
}

export interface HeroicanRecommendation {
  title: string;
  text: string;
  productName: string | null;
  productUrl: string;
}

const STORE_URL = "https://heroican.com/tienda/";

export function getHeroicanRecommendation({
  petType,
  size,
  coatLength,
  lifeStage,
}: HeroicanRecommendationInput): HeroicanRecommendation {
  const normalizedType = (petType || "").toLowerCase();
  const normalizedSize = (size || "").toLowerCase();
  const normalizedLifeStage = (lifeStage || "adulto").toLowerCase();
  const normalizedCoat = (coatLength || "").toLowerCase();

  if (normalizedType !== "perro") {
    return {
      title: "PIEL Y PELAJE",
      text: "Descubre en Heroican una opción de alimentación pensada para acompañar el bienestar de tu mascota.",
      productName: null,
      productUrl: STORE_URL,
    };
  }

  if (normalizedLifeStage === "cachorro" || normalizedLifeStage === "puppy") {
    if (normalizedSize === "grande" || normalizedSize === "mediano") {
      return {
        title: "PIEL Y PELAJE",
        text: "Para un cachorro de raza mediana o grande, Heroican Perro cachorro raza grande puede acompañar el desarrollo de su piel, pelaje y crecimiento saludable.",
        productName: "Heroican – Perro cachorro raza grande – 15 Kg",
        productUrl:
          "https://heroican.com/producto/heroican-perro-cachorro-raza-grande-15-kg/",
      };
    }
    return {
      title: "PIEL Y PELAJE",
      text: "Para un cachorro, explora la línea Heroican para encontrar una opción adecuada a su etapa de crecimiento.",
      productName: null,
      productUrl: STORE_URL,
    };
  }

  if (normalizedLifeStage === "adulto") {
    if (
      normalizedSize === "pequeño" ||
      normalizedSize === "pequeno" ||
      normalizedSize === "small"
    ) {
      return {
        title: "PIEL Y PELAJE",
        text: "Para un perro adulto de raza pequeña, Heroican Perro adulto raza pequeña puede acompañar el cuidado diario de su piel y pelaje.",
        productName: "Heroican – Perro adulto raza pequeña – 15 Kg",
        productUrl:
          "https://heroican.com/producto/heroican-perro-adulto-raza-pequena-15-kg/",
      };
    }
    if (
      normalizedSize === "grande" ||
      normalizedSize === "mediano" ||
      normalizedSize === "medium" ||
      normalizedSize === "large"
    ) {
      return {
        title: "PIEL Y PELAJE",
        text:
          normalizedCoat === "largo" || normalizedCoat === "long"
            ? "Por su pelaje abundante, Heroican Perro adulto raza grande puede acompañar su nutrición diaria y el cuidado visible del pelaje."
            : "Heroican Perro adulto raza grande puede acompañar su nutrición diaria y el bienestar visible de su piel y pelaje.",
        productName: "Heroican – Perro adulto raza grande – 15 Kg",
        productUrl:
          "https://heroican.com/producto/heroican-perro-adulto-raza-grande-15-kg/",
      };
    }
  }

  if (
    normalizedLifeStage === "senior" ||
    normalizedLifeStage === "adulto mayor"
  ) {
    return {
      title: "PIEL Y PELAJE",
      text: "En esta etapa, explora la tienda Heroican para encontrar una opción acorde a su tamaño y necesidades.",
      productName: null,
      productUrl: STORE_URL,
    };
  }

  return {
    title: "PIEL Y PELAJE",
    text: "Explora la línea Heroican y encuentra una receta alineada al tamaño y etapa de vida de tu perro para acompañar el cuidado de su piel y pelaje.",
    productName: null,
    productUrl: STORE_URL,
  };
}

/** Normaliza el PetAnalysis del backend al contrato de getHeroicanRecommendation. */
export function inferRecommendationInput(a: {
  detected_animal: string;
  size_guess: string;
  coat_length: string;
  visual_tags: string[];
  short_comment: string;
}): HeroicanRecommendationInput {
  const haystack = [
    a.detected_animal,
    a.size_guess,
    a.coat_length,
    a.short_comment,
    ...(a.visual_tags || []),
  ]
    .join(" ")
    .toLowerCase();

  const isDog =
    /\b(perro|perra|perrito|perrita|can|canino|cachorro|dog|puppy)\b/.test(
      haystack,
    );

  let size: string = a.size_guess;
  const sizeLower = (a.size_guess || "").toLowerCase();
  if (!sizeLower || sizeLower === "desconocido") {
    if (/\b(peque[nñ]o|small|mini|toy)\b/.test(haystack)) size = "pequeño";
    else if (/\b(mediano|medium)\b/.test(haystack)) size = "mediano";
    else if (/\b(grande|large|gigante|xl)\b/.test(haystack)) size = "grande";
  }

  let lifeStage = "adulto";
  if (/\b(cachorro|puppy|cría|cria)\b/.test(haystack)) lifeStage = "cachorro";
  else if (/\b(senior|adulto mayor|anciano|viejito)\b/.test(haystack))
    lifeStage = "senior";

  return {
    petType: isDog ? "perro" : a.detected_animal,
    size,
    coatLength: a.coat_length,
    lifeStage,
  };
}
