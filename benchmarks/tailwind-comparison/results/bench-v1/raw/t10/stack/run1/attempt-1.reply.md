The errors say that `SearchPage`, `MiniMapLoader` and `Placeholder` can't be found, so those files weren't picked up. I'll resend every file with its full path on the opening line of each block.

Two fixes beyond the missing files: `HomeDetail` is a server component that uses `Grid` with a `m={{ columns: 4 }}` prop, which I've replaced with a plain CSS grid. `Placeholder` now carries `"use client"`-free markup but imports its CSS, so it works in both server and client trees.

```ts src/lib/data.ts
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
```

```css src/components/haven/haven.css
.haven-ph {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}
.haven-ph::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)) 18% 62% / 22% 3% no-repeat,
    linear-gradient(rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.16)) 14% 100% / 34% 46% no-repeat,
    linear-gradient(rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0.24)) 52% 100% / 26% 64% no-repeat,
    linear-gradient(rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12)) 84% 100% / 24% 38% no-repeat;
}
.haven-ph::after {
  content: "";
  position: absolute;
  width: 22%;
  aspect-ratio: 1;
  border-radius: 50%;
  right: 12%;
  top: 14%;
  background: rgba(255, 255, 255, 0.55);
}

.haven-card {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-l);
  border: 1px solid var(--neutral-alpha-weak);
  background: var(--surface-background);
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}
.haven-card[data-active="true"] {
  border-color: var(--brand-solid-strong);
  box-shadow: 0 0 0 2px var(--brand-alpha-medium), 0 8px 24px rgba(0, 0, 0, 0.12);
}
.haven-card__link {
  color: inherit;
  text-decoration: none;
}
.haven-card__link::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
}
.haven-card__link:focus-visible {
  outline: none;
}
.haven-card:has(.haven-card__link:focus-visible) {
  outline: 2px solid var(--brand-solid-strong);
  outline-offset: 2px;
}
.haven-card__save {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.haven-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.haven-field > label {
  font-size: 12px;
  color: var(--neutral-on-background-weak);
}
.haven-select,
.haven-input {
  height: 40px;
  padding: 0 12px;
  border-radius: var(--radius-m);
  border: 1px solid var(--neutral-alpha-medium);
  background: var(--surface-background);
  color: var(--neutral-on-background-strong);
  font: inherit;
  font-size: 14px;
  min-width: 0;
  width: 100%;
}
.haven-select:focus-visible,
.haven-input:focus-visible {
  outline: 2px solid var(--brand-solid-strong);
  outline-offset: 1px;
}

.haven-marker {
  appearance: none;
  border: 1px solid var(--neutral-alpha-strong);
  background: var(--surface-background);
  color: var(--neutral-on-background-strong);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  padding: 6px 10px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  transition: transform 0.12s ease, background 0.12s ease, color 0.12s ease;
  white-space: nowrap;
}
.haven-marker[data-active="true"] {
  background: var(--brand-solid-strong);
  color: var(--brand-on-solid-strong, #fff);
  border-color: var(--brand-solid-strong);
  transform: scale(1.14);
}
.haven-marker:focus-visible {
  outline: 2px solid var(--brand-solid-strong);
  outline-offset: 2px;
}

.haven-popup .maplibregl-popup-content {
  padding: 0;
  border-radius: var(--radius-m);
  overflow: hidden;
  background: var(--surface-background);
  color: var(--neutral-on-background-strong);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.25);
  font-family: inherit;
}
.haven-popup .maplibregl-popup-close-button {
  font-size: 18px;
  width: 28px;
  height: 28px;
  color: #fff;
  z-index: 2;
}
.haven-popup.maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
  border-top-color: var(--surface-background);
}

.haven-results {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 640px) {
  .haven-results {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.haven-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
}
.haven-mapcol {
  display: none;
}
.haven-split[data-view="map"] .haven-mapcol {
  display: block;
}
.haven-split[data-view="map"] .haven-listcol {
  display: none;
}
.haven-mapbox {
  height: calc(100dvh - 220px);
  min-height: 360px;
  border-radius: var(--radius-l);
  overflow: hidden;
  border: 1px solid var(--neutral-alpha-weak);
  position: relative;
}
@media (min-width: 1024px) {
  .haven-split {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  }
  .haven-split .haven-mapcol,
  .haven-split[data-view="map"] .haven-mapcol,
  .haven-split[data-view="list"] .haven-mapcol {
    display: block;
  }
  .haven-split[data-view="map"] .haven-listcol {
    display: block;
  }
  .haven-mapcol .haven-mapbox {
    position: sticky;
    top: 16px;
    height: calc(100dvh - 32px);
  }
  .haven-viewtoggle {
    display: none !important;
  }
}

.haven-gallery {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 8px;
  height: 340px;
}
.haven-gallery > :first-child {
  grid-row: span 2;
}
.haven-gallery > * {
  border-radius: var(--radius-m);
  overflow: hidden;
  min-height: 0;
}
@media (max-width: 767px) {
  .haven-gallery {
    display: flex;
    overflow-x: auto;
    height: 220px;
    scroll-snap-type: x mandatory;
  }
  .haven-gallery > * {
    flex: 0 0 82%;
    scroll-snap-align: start;
  }
}

.haven-detail {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 32px;
}
@media (min-width: 1024px) {
  .haven-detail {
    grid-template-columns: minmax(0, 1fr) 380px;
    align-items: start;
  }
  .haven-detail__aside {
    position: sticky;
    top: 16px;
  }
}

.haven-facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
@media (min-width: 640px) {
  .haven-facts {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.haven-minimap {
  height: 260px;
  border-radius: var(--radius-l);
  overflow: hidden;
  border: 1px solid var(--neutral-alpha-weak);
}

.haven-energy {
  display: flex;
  gap: 4px;
  align-items: flex-end;
}
.haven-energy > span {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  border-radius: 4px;
  opacity: 0.45;
}
.haven-energy > span[data-on="true"] {
  opacity: 1;
  outline: 2px solid var(--neutral-on-background-strong);
  outline-offset: 2px;
}

.haven-error {
  color: var(--danger-on-background-strong);
  font-size: 13px;
}
.haven-textarea {
  min-height: 120px;
  padding: 10px 12px;
  border-radius: var(--radius-m);
  border: 1px solid var(--neutral-alpha-medium);
  background: var(--surface-background);
  color: var(--neutral-on-background-strong);
  font: inherit;
  font-size: 14px;
  width: 100%;
  resize: vertical;
}
.haven-textarea:focus-visible {
  outline: 2px solid var(--brand-solid-strong);
  outline-offset: 1px;
}
.haven-input[aria-invalid="true"],
.haven-textarea[aria-invalid="true"],
.haven-select[aria-invalid="true"] {
  border-color: var(--danger-solid-strong);
}
```

