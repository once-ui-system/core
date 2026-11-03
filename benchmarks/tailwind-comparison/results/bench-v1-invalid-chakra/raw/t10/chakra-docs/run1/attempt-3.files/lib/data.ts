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

export const SITE = "Haven, a home search site for one city";
export const CITY = "Lisbon";
export const MAP_STYLE_URL =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
export const MAP_CENTER: [number, number] = [-9.1393, 38.7223];
export const CURRENCY = "EUR";

export const AGENT = {
  name: "Inês Carvalho",
  agency: "Haven Homes",
  phone: "+351 210 000 123",
  email: "ines@havenhomes.example",
};

export const HOMES: Home[] = [
  { id: "h-101", title: "Sunlit flat with river view", type: "Apartment", price: 485000, beds: 2, baths: 1, area_m2: 84, district: "Alfama", lat: 38.7114, lng: -9.1305, year: 1962, energy: "C", features: ["Balcony", "River view", "Renovated kitchen"], listed: "2026-10-21" },
  { id: "h-102", title: "Family house with garden", type: "House", price: 895000, beds: 4, baths: 3, area_m2: 210, district: "Restelo", lat: 38.7037, lng: -9.2129, year: 1988, energy: "B", features: ["Garden", "Garage", "Fireplace"], listed: "2026-10-18" },
  { id: "h-103", title: "Compact studio near the metro", type: "Studio", price: 219000, beds: 0, baths: 1, area_m2: 31, district: "Arroios", lat: 38.7316, lng: -9.1358, year: 1975, energy: "D", features: ["Metro 2 min", "Furnished"], listed: "2026-10-29" },
  { id: "h-104", title: "Loft in a converted warehouse", type: "Apartment", price: 640000, beds: 2, baths: 2, area_m2: 120, district: "Marvila", lat: 38.7486, lng: -9.1031, year: 2019, energy: "A", features: ["High ceilings", "Terrace", "Parking"], listed: "2026-10-11" },
  { id: "h-105", title: "Classic flat with tiled facade", type: "Apartment", price: 529000, beds: 3, baths: 2, area_m2: 112, district: "Campo de Ourique", lat: 38.7181, lng: -9.1662, year: 1940, energy: "C", features: ["Original tiles", "Lift", "Storage room"], listed: "2026-10-25" },
  { id: "h-106", title: "Penthouse with rooftop pool", type: "Apartment", price: 1450000, beds: 3, baths: 3, area_m2: 168, district: "Avenidas Novas", lat: 38.7392, lng: -9.1467, year: 2021, energy: "A", features: ["Rooftop pool", "Concierge", "2 parking spaces"], listed: "2026-10-02" },
  { id: "h-107", title: "Townhouse on a quiet lane", type: "House", price: 735000, beds: 3, baths: 2, area_m2: 156, district: "Graça", lat: 38.7176, lng: -9.1295, year: 1910, energy: "D", features: ["Patio", "Restored beams"], listed: "2026-10-27" },
  { id: "h-108", title: "Two-bed flat by the park", type: "Apartment", price: 412000, beds: 2, baths: 1, area_m2: 78, district: "Alvalade", lat: 38.753, lng: -9.1445, year: 1958, energy: "C", features: ["Park view", "Lift"], listed: "2026-10-30" },
  { id: "h-109", title: "Riverside new build", type: "Apartment", price: 780000, beds: 3, baths: 2, area_m2: 131, district: "Parque das Nações", lat: 38.7681, lng: -9.0947, year: 2024, energy: "A+", features: ["Gym", "Pool", "Concierge"], listed: "2026-10-15" },
  { id: "h-110", title: "Bright studio with mezzanine", type: "Studio", price: 265000, beds: 1, baths: 1, area_m2: 42, district: "Bairro Alto", lat: 38.7127, lng: -9.145, year: 1900, energy: "E", features: ["Mezzanine", "Central"], listed: "2026-10-22" },
  { id: "h-111", title: "Villa with sea glimpse", type: "House", price: 1290000, beds: 5, baths: 4, area_m2: 290, district: "Belém", lat: 38.6979, lng: -9.2063, year: 2001, energy: "B", features: ["Pool", "Garden", "Sea glimpse"], listed: "2026-09-30" },
  { id: "h-112", title: "Renovated flat near the market", type: "Apartment", price: 455000, beds: 2, baths: 2, area_m2: 89, district: "Cais do Sodré", lat: 38.7066, lng: -9.1442, year: 1930, energy: "C", features: ["Renovated", "Air conditioning"], listed: "2026-10-28" },
];

/** Fixed reference date so "new" badges are deterministic on server and client. */
export const TODAY = "2026-10-31";

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysSinceListed(home: Home): number {
  return Math.round((Date.parse(TODAY) - Date.parse(home.listed)) / DAY_MS);
}

export function isNewListing(home: Home): boolean {
  return daysSinceListed(home) <= 7;
}

/** Deterministic thousands grouping (no Intl, so server and client agree). */
function groupDigits(value: number): string {
  const digits = String(Math.round(value));
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ",";
    out += digits[i];
  }
  return out;
}

export function formatPrice(value: number): string {
  return `€${groupDigits(value)}`;
}

export function formatPriceShort(value: number): string {
  if (value >= 1_000_000) {
    const m = Math.round(value / 10_000) / 100;
    return `€${m}M`;
  }
  return `€${Math.round(value / 1000)}k`;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function bedsLabel(beds: number): string {
  return beds === 0 ? "Studio" : `${beds} bed${beds === 1 ? "" : "s"}`;
}

export function getHome(id: string): Home | undefined {
  return HOMES.find((h) => h.id === id);
}

export type SortKey = "newest" | "price-asc" | "price-desc" | "size-desc";

export interface Filters {
  type: "any" | HomeType;
  minPrice: number; // 0 = no min
  maxPrice: number; // 0 = no max
  minBeds: number;
  sort: SortKey;
}

export const DEFAULT_FILTERS: Filters = {
  type: "any",
  minPrice: 0,
  maxPrice: 0,
  minBeds: 0,
  sort: "newest",
};

export const PRICE_STEPS = [
  200000, 300000, 400000, 500000, 600000, 800000, 1000000, 1500000,
];

export function applyFilters(homes: Home[], f: Filters): Home[] {
  const out = homes.filter((h) => {
    if (f.type !== "any" && h.type !== f.type) return false;
    if (f.minPrice > 0 && h.price < f.minPrice) return false;
    if (f.maxPrice > 0 && h.price > f.maxPrice) return false;
    if (h.beds < f.minBeds) return false;
    return true;
  });
  out.sort((a, b) => {
    switch (f.sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "size-desc":
        return b.area_m2 - a.area_m2;
      case "newest":
      default:
        return Date.parse(b.listed) - Date.parse(a.listed);
    }
  });
  return out;
}
