`emotion-registry.tsx` is in `project/components/ui/`, so `@/components/ui/emotion-registry` should resolve through the `@/*` → `./*` path mapping in `tsconfig.json`. The previous run also flagged my own `@/components/...` and `@/lib/data` imports, and those errors went away once I switched to relative imports. Now only the layout's alias import is left. I can't edit the layout or `tsconfig.json`, so the way to make that alias resolve is to supply the file at the path the checker looks for it. The earlier errors named `@/components/site-header` and `@/lib/data` as unresolvable too, which means the checker's root holds my emitted files (`components/`, `lib/`, `app/`) but not the pre-existing `components/ui/*`.

The layout needs `@/components/ui/emotion-registry`, `@/components/ui/provider` and `@/components/ui/toaster`. Only the first one failed, so `provider` and `toaster` must resolve and `emotion-registry` is the one missing from the checker's tree. I'll supply `components/ui/emotion-registry.tsx` with the same content as the existing project file, so the alias resolves in either layout.

```tsx components/ui/emotion-registry.tsx
"use client"

import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import { useServerInsertedHTML } from "next/navigation"
import { useState } from "react"

export function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: "css" })
    cache.compat = true

    const previousInsert = cache.insert
    let inserted: string[] = []

    cache.insert = (...args) => {
      const serialized = args[1]
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name)
      }
      return previousInsert(...args)
    }

    const flush = () => {
      const previouslyInserted = inserted
      inserted = []
      return previouslyInserted
    }

    return { cache, flush }
  })

  useServerInsertedHTML(() => {
    const names = flush()
    if (names.length === 0) return null

    const styles = names.map((name) => cache.inserted[name]).join("")

    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    )
  })

  return <CacheProvider value={cache}>{children}</CacheProvider>
}
```

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
  mapStyleUrl: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  mapCenter: { lng: -9.1393, lat: 38.7223 },
  currency: "EUR",
};

export const AGENT = {
  name: "Inês Carvalho",
  agency: "Haven Homes",
  phone: "+351 210 000 123",
  email: "ines@havenhomes.example",
};

/** Fixed reference "today" so the "new" badge is deterministic across server and client. */
export const TODAY = "2026-10-31";

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

const eur = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatPrice(n: number): string {
  return eur.format(n);
}

/** Short price for map markers, e.g. 485k or 1.45M */
export function shortPrice(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `€${Number.isInteger(m) ? m : m.toFixed(2).replace(/0$/, "")}M`;
  }
  return `€${Math.round(n / 1000)}k`;
}

export function bedsLabel(beds: number): string {
  return beds === 0 ? "Studio" : `${beds} bed${beds === 1 ? "" : "s"}`;
}

export function isNew(listed: string): boolean {
  const days =
    (Date.parse(TODAY + "T00:00:00Z") - Date.parse(listed + "T00:00:00Z")) /
    86_400_000;
  return days >= 0 && days <= 7;
}

export function formatListed(listed: string): string {
  return new Date(listed + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
```

```tsx components/placeholder.tsx
import { Box } from "@chakra-ui/react";

const PALETTES: Array<[string, string, string]> = [
  ["#f6d7b0", "#e8a87c", "#c38d9e"],
  ["#bfd8d2", "#7fb7be", "#3d7a8a"],
  ["#d9d2e9", "#a79bd0", "#6b5fa6"],
  ["#f2e2b3", "#e0b863", "#b9824a"],
  ["#cfe3c4", "#93c28a", "#4f8a64"],
  ["#f3c9c9", "#e39a9a", "#b25c6a"],
];

export function hashIndex(id: string, offset = 0): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h + offset) % PALETTES.length;
}

interface PlaceholderProps {
  id: string;
  variant?: number;
  height?: string | number | Record<string, string | number>;
  rounded?: string;
  label?: string;
}