```tsx src/components/haven/Placeholder.tsx
import { placeholderStyle } from "@/lib/data";
import "./haven.css";

export function Placeholder({
  seed,
  shift = 0,
  label,
}: {
  seed: string;
  shift?: number;
  label?: string;
}) {
  return (
    <div
      className="haven-ph"
      style={placeholderStyle(seed, shift)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
```

```ts src/components/haven/useSaved.ts
"use client";

import { useCallback, useState } from "react";

/** Saved homes, kept in memory for the session (no storage, no backend). */
export function useSaved() {
  const [saved, setSaved] = useState<ReadonlySet<string>>(new Set());
  const toggle = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  return { saved, toggle };
}
```

```tsx src/components/haven/SearchMap.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "./haven.css";

import { Column, Row, Text } from "@once-ui-system/core";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { Map as MapGL, Marker, Popup, type MapRef } from "react-map-gl/maplibre";
import {
  bedsLabel,
  formatPrice,
  formatPriceShort,
  type Home,
  listings,
} from "@/lib/data";
import { Placeholder } from "./Placeholder";

type Props = {
  homes: Home[];
  highlightedId: string | null;
  onHighlight: (id: string | null) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export default function SearchMap({
  homes,
  highlightedId,
  onHighlight,
  selectedId,
  onSelect,
}: Props) {
  const mapRef = useRef<MapRef | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const fit = useCallback(
    (duration: number) => {
      const map = mapRef.current;
      if (!map || homes.length === 0) return;
      const lngs = homes.map((h) => h.lng);
      const lats = homes.map((h) => h.lat);
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 64, maxZoom: 14, duration },
      );
    },
    [homes],
  );

  // Refit when the filtered set changes.
  useEffect(() => {
    fit(500);
  }, [fit]);

  // The map column is display:none on phones in list view; resize and refit
  // when it becomes visible.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let lastWidth = el.clientWidth;
    const observer = new ResizeObserver(() => {
      const width = el.clientWidth;
      if (width > 0 && lastWidth === 0) {
        mapRef.current?.resize();
        fit(0);
      }
      lastWidth = width;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [fit]);

  const selected = homes.find((h) => h.id === selectedId) ?? null;

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%" }}>
      <MapGL
        ref={mapRef}
        initialViewState={{
          longitude: listings.map_center[0],
          latitude: listings.map_center[1],
          zoom: 11.3,
        }}
        mapStyle={listings.map_style_url}
        style={{ width: "100%", height: "100%" }}
        attributionControl={{ compact: true }}
        onClick={() => onSelect(null)}
        onLoad={() => fit(0)}
      >
        {homes.map((home) => {
          const active = home.id === highlightedId || home.id === selectedId;
          return (
            <Marker
              key={home.id}
              longitude={home.lng}
              latitude={home.lat}
              anchor="center"
              style={{ zIndex: active ? 5 : 1 }}
            >
              <button
                type="button"
                className="haven-marker"
                data-active={active}
                aria-label={`${home.title}, ${formatPrice(home.price)}`}
                aria-pressed={home.id === selectedId}
                onMouseEnter={() => onHighlight(home.id)}
                onMouseLeave={() => onHighlight(null)}
                onFocus={() => onHighlight(home.id)}
                onBlur={() => onHighlight(null)}
                onClick={(event) => {
                  event.stopPropagation();
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
            offset={22}
            maxWidth="260px"
            className="haven-popup"
            closeOnClick={false}
            onClose={() => onSelect(null)}
          >
            <Column style={{ width: 240 }}>
              <div style={{ height: 90 }}>
                <Placeholder seed={selected.id} />
              </div>
              <Column padding="12" gap="4">
                <Text variant="label-strong-m">{formatPrice(selected.price)}</Text>
                <Text variant="body-default-s">{selected.title}</Text>
                <Row gap="8" wrap>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    {bedsLabel(selected.beds)} · {selected.area_m2} m² · {selected.district}
                  </Text>
                </Row>
                <Link
                  href={`/homes/${selected.id}`}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--brand-on-background-strong)",
                    marginTop: 4,
                  }}
                >
                  View home
                </Link>
              </Column>
            </Column>
          </Popup>
        )}
      </MapGL>
    </div>
  );
}
```

