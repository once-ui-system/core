I have what I need. Writing all the files now.

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

export const SITE = {
  name: "Haven",
  tagline: "Haven, a home search site for one city",
  city: "Lisbon",
  currency: "EUR",
  mapStyleUrl: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  // [lng, lat]
  mapCenter: [-9.1393, 38.7223] as [number, number],
};

export const AGENT = {
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

/**
 * Fixed "today" so that the "new" badge renders identically on the server and
 * the client (the listing dates are in the data, so the site's clock is fixed).
 */
export const REFERENCE_DATE = "2026-11-02";

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysSinceListed(home: Home): number {
  const diff = Date.parse(REFERENCE_DATE) - Date.parse(home.listed);
  return Math.floor(diff / DAY_MS);
}

export function isNew(home: Home): boolean {
  return daysSinceListed(home) <= 7;
}

export function getHome(id: string): Home | undefined {
  return HOMES.find((h) => h.id === id);
}

const priceFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: SITE.currency,
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

/** Short price for map markers, e.g. €485k or €1.45M */
export function formatPriceShort(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `€${Number.isInteger(m) ? m : m.toFixed(2).replace(/0$/, "")}M`;
  }
  return `€${Math.round(value / 1000)}k`;
}

export function formatBeds(beds: number): string {
  return beds === 0 ? "Studio" : `${beds} bed${beds === 1 ? "" : "s"}`;
}

export function formatListed(home: Home): string {
  const days = daysSinceListed(home);
  if (days <= 0) return "Listed today";
  if (days === 1) return "Listed yesterday";
  return `Listed ${days} days ago`;
}

export const ENERGY_SCALE = ["A+", "A", "B", "C", "D", "E", "F"] as const;
```

```tsx lib/saved-store.ts
"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "haven:saved";
const EMPTY: string[] = [];

let cache: string[] | null = null;
const listeners = new Set<() => void>();

