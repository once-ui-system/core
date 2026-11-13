```ts lib/data.ts
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

export interface Agent {
  name: string;
  agency: string;
  phone: string;
  email: string;
}

export const SITE = "Haven, a home search site for one city";
export const CITY = "Lisbon";
export const MAP_STYLE_URL = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
export const MAP_CENTER: [number, number] = [-9.1393, 38.7223];
export const CURRENCY = "EUR";

export const AGENT: Agent = {
  name: "Inês Carvalho",
  agency: "Haven Homes",
  phone: "+351 210 000 123",
  email: "ines@havenhomes.example",
};

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

/**
 * Fixed "today" for the demo data set. A constant keeps server and client
 * renders identical (no hydration mismatch) and keeps the "New" badge
 * meaningful relative to the dated listings.
 */
export const REFERENCE_DATE = "2026-10-31";

export function isNew(home: Home): boolean {
  const ref = Date.parse(`${REFERENCE_DATE}T00:00:00Z`);
  const listed = Date.parse(`${home.listed}T00:00:00Z`);
  return (ref - listed) / 86_400_000 <= 7;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPriceShort(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `€${m % 1 === 0 ? m.toFixed(0) : m.toFixed(2).replace(/0$/, "")}M`;
  }
  return `€${Math.round(value / 1000)}k`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function bedsLabel(beds: number): string {
  return beds === 0 ? "Studio" : `${beds} bed${beds === 1 ? "" : "s"}`;
}

export type SortKey = "newest" | "price-asc" | "price-desc" | "size";

export interface Filters {
  type: string; // "any" | HomeType
  price: [number, number];
  minBeds: string; // "any" | "1" | "2" | "3" | "4"
  sort: SortKey;
}

export const PRICE_MIN = 0;
export const PRICE_MAX = 1_500_000;
export const PRICE_STEP = 25_000;

export const DEFAULT_FILTERS: Filters = {
  type: "any",
  price: [PRICE_MIN, PRICE_MAX],
  minBeds: "any",
  sort: "newest",
};

export function applyFilters(homes: Home[], f: Filters): Home[] {
  const minBeds = f.minBeds === "any" ? 0 : Number(f.minBeds);
  const list = homes.filter(
    (h) =>
      (f.type === "any" || h.type === f.type) &&
      h.price >= f.price[0] &&
      h.price <= f.price[1] &&
      h.beds >= minBeds,
  );
  const sorted = [...list];
  switch (f.sort) {
    case "newest":
      sorted.sort((a, b) => b.listed.localeCompare(a.listed));
      break;
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "size":
      sorted.sort((a, b) => b.area_m2 - a.area_m2);
      break;
  }
  return sorted;
}
```

```css components/Placeholder.module.css
.root {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background: var(--ph-bg);
}

.sun {
  position: absolute;
  top: 14%;
  right: 16%;
  width: 18%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--ph-sun);
  opacity: 0.85;
}

.hill {
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 80%;
  height: 70%;
  border-radius: 50%;
  background: var(--ph-hill-a);
}

.hill2 {
  position: absolute;
  bottom: -40%;
  right: -15%;
  width: 90%;
  height: 70%;
  border-radius: 50%;
  background: var(--ph-hill-b);
}

.house {
  position: absolute;
  left: 50%;
  bottom: 14%;
  transform: translateX(-50%);
  width: 34%;
  height: 38%;
}

.body {
  position: absolute;
  inset: 38% 0 0 0;
  background: var(--ph-wall);
  border-radius: 2px;
}

.roof {
  position: absolute;
  top: 0;
  left: -8%;
  width: 116%;
  height: 42%;
  background: var(--ph-roof);
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
}

.door {
  position: absolute;
  left: 42%;
  bottom: 0;
  width: 16%;
  height: 48%;
  background: var(--ph-roof);
  border-radius: 2px 2px 0 0;
}

.window {
  position: absolute;
  top: 52%;
  width: 16%;
  height: 20%;
  background: var(--ph-sun);
  border-radius: 1px;
}

.windowL {
  left: 12%;
}

.windowR {
  right: 12%;
}
```