```tsx src/components/haven/MiniMap.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "./haven.css";

import { Map as MapGL, Marker } from "react-map-gl/maplibre";
import { formatPriceShort, type Home, listings } from "@/lib/data";

export default function MiniMap({ home }: { home: Home }) {
  return (
    <MapGL
      initialViewState={{ longitude: home.lng, latitude: home.lat, zoom: 14 }}
      mapStyle={listings.map_style_url}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      cooperativeGestures
    >
      <Marker longitude={home.lng} latitude={home.lat} anchor="center">
        <div
          className="haven-marker"
          data-active="true"
          role="img"
          aria-label={`${home.title} location`}
        >
          {formatPriceShort(home.price)}
        </div>
      </Marker>
    </MapGL>
  );
}
```

```tsx src/components/haven/MiniMapLoader.tsx
"use client";

import dynamic from "next/dynamic";
import { Column, Text } from "@once-ui-system/core";
import { type Home, listings } from "@/lib/data";

const MiniMap = dynamic(() => import("./MiniMap"), {
  ssr: false,
  loading: () => (
    <Column fill center background="neutral-alpha-weak">
      <Text variant="body-default-s" onBackground="neutral-weak">
        Loading map…
      </Text>
    </Column>
  ),
});

export function MiniMapLoader({ home }: { home: Home }) {
  return (
    <div
      className="haven-minimap"
      role="region"
      aria-label={`Map showing ${home.title} in ${home.district}, ${listings.city}`}
    >
      <MiniMap home={home} />
    </div>
  );
}
```

