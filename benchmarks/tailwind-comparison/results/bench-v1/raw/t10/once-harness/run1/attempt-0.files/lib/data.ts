export type HomeType = "Apartment" | "House" | "Studio";

export interface Home {
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
}

export const SITE = {
  name: "Haven",
  tagline: "Haven, a home search site for one city",
  city: "Lisbon",
  mapStyleUrl: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  mapCenter: [-9.1393, 38.7223] as [number, number],
  currency: "EUR",
};

export const AGENT = {
  name: "Inês Carvalho",
  agency: "Haven Homes",
  phone: "+351 210 000 123",
  email: "ines@havenhomes.example",
};

/** Fixed "today" so the "new" badge renders identically on server and client. */
export const REFERENCE_DATE = "2026-11-02";

export const HOMES: Home[] = [
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
];

export function getHome(id: string): Home | undefined {
  return HOMES.find((h) => h.id === id);
}

const priceFmt = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: SITE.currency,
  maximumFractionDigits: 0,
});

export function formatPrice(n: number): string {
  return priceFmt.format(n);
}

/** Compact price for map markers: €485k, €1.45M */
export function formatPriceShort(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `€${Number.isInteger(m) ? m : m.toFixed(2).replace(/0$/, "")}M`;
  }
  return `€${Math.round(n / 1000)}k`;
}

export function bedsLabel(beds: number): string {
  return beds === 0 ? "Studio" : `${beds} bed${beds === 1 ? "" : "s"}`;
}

export function bathsLabel(baths: number): string {
  return `${baths} bath${baths === 1 ? "" : "s"}`;
}

const DAY = 86_400_000;

export function daysSinceListed(listed: string): number {
  return Math.floor((Date.parse(REFERENCE_DATE) - Date.parse(listed)) / DAY);
}

export function isNew(home: Home): boolean {
  const d = daysSinceListed(home.listed);
  return d >= 0 && d <= 7;
}

export function formatListed(listed: string): string {
  const d = daysSinceListed(listed);
  if (d <= 0) return "Listed today";
  if (d === 1) return "Listed yesterday";
  return `Listed ${d} days ago`;
}

export type SortKey = "newest" | "price-asc" | "price-desc" | "size";

export interface Filters {
  type: "any" | HomeType;
  minPrice: number; // 0 = no minimum
  maxPrice: number; // 0 = no maximum
  minBeds: number; // 0 = any
  sort: SortKey;
}

export const DEFAULT_FILTERS: Filters = {
  type: "any",
  minPrice: 0,
  maxPrice: 0,
  minBeds: 0,
  sort: "newest",
};

export function applyFilters(homes: Home[], f: Filters): Home[] {
  const out = homes.filter(
    (h) =>
      (f.type === "any" || h.type === f.type) &&
      (f.minPrice === 0 || h.price >= f.minPrice) &&
      (f.maxPrice === 0 || h.price <= f.maxPrice) &&
      h.beds >= f.minBeds,
  );
  switch (f.sort) {
    case "newest":
      out.sort((a, b) => Date.parse(b.listed) - Date.parse(a.listed));
      break;
    case "price-asc":
      out.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      out.sort((a, b) => b.price - a.price);
      break;
    case "size":
      out.sort((a, b) => b.area_m2 - a.area_m2);
      break;
  }
  return out;
}