```tsx components/Placeholder.tsx
import type { CSSProperties } from "react";
import classes from "./Placeholder.module.css";

interface Palette {
  bg: string;
  sun: string;
  hillA: string;
  hillB: string;
  wall: string;
  roof: string;
}

const PALETTES: Palette[] = [
  { bg: "#dbeafe", sun: "#fde68a", hillA: "#86efac", hillB: "#4ade80", wall: "#fff7ed", roof: "#c2410c" },
  { bg: "#fce7f3", sun: "#fef3c7", hillA: "#c4b5fd", hillB: "#a78bfa", wall: "#ffffff", roof: "#9d174d" },
  { bg: "#ccfbf1", sun: "#fef08a", hillA: "#7dd3fc", hillB: "#38bdf8", wall: "#f8fafc", roof: "#0f766e" },
  { bg: "#fef3c7", sun: "#fffbeb", hillA: "#fdba74", hillB: "#fb923c", wall: "#fffbeb", roof: "#7c2d12" },
  { bg: "#e0e7ff", sun: "#fde68a", hillA: "#a5b4fc", hillB: "#818cf8", wall: "#f5f3ff", roof: "#3730a3" },
  { bg: "#dcfce7", sun: "#fef9c3", hillA: "#bef264", hillB: "#84cc16", wall: "#f7fee7", roof: "#365314" },
];

export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

interface PlaceholderProps {
  seed: string;
  /** Offsets the palette so gallery frames of one home differ from each other. */
  variant?: number;
}

/** A decorative, CSS-only "photo" of a home. Hidden from assistive tech. */
export function Placeholder({ seed, variant = 0 }: PlaceholderProps) {
  const p = PALETTES[(hashString(seed) + variant) % PALETTES.length];
  const style = {
    "--ph-bg": p.bg,
    "--ph-sun": p.sun,
    "--ph-hill-a": p.hillA,
    "--ph-hill-b": p.hillB,
    "--ph-wall": p.wall,
    "--ph-roof": p.roof,
  } as CSSProperties;

  return (
    <div className={classes.root} style={style} aria-hidden="true">
      <div className={classes.sun} />
      <div className={classes.hill} />
      <div className={classes.hill2} />
      <div className={classes.house}>
        <div className={classes.roof} />
        <div className={classes.body} />
        <div className={`${classes.window} ${classes.windowL}`} />
        <div className={`${classes.window} ${classes.windowR}`} />
        <div className={classes.door} />
      </div>
    </div>
  );
}
```

```css components/HomeCard.module.css
.card {
  position: relative;
  transition:
    box-shadow 150ms ease,
    border-color 150ms ease;
  border: 1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4));
  scroll-margin: 12px;
}

.card[data-active] {
  border-color: var(--mantine-color-teal-6);
  box-shadow: var(--mantine-shadow-md);
}

.card:focus-within {
  outline: 2px solid var(--mantine-color-teal-6);
  outline-offset: 2px;
}

.photo {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
}

.badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 6px;
}

.save {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
  background: light-dark(rgba(255, 255, 255, 0.92), rgba(0, 0, 0, 0.6));
}

.titleLink {
  color: inherit;
  text-decoration: none;
}

/* The whole card is clickable through the title link. */
.titleLink::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
}

.titleLink:focus-visible {
  outline: none;
}

.facts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin-top: 10px;
}

.fact {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.body {
  padding: var(--mantine-spacing-md);
}
```

```tsx components/HomeCard.tsx
"use client";

import Link from "next/link";
import { ActionIcon, Badge, Card, Text } from "@mantine/core";
import { IconBath, IconBed, IconHeart, IconHeartFilled, IconRuler2 } from "@tabler/icons-react";
import { bedsLabel, formatPrice, isNew, type Home } from "@/lib/data";
import { Placeholder } from "./Placeholder";
import classes from "./HomeCard.module.css";

interface HomeCardProps {
  home: Home;
  active: boolean;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onHover: (id: string | null) => void;
}

export function HomeCard({ home, active, saved, onToggleSave, onHover }: HomeCardProps) {
  return (
    <Card
      component="li"
      padding={0}
      radius="md"
      className={classes.card}
      data-active={active || undefined}
      data-home-id={home.id}
      onMouseEnter={() => onHover(home.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(home.id)}
      onBlur={() => onHover(null)}
    >
      <div className={classes.photo}>
        <Placeholder seed={home.id} />
        <div className={classes.badges}>
          {isNew(home) && (
            <Badge color="teal" variant="filled" size="sm">
              New
            </Badge>
          )}
          <Badge color="dark" variant="white" size="sm">
            {home.type}
          </Badge>
        </div>
        <ActionIcon
          className={classes.save}
          variant="subtle"
          color={saved ? "red" : "gray"}
          radius="xl"
          size="lg"
          aria-pressed={saved}
          aria-label={saved ? `Remove ${home.title} from saved homes` : `Save ${home.title}`}
          onClick={() => onToggleSave(home.id)}
        >
          {saved ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
        </ActionIcon>
      </div>

      <div className={classes.body}>
        <Text fz="xl" fw={700} lh={1.2}>
          {formatPrice(home.price)}
        </Text>
        <Text fw={600} mt={4} lh={1.3}>
          <Link href={`/homes/${home.id}`} className={classes.titleLink}>
            {home.title}
          </Link>
        </Text>
        <Text size="sm" c="dimmed" mt={2}>
          {home.district}, Lisbon
        </Text>

        <div className={classes.facts}>
          <Text size="sm" className={classes.fact}>
            <IconBed size={16} aria-hidden="true" />
            {bedsLabel(home.beds)}
          </Text>
          <Text size="sm" className={classes.fact}>
            <IconBath size={16} aria-hidden="true" />
            {home.baths} bath{home.baths === 1 ? "" : "s"}
          </Text>
          <Text size="sm" className={classes.fact}>
            <IconRuler2 size={16} aria-hidden="true" />
            {home.area_m2} m²
          </Text>
        </div>
      </div>
    </Card>
  );
}
```

