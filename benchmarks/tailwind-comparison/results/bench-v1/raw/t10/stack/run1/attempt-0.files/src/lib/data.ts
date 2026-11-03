import type { CSSProperties } from "react";

export type HomeType = "Apartment" | "House" | "Studio";

export type Home = {
  id: string;
  title: string;
  type: HomeType;
  price: number;
  beds: number;
  baths: number;
  area_m2: number;
  district: string;
  lat: number;
  lng: number;
  year: number;
  energy: string;
  features: string[];
  listed: string;
};

export const listings = {
  site: "Haven, a home search site for one city",
  city: "Lisbon",
  map_style_url: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  map_center: [-9.1393, 38.7223] as [number, number],
  currency: "EUR",
  agent: {
    name: "Inês Carvalho",
    agency: "Haven Homes",
    phone: "+351 210 000 123",
    email: "ines@havenhomes.example",
  },
  homes: [
    {
      id: "h-101",
      title: "Sunlit flat with river view",
      type: "Apartment",
      price: 485000,
      beds: 2,
      baths: 1,
      area_m2: 84,
      district: "Alfama",
      lat: 38.7114,
      lng: -9.1305,
      year: 1962,
      energy: "C",
      features: ["Balcony", "River view", "Renovated kitchen"],
      listed: "2026-10-21",
    },
    {
      id: "h-102",
      title: "Family house with garden",
      type: "House",
      price: 895000,
      beds: 4,
      baths: 3,
      area_m2: 210,
      district: "Restelo",
      lat: 38.7037,
      lng: -9.2129,
      year: 1988,
      energy: "B",
      features: ["Garden", "Garage", "Fireplace"],
      listed: "2026-10-18",
    },
    {
      id: "h-103",
      title: "Compact studio near the metro",
      type: "Studio",
      price: 219000,
      beds: 0,
      baths: 1,
      area_m2: 31,
      district: "Arroios",
      lat: 38.7316,
      lng: -9.1358,
      year: 1975,
      energy: "D",
      features: ["Metro 2 min", "Furnished"],
      listed: "2026-10-29",
    },
    {
      id: "h-104",
      title: "Loft in a converted warehouse",
      type: "Apartment",
      price: 640000,
      beds: 2,
      baths: 2,
      area_m2: 120,
      district: "Marvila",
      lat: 38.7486,
      lng: -9.1031,
      year: 2019,
      energy: "A",
      features: ["High ceilings", "Terrace", "Parking"],
      listed: "2026-10-11",
    },
    {
      id: "h-105",
      title: "Classic flat with tiled facade",
      type: "Apartment",
      price: 529000,
      beds: 3,
      baths: 2,
      area_m2: 112,
      district: "Campo de Ourique",
      lat: 38.7181,
      lng: -9.1662,
      year: 1940,
      energy: "C",
      features: ["Original tiles", "Lift", "Storage room"],
      listed: "2026-10-25",
    },
    {
      id: "h-106",
      title: "Penthouse with rooftop pool",
      type: "Apartment",
      price: 1450000,
      beds: 3,
      baths: 3,
      area_m2: 168,
      district: "Avenidas Novas",
      lat: 38.7392,
      lng: -9.1467,
      year: 2021,
      energy: "A",
      features: ["Rooftop pool", "Concierge", "2 parking spaces"],
      listed: "2026-10-02",
    },
    {
      id: "h-107",
      title: "Townhouse on a quiet lane",
      type: "House",
      price: 735000,
      beds: 3,
      baths: 2,
      area_m2: 156,
      district: "Graça",
      lat: 38.7176,
      lng: -9.1295,
      year: 1910,
      energy: "D",
      features: ["Patio", "Restored beams"],
      listed: "2026-10-27",
    },
    {
      id: "h-108",
      title: "Two-bed flat by the park",
      type: "Apartment",
      price: 412000,
      beds: 2,
      baths: 1,
      area_m2: 78,
      district: "Alvalade",
      lat: 38.753,
      lng: -9.1445,
      year: 1958,
      energy: "C",
      features: ["Park view", "Lift"],
      listed: "2026-10-30",
    },
    {
      id: "h-109",
      title: "Riverside new build",
      type: "Apartment",
      price: 780000,
      beds: 3,
      baths: 2,
      area_m2: 131,
      district: "Parque das Nações",
      lat: 38.7681,
      lng: -9.0947,
      year: 2024,
      energy: "A+",
      features: ["Gym", "Pool", "Concierge"],
      listed: "2026-10-15",
    },
    {
      id: "h-110",
      title: "Bright studio with mezzanine",
      type: "Studio",
      price: 265000,
      beds: 1,
      baths: 1,
      area_m2: 42,
      district: "Bairro Alto",
      lat: 38.7127,
      lng: -9.145,
      year: 1900,
      energy: "E",
      features: ["Mezzanine", "Central"],
      listed: "2026-10-22",
    },
    {
      id: "h-111",
      title: "Villa with sea glimpse",
      type: "House",
      price: 1290000,
      beds: 5,
      baths: 4,
      area_m2: 290,
      district: "Belém",
      lat: 38.6979,
      lng: -9.2063,
      year: 2001,
      energy: "B",
      features: ["Pool", "Garden", "Sea glimpse"],
      listed: "2026-09-30",
    },
    {
      id: "h-112",
      title: "Renovated flat near the market",
      type: "Apartment",
      price: 455000,
      beds: 2,
      baths: 2,
      area_m2: 89,
      district: "Cais do Sodré",
      lat: 38.7066,
      lng: -9.1442,
      year: 1930,
      energy: "C",
      features: ["Renovated", "Air conditioning"],
      listed: "2026-10-28",
    },
  ] as Home[],
};

/** The site's "today": fixed so server and client agree on what is new. */
export const REFERENCE_DATE = "2026-10-31";

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysSinceListed(home: Home): number {
  const ref = Date.parse(`${REFERENCE_DATE}T00:00:00Z`);
  const listed = Date.parse(`${home.listed}T00:00:00Z`);
  return Math.floor((ref - listed) / DAY_MS);
}

export function isNew(home: Home): boolean {
  return daysSinceListed(home) <= 7;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: listings.currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Short price for map markers: 485k, 1.45M. */
export function formatPriceShort(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `€${Number.isInteger(m) ? m : m.toFixed(2).replace(/0$/, "")}M`;
  }
  return `€${Math.round(value / 1000)}k`;
}

export function bedsLabel(beds: number): string {
  return beds === 0 ? "Studio" : `${beds} bed${beds === 1 ? "" : "s"}`;
}

export function getHome(id: string): Home | undefined {
  return listings.homes.find((h) => h.id === id);
}

/** Deterministic hue pair so every home gets its own CSS placeholder. */
export function placeholderStyle(seed: string, shift = 0): CSSProperties {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  const h1 = (hash + shift * 37) % 360;
  const h2 = (h1 + 48) % 360;
  return {
    background: `linear-gradient(135deg, hsl(${h1} 38% 62%) 0%, hsl(${h2} 42% 46%) 100%)`,
  };
}
