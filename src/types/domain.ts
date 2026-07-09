export type LifeStage = "Cachorro" | "Adulto";
export type BreedSize = "Raza pequeña" | "Raza grande";
export type AgeRange = "Menos de 1 año" | "1 a 7 años" | "Más de 7 años" | "No estoy seguro";

export const NEEDS = [
  "Confort digestivo / gases",
  "Mejor aceptación del alimento",
  "Energía y vitalidad",
  "Piel y pelaje",
  "Transición desde otra marca",
  "Solo quiero asesoría",
] as const;
export type Need = (typeof NEEDS)[number];

export interface Presentation {
  sizeKg: 3 | 15 | 22;
  pricePen: number;
}

export interface Nutrition {
  proteina: string;
  grasa: string;
  fibra: string;
  humedad: string;
  ceniza: string;
  calcio: string;
  fosforo: string;
}

export interface Product {
  id: string;
  name: string;
  lifeStage: LifeStage;
  breedSize: BreedSize;
  presentations: Presentation[];
  benefits: string[];
  ingredientsSummary: string;
  storeUrl: string;
  nutrition?: Nutrition;
}

export interface QrParams {
  qr_id?: string;
  producto?: string;
  lote?: string;
  campania?: string;
  ciudad_url?: string;
}

export interface Lead {
  id: string;
  sessionId: string;
  tutorName: string;
  phone: string;
  city: string;
  petName: string;
  lifeStage: LifeStage;
  breedSize: BreedSize;
  ageRange?: AgeRange;
  needs: Need[];
  recommendedProduct: string;
  consentWhatsApp: boolean;
  consentLocation: boolean;
  locationLat?: number;
  locationLng?: number;
  createdAt: string;
  qrParams: QrParams;
}

export interface TrackedEvent {
  id: string;
  sessionId: string;
  eventName: string;
  timestamp: string;
  qrParams: QrParams;
  metadata?: Record<string, unknown>;
}

export interface SessionAnswers {
  petName?: string;
  lifeStage?: LifeStage;
  breedSize?: BreedSize;
  ageRange?: AgeRange;
  needs?: Need[];
}