```css components/SearchMap.module.css
.wrap {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 320px;
  background: light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-6));
}

.marker {
  display: block;
  padding: 4px 9px;
  border-radius: 999px;
  border: 1.5px solid #adb5bd;
  background: #fff;
  color: #1b1b1f;
  font: inherit;
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  transition:
    transform 120ms ease,
    background-color 120ms ease,
    color 120ms ease;
}

.marker:hover {
  background: var(--mantine-color-teal-1);
}

.marker:focus-visible {
  outline: 3px solid var(--mantine-color-blue-6);
  outline-offset: 2px;
}

.marker[data-active] {
  background: var(--mantine-color-teal-7);
  border-color: var(--mantine-color-teal-9);
  color: #fff;
  transform: scale(1.18);
}

.marker[data-saved]::before {
  content: "♥ ";
  color: var(--mantine-color-red-6);
}

.marker[data-active][data-saved]::before {
  color: #fff;
}

.popupCard {
  width: 220px;
  color: #1b1b1f;
}

.popupPhoto {
  position: relative;
  height: 96px;
  overflow: hidden;
}

.popupBody {
  padding: 10px 12px 12px;
}

.popupLink {
  display: inline-block;
  margin-top: 6px;
  color: var(--mantine-color-teal-8);
  font-weight: 600;
  font-size: 13px;
  text-decoration: underline;
}

.empty {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  padding: 6px 12px;
  border-radius: 999px;
  background: #fff;
  color: #1b1b1f;
  font-size: 13px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  pointer-events: none;
}

.wrap :global(.maplibregl-popup-content) {
  padding: 0;
  border-radius: 10px;
  overflow: hidden;
}

.wrap :global(.maplibregl-popup-close-button) {
  width: 28px;
  height: 28px;
  font-size: 20px;
  line-height: 1;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0 0 0 8px;
  color: #1b1b1f;
}
```

```tsx components/SearchMap.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Map, { Marker, NavigationControl, Popup, type MapRef } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { Text } from "@mantine/core";
import {
  MAP_CENTER,
  MAP_STYLE_URL,
  bedsLabel,
  formatPrice,
  formatPriceShort,
  type Home,
} from "@/lib/data";
import { Placeholder } from "./Placeholder";
import classes from "./SearchMap.module.css";

interface SearchMapProps {
  homes: Home[];
  hoveredId: string | null;
  selectedId: string | null;
  savedIds: ReadonlySet<string>;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  /** Changes whenever the map container may have changed size (e.g. mobile view toggle). */
  resizeKey: string;
}

export default function SearchMap({
  homes,
  hoveredId,
  selectedId,
  savedIds,
  onHover,
  onSelect,
  resizeKey,
}: SearchMapProps) {
  const mapRef = useRef<MapRef | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => mapRef.current?.resize(), 50);
    return () => window.clearTimeout(id);
  }, [resizeKey]);

  const selected = useMemo(
    () => homes.find((h) => h.id === selectedId) ?? null,
    [homes, selectedId],
  );

  return (
    <div className={classes.wrap}>
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        initialViewState={{ longitude: MAP_CENTER[0], latitude: MAP_CENTER[1], zoom: 11.6 }}
        mapStyle={MAP_STYLE_URL}
        style={{ width: "100%", height: "100%" }}
        attributionControl={{ compact: true }}
        onClick={() => onSelect(null)}
        reuseMaps={false}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {homes.map((home) => {
          const active = hoveredId === home.id || selectedId === home.id;
          const isSaved = savedIds.has(home.id);
          return (
            <Marker
              key={home.id}
              longitude={home.lng}
              latitude={home.lat}
              anchor="bottom"
              style={{ zIndex: active ? 10 : 1 }}
            >
              <button
                type="button"
                className={classes.marker}
                data-active={active || undefined}
                data-saved={isSaved || undefined}
                aria-label={`${formatPrice(home.price)}, ${home.title}, ${home.district}${
                  isSaved ? ", saved" : ""
                }`}
                onMouseEnter={() => onHover(home.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(home.id)}
                onBlur={() => onHover(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(home.id);
                }}
              >
                {formatPriceShort(home.price)}
              </button>
            </Marker>
          );
        })}

        {selected && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="bottom"
            offset={34}
            closeOnClick={false}
            maxWidth="240px"
            onClose={() => onSelect(null)}
          >
            <div className={classes.popupCard} role="group" aria-label={selected.title}>
              <div className={classes.popupPhoto}>
                <Placeholder seed={selected.id} />
              </div>
              <div className={classes.popupBody}>
                <Text fw={700} fz="md" lh={1.2}>
                  {formatPrice(selected.price)}
                </Text>
                <Text fz="sm" fw={600} lh={1.3} mt={2}>
                  {selected.title}
                </Text>
                <Text fz="xs" c="dimmed" mt={2}>
                  {bedsLabel(selected.beds)} · {selected.baths} bath
                  {selected.baths === 1 ? "" : "s"} · {selected.area_m2} m² · {selected.district}
                </Text>
                <Link href={`/homes/${selected.id}`} className={classes.popupLink}>
                  View home
                </Link>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {homes.length === 0 && <div className={classes.empty}>No homes match these filters</div>}
    </div>
  );
}
```