```tsx src/components/haven/SearchPage.tsx
"use client";

import "./haven.css";

import { Badge, Button, Column, Heading, IconButton, Row, Text } from "@once-ui-system/core";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  bedsLabel,
  formatPrice,
  type Home,
  type HomeType,
  isNew,
  listings,
} from "@/lib/data";
import { Placeholder } from "./Placeholder";
import { useSaved } from "./useSaved";

const SearchMap = dynamic(() => import("./SearchMap"), {
  ssr: false,
  loading: () => (
    <Column fill center background="neutral-alpha-weak">
      <Text variant="body-default-s" onBackground="neutral-weak">
        Loading map…
      </Text>
    </Column>
  ),
});

type SortKey = "newest" | "price-asc" | "price-desc" | "size";

const TYPE_OPTIONS: { value: "any" | HomeType; label: string }[] = [
  { value: "any", label: "Any type" },
  { value: "Apartment", label: "Apartment" },
  { value: "House", label: "House" },
  { value: "Studio", label: "Studio" },
];

const MIN_PRICE_OPTIONS = [0, 200000, 300000, 400000, 500000, 750000, 1000000];
const MAX_PRICE_OPTIONS = [0, 300000, 400000, 500000, 750000, 1000000, 1500000];
const BED_OPTIONS = [0, 1, 2, 3, 4];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "size", label: "Size: largest first" },
];

function priceLabel(value: number, empty: string) {
  return value === 0 ? empty : formatPrice(value);
}

function HomeCard({
  home,
  active,
  saved,
  onToggleSave,
  onHover,
}: {
  home: Home;
  active: boolean;
  saved: boolean;
  onToggleSave: () => void;
  onHover: (id: string | null) => void;
}) {
  return (
    <li
      className="haven-card"
      data-active={active}
      data-home-id={home.id}
      onMouseEnter={() => onHover(home.id)}
      onMouseLeave={() => onHover(null)}
      style={{ listStyle: "none" }}
    >
      <div style={{ height: 150, position: "relative" }}>
        <Placeholder seed={home.id} />
        {isNew(home) && (
          <div style={{ position: "absolute", top: 12, left: 12 }}>
            <Badge effect={false} icon="sparkle">
              New this week
            </Badge>
          </div>
        )}
      </div>
      <div className="haven-card__save">
        <IconButton
          icon="heart"
          variant={saved ? "primary" : "secondary"}
          size="s"
          rounded
          ariaLabel={saved ? `Remove ${home.title} from saved homes` : `Save ${home.title}`}
          aria-pressed={saved}
          onClick={onToggleSave}
        />
      </div>
      <Column padding="16" gap="8">
        <Text variant="heading-strong-l">{formatPrice(home.price)}</Text>
        <Heading as="h3" variant="heading-default-s">
          <Link
            href={`/homes/${home.id}`}
            className="haven-card__link"
            onFocus={() => onHover(home.id)}
            onBlur={() => onHover(null)}
          >
            {home.title}
          </Link>
        </Heading>
        <Row gap="12" wrap>
          <Text variant="body-default-s" onBackground="neutral-weak">
            {bedsLabel(home.beds)}
          </Text>
          <Text variant="body-default-s" onBackground="neutral-weak">
            {home.baths} bath{home.baths === 1 ? "" : "s"}
          </Text>
          <Text variant="body-default-s" onBackground="neutral-weak">
            {home.area_m2} m²
          </Text>
        </Row>
        <Text variant="label-default-s" onBackground="neutral-medium">
          {home.district}, {listings.city}
        </Text>
      </Column>
    </li>
  );
}

export function SearchPage() {
  const [type, setType] = useState<"any" | HomeType>("any");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [minBeds, setMinBeds] = useState(0);
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<"list" | "map">("list");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { saved, toggle } = useSaved();

  const results = useMemo(() => {
    const filtered = listings.homes.filter(
      (h) =>
        (type === "any" || h.type === type) &&
        h.price >= minPrice &&
        (maxPrice === 0 || h.price <= maxPrice) &&
        h.beds >= minBeds,
    );
    const sorted = [...filtered];
    switch (sort) {
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
  }, [type, minPrice, maxPrice, minBeds, sort]);

  const invalidRange = maxPrice !== 0 && minPrice > maxPrice;
  const filtersActive = type !== "any" || minPrice !== 0 || maxPrice !== 0 || minBeds !== 0;

  function reset() {
    setType("any");
    setMinPrice(0);
    setMaxPrice(0);
    setMinBeds(0);
    setSelectedId(null);
  }

  const visibleSelected = results.some((h) => h.id === selectedId) ? selectedId : null;

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
      <Column fillWidth maxWidth={80} gap="20">
        <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
          <Column gap="4">
            <Text variant="label-default-s" onBackground="brand-medium">
              {listings.city}
            </Text>
            <Heading as="h1" variant="display-strong-xs">
              Find a home in {listings.city}
            </Heading>
          </Column>
          <Row className="haven-viewtoggle" gap="8" role="group" aria-label="Choose list or map view">
            <Button
              size="s"
              variant={view === "list" ? "primary" : "secondary"}
              prefixIcon="grid"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              List
            </Button>
            <Button
              size="s"
              variant={view === "map" ? "primary" : "secondary"}
              prefixIcon="globe"
              aria-pressed={view === "map"}
              onClick={() => setView("map")}
            >
              Map
            </Button>
          </Row>
        </Row>

        <form
          role="search"
          aria-label="Filter homes"
          onSubmit={(e) => e.preventDefault()}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
            padding: 16,
            borderRadius: "var(--radius-l)",
            border: "1px solid var(--neutral-alpha-weak)",
            background: "var(--surface-background)",
          }}
        >
          <div className="haven-field">
            <label htmlFor="f-type">Type</label>
            <select
              id="f-type"
              className="haven-select"
              value={type}
              onChange={(e) => setType(e.target.value as "any" | HomeType)}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="haven-field">
            <label htmlFor="f-min">Min price</label>
            <select
              id="f-min"
              className="haven-select"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              aria-invalid={invalidRange}
            >
              {MIN_PRICE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {priceLabel(v, "No minimum")}
                </option>
              ))}
            </select>
          </div>
          <div className="haven-field">
            <label htmlFor="f-max">Max price</label>
            <select
              id="f-max"
              className="haven-select"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              aria-invalid={invalidRange}
              aria-describedby={invalidRange ? "price-error" : undefined}
            >
              {MAX_PRICE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {priceLabel(v, "No maximum")}
                </option>
              ))}
            </select>
          </div>
          <div className="haven-field">
            <label htmlFor="f-beds">Bedrooms</label>
            <select
              id="f-beds"
              className="haven-select"
              value={minBeds}
              onChange={(e) => setMinBeds(Number(e.target.value))}
            >
              {BED_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v === 0 ? "Any" : `${v}+ beds`}
                </option>
              ))}
            </select>
          </div>
          <div className="haven-field">
            <label htmlFor="f-sort">Sort by</label>
            <select
              id="f-sort"
              className="haven-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </form>
        {invalidRange && (
          <Text id="price-error" variant="body-default-s" onBackground="danger-medium" role="alert">
            The minimum price is higher than the maximum, so nothing can match.
          </Text>
        )}

        <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
          <Text variant="label-default-m" aria-live="polite" role="status">
            {results.length} {results.length === 1 ? "home" : "homes"} in {listings.city}
          </Text>
          {filtersActive && (
            <Button size="s" variant="tertiary" prefixIcon="close" onClick={reset}>
              Clear filters
            </Button>
          )}
        </Row>

        <div className="haven-split" data-view={view}>
          <div className="haven-listcol">
            {results.length === 0 ? (
              <Column
                background="surface"
                border
                radius="l"
                padding="32"
                gap="12"
                horizontal="center"
                align="center"
              >
                <Heading as="h2" variant="heading-strong-m">
                  No homes match these filters
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Try a wider price range or fewer bedrooms.
                </Text>
                <Button variant="secondary" size="s" onClick={reset}>
                  Clear filters
                </Button>
              </Column>
            ) : (
              <ul
                className="haven-results"
                style={{ padding: 0, margin: 0 }}
                aria-label="Search results"
              >
                {results.map((home) => (
                  <HomeCard
                    key={home.id}
                    home={home}
                    active={home.id === highlightedId || home.id === visibleSelected}
                    saved={saved.has(home.id)}
                    onToggleSave={() => toggle(home.id)}
                    onHover={setHighlightedId}
                  />
                ))}
              </ul>
            )}
          </div>
          <div className="haven-mapcol">
            <div
              className="haven-mapbox"
              role="region"
              aria-label={`Map of ${results.length} homes in ${listings.city}`}
            >
              <SearchMap
                homes={results}
                highlightedId={highlightedId}
                onHighlight={setHighlightedId}
                selectedId={visibleSelected}
                onSelect={setSelectedId}
              />
            </div>
          </div>
        </div>
      </Column>
    </Column>
  );
}
```