function read(): string[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: string[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable: keep in-memory state only
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSaved() {
  const saved = useSyncExternalStore(subscribe, read, () => EMPTY);

  const toggle = useCallback((id: string) => {
    const current = read();
    write(
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }, []);

  return { saved, toggle };
}
```

```tsx components/haven/home-placeholder.tsx
import { cn } from "@/lib/utils";
import type { Home } from "@/lib/data";

const PALETTES: ReadonlyArray<{ sky: string; wall: string; roof: string; accent: string }> = [
  { sky: "#dbeafe", wall: "#fde68a", roof: "#b45309", accent: "#0f766e" },
  { sky: "#fce7f3", wall: "#e7e5e4", roof: "#9f1239", accent: "#1d4ed8" },
  { sky: "#dcfce7", wall: "#fed7aa", roof: "#7c2d12", accent: "#4d7c0f" },
  { sky: "#e0e7ff", wall: "#f5f5f4", roof: "#3730a3", accent: "#be123c" },
  { sky: "#cffafe", wall: "#fef3c7", roof: "#92400e", accent: "#0369a1" },
  { sky: "#ede9fe", wall: "#fecdd3", roof: "#6b21a8", accent: "#047857" },
];

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * A photo placeholder drawn purely with CSS shapes. `variant` shifts the
 * palette and the scene so each gallery tile differs.
 */
export function HomePlaceholder({
  home,
  variant = 0,
  className,
  label,
}: {
  home: Home;
  variant?: number;
  className?: string;
  label?: string;
}) {
  const p = PALETTES[(hash(home.id) + variant) % PALETTES.length];
  const kind = (hash(home.id) + variant) % 3;
  const isHouse = home.type === "House";

  return (
    <div
      role="img"
      aria-label={label ?? `Photo placeholder of ${home.title}`}
      className={cn("relative aspect-[4/3] w-full overflow-hidden", className)}
      style={{ background: `linear-gradient(180deg, ${p.sky} 0%, ${p.sky} 62%, ${p.accent}33 62%)` }}
    >
      {/* sun */}
      <div
        className="absolute rounded-full"
        style={{
          width: "14%",
          aspectRatio: "1",
          top: "10%",
          right: kind === 1 ? "auto" : "12%",
          left: kind === 1 ? "12%" : "auto",
          background: "#fef08a",
        }}
      />
      {/* ground */}
      <div className="absolute inset-x-0 bottom-0 h-[38%]" style={{ background: `${p.accent}40` }} />
      {isHouse ? (
        <>
          <div
            className="absolute"
            style={{
              left: "24%",
              width: "52%",
              bottom: "20%",
              height: "34%",
              background: p.wall,
              boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.06)",
            }}
          />
          <div
            className="absolute"
            style={{
              left: "20%",
              width: "60%",
              bottom: "54%",
              height: "20%",
              background: p.roof,
              clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
            }}
          />
          <div
            className="absolute"
            style={{ left: "45%", width: "10%", bottom: "20%", height: "18%", background: p.accent }}
          />
          <div
            className="absolute"
            style={{ left: "30%", width: "9%", bottom: "34%", height: "10%", background: "#bae6fd" }}
          />
          <div
            className="absolute"
            style={{ left: "61%", width: "9%", bottom: "34%", height: "10%", background: "#bae6fd" }}
          />
        </>
      ) : (
        <>
          <div
            className="absolute"
            style={{
              left: kind === 2 ? "14%" : "20%",
              width: "34%",
              bottom: "18%",
              height: "62%",
              background: p.wall,
              boxShadow: "inset -8px 0 0 rgba(0,0,0,0.05)",
            }}
          />
          <div
            className="absolute"
            style={{
              left: kind === 2 ? "46%" : "50%",
              width: "28%",
              bottom: "18%",
              height: "44%",
              background: p.accent,
              opacity: 0.85,
            }}
          />
          {[0, 1, 2].map((row) =>
            [0, 1].map((col) => (
              <div
                key={`${row}-${col}`}
                className="absolute"
                style={{
                  left: `${(kind === 2 ? 18 : 24) + col * 14}%`,
                  width: "8%",
                  bottom: `${30 + row * 16}%`,
                  height: "9%",
                  background: "#bae6fd",
                }}
              />
            )),
          )}
          <div
            className="absolute"
            style={{ left: "55%", width: "18%", bottom: "18%", height: "10%", background: p.roof, opacity: 0.8 }}
          />
        </>
      )}
    </div>
  );
}
```

```tsx components/haven/save-button.tsx
"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSaved } from "@/lib/saved-store";

export function SaveButton({
  homeId,
  title,
  className,
  withLabel = false,
}: {
  homeId: string;
  title: string;
  className?: string;
  withLabel?: boolean;
}) {
  const { saved, toggle } = useSaved();
  const isSaved = saved.includes(homeId);

  return (
    <Button
      type="button"
      variant={withLabel ? "outline" : "secondary"}
      size={withLabel ? "default" : "icon-sm"}
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove ${title} from saved homes` : `Save ${title}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(homeId);
      }}
      className={cn("rounded-full", className)}
    >
      <Heart className={cn(isSaved && "fill-rose-500 text-rose-500")} aria-hidden="true" />
      {withLabel ? <span>{isSaved ? "Saved" : "Save"}</span> : null}
    </Button>
  );
}
```

```tsx components/haven/site-header.tsx
import Link from "next/link";
import { Home as HomeIcon } from "lucide-react";
import { SITE } from "@/lib/data";

export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HomeIcon className="size-4" aria-hidden="true" />
          </span>
          <span className="text-lg">{SITE.name}</span>
        </Link>
        <p className="hidden text-sm text-muted-foreground sm:block">
          Homes for sale in {SITE.city}
        </p>
      </div>
    </header>
  );
}
```

```tsx components/haven/home-card.tsx
"use client";

import Link from "next/link";
import { Bath, BedDouble, MapPin, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Home, formatBeds, formatPrice, isNew } from "@/lib/data";
import { HomePlaceholder } from "@/components/haven/home-placeholder";
import { SaveButton } from "@/components/haven/save-button";