```css components/SearchPage.module.css
.page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.header {
  border-bottom: 1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4));
  background: var(--mantine-color-body);
}

.headerInner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mantine-spacing-md);
  padding: 10px var(--mantine-spacing-md);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--mantine-color-teal-8);
  font-weight: 800;
  font-size: 1.25rem;
  text-decoration: none;
}

.visuallyHidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.main {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.filters {
  padding: var(--mantine-spacing-sm) var(--mantine-spacing-md);
  border-bottom: 1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4));
  background: light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7));
}

.filterGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--mantine-spacing-sm) var(--mantine-spacing-md);
  align-items: end;
}

.priceField {
  grid-column: 1 / -1;
}

@media (min-width: 62em) {
  .filterGrid {
    grid-template-columns: 160px minmax(260px, 1fr) 150px 190px auto;
  }

  .priceField {
    grid-column: auto;
  }
}

.body {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  min-height: 0;
}

.listPane {
  padding: var(--mantine-spacing-md);
  min-width: 0;
}

.mapPane {
  min-width: 0;
  height: calc(100dvh - 260px);
  min-height: 380px;
}

/* Phones & small tablets: list and map are two views. */
@media (max-width: 61.99em) {
  .body[data-view="list"] .mapPane {
    display: none;
  }

  .body[data-view="map"] .listPane {
    display: none;
  }

  .toggleBar {
    position: sticky;
    bottom: 0;
    z-index: 20;
    display: flex;
    justify-content: center;
    padding: 10px;
    pointer-events: none;
  }

  .toggleBar > * {
    pointer-events: auto;
    box-shadow: var(--mantine-shadow-lg);
  }
}

@media (min-width: 62em) {
  .body {
    grid-template-columns: minmax(420px, 46%) 1fr;
    height: calc(100dvh - 175px);
    min-height: 520px;
  }

  .listPane {
    overflow-y: auto;
    height: 100%;
  }

  .mapPane {
    height: 100%;
  }

  .toggleBar {
    display: none;
  }
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--mantine-spacing-md);
}

@media (min-width: 36em) and (max-width: 61.99em) {
  .list {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 90em) {
  .list {
    grid-template-columns: 1fr 1fr;
  }
}

.emptyState {
  padding: var(--mantine-spacing-xl);
  text-align: center;
  border: 1px dashed light-dark(var(--mantine-color-gray-4), var(--mantine-color-dark-3));
  border-radius: var(--mantine-radius-md);
}
```