```tsx src/components/haven/ContactForm.tsx
"use client";

import "./haven.css";

import { Button, Column, Text } from "@once-ui-system/core";
import { type FormEvent, useState } from "react";
import { listings } from "@/lib/data";

type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: Fields): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(values.email.trim()))
    errors.email = "Enter a valid email, like name@example.com.";
  if (!values.message.trim()) errors.message = "Write a short message for the agent.";
  return errors;
}

export function ContactForm({ homeTitle }: { homeTitle: string }) {
  const [values, setValues] = useState<Fields>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function update<K extends keyof Fields>(key: K, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (errors[key]) setErrors({ ...errors, [key]: validate(next)[key] });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    const first = (Object.keys(found) as (keyof Fields)[])[0];
    if (first) {
      document.getElementById(`c-${first}`)?.focus();
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Column gap="12" role="status" aria-live="polite">
        <Text variant="heading-strong-m">Message sent</Text>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Thanks, {values.name.trim()}. {listings.agent.name} will reply to {values.email.trim()}{" "}
          about “{homeTitle}”, usually within one working day.
        </Text>
        <Button
          variant="secondary"
          size="s"
          onClick={() => {
            setValues({ name: "", email: "", message: "" });
            setSent(false);
          }}
        >
          Send another message
        </Button>
      </Column>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label={`Contact ${listings.agent.name}`}>
      <Column gap="16">
        <div className="haven-field">
          <label htmlFor="c-name">Name</label>
          <input
            id="c-name"
            className="haven-input"
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "c-name-err" : undefined}
          />
          {errors.name && (
            <span id="c-name-err" className="haven-error" role="alert">
              {errors.name}
            </span>
          )}
        </div>
        <div className="haven-field">
          <label htmlFor="c-email">Email</label>
          <input
            id="c-email"
            className="haven-input"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "c-email-err" : undefined}
          />
          {errors.email && (
            <span id="c-email-err" className="haven-error" role="alert">
              {errors.email}
            </span>
          )}
        </div>
        <div className="haven-field">
          <label htmlFor="c-message">Message</label>
          <textarea
            id="c-message"
            className="haven-textarea"
            required
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "c-message-err" : undefined}
            placeholder="I would like to arrange a viewing…"
          />
          {errors.message && (
            <span id="c-message-err" className="haven-error" role="alert">
              {errors.message}
            </span>
          )}
        </div>
        <Button type="submit" fillWidth>
          Send message
        </Button>
      </Column>
    </form>
  );
}
```