export function HomeCard({
  home,
  active,
  onHover,
}: {
  home: Home;
  active: boolean;
  onHover: (id: string | null) => void;
}) {
  return (
    <article
      id={`card-${home.id}`}
      data-active={active}
      onMouseEnter={() => onHover(home.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(home.id)}
      onBlur={() => onHover(null)}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow",
        active && "ring-2 ring-primary shadow-md",
      )}
    >
      <div className="relative">
        <HomePlaceholder home={home} className="aspect-[16/10] transition-transform duration-300 group-hover:scale-[1.02]" />
        {isNew(home) ? (
          <Badge className="absolute top-3 left-3 bg-emerald-600 text-white">New this week</Badge>
        ) : null}
        <SaveButton homeId={home.id} title={home.title} className="absolute top-3 right-3 z-10" />
      </div>
      <div className="flex flex-col gap-2 p-4">
        <p className="text-xl font-semibold tracking-tight">{formatPrice(home.price)}</p>
        <h3 className="leading-snug font-medium">
          <Link
            href={`/homes/${home.id}`}
            className="rounded-sm outline-none after:absolute after:inset-0 after:content-[''] focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {home.title}
          </Link>
        </h3>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <BedDouble className="size-4" aria-hidden="true" />
            {formatBeds(home.beds)}
          </li>
          <li className="flex items-center gap-1.5">
            <Bath className="size-4" aria-hidden="true" />
            {home.baths} bath{home.baths === 1 ? "" : "s"}
          </li>
          <li className="flex items-center gap-1.5">
            <Ruler className="size-4" aria-hidden="true" />
            {home.area_m2} m²
          </li>
        </ul>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4" aria-hidden="true" />
          {home.district}, Lisbon · {home.type}
        </p>
      </div>
    </article>
  );
}
```

The map component comes next. It's loaded client-only because maplibre needs the browser.

```tsx components/haven/homes-map.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import MapGL, { Marker, NavigationControl, Popup, type MapRef } from "react-map-gl/maplibre";
import { cn } from "@/lib/utils";
import { type Home, SITE, formatBeds, formatPrice, formatPriceShort } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { HomePlaceholder } from "@/components/haven/home-placeholder";

export default function HomesMap({
  homes,
  hoveredId,
  onHover,
  selectedId,
  onSelect,
}: {
  homes: Home[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const mapRef = useRef<MapRef | null>(null);
  const selected = useMemo(() => homes.find((h) => h.id === selectedId) ?? null, [homes, selectedId]);

  // Keep the map sized correctly when its container changes (mobile view toggle).
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const container = map.getContainer();
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  return (
    <MapGL
      ref={mapRef}
      initialViewState={{ longitude: SITE.mapCenter[0], latitude: SITE.mapCenter[1], zoom: 11.6 }}
      mapStyle={SITE.mapStyleUrl}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      onClick={() => onSelect(null)}
      cooperativeGestures={false}
    >
      <NavigationControl position="top-right" showCompass={false} />
      {homes.map((home) => {
        const active = hoveredId === home.id || selectedId === home.id;
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
              aria-label={`${formatPrice(home.price)}, ${home.title}, ${home.district}`}
              aria-pressed={selectedId === home.id}
              onMouseEnter={() => onHover(home.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(home.id)}
              onBlur={() => onHover(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(home.id);
              }}
              className={cn(
                "relative rounded-full border px-2.5 py-1 text-xs font-semibold shadow-md transition-transform outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60",
                active
                  ? "z-10 scale-110 border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:scale-105",
              )}
            >
              {formatPriceShort(home.price)}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-full left-1/2 size-2 -translate-x-1/2 -translate-y-1 rotate-45 border-r border-b",
                  active ? "border-primary bg-primary" : "border-border bg-background",
                )}
              />
            </button>
          </Marker>
        );
      })}
      {selected ? (
        <Popup
          longitude={selected.lng}
          latitude={selected.lat}
          anchor="bottom"
          offset={36}
          closeOnClick={false}
          onClose={() => onSelect(null)}
          maxWidth="240px"
        >
          <div className="w-56 overflow-hidden rounded-md text-foreground">
            <HomePlaceholder home={selected} className="aspect-[16/9]" />
            <div className="flex flex-col gap-1 p-2.5">
              <p className="text-base font-semibold">{formatPrice(selected.price)}</p>
              <p className="text-sm leading-snug font-medium">{selected.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatBeds(selected.beds)} · {selected.baths} bath · {selected.area_m2} m² · {selected.district}
              </p>
              <div className="flex items-center justify-between pt-1">
                <Badge variant="secondary">{selected.type}</Badge>
                <Link
                  href={`/homes/${selected.id}`}
                  className="rounded-sm text-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  View home
                </Link>
              </div>
            </div>
          </div>
        </Popup>
      ) : null}
    </MapGL>
  );
}
```

```tsx components/haven/homes-map-loader.tsx
"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const HomesMap = dynamic(() => import("@/components/haven/homes-map"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