```tsx components/SearchPage.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button, Group, NativeSelect, RangeSlider, Skeleton, Text, Title } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconHome2, IconList, IconMap2, IconRefresh } from "@tabler/icons-react";
import {
  CITY,
  DEFAULT_FILTERS,
  HOMES,
  PRICE_MAX,
  PRICE_MIN,
  PRICE_STEP,
  applyFilters,
  formatPrice,
  formatPriceShort,
  type Filters,
  type SortKey,
} from "@/lib/data";
import { HomeCard } from "./HomeCard";
import classes from "./SearchPage.module.css";

const SearchMap = dynamic(() => import("./SearchMap"), {
  ssr: false,
  loading: () => <Skeleton h="100%" mih={320} radius={0} aria-label="Loading map" />,
});

const TYPE_OPTIONS = [
  { value: "any", label: "Any type" },
  { value: "Apartment", label: "Apartment" },
  { value: "House", label: "House" },
  { value: "Studio", label: "Studio" },
];

const BED_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "size", label: "Size: largest first" },
];

export function SearchPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const listRef = useRef<HTMLElement | null>(null);
  const [saved, setSaved] = useLocalStorage<string[]>({
    key: "haven-saved-homes",
    defaultValue: [],
    getInitialValueInEffect: true,
  });

  const savedSet = useMemo(() => new Set(saved), [saved]);
  const results = useMemo(() => applyFilters(HOMES, filters), [filters]);

  // Drop hover/selection of homes that the filters have removed.
  useEffect(() => {
    if (hoveredId && !results.some((h) => h.id === hoveredId)) setHoveredId(null);
    if (selectedId && !results.some((h) => h.id === selectedId)) setSelectedId(null);
  }, [results, hoveredId, selectedId]);

  // When a marker is hovered/selected, make sure its card is visible in the list pane (desktop).
  useEffect(() => {
    const id = selectedId ?? hoveredId;
    const pane = listRef.current;
    if (!id || !pane || pane.offsetParent === null) return;
    const card = pane.querySelector<HTMLElement>(`[data-home-id="${id}"]`);
    if (!card) return;
    const paneRect = pane.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    if (cardRect.top < paneRect.top || cardRect.bottom > paneRect.bottom) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      card.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
    }
  }, [hoveredId, selectedId]);

  const toggleSave = useCallback(
    (id: string) => {
      setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    },
    [setSaved],
  );

  const update = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const isDefault =
    filters.type === DEFAULT_FILTERS.type &&
    filters.minBeds === DEFAULT_FILTERS.minBeds &&
    filters.sort === DEFAULT_FILTERS.sort &&
    filters.price[0] === PRICE_MIN &&
    filters.price[1] === PRICE_MAX;

  const countLabel = `${results.length} ${results.length === 1 ? "home" : "homes"} for sale in ${CITY}`;

  return (
    <div className={classes.page}>
      <header className={classes.header}>
        <div className={classes.headerInner}>
          <Link href="/" className={classes.brand}>
            <IconHome2 size={26} aria-hidden="true" />
            Haven
          </Link>
          <Text size="sm" c="dimmed" visibleFrom="sm">
            Homes for sale in {CITY}
          </Text>
          <Text size="sm" fw={600} aria-live="polite">
            {saved.length} saved
          </Text>
        </div>
      </header>

      <main className={classes.main}>
        <h1 className={classes.visuallyHidden}>Search homes in {CITY}</h1>

        <form
          className={classes.filters}
          role="search"
          aria-label="Filter homes"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className={classes.filterGrid}>
            <NativeSelect
              label="Type"
              data={TYPE_OPTIONS}
              value={filters.type}
              onChange={(e) => update("type", e.currentTarget.value)}
            />

            <div className={classes.priceField} role="group" aria-labelledby="price-label">
              <Group justify="space-between" mb={4} gap="xs">
                <Text id="price-label" size="sm" fw={500}>
                  Price range
                </Text>
                <Text size="sm" c="dimmed" aria-hidden="true">
                  {formatPrice(filters.price[0])} – {formatPrice(filters.price[1])}
                  {filters.price[1] === PRICE_MAX ? "+" : ""}
                </Text>
              </Group>
              <RangeSlider
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                minRange={PRICE_STEP}
                color="teal"
                value={filters.price}
                onChange={(v) => update("price", v)}
                label={(v) => formatPriceShort(v)}
                thumbFromLabel="Minimum price"
                thumbToLabel="Maximum price"
                thumbValueText={(v) => formatPrice(v)}
                mb={6}
                mt={10}
              />
            </div>

            <NativeSelect
              label="Min. bedrooms"
              data={BED_OPTIONS}
              value={filters.minBeds}
              onChange={(e) => update("minBeds", e.currentTarget.value)}
            />

            <NativeSelect
              label="Sort by"
              data={SORT_OPTIONS}
              value={filters.sort}
              onChange={(e) => update("sort", e.currentTarget.value as SortKey)}
            />

            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconRefresh size={16} aria-hidden="true" />}
              disabled={isDefault}
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              Reset
            </Button>
          </div>
        </form>

        <div className={classes.body} data-view={view}>
          <section ref={listRef} className={classes.listPane} aria-labelledby="results-heading">
            <Title order={2} fz="lg" id="results-heading" mb="md" aria-live="polite">
              {countLabel}
            </Title>

            {results.length > 0 ? (
              <ul className={classes.list}>
                {results.map((home) => (
                  <HomeCard
                    key={home.id}
                    home={home}
                    active={hoveredId === home.id || selectedId === home.id}
                    saved={savedSet.has(home.id)}
                    onToggleSave={toggleSave}
                    onHover={setHoveredId}
                  />
                ))}
              </ul>
            ) : (
              <div className={classes.emptyState}>
                <Text fw={600}>No homes match your filters</Text>
                <Text size="sm" c="dimmed" mt={4} mb="md">
                  Try widening the price range or lowering the minimum bedrooms.
                </Text>
                <Button variant="light" color="teal" onClick={() => setFilters(DEFAULT_FILTERS)}>
                  Clear filters
                </Button>
              </div>
            )}
          </section>

          <section className={classes.mapPane} aria-label={`Map of homes in ${CITY}`}>
            <SearchMap
              homes={results}
              hoveredId={hoveredId}
              selectedId={selectedId}
              savedIds={savedSet}
              onHover={setHoveredId}
              onSelect={setSelectedId}
              resizeKey={view}
            />
          </section>
        </div>

        <div className={classes.toggleBar}>
          <Button
            radius="xl"
            size="md"
            color="dark"
            leftSection={
              view === "list" ? (
                <IconMap2 size={18} aria-hidden="true" />
              ) : (
                <IconList size={18} aria-hidden="true" />
              )
            }
            onClick={() => setView((v) => (v === "list" ? "map" : "list"))}
          >
            {view === "list" ? "Show map" : "Show list"}
          </Button>
        </div>
      </main>
    </div>
  );
}
```