/** A photo placeholder drawn purely with CSS gradients (skyline of windows). */
export function Placeholder({
  id,
  variant = 0,
  height = "160px",
  rounded = "md",
  label,
}: PlaceholderProps) {
  const [a, b, c] = PALETTES[hashIndex(id, variant)];
  const flip = hashIndex(id, variant + 2) % 2;
  const windows =
    "repeating-linear-gradient(0deg, transparent 0 10px, rgba(255,255,255,0.35) 10px 15px)";
  return (
    <Box
      role="img"
      aria-label={label ?? "Photo placeholder"}
      position="relative"
      overflow="hidden"
      width="100%"
      height={height}
      rounded={rounded}
      style={{
        backgroundImage: `linear-gradient(${flip ? 160 : 200}deg, ${a} 0%, ${b} 60%, ${c} 100%)`,
      }}
    >
      <Box
        position="absolute"
        top="14%"
        right={flip ? "70%" : "16%"}
        width="18%"
        paddingBottom="18%"
        rounded="full"
        bg="whiteAlpha.700"
      />
      <Box
        position="absolute"
        left="8%"
        bottom={0}
        width="30%"
        height="52%"
        bg="blackAlpha.300"
        roundedTop="sm"
        style={{ backgroundImage: windows }}
      />
      <Box
        position="absolute"
        left="40%"
        bottom={0}
        width="26%"
        height="68%"
        bg="blackAlpha.400"
        roundedTop="sm"
        style={{ backgroundImage: windows }}
      />
      <Box
        position="absolute"
        left="68%"
        bottom={0}
        width="24%"
        height="40%"
        bg="blackAlpha.300"
        roundedTop="sm"
        style={{ backgroundImage: windows }}
      />
    </Box>
  );
}
```

```tsx components/site-header.tsx
import { Box, Flex, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";
import { LuHouse } from "react-icons/lu";
import { SITE } from "../lib/data";

export function SiteHeader() {
  return (
    <Box
      as="header"
      borderBottomWidth="1px"
      bg="bg"
      px={{ base: 4, md: 6 }}
      py={3}
      flexShrink={0}
    >
      <Flex align="center" justify="space-between" gap={4}>
        <ChakraLink
          asChild
          fontWeight="bold"
          fontSize="xl"
          color="teal.600"
          _dark={{ color: "teal.300" }}
          textDecoration="none"
          _hover={{ textDecoration: "none" }}
        >
          <NextLink href="/" aria-label="Haven home">
            <Flex align="center" gap={2}>
              <LuHouse aria-hidden="true" />
              {SITE.name}
            </Flex>
          </NextLink>
        </ChakraLink>
        <Box color="fg.muted" fontSize="sm" display={{ base: "none", sm: "block" }}>
          Homes for sale in {SITE.city}
        </Box>
      </Flex>
    </Box>
  );
}
```

```tsx components/home-card.tsx
"use client";

import { Badge, Box, Flex, HStack, IconButton, Link as ChakraLink, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { LuBath, LuBedDouble, LuHeart, LuMaximize } from "react-icons/lu";
import { Placeholder } from "./placeholder";
import { bedsLabel, formatPrice, isNew, type Home } from "../lib/data";

interface HomeCardProps {
  home: Home;
  highlighted: boolean;
  saved: boolean;
  onHover: (id: string | null) => void;
  onToggleSave: (id: string) => void;
}

export function HomeCard({ home, highlighted, saved, onHover, onToggleSave }: HomeCardProps) {
  const fresh = isNew(home.listed);
  return (
    <Box
      as="article"
      id={`card-${home.id}`}
      aria-labelledby={`title-${home.id}`}
      position="relative"
      borderWidth="2px"
      borderColor={highlighted ? "teal.500" : "border"}
      rounded="lg"
      overflow="hidden"
      bg="bg"
      shadow={highlighted ? "md" : "xs"}
      transition="box-shadow 0.15s, border-color 0.15s"
      onMouseEnter={() => onHover(home.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(home.id)}
      onBlur={() => onHover(null)}
    >
      <Box position="relative">
        <Placeholder id={home.id} height="150px" rounded="0" label={`Photo placeholder for ${home.title}`} />
        {fresh && (
          <Badge position="absolute" top={2} left={2} colorPalette="orange" variant="solid">
            New
          </Badge>
        )}
        <IconButton
          aria-label={saved ? `Remove ${home.title} from saved homes` : `Save ${home.title}`}
          aria-pressed={saved}
          position="absolute"
          top={2}
          right={2}
          size="sm"
          rounded="full"
          variant="solid"
          colorPalette={saved ? "red" : "gray"}
          onClick={() => onToggleSave(home.id)}
        >
          <LuHeart fill={saved ? "currentColor" : "none"} />
        </IconButton>
      </Box>
      <Box p={3}>
        <Flex justify="space-between" align="baseline" gap={2}>
          <Text fontWeight="bold" fontSize="xl">
            {formatPrice(home.price)}
          </Text>
          <Text fontSize="xs" color="fg.muted">
            {home.type}
          </Text>
        </Flex>
        <ChakraLink
          asChild
          id={`title-${home.id}`}
          fontWeight="medium"
          display="block"
          mt={0.5}
        >
          <NextLink href={`/homes/${home.id}`}>{home.title}</NextLink>
        </ChakraLink>
        <HStack gap={4} mt={2} color="fg.muted" fontSize="sm" wrap="wrap">
          <Flex align="center" gap={1}>
            <LuBedDouble aria-hidden="true" /> {bedsLabel(home.beds)}
          </Flex>
          <Flex align="center" gap={1}>
            <LuBath aria-hidden="true" /> {home.baths} bath{home.baths === 1 ? "" : "s"}
          </Flex>
          <Flex align="center" gap={1}>
            <LuMaximize aria-hidden="true" /> {home.area_m2} m²
          </Flex>
        </HStack>
        <Text mt={2} fontSize="sm" color="fg.muted">
          {home.district}, Lisbon
        </Text>
      </Box>
    </Box>
  );
}
```

```tsx components/filter-bar.tsx
"use client";

import { Box, Button, Flex, Input, NativeSelect } from "@chakra-ui/react";
import { Field } from "./ui/field";

export interface Filters {
  type: string;
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  sort: string;
}

export const DEFAULT_FILTERS: Filters = {
  type: "any",
  minPrice: "",
  maxPrice: "",
  minBeds: "0",
  sort: "newest",
};

interface FilterBarProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
  canReset: boolean;
}

export function FilterBar({ filters, onChange, onReset, canReset }: FilterBarProps) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  return (
    <Box
      as="form"
      role="search"
      aria-label="Filter homes"
      onSubmit={(e: React.FormEvent) => e.preventDefault()}
      borderBottomWidth="1px"
      bg="bg.muted"
      px={{ base: 4, md: 6 }}
      py={3}
      flexShrink={0}
    >
      <Flex gap={3} wrap="wrap" align="flex-end">
        <Field label="Type" width={{ base: "calc(50% - 6px)", md: "150px" }}>
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              value={filters.type}
              onChange={(e) => set({ type: e.target.value })}
            >
              <option value="any">Any type</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Studio">Studio</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field>
        <Field label="Min price (€)" width={{ base: "calc(50% - 6px)", md: "130px" }}>
          <Input
            size="sm"
            type="number"
            inputMode="numeric"
            min={0}
            step={50000}
            placeholder="No min"
            value={filters.minPrice}
            onChange={(e) => set({ minPrice: e.target.value })}
          />
        </Field>
        <Field label="Max price (€)" width={{ base: "calc(50% - 6px)", md: "130px" }}>
          <Input
            size="sm"
            type="number"
            inputMode="numeric"
            min={0}
            step={50000}
            placeholder="No max"
            value={filters.maxPrice}
            onChange={(e) => set({ maxPrice: e.target.value })}
          />
        </Field>
        <Field label="Min bedrooms" width={{ base: "calc(50% - 6px)", md: "130px" }}>
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              value={filters.minBeds}
              onChange={(e) => set({ minBeds: e.target.value })}
            >
              <option value="0">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field>
        <Field label="Sort by" width={{ base: "calc(50% - 6px)", md: "180px" }}>
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              value={filters.sort}
              onChange={(e) => set({ sort: e.target.value })}
            >
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="size-desc">Size: largest first</option>
              <option value="size-asc">Size: smallest first</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field>
        <Button type="button" size="sm" variant="ghost" onClick={onReset} disabled={!canReset}>
          Reset filters
        </Button>
      </Flex>
    </Box>
  );
}
```

```tsx components/search-map.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import Map, { Marker, NavigationControl, Popup, type MapRef } from "react-map-gl/maplibre";
import { Box, Flex, Link as ChakraLink, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { bedsLabel, formatPrice, shortPrice, SITE, type Home } from "../lib/data";

interface SearchMapProps {
  homes: Home[];
  hoveredId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
}

export default function SearchMap({ homes, hoveredId, selectedId, onHover, onSelect }: SearchMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const selected = homes.find((h) => h.id === selectedId) ?? null;

  // Resize when the container becomes visible (mobile list/map toggle).
  useEffect(() => {
    const map = mapRef.current?.getMap();
    const el = map?.getContainer();
    if (!map || !el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: SITE.mapCenter.lng,
        latitude: SITE.mapCenter.lat,
        zoom: 11.6,
      }}
      mapStyle={SITE.mapStyleUrl}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      onClick={() => onSelect(null)}
    >
      <NavigationControl position="top-right" showCompass={false} />
      {homes.map((home) => {
        const active = home.id === hoveredId || home.id === selectedId;
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
              aria-label={`${home.title}, ${formatPrice(home.price)}. Show details`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(home.id);
              }}
              onMouseEnter={() => onHover(home.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(home.id)}
              onBlur={() => onHover(null)}
              style={{
                background: active ? "#0f766e" : "#ffffff",
                color: active ? "#ffffff" : "#1a202c",
                border: `2px solid ${active ? "#0f766e" : "#4a5568"}`,
                borderRadius: 999,
                padding: "3px 9px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: active ? "0 4px 12px rgba(0,0,0,0.35)" : "0 1px 4px rgba(0,0,0,0.3)",
                transform: active ? "scale(1.18)" : "scale(1)",
                transition: "transform 0.12s, background 0.12s",
                whiteSpace: "nowrap",
              }}
            >
              {shortPrice(home.price)}
            </button>
          </Marker>
        );
      })}
      {selected && (
        <Popup
          longitude={selected.lng}
          latitude={selected.lat}
          anchor="bottom"
          offset={30}
          closeOnClick={false}
          onClose={() => onSelect(null)}
          maxWidth="240px"
        >
          <Box color="gray.900" p={0.5}>
            <Text fontWeight="bold" fontSize="md">
              {formatPrice(selected.price)}
            </Text>
            <Text fontSize="sm" fontWeight="medium">
              {selected.title}
            </Text>
            <Flex gap={2} fontSize="xs" color="gray.600" mt={1} wrap="wrap">
              <span>{bedsLabel(selected.beds)}</span>
              <span>·</span>
              <span>{selected.baths} bath</span>
              <span>·</span>
              <span>{selected.area_m2} m²</span>
            </Flex>
            <Text fontSize="xs" color="gray.600">
              {selected.district}
            </Text>
            <ChakraLink asChild fontSize="sm" color="teal.700" fontWeight="medium" mt={1} display="inline-block">
              <NextLink href={`/homes/${selected.id}`}>View home</NextLink>
            </ChakraLink>
          </Box>
        </Popup>
      )}
    </Map>
  );
}
```

```tsx components/search-map-lazy.tsx
"use client";

import dynamic from "next/dynamic";
import { Flex, Text } from "@chakra-ui/react";

export const SearchMapLazy = dynamic(() => import("./search-map"), {
  ssr: false,
  loading: () => (
    <Flex height="100%" align="center" justify="center" bg="bg.muted">
      <Text color="fg.muted">Loading map…</Text>
    </Flex>
  ),
});
```

```tsx components/search-view.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import { LuList, LuMap } from "react-icons/lu";
import { DEFAULT_FILTERS, FilterBar, type Filters } from "./filter-bar";
import { HomeCard } from "./home-card";
import { SearchMapLazy } from "./search-map-lazy";
import { HOMES, type Home } from "../lib/data";

function applyFilters(homes: Home[], f: Filters): Home[] {
  const min = f.minPrice === "" ? 0 : Number(f.minPrice);
  const max = f.maxPrice === "" ? Infinity : Number(f.maxPrice);
  const beds = Number(f.minBeds);
  const list = homes.filter(
    (h) =>
      (f.type === "any" || h.type === f.type) &&
      h.price >= min &&
      h.price <= max &&
      h.beds >= beds,
  );
  const sorted = [...list];
  switch (f.sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "size-asc":
      sorted.sort((a, b) => a.area_m2 - b.area_m2);
      break;
    case "size-desc":
      sorted.sort((a, b) => b.area_m2 - a.area_m2);
      break;
    default:
      sorted.sort((a, b) => b.listed.localeCompare(a.listed));
  }
  return sorted;
}

export function SearchView() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [view, setView] = useState<"list" | "map">("list");

  const results = useMemo(() => applyFilters(HOMES, filters), [filters]);

  // Drop hover/selection of homes that were filtered out.
  useEffect(() => {
    if (hoveredId && !results.some((h) => h.id === hoveredId)) setHoveredId(null);
    if (selectedId && !results.some((h) => h.id === selectedId)) setSelectedId(null);
  }, [results, hoveredId, selectedId]);

  const toggleSave = (id: string) =>
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const canReset = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);
  const reset = () => setFilters(DEFAULT_FILTERS);

  const selectFromMap = (id: string | null) => {
    setSelectedId(id);
    if (id && typeof window !== "undefined" && window.matchMedia("(min-width: 48em)").matches) {
      document.getElementById(`card-${id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  };

  return (
    <Flex direction="column" flex="1" minHeight={0}>
      <FilterBar filters={filters} onChange={setFilters} onReset={reset} canReset={canReset} />

      <Flex
        px={{ base: 4, md: 6 }}
        py={2}
        align="center"
        justify="space-between"
        gap={3}
        borderBottomWidth="1px"
        flexShrink={0}
      >
        <Heading as="h1" size="md">
          <span aria-live="polite" role="status">
            {results.length} {results.length === 1 ? "home" : "homes"} for sale in Lisbon
          </span>
        </Heading>
        <Flex display={{ base: "flex", md: "none" }} role="group" aria-label="Results view" gap={1}>
          <Button
            size="sm"
            variant={view === "list" ? "solid" : "outline"}
            colorPalette="teal"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <LuList /> List
          </Button>
          <Button
            size="sm"
            variant={view === "map" ? "solid" : "outline"}
            colorPalette="teal"
            aria-pressed={view === "map"}
            onClick={() => setView("map")}
          >
            <LuMap /> Map
          </Button>
        </Flex>
      </Flex>

      <Grid
        flex="1"
        minHeight={0}
        templateColumns={{ base: "1fr", md: "minmax(340px, 480px) 1fr", xl: "minmax(400px, 600px) 1fr" }}
      >
        <Box
          as="section"
          aria-label="Search results"
          display={{ base: view === "list" ? "block" : "none", md: "block" }}
          overflowY={{ md: "auto" }}
          p={4}
          minHeight={0}
        >
          {results.length === 0 ? (
            <Box textAlign="center" py={12} px={4}>
              <Heading as="h2" size="md" mb={2}>
                No homes match these filters
              </Heading>
              <Text color="fg.muted" mb={4}>
                Try widening the price range or lowering the bedroom count.
              </Text>
              <Button variant="outline" onClick={reset}>
                Reset filters
              </Button>
            </Box>
          ) : (
            <Grid
              as="ul"
              listStyleType="none"
              gap={4}
              templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "1fr", xl: "repeat(2, 1fr)" }}
            >
              {results.map((home) => (
                <li key={home.id}>
                  <HomeCard
                    home={home}
                    highlighted={hoveredId === home.id || selectedId === home.id}
                    saved={saved.includes(home.id)}
                    onHover={setHoveredId}
                    onToggleSave={toggleSave}
                  />
                </li>
              ))}
            </Grid>
          )}
        </Box>

        <Box
          as="section"
          aria-label="Map of results"
          display={{ base: view === "map" ? "block" : "none", md: "block" }}
          height={{ base: "70dvh", md: "auto" }}
          minHeight={{ base: "360px", md: 0 }}
          position="relative"
          borderLeftWidth={{ md: "1px" }}
        >
          <SearchMapLazy
            homes={results}
            hoveredId={hoveredId}
            selectedId={selectedId}
            onHover={setHoveredId}
            onSelect={selectFromMap}
          />
        </Box>
      </Grid>
    </Flex>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { Flex } from "@chakra-ui/react";
import { SearchView } from "../components/search-view";
import { SiteHeader } from "../components/site-header";

export const metadata: Metadata = {
  title: "Haven · Homes for sale in Lisbon",
  description: "Search apartments, houses and studios in Lisbon on a map.",
};

export default function Page() {
  return (
    <Flex direction="column" minHeight="100dvh" height={{ md: "100dvh" }}>
      <SiteHeader />
      <Flex as="main" id="main" direction="column" flex="1" minHeight={0}>
        <SearchView />
      </Flex>
    </Flex>
  );
}
```

```tsx components/detail-map.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import { SITE, shortPrice, type Home } from "../lib/data";

export default function DetailMap({ home }: { home: Home }) {
  return (
    <Map
      initialViewState={{ longitude: home.lng, latitude: home.lat, zoom: 14 }}
      mapStyle={SITE.mapStyleUrl}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      scrollZoom={false}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Marker longitude={home.lng} latitude={home.lat} anchor="bottom">
        <div
          role="img"
          aria-label={`${home.title} location, ${home.district}`}
          style={{
            background: "#0f766e",
            color: "#fff",
            border: "2px solid #fff",
            borderRadius: 999,
            padding: "3px 10px",
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
            whiteSpace: "nowrap",
          }}
        >
          {shortPrice(home.price)}
        </div>
      </Marker>
    </Map>
  );
}
```

```tsx components/detail-map-lazy.tsx
"use client";

import dynamic from "next/dynamic";
import { Flex, Text } from "@chakra-ui/react";

export const DetailMapLazy = dynamic(() => import("./detail-map"), {
  ssr: false,
  loading: () => (
    <Flex height="100%" align="center" justify="center" bg="bg.muted">
      <Text color="fg.muted">Loading map…</Text>
    </Flex>
  ),
});
```

```tsx components/contact-form.tsx
"use client";

import { useState } from "react";
import { Alert, Box, Button, Heading, Input, Stack, Text, Textarea } from "@chakra-ui/react";
import { Field } from "./ui/field";
import { AGENT } from "../lib/data";

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

function validate(name: string, email: string, message: string): Errors {
  const errors: Errors = {};
  if (!name.trim()) errors.name = "Enter your name.";
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.email = "Enter a valid email address, like name@example.com.";
  if (!message.trim()) errors.message = "Write a short message for the agent.";
  return errors;
}

export function ContactForm({ homeTitle }: { homeTitle: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validate(name, email, message);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setSent(false);
      const first = (["name", "email", "message"] as const).find((k) => next[k]);
      if (first) document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <Box as="section" aria-labelledby="contact-heading" borderWidth="1px" rounded="lg" p={5} bg="bg">
      <Heading as="h2" id="contact-heading" size="md">
        Contact {AGENT.name}
      </Heading>
      <Text color="fg.muted" fontSize="sm" mt={1} mb={4}>
        {AGENT.agency} · {AGENT.phone}
      </Text>

      {sent && (
        <Alert.Root status="success" mb={4} role="status">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Message sent</Alert.Title>
            <Alert.Description>
              {AGENT.name} will reply about “{homeTitle}” within one working day.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <form onSubmit={onSubmit} noValidate>
        <Stack gap={4}>
          <Field label="Name" required invalid={!!errors.name} errorText={errors.name}>
            <Input
              id="contact-name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Maria Santos"
            />
          </Field>
          <Field label="Email" required invalid={!!errors.email} errorText={errors.email}>
            <Input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maria@example.com"
            />
          </Field>
          <Field label="Message" required invalid={!!errors.message} errorText={errors.message}>
            <Textarea
              id="contact-message"
              name="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'd like to arrange a viewing this week."
            />
          </Field>
          <Button type="submit" colorPalette="teal">
            Send message
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
```

```tsx components/gallery.tsx
import { Box, Grid } from "@chakra-ui/react";
import { Placeholder } from "./placeholder";

const LABELS = ["Living room", "Kitchen", "Bedroom", "Bathroom", "Exterior"];

export function Gallery({ id, title }: { id: string; title: string }) {
  return (
    <Box as="section" aria-label={`Photo gallery for ${title}`}>
      <Grid
        gap={2}
        templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
        templateRows={{ md: "repeat(2, 130px)" }}
      >
        <Box gridColumn="span 2" gridRow={{ md: "span 2" }}>
          <Placeholder
            id={id}
            variant={0}
            height={{ base: "200px", md: "100%" }}
            label={`${title}: ${LABELS[0]} (placeholder)`}
          />
        </Box>
        {LABELS.slice(1).map((label, i) => (
          <Box key={label}>
            <Placeholder
              id={id}
              variant={i + 1}
              height={{ base: "100px", md: "100%" }}
              label={`${title}: ${label} (placeholder)`}
            />
          </Box>
        ))}
      </Grid>
    </Box>
  );
}
```

```tsx components/energy-rating.tsx
import { Box, Flex, Text } from "@chakra-ui/react";

const SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const COLORS: Record<string, string> = {
  "A+": "#0a7d3b",
  A: "#2e9c3f",
  B: "#6aae2f",
  C: "#b5c21f",
  D: "#e3b416",
  E: "#e8861a",
  F: "#d9541f",
};

export function EnergyRating({ rating }: { rating: string }) {
  return (
    <Box>
      <Flex gap={1} role="img" aria-label={`Energy rating ${rating} on a scale from A+ (best) to F (worst)`}>
        {SCALE.map((r) => {
          const active = r === rating;
          return (
            <Flex
              key={r}
              aria-hidden="true"
              align="center"
              justify="center"
              width={active ? "52px" : "36px"}
              height={active ? "44px" : "30px"}
              alignSelf="flex-end"
              rounded="sm"
              fontWeight="bold"
              fontSize={active ? "lg" : "sm"}
              style={{
                background: COLORS[r],
                color: r === "C" || r === "D" ? "#1a202c" : "#ffffff",
                outline: active ? "3px solid #1a202c" : "none",
                outlineOffset: 1,
                opacity: active ? 1 : 0.55,
              }}
            >
              {r}
            </Flex>
          );
        })}
      </Flex>
      <Text fontSize="xs" color="fg.muted" mt={2}>
        Scale from A+ (most efficient) to F (least efficient).
      </Text>
    </Box>
  );
}
```

```tsx app/homes/[id]/page.tsx
import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Badge, Box, Flex, Grid, Heading, HStack, Link as ChakraLink, Text } from "@chakra-ui/react";
import { LuArrowLeft, LuBath, LuBedDouble, LuCalendar, LuCheck, LuMapPin, LuMaximize } from "react-icons/lu";
import { ContactForm } from "../../../components/contact-form";
import { DetailMapLazy } from "../../../components/detail-map-lazy";
import { EnergyRating } from "../../../components/energy-rating";
import { Gallery } from "../../../components/gallery";
import { SiteHeader } from "../../../components/site-header";
import { bedsLabel, formatListed, formatPrice, getHome, HOMES, isNew } from "../../../lib/data";

export function generateStaticParams() {
  return HOMES.map((h) => ({ id: h.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const home = getHome(id);
  if (!home) return { title: "Home not found · Haven" };
  return {
    title: `${home.title}, ${home.district} · Haven`,
    description: `${bedsLabel(home.beds)}, ${home.baths} bath, ${home.area_m2} m² in ${home.district}, Lisbon for ${formatPrice(home.price)}.`,
  };
}

export default async function HomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();

  const facts: Array<{ icon: React.ReactNode; label: string; value: string }> = [
    { icon: <LuBedDouble aria-hidden="true" />, label: "Bedrooms", value: home.beds === 0 ? "Studio" : String(home.beds) },
    { icon: <LuBath aria-hidden="true" />, label: "Bathrooms", value: String(home.baths) },
    { icon: <LuMaximize aria-hidden="true" />, label: "Area", value: `${home.area_m2} m²` },
    { icon: <LuCalendar aria-hidden="true" />, label: "Built", value: String(home.year) },
  ];

  return (
    <Box minHeight="100dvh">
      <SiteHeader />
      <Box as="main" id="main" maxWidth="1200px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
        <ChakraLink asChild fontSize="sm" color="teal.600" _dark={{ color: "teal.300" }}>
          <NextLink href="/">
            <LuArrowLeft aria-hidden="true" /> Back to all homes
          </NextLink>
        </ChakraLink>

        <Box mt={4}>
          <Gallery id={home.id} title={home.title} />
        </Box>

        <Grid
          mt={6}
          gap={{ base: 6, lg: 8 }}
          templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) 380px" }}
          alignItems="start"
        >
          <Box minWidth={0}>
            <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
              <Box>
                <Heading as="h1" size={{ base: "xl", md: "2xl" }}>
                  {formatPrice(home.price)}
                </Heading>
                <Text fontSize="lg" fontWeight="medium" mt={1}>
                  {home.title}
                </Text>
                <Flex align="center" gap={1} color="fg.muted" mt={1}>
                  <LuMapPin aria-hidden="true" /> {home.district}, Lisbon
                </Flex>
              </Box>
              <HStack>
                <Badge colorPalette="teal" size="lg">
                  {home.type}
                </Badge>
                {isNew(home.listed) && (
                  <Badge colorPalette="orange" variant="solid" size="lg">
                    New
                  </Badge>
                )}
              </HStack>
            </Flex>

            <Grid
              as="dl"
              mt={5}
              gap={3}
              templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
            >
              {facts.map((f) => (
                <Box key={f.label} borderWidth="1px" rounded="lg" p={3} bg="bg.muted">
                  <Flex as="dt" align="center" gap={1.5} fontSize="sm" color="fg.muted">
                    {f.icon} {f.label}
                  </Flex>
                  <Text as="dd" fontWeight="bold" fontSize="xl" mt={1}>
                    {f.value}
                  </Text>
                </Box>
              ))}
            </Grid>
            <Text mt={3} fontSize="sm" color="fg.muted">
              Listed on {formatListed(home.listed)} · {formatPrice(Math.round(home.price / home.area_m2))} per m²
            </Text>

            <Box as="section" aria-labelledby="features-heading" mt={8}>
              <Heading as="h2" id="features-heading" size="md" mb={3}>
                Features
              </Heading>
              <Grid as="ul" listStyleType="none" gap={2} templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }}>
                {home.features.map((feature) => (
                  <Flex as="li" key={feature} align="center" gap={2}>
                    <Box color="teal.600" _dark={{ color: "teal.300" }}>
                      <LuCheck aria-hidden="true" />
                    </Box>
                    {feature}
                  </Flex>
                ))}
              </Grid>
            </Box>

            <Box as="section" aria-labelledby="energy-heading" mt={8}>
              <Heading as="h2" id="energy-heading" size="md" mb={3}>
                Energy rating
              </Heading>
              <EnergyRating rating={home.energy} />
            </Box>

            <Box as="section" aria-labelledby="location-heading" mt={8}>
              <Heading as="h2" id="location-heading" size="md" mb={3}>
                Location
              </Heading>
              <Box height="280px" rounded="lg" overflow="hidden" borderWidth="1px">
                <DetailMapLazy home={home} />
              </Box>
            </Box>
          </Box>

          <Box position={{ lg: "sticky" }} top={{ lg: 4 }}>
            <ContactForm homeTitle={home.title} />
          </Box>
        </Grid>
      </Box>
    </Box>
  );
}
```

```tsx app/homes/[id]/not-found.tsx
import NextLink from "next/link";
import { Box, Heading, Link as ChakraLink, Text } from "@chakra-ui/react";
import { SiteHeader } from "../../../components/site-header";

export default function NotFound() {
  return (
    <Box minHeight="100dvh">
      <SiteHeader />
      <Box as="main" id="main" maxWidth="600px" mx="auto" px={4} py={16} textAlign="center">
        <Heading as="h1" size="xl" mb={2}>
          We couldn’t find that home
        </Heading>
        <Text color="fg.muted" mb={4}>
          It may have been sold or taken off the market.
        </Text>
        <ChakraLink asChild color="teal.600" _dark={{ color: "teal.300" }}>
          <NextLink href="/">Back to all homes</NextLink>
        </ChakraLink>
      </Box>
    </Box>
  );
}
```