export function HomesMapLoader(props: ComponentProps<typeof HomesMap>) {
  return <HomesMap {...props} />;
}
```

```tsx components/haven/detail-map.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import MapGL, { Marker, NavigationControl } from "react-map-gl/maplibre";
import { MapPin } from "lucide-react";
import { type Home, SITE } from "@/lib/data";

export default function DetailMap({ home }: { home: Home }) {
  return (
    <MapGL
      initialViewState={{ longitude: home.lng, latitude: home.lat, zoom: 13.5 }}
      mapStyle={SITE.mapStyleUrl}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Marker longitude={home.lng} latitude={home.lat} anchor="bottom">
        <div
          role="img"
          aria-label={`${home.title} location in ${home.district}`}
          className="flex size-9 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-lg"
        >
          <MapPin className="size-4" aria-hidden="true" />
        </div>
      </Marker>
    </MapGL>
  );
}
```

```tsx components/haven/detail-map-loader.tsx
"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const DetailMap = dynamic(() => import("@/components/haven/detail-map"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

export function DetailMapLoader(props: ComponentProps<typeof DetailMap>) {
  return <DetailMap {...props} />;
}
```

Now the search view with filters, results, and the mobile toggle.

```tsx components/haven/search-view.tsx
"use client";

import { useMemo, useState } from "react";
import { List, Map as MapIcon, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { HOMES, SITE } from "@/lib/data";
import { HomeCard } from "@/components/haven/home-card";
import { HomesMapLoader } from "@/components/haven/homes-map-loader";

type TypeFilter = "any" | "Apartment" | "House" | "Studio";
type SortKey = "newest" | "price-asc" | "price-desc" | "size-desc";

const MIN_PRICE_OPTIONS = [
  { value: "any", label: "No min" },
  { value: "200000", label: "€200k" },
  { value: "400000", label: "€400k" },
  { value: "600000", label: "€600k" },
  { value: "800000", label: "€800k" },
  { value: "1000000", label: "€1M" },
];

const MAX_PRICE_OPTIONS = [
  { value: "any", label: "No max" },
  { value: "300000", label: "€300k" },
  { value: "500000", label: "€500k" },
  { value: "700000", label: "€700k" },
  { value: "900000", label: "€900k" },
  { value: "1200000", label: "€1.2M" },
];

const BED_OPTIONS = [
  { value: "0", label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
];

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function SearchView() {
  const [type, setType] = useState<TypeFilter>("any");
  const [minPrice, setMinPrice] = useState("any");
  const [maxPrice, setMaxPrice] = useState("any");
  const [minBeds, setMinBeds] = useState("0");
  const [sort, setSort] = useState<SortKey>("newest");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const results = useMemo(() => {
    const min = minPrice === "any" ? 0 : Number(minPrice);
    const max = maxPrice === "any" ? Infinity : Number(maxPrice);
    const beds = Number(minBeds);
    const filtered = HOMES.filter(
      (h) =>
        (type === "any" || h.type === type) &&
        h.price >= min &&
        h.price <= max &&
        h.beds >= beds,
    );
    const sorted = [...filtered];
    switch (sort) {
      case "newest":
        sorted.sort((a, b) => Date.parse(b.listed) - Date.parse(a.listed));
        break;
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "size-desc":
        sorted.sort((a, b) => b.area_m2 - a.area_m2);
        break;
    }
    return sorted;
  }, [type, minPrice, maxPrice, minBeds, sort]);

  const filtersActive = type !== "any" || minPrice !== "any" || maxPrice !== "any" || minBeds !== "0";

  function reset() {
    setType("any");
    setMinPrice("any");
    setMaxPrice("any");
    setMinBeds("0");
  }

  function handleSelect(id: string | null) {
    setSelectedId(id);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section aria-label="Search filters" className="border-b bg-background">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto grid max-w-screen-2xl grid-cols-2 gap-3 px-4 py-3 sm:grid-cols-3 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto] lg:items-end"
        >
          <FilterSelect
            id="filter-type"
            label="Type"
            value={type}
            onChange={(v) => setType(v as TypeFilter)}
            options={[
              { value: "any", label: "All types" },
              { value: "Apartment", label: "Apartment" },
              { value: "House", label: "House" },
              { value: "Studio", label: "Studio" },
            ]}
          />
          <FilterSelect id="filter-min-price" label="Min price" value={minPrice} onChange={setMinPrice} options={MIN_PRICE_OPTIONS} />
          <FilterSelect id="filter-max-price" label="Max price" value={maxPrice} onChange={setMaxPrice} options={MAX_PRICE_OPTIONS} />
          <FilterSelect id="filter-beds" label="Bedrooms" value={minBeds} onChange={setMinBeds} options={BED_OPTIONS} />
          <FilterSelect
            id="filter-sort"
            label="Sort by"
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            options={[
              { value: "newest", label: "Newest" },
              { value: "price-asc", label: "Price: low to high" },
              { value: "price-desc", label: "Price: high to low" },
              { value: "size-desc", label: "Size: largest first" },
            ]}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={reset}
            disabled={!filtersActive}
            className="col-span-2 sm:col-span-1"
          >
            Clear filters
          </Button>
        </form>
      </section>

      {/* Mobile view toggle */}
      <div className="border-b bg-background px-4 py-2 lg:hidden">
        <div role="group" aria-label="Results view" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          <Button
            type="button"
            size="sm"
            variant={mobileView === "list" ? "default" : "ghost"}
            aria-pressed={mobileView === "list"}
            onClick={() => setMobileView("list")}
          >
            <List aria-hidden="true" /> List
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mobileView === "map" ? "default" : "ghost"}
            aria-pressed={mobileView === "map"}
            onClick={() => setMobileView("map")}
          >
            <MapIcon aria-hidden="true" /> Map
          </Button>
        </div>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(0,640px)_minmax(0,1fr)]">
        <section
          aria-label="Search results"
          className={cn(
            "min-h-0 flex-col px-4 py-4 lg:flex lg:overflow-y-auto",
            mobileView === "list" ? "flex" : "hidden",
          )}
        >
          <h1 className="text-2xl font-semibold tracking-tight">Homes for sale in {SITE.city}</h1>
          <p className="mt-1 mb-4 text-sm text-muted-foreground" role="status" aria-live="polite">
            <span className="font-medium text-foreground">{results.length}</span>{" "}
            {results.length === 1 ? "home" : "homes"} found
          </p>
          {results.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {results.map((home) => (
                <li key={home.id}>
                  <HomeCard home={home} active={hoveredId === home.id} onHover={setHoveredId} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
              <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="font-medium">No homes match these filters</p>
              <p className="text-sm text-muted-foreground">Try widening the price range or lowering the bedroom count.</p>
              <Button type="button" variant="outline" size="sm" onClick={reset}>
                Clear filters
              </Button>
            </div>
          )}
        </section>

        <section
          aria-label="Map of results"
          className={cn(
            "relative min-h-[420px] flex-1 lg:sticky lg:top-0 lg:block lg:h-[calc(100svh-9.5rem)] lg:min-h-0 lg:flex-none",
            mobileView === "map" ? "block" : "hidden",
          )}
        >
          <div className="absolute inset-0">
            <HomesMapLoader
              homes={results}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
```

The map is inside `hidden` on mobile when the list is shown, so the ResizeObserver in the map component handles resizing when it becomes visible. Next is the home page and the detail components.

```tsx app/page.tsx
import { SiteHeader } from "@/components/haven/site-header";
import { SearchView } from "@/components/haven/search-view";

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col lg:h-svh">
      <SiteHeader />
      <main className="flex min-h-0 flex-1 flex-col">
        <SearchView />
      </main>
    </div>
  );
}
```

```tsx components/haven/contact-form.tsx
"use client";

import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { AGENT, type Home } from "@/lib/data";

interface Values {
  name: string;
  email: string;
  message: string;
}
type Errors = Partial<Record<keyof Values, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(v: Values): Errors {
  const errors: Errors = {};
  if (!v.name.trim()) errors.name = "Enter your name.";
  if (!v.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(v.email.trim())) errors.email = "Enter a valid email address, like name@example.com.";
  if (!v.message.trim()) errors.message = "Write a short message for the agent.";
  return errors;
}

export function ContactForm({ home }: { home: Home }) {
  const [values, setValues] = useState<Values>({
    name: "",
    email: "",
    message: `Hello, I'd like to arrange a viewing of "${home.title}" in ${home.district}.`,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function update<K extends keyof Values>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = validate(values);
    setErrors(next);
    const firstInvalid = (["name", "email", "message"] as const).find((k) => next[k]);
    if (firstInvalid) {
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }
    setSent(true);
    toast.success(`Message sent to ${AGENT.name}`, {
      description: "She usually replies within one working day.",
    });
  }

  if (sent) {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-lg bg-muted p-4 text-sm">
        <p className="font-medium">Thanks, {values.name.trim()}. Your message is on its way.</p>
        <p className="text-muted-foreground">
          {AGENT.name} will reply to {values.email.trim()} about {home.title}.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => {
            setSent(false);
            setValues((prev) => ({ ...prev, message: "" }));
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label={`Contact ${AGENT.name} about ${home.title}`}>
      <FieldGroup className="gap-4">
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="contact-name">Name</FieldLabel>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
          />
          <FieldError id="contact-name-error">{errors.name}</FieldError>
        </Field>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="contact-email">Email</FieldLabel>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
          />
          <FieldError id="contact-email-error">{errors.email}</FieldError>
        </Field>
        <Field data-invalid={!!errors.message}>
          <FieldLabel htmlFor="contact-message">Message</FieldLabel>
          <Textarea
            id="contact-message"
            name="message"
            rows={4}
            required
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
          />
          <FieldError id="contact-message-error">{errors.message}</FieldError>
        </Field>
        <Button type="submit" size="lg" className="w-full">
          Send message
        </Button>
      </FieldGroup>
      <ul className="mt-4 flex flex-col gap-1.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Phone className="size-4" aria-hidden="true" />
          <a href={`tel:${AGENT.phone.replace(/\s/g, "")}`} className="underline-offset-4 hover:underline">
            {AGENT.phone}
          </a>
        </li>
        <li className="flex items-center gap-2">
          <Mail className="size-4" aria-hidden="true" />
          <a href={`mailto:${AGENT.email}`} className="underline-offset-4 hover:underline">
            {AGENT.email}
          </a>
        </li>
      </ul>
    </form>
  );
}
```

`FieldError` renders `children` when present and returns `null` otherwise, so inline errors appear only on failure. Now the energy rating and the detail page.

```tsx components/haven/energy-rating.tsx
import { cn } from "@/lib/utils";
import { ENERGY_SCALE } from "@/lib/data";

const COLORS: Record<string, string> = {
  "A+": "bg-green-700 text-white",
  A: "bg-green-600 text-white",
  B: "bg-lime-600 text-white",
  C: "bg-yellow-400 text-neutral-900",
  D: "bg-amber-500 text-neutral-900",
  E: "bg-orange-600 text-white",
  F: "bg-red-600 text-white",
};

export function EnergyRating({ rating }: { rating: string }) {
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Energy rating:{" "}
        <span className="font-semibold text-foreground">{rating}</span>
      </p>
      <ol aria-label="Energy rating scale" className="flex flex-wrap gap-1.5">
        {ENERGY_SCALE.map((step) => {
          const current = step === rating;
          return (
            <li
              key={step}
              aria-current={current ? "true" : undefined}
              className={cn(
                "flex h-9 min-w-10 items-center justify-center rounded-md px-2 text-sm font-semibold transition-transform",
                COLORS[step],
                current ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background" : "opacity-40",
              )}
            >
              {step}
              {current ? <span className="sr-only"> (this home)</span> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
```

```tsx app/homes/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bath, BedDouble, Calendar, Check, MapPin, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AGENT,
  HOMES,
  formatBeds,
  formatListed,
  formatPrice,
  getHome,
  isNew,
} from "@/lib/data";
import { SiteHeader } from "@/components/haven/site-header";
import { HomePlaceholder } from "@/components/haven/home-placeholder";
import { SaveButton } from "@/components/haven/save-button";
import { EnergyRating } from "@/components/haven/energy-rating";
import { DetailMapLoader } from "@/components/haven/detail-map-loader";
import { ContactForm } from "@/components/haven/contact-form";

export const dynamicParams = false;

export function generateStaticParams() {
  return HOMES.map((h) => ({ id: h.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const home = getHome(id);
  if (!home) return { title: "Home not found · Haven" };
  return { title: `${home.title}, ${home.district} · Haven` };
}

const GALLERY_LABELS = ["Living room", "Kitchen", "Bedroom", "Bathroom", "Exterior"];

export default async function HomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();

  const facts = [
    { icon: BedDouble, label: "Bedrooms", value: home.beds === 0 ? "Studio" : String(home.beds) },
    { icon: Bath, label: "Bathrooms", value: String(home.baths) },
    { icon: Ruler, label: "Area", value: `${home.area_m2} m²` },
    { icon: Calendar, label: "Built", value: String(home.year) },
  ];

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-screen-xl px-4 py-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to search
        </Link>

        <section aria-label="Photo gallery" className="mb-8">
          <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
            {GALLERY_LABELS.map((label, i) => (
              <li key={label} className="w-[78%] shrink-0 snap-start sm:w-[44%] lg:w-[32%]">
                <HomePlaceholder
                  home={home}
                  variant={i}
                  className="rounded-xl"
                  label={`${label} of ${home.title} (placeholder)`}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">{label}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-8">
            <header className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{home.type}</Badge>
                {isNew(home) ? <Badge className="bg-emerald-600 text-white">New this week</Badge> : null}
                <span className="text-sm text-muted-foreground">{formatListed(home)}</span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">{home.title}</h1>
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-4" aria-hidden="true" />
                {home.district}, Lisbon
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-3xl font-bold tracking-tight">{formatPrice(home.price)}</p>
                <SaveButton homeId={home.id} title={home.title} withLabel />
              </div>
            </header>

            <section aria-labelledby="facts-heading">
              <h2 id="facts-heading" className="sr-only">
                Key facts
              </h2>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl border p-4">
                    <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Icon className="size-4" aria-hidden="true" />
                      {label}
                    </dt>
                    <dd className="mt-1 text-xl font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <Separator />

            <section aria-labelledby="features-heading">
              <h2 id="features-heading" className="mb-3 text-xl font-semibold">
                Features
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {home.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-600" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="energy-heading">
              <h2 id="energy-heading" className="mb-3 text-xl font-semibold">
                Energy rating
              </h2>
              <EnergyRating rating={home.energy} />
            </section>

            <section aria-labelledby="location-heading">
              <h2 id="location-heading" className="mb-3 text-xl font-semibold">
                Location
              </h2>
              <div className="h-72 overflow-hidden rounded-xl border">
                <DetailMapLoader home={home} />
              </div>
            </section>
          </div>

          <aside
            aria-labelledby="contact-heading"
            className="rounded-xl border bg-card p-5 shadow-sm lg:sticky lg:top-6"
          >
            <h2 id="contact-heading" className="text-lg font-semibold">
              Contact the agent
            </h2>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">
              {AGENT.name}, {AGENT.agency}
            </p>
            <ContactForm home={home} />
          </aside>
        </div>
      </main>
    </div>
  );
}
```