```css components/DetailMap.module.css
.wrap {
  width: 100%;
  height: 100%;
  min-height: 260px;
  border-radius: var(--mantine-radius-md);
  overflow: hidden;
  border: 1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4));
}

.pin {
  display: block;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--mantine-color-teal-7);
  border: 2px solid #fff;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.35);
}
```

```tsx components/DetailMap.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { MAP_STYLE_URL, formatPriceShort, type Home } from "@/lib/data";
import classes from "./DetailMap.module.css";

export default function DetailMap({ home }: { home: Home }) {
  return (
    <div className={classes.wrap}>
      <Map
        mapLib={maplibregl}
        initialViewState={{ longitude: home.lng, latitude: home.lat, zoom: 13.5 }}
        mapStyle={MAP_STYLE_URL}
        style={{ width: "100%", height: "100%", minHeight: 260 }}
        attributionControl={{ compact: true }}
        reuseMaps={false}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <Marker longitude={home.lng} latitude={home.lat} anchor="bottom">
          <span className={classes.pin} role="img" aria-label={`${home.title} location in ${home.district}`}>
            {formatPriceShort(home.price)}
          </span>
        </Marker>
      </Map>
    </div>
  );
}
```

```tsx components/ContactForm.tsx
"use client";

import { useState } from "react";
import { Alert, Button, Paper, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconSend } from "@tabler/icons-react";
import { AGENT, type Home } from "@/lib/data";

interface ContactValues {
  name: string;
  email: string;
  message: string;
}

export function ContactForm({ home }: { home: Home }) {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<ContactValues>({
    mode: "controlled",
    initialValues: {
      name: "",
      email: "",
      message: `Hello ${AGENT.name.split(" ")[0]}, I would like to arrange a viewing of "${home.title}" in ${home.district}.`,
    },
    validate: {
      name: (v) => (v.trim().length < 2 ? "Please enter your name" : null),
      email: (v) =>
        v.trim().length === 0
          ? "Please enter your email address"
          : /^\S+@\S+\.\S+$/.test(v.trim())
            ? null
            : "Enter a valid email address, like name@example.com",
      message: (v) => (v.trim().length < 10 ? "Please write a message of at least 10 characters" : null),
    },
  });

  return (
    <Paper withBorder radius="md" p="lg" component="section" aria-labelledby="contact-heading">
      <Title order={2} fz="lg" id="contact-heading">
        Contact {AGENT.name}
      </Title>
      <Text size="sm" c="dimmed" mt={2} mb="md">
        {AGENT.agency} · {AGENT.phone}
      </Text>

      {sentTo ? (
        <Alert color="teal" icon={<IconCheck size={18} />} title="Message sent" role="status">
          Thanks, {sentTo}. {AGENT.name} will reply to you within one working day.
          <div>
            <Button mt="sm" size="xs" variant="light" color="teal" onClick={() => setSentTo(null)}>
              Send another message
            </Button>
          </div>
        </Alert>
      ) : (
        <form
          noValidate
          onSubmit={form.onSubmit((values) => {
            setSentTo(values.name.trim());
            form.reset();
          })}
        >
          <Stack gap="sm">
            <TextInput
              label="Name"
              placeholder="Your full name"
              autoComplete="name"
              required
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              required
              {...form.getInputProps("email")}
            />
            <Textarea label="Message" autosize minRows={4} required {...form.getInputProps("message")} />
            <Button type="submit" color="teal" leftSection={<IconSend size={16} aria-hidden="true" />}>
              Send message
            </Button>
          </Stack>
        </form>
      )}
    </Paper>
  );
}
```