```tsx src/components/haven/HomeDetail.tsx
import "./haven.css";

import { Badge, Button, Column, Heading, Row, Text } from "@once-ui-system/core";
import Link from "next/link";
import { bedsLabel, formatPrice, type Home, isNew, listings } from "@/lib/data";
import { ContactForm } from "./ContactForm";
import { MiniMapLoader } from "./MiniMapLoader";
import { Placeholder } from "./Placeholder";

const ENERGY_SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const ENERGY_COLORS: Record<string, string> = {
  "A+": "#1b7f3b",
  A: "#2f9e44",
  B: "#74b816",
  C: "#c4a000",
  D: "#e8890c",
  E: "#d9480f",
  F: "#c92a2a",
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Column gap="4" background="surface" border radius="m" padding="16">
      <Text variant="label-default-xs" onBackground="neutral-weak">
        {label}
      </Text>
      <Text variant="heading-strong-m">{value}</Text>
    </Column>
  );
}

export function HomeDetail({ home }: { home: Home }) {
  const perM2 = Math.round(home.price / home.area_m2);

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
      <Column fillWidth maxWidth={80} gap="24">
        <Row>
          <Button href="/" variant="tertiary" size="s" prefixIcon="chevronLeft">
            Back to search
          </Button>
        </Row>

        <div
          className="haven-gallery"
          role="group"
          aria-label={`Photos of ${home.title} (illustrated placeholders)`}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ position: "relative" }}>
              <Placeholder seed={home.id} shift={i} label={`Placeholder photo ${i + 1} of 5`} />
            </div>
          ))}
        </div>

        <div className="haven-detail">
          <Column gap="32" minWidth={0}>
            <Column gap="12">
              <Row gap="12" vertical="center" wrap>
                <Text variant="label-default-s" onBackground="brand-medium">
                  {home.type} · {home.district}, {listings.city}
                </Text>
                {isNew(home) && (
                  <Badge effect={false} icon="sparkle">
                    New this week
                  </Badge>
                )}
              </Row>
              <Heading as="h1" variant="display-strong-xs">
                {home.title}
              </Heading>
              <Row gap="16" vertical="end" wrap>
                <Text variant="display-strong-s">{formatPrice(home.price)}</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {formatPrice(perM2)} per m²
                </Text>
              </Row>
            </Column>

            <section className="haven-facts" aria-label="Key facts">
              <Fact label="Bedrooms" value={bedsLabel(home.beds)} />
              <Fact label="Bathrooms" value={String(home.baths)} />
              <Fact label="Area" value={`${home.area_m2} m²`} />
              <Fact label="Built" value={String(home.year)} />
            </section>

            <Column as="section" gap="12" aria-labelledby="features-h">
              <Heading as="h2" id="features-h" variant="heading-strong-l">
                Features
              </Heading>
              <ul
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  padding: 0,
                  margin: 0,
                  listStyle: "none",
                }}
              >
                {home.features.map((feature) => (
                  <li key={feature}>
                    <Row
                      background="neutral-alpha-weak"
                      radius="full"
                      paddingX="12"
                      paddingY="8"
                      vertical="center"
                    >
                      <Text variant="label-default-s">{feature}</Text>
                    </Row>
                  </li>
                ))}
              </ul>
            </Column>

            <Column as="section" gap="12" aria-labelledby="energy-h">
              <Heading as="h2" id="energy-h" variant="heading-strong-l">
                Energy rating
              </Heading>
              <div
                className="haven-energy"
                role="img"
                aria-label={`Energy rating ${home.energy} on a scale from A+ (best) to F`}
              >
                {ENERGY_SCALE.map((grade, index) => (
                  <span
                    key={grade}
                    data-on={grade === home.energy}
                    style={{
                      background: ENERGY_COLORS[grade],
                      height: 28 + (ENERGY_SCALE.length - index) * 4,
                    }}
                  >
                    {grade}
                  </span>
                ))}
              </div>
              <Text variant="body-default-s" onBackground="neutral-weak">
                This home is rated {home.energy}. A+ is the most efficient, F the least.
              </Text>
            </Column>

            <Column as="section" gap="12" aria-labelledby="loc-h">
              <Heading as="h2" id="loc-h" variant="heading-strong-l">
                Location
              </Heading>
              <MiniMapLoader home={home} />
              <Text variant="body-default-s" onBackground="neutral-weak">
                {home.district}, {listings.city}
              </Text>
            </Column>
          </Column>

          <aside className="haven-detail__aside" aria-label="Contact the agent">
            <Column background="surface" border radius="l" padding="24" gap="20">
              <Column gap="4">
                <Heading as="h2" variant="heading-strong-l">
                  Contact the agent
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {listings.agent.name}, {listings.agent.agency}
                </Text>
                <Row gap="16" wrap>
                  <Link
                    href={`tel:${listings.agent.phone.replace(/\s/g, "")}`}
                    style={{ fontSize: 14, color: "var(--brand-on-background-strong)" }}
                  >
                    {listings.agent.phone}
                  </Link>
                  <Link
                    href={`mailto:${listings.agent.email}`}
                    style={{ fontSize: 14, color: "var(--brand-on-background-strong)" }}
                  >
                    {listings.agent.email}
                  </Link>
                </Row>
              </Column>
              <ContactForm homeTitle={home.title} />
            </Column>
          </aside>
        </div>
      </Column>
    </Column>
  );
}
```

```tsx src/app/page.tsx
import type { Metadata } from "next";
import { SearchPage } from "@/components/haven/SearchPage";

export const metadata: Metadata = {
  title: "Haven: homes for sale in Lisbon",
  description:
    "Search apartments, houses and studios for sale in Lisbon. Filter by type, price and bedrooms, and see every home on the map.",
};

export default function Page() {
  return <SearchPage />;
}
```

```tsx src/app/homes/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeDetail } from "@/components/haven/HomeDetail";
import { formatPrice, getHome, listings } from "@/lib/data";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return listings.homes.map((home) => ({ id: home.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const home = getHome(id);
  if (!home) return { title: "Home not found | Haven" };
  return {
    title: `${home.title}, ${home.district} | Haven`,
    description: `${home.type} in ${home.district}, ${listings.city}: ${home.beds === 0 ? "studio" : `${home.beds} bedrooms`}, ${home.area_m2} m², ${formatPrice(home.price)}.`,
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();
  return <HomeDetail home={home} />;
}
```