```css components/HomeDetail.module.css
.header {
  border-bottom: 1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4));
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--mantine-color-teal-8);
  font-weight: 800;
  font-size: 1.25rem;
  text-decoration: none;
}

.gallery {
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 150px 150px;
  border-radius: var(--mantine-radius-md);
  overflow: hidden;
}

.galleryMain {
  grid-column: 1 / -1;
  grid-row: 1 / 2;
}

.galleryItem {
  position: relative;
  overflow: hidden;
  min-width: 0;
}

.galleryLabel {
  position: absolute;
  left: 8px;
  bottom: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 12px;
}

.galleryItemHidden {
  display: none;
}

@media (min-width: 48em) {
  .gallery {
    grid-template-columns: 2fr 1fr 1fr;
    grid-template-rows: 190px 190px;
  }

  .galleryMain {
    grid-column: 1 / 2;
    grid-row: 1 / 3;
  }

  .galleryItemHidden {
    display: block;
  }
}

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--mantine-spacing-xl);
  align-items: start;
  margin-top: var(--mantine-spacing-xl);
}

@media (min-width: 62em) {
  .layout {
    grid-template-columns: minmax(0, 1fr) 380px;
  }

  .aside {
    position: sticky;
    top: 16px;
  }
}

.facts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--mantine-spacing-sm);
  margin: 0;
}

@media (min-width: 36em) {
  .facts {
    grid-template-columns: repeat(4, 1fr);
  }
}

.fact {
  padding: var(--mantine-spacing-sm);
  border-radius: var(--mantine-radius-md);
  border: 1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4));
}

.fact dt {
  font-size: var(--mantine-font-size-xs);
  color: var(--mantine-color-dimmed);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.fact dd {
  margin: 2px 0 0;
  font-weight: 700;
  font-size: var(--mantine-font-size-lg);
}

.features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
}

.features li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.energy {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.energyStep {
  min-width: 44px;
  padding: 6px 10px;
  text-align: center;
  border-radius: 6px;
  font-weight: 700;
  color: #14213d;
  opacity: 0.6;
}

.energyStep[data-current] {
  opacity: 1;
  outline: 3px solid #14213d;
  outline-offset: 2px;
}

.mapBox {
  height: 280px;
}
```

```tsx components/HomeDetail.tsx
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ActionIcon,
  Anchor,
  Badge,
  Breadcrumbs,
  Container,
  Group,
  Skeleton,
  Text,
  Title,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconCheck, IconHeart, IconHeartFilled, IconHome2 } from "@tabler/icons-react";
import { AGENT, CITY, bedsLabel, formatDate, formatPrice, isNew, type Home } from "@/lib/data";
import { ContactForm } from "./ContactForm";
import { Placeholder } from "./Placeholder";
import classes from "./HomeDetail.module.css";

const DetailMap = dynamic(() => import("./DetailMap"), {
  ssr: false,
  loading: () => <Skeleton h={280} radius="md" aria-label="Loading map" />,
});

const ENERGY_SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const ENERGY_COLORS: Record<string, string> = {
  "A+": "#2f9e44",
  A: "#51cf66",
  B: "#94d82d",
  C: "#ffe066",
  D: "#ffc078",
  E: "#ff922b",
  F: "#fa5252",
};

const FRAMES = ["Living room", "Kitchen", "Bedroom", "Bathroom", "Exterior"];

export function HomeDetail({ home }: { home: Home }) {
  const [saved, setSaved] = useLocalStorage<string[]>({
    key: "haven-saved-homes",
    defaultValue: [],
    getInitialValueInEffect: true,
  });
  const isSaved = saved.includes(home.id);
  const toggleSave = () =>
    setSaved((prev) => (prev.includes(home.id) ? prev.filter((x) => x !== home.id) : [...prev, home.id]));

  const facts: { label: string; value: string }[] = [
    { label: "Bedrooms", value: home.beds === 0 ? "Studio" : String(home.beds) },
    { label: "Bathrooms", value: String(home.baths) },
    { label: "Area", value: `${home.area_m2} m²` },
    { label: "Built", value: String(home.year) },
  ];

  return (
    <>
      <header className={classes.header}>
        <Container size="lg" py="sm">
          <Group justify="space-between">
            <Link href="/" className={classes.brand}>
              <IconHome2 size={26} aria-hidden="true" />
              Haven
            </Link>
            <Text size="sm" c="dimmed" visibleFrom="sm">
              Homes for sale in {CITY}
            </Text>
          </Group>
        </Container>
      </header>

      <Container component="main" size="lg" py="lg">
        <Breadcrumbs mb="md">
          <Anchor component={Link} href="/" size="sm">
            Search
          </Anchor>
          <Text size="sm" aria-current="page">
            {home.title}
          </Text>
        </Breadcrumbs>

        <div className={classes.gallery} role="group" aria-label="Photo gallery">
          {FRAMES.map((label, i) => (
            <div
              key={label}
              className={`${classes.galleryItem} ${i === 0 ? classes.galleryMain : ""} ${
                i > 2 ? classes.galleryItemHidden : ""
              }`}
              role="img"
              aria-label={`Placeholder photo ${i + 1} of ${FRAMES.length}: ${label}`}
            >
              <Placeholder seed={home.id} variant={i} />
              <span className={classes.galleryLabel}>{label}</span>
            </div>
          ))}
        </div>

        <div className={classes.layout}>
          <div>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <div>
                <Group gap="xs" mb={6}>
                  <Badge color="teal" variant="light">
                    {home.type}
                  </Badge>
                  {isNew(home) && <Badge color="teal">New</Badge>}
                </Group>
                <Title order={1} fz={{ base: 26, sm: 32 }} lh={1.15}>
                  {formatPrice(home.price)}
                </Title>
                <Text fz="lg" fw={600} mt={4}>
                  {home.title}
                </Text>
                <Text c="dimmed">
                  {home.district}, {CITY} · Listed {formatDate(home.listed)}
                </Text>
              </div>
              <ActionIcon
                variant="default"
                size="xl"
                radius="xl"
                aria-pressed={isSaved}
                aria-label={isSaved ? "Remove from saved homes" : "Save this home"}
                onClick={toggleSave}
              >
                {isSaved ? (
                  <IconHeartFilled size={22} color="var(--mantine-color-red-6)" />
                ) : (
                  <IconHeart size={22} />
                )}
              </ActionIcon>
            </Group>

            <Title order={2} fz="lg" mt="xl" mb="sm" id="facts-heading">
              Key facts
            </Title>
            <dl className={classes.facts} aria-labelledby="facts-heading">
              {facts.map((f) => (
                <div key={f.label} className={classes.fact}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
            <Text size="sm" c="dimmed" mt="xs">
              {bedsLabel(home.beds)} · {Math.round(home.price / home.area_m2).toLocaleString("en-IE")} EUR per m²
            </Text>

            <Title order={2} fz="lg" mt="xl" mb="sm">
              Features
            </Title>
            <ul className={classes.features}>
              {home.features.map((feature) => (
                <li key={feature}>
                  <IconCheck size={18} color="var(--mantine-color-teal-7)" aria-hidden="true" />
                  <Text component="span">{feature}</Text>
                </li>
              ))}
            </ul>

            <Title order={2} fz="lg" mt="xl" mb="sm" id="energy-heading">
              Energy rating
            </Title>
            <ul className={classes.energy} aria-labelledby="energy-heading">
              {ENERGY_SCALE.map((grade) => (
                <li
                  key={grade}
                  className={classes.energyStep}
                  style={{ background: ENERGY_COLORS[grade] }}
                  data-current={grade === home.energy || undefined}
                  aria-current={grade === home.energy ? "true" : undefined}
                >
                  {grade}
                </li>
              ))}
            </ul>
            <Text size="sm" mt="sm">
              This home is rated <strong>{home.energy}</strong> on the energy scale (A+ is the most efficient).
            </Text>

            <Title order={2} fz="lg" mt="xl" mb="sm">
              Location
            </Title>
            <div className={classes.mapBox}>
              <DetailMap home={home} />
            </div>
            <Text size="sm" c="dimmed" mt="xs">
              {home.district}, {CITY}
            </Text>
          </div>

          <aside className={classes.aside} aria-label={`Contact ${AGENT.name}`}>
            <ContactForm home={home} />
            <Text size="xs" c="dimmed" mt="sm" ta="center">
              Or email {AGENT.email}
            </Text>
          </aside>
        </div>
      </Container>
    </>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { SearchPage } from "@/components/SearchPage";

export const metadata: Metadata = {
  title: "Haven | Homes for sale in Lisbon",
  description: "Search apartments, houses and studios for sale in Lisbon, with prices on an interactive map.",
};

export default function Page() {
  return <SearchPage />;
}
```

```tsx app/homes/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeDetail } from "@/components/HomeDetail";
import { HOMES, formatPrice, getHome } from "@/lib/data";

export function generateStaticParams() {
  return HOMES.map((home) => ({ id: home.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const home = getHome(id);
  if (!home) return { title: "Home not found | Haven" };
  return {
    title: `${home.title}, ${home.district} | Haven`,
    description: `${formatPrice(home.price)} · ${home.beds} bed · ${home.area_m2} m² in ${home.district}, Lisbon.`,
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();
  return <HomeDetail home={home} />;
}
```