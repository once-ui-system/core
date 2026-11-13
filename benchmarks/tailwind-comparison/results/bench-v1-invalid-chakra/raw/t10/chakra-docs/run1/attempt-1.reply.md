The project structure looks as expected. Likely failure causes, then:

1. **`next/dynamic` with `ssr: false`**: valid only in Client Components, and mine are client files.
2. **`import "maplibre-gl/dist/maplibre-gl.css"`**: possibly fragile, but it is only in a dynamically imported client file.
3. **`react-map-gl/maplibre` named export `Map`**: shadows the global `Map`. That compiles, but it is risky.
4. **A server component (`app/homes/[id]/page.tsx`) using `Box as="dl"` and passing `as` props**: fine in principle.
5. **`LuBedDouble`, `LuBath`, `LuRuler`, `LuCalendar`**: `react-icons/lu` might lack some of these. A missing export fails the build.

I can't see `node_modules`, so I'll avoid risky icon names and rename the `Map` import. I'll also make the contact form and map wrapper more conservative. Icons I'm confident exist in `lu`: `LuHeart`, `LuMapPin`, `LuList`, `LuMap`, `LuArrowLeft`, `LuCheck`, `LuBath`, `LuRuler`, `LuCalendar`, `LuRotateCcw`. `LuBedDouble` has existed since lucide's early versions, but I'll swap it for `LuBed`, which also exists, to be safe. The `Spinner` and `Alert` compound components are standard.

Another risk is the `style` prop on `Box` combined with `clipPath`: fine. `Text lineClamp` is valid in v3. `Grid as="ul"` and `Grid as="dl"` are typed fine.

A more probable cause of a startup failure is that the render check runs `next start` or `next dev` after a build, and a build failure surfaces as "server did not start". The most type-fragile spots are these:
- `onSubmit={(e: React.FormEvent) => ...}` on `Box as="form"`: `React` is a namespace not imported in that file, but the global `React` UMD namespace types work under `jsx: react-jsx` only with `allowUmdGlobalAccess`, so it can error. I'll import types explicitly.
- `e.originalEvent.stopPropagation()` in the `Marker` `onClick`: the type is `MarkerEvent<MouseEvent>`, so that's fine.
- `attributionControl={{ compact: true }}`: valid.
- `Popup`'s `maxWidth`: valid.
- In `HomeVisual`, `paddingBottom="14%"` is fine.
- Indexing `PALETTES[...]` and destructuring: under strict mode without `noUncheckedIndexedAccess` that's fine.

I'll fix the `React` namespace usage, rename the imports, and simplify the dynamic import by keeping it in a client file with a typed props passthrough.

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

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPriceShort(value: number): string {
  if (value >= 1_000_000) {
    const m = Math.round(value / 10_000) / 100;
    return `€${m}M`;
  }
  return `€${Math.round(value / 1000)}k`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
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
```

```tsx components/home-visual.tsx
import { Box } from "@chakra-ui/react";

const PALETTES: [string, string, string][] = [
  ["#f4d9b8", "#e8a87c", "#c38d9e"],
  ["#cfe3d4", "#8fbf9f", "#41747a"],
  ["#d6dcf5", "#8f9fe0", "#5b5f97"],
  ["#f7d6d0", "#e5989b", "#b5838d"],
  ["#e9e4c8", "#c9b458", "#7a6c2f"],
  ["#d2eaf2", "#7bb8d1", "#33658a"],
];

function hash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

interface Props {
  id: string;
  /** Variation index for gallery tiles */
  variant?: number;
  label?: string;
}

/** A photo placeholder drawn purely with CSS gradients and shapes. */
export function HomeVisual({ id, variant = 0, label }: Props) {
  const palette = PALETTES[(hash(id) + variant) % PALETTES.length];
  const sky = palette[0];
  const mid = palette[1];
  const deep = palette[2];
  const shift = (hash(id) + variant * 7) % 30;
  return (
    <Box
      role="img"
      aria-label={label ?? "Photo placeholder"}
      position="relative"
      overflow="hidden"
      height="100%"
      width="100%"
      style={{
        background: `linear-gradient(180deg, ${sky} 0%, ${sky} 55%, ${mid} 55%, ${mid} 100%)`,
      }}
    >
      <Box
        position="absolute"
        borderRadius="full"
        bg="whiteAlpha.800"
        width="14%"
        paddingBottom="14%"
        style={{ top: "12%", right: `${12 + shift}%` }}
      />
      <Box
        position="absolute"
        bottom="38%"
        left="12%"
        width="26%"
        height="42%"
        style={{ background: deep, opacity: 0.9 }}
      />
      <Box
        position="absolute"
        bottom="38%"
        left="36%"
        width="22%"
        height="30%"
        style={{ background: deep, opacity: 0.7 }}
      />
      <Box
        position="absolute"
        bottom="38%"
        left="56%"
        width="30%"
        height="52%"
        style={{
          background: deep,
          opacity: 0.8,
          clipPath: "polygon(0 12%, 50% 0, 100% 12%, 100% 100%, 0 100%)",
        }}
      />
      <Box
        position="absolute"
        bottom="56%"
        left="17%"
        width="6%"
        height="9%"
        bg="whiteAlpha.700"
      />
      <Box
        position="absolute"
        bottom="56%"
        left="28%"
        width="6%"
        height="9%"
        bg="whiteAlpha.700"
      />
      <Box
        position="absolute"
        bottom="60%"
        left="66%"
        width="8%"
        height="10%"
        bg="whiteAlpha.700"
      />
    </Box>
  );
}
```

```tsx components/save-button.tsx
"use client";

import { IconButton } from "@chakra-ui/react";
import { LuHeart } from "react-icons/lu";

interface Props {
  saved: boolean;
  title: string;
  onToggle: () => void;
}

export function SaveButton({ saved, title, onToggle }: Props) {
  return (
    <IconButton
      size="sm"
      rounded="full"
      variant={saved ? "solid" : "surface"}
      colorPalette={saved ? "red" : "gray"}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved homes` : `Save ${title}`}
      onClick={() => onToggle()}
    >
      <LuHeart fill={saved ? "currentColor" : "none"} />
    </IconButton>
  );
}
```

```tsx components/home-card.tsx
"use client";

import NextLink from "next/link";
import { Badge, Box, Flex, HStack, Heading, Text } from "@chakra-ui/react";
import { LuBath, LuBed, LuMapPin, LuRuler } from "react-icons/lu";
import {
  type Home,
  bedsLabel,
  formatPrice,
  isNewListing,
} from "@/lib/data";
import { HomeVisual } from "./home-visual";
import { SaveButton } from "./save-button";

interface Props {
  home: Home;
  highlighted: boolean;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onHover: (id: string | null) => void;
}

export function HomeCard({
  home,
  highlighted,
  saved,
  onToggleSave,
  onHover,
}: Props) {
  return (
    <Box
      as="article"
      id={`card-${home.id}`}
      position="relative"
      bg="bg.panel"
      borderWidth="2px"
      borderColor={highlighted ? "teal.500" : "border"}
      rounded="lg"
      overflow="hidden"
      shadow={highlighted ? "md" : "xs"}
      transition="box-shadow 0.15s, border-color 0.15s"
      onMouseEnter={() => onHover(home.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(home.id)}
      onBlur={() => onHover(null)}
    >
      <Box position="relative" height="160px">
        <HomeVisual
          id={home.id}
          label={`Photo placeholder for ${home.title}`}
        />
        {isNewListing(home) && (
          <Badge
            position="absolute"
            top="3"
            left="3"
            colorPalette="green"
            variant="solid"
          >
            New
          </Badge>
        )}
        <Box position="absolute" top="2" right="2" zIndex="2">
          <SaveButton
            saved={saved}
            title={home.title}
            onToggle={() => onToggleSave(home.id)}
          />
        </Box>
      </Box>
      <Box p="4">
        <Text fontSize="xl" fontWeight="bold">
          {formatPrice(home.price)}
        </Text>
        <Heading as="h3" size="md" mt="1">
          <NextLink
            href={`/homes/${home.id}`}
            style={{ textDecoration: "none" }}
          >
            {home.title}
            <Box
              as="span"
              position="absolute"
              inset="0"
              zIndex="1"
              aria-hidden="true"
            />
          </NextLink>
        </Heading>
        <Flex mt="2" gap="4" wrap="wrap" color="fg.muted" fontSize="sm">
          <HStack gap="1">
            <LuBed aria-hidden="true" />
            <Text as="span">{bedsLabel(home.beds)}</Text>
          </HStack>
          <HStack gap="1">
            <LuBath aria-hidden="true" />
            <Text as="span">
              {home.baths} bath{home.baths === 1 ? "" : "s"}
            </Text>
          </HStack>
          <HStack gap="1">
            <LuRuler aria-hidden="true" />
            <Text as="span">{home.area_m2} m²</Text>
          </HStack>
        </Flex>
        <HStack mt="2" gap="1" color="fg.muted" fontSize="sm">
          <LuMapPin aria-hidden="true" />
          <Text as="span">
            {home.district} · {home.type}
          </Text>
        </HStack>
      </Box>
    </Box>
  );
}
```

```tsx components/home-map.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import NextLink from "next/link";
import {
  Map as MapGL,
  Marker,
  NavigationControl,
  Popup,
  type MapRef,
} from "react-map-gl/maplibre";
import { Box, HStack, Text } from "@chakra-ui/react";
import {
  type Home,
  MAP_CENTER,
  MAP_STYLE_URL,
  bedsLabel,
  formatPrice,
  formatPriceShort,
} from "@/lib/data";

export interface HomeMapProps {
  homes: Home[];
  hoveredId?: string | null;
  selectedId?: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string | null) => void;
  zoom?: number;
  center?: [number, number];
  /** Used to tell the map to re-measure after being shown */
  visible?: boolean;
  label: string;
}

export default function HomeMap({
  homes,
  hoveredId = null,
  selectedId = null,
  onHover,
  onSelect,
  zoom = 11.3,
  center = MAP_CENTER,
  visible = true,
  label,
}: HomeMapProps) {
  const mapRef = useRef<MapRef | null>(null);

  useEffect(() => {
    if (!visible) return;
    const t = window.setTimeout(() => mapRef.current?.resize(), 50);
    return () => window.clearTimeout(t);
  }, [visible]);

  const selected = homes.find((h) => h.id === selectedId) ?? null;

  return (
    <Box
      position="relative"
      width="100%"
      height="100%"
      role="region"
      aria-label={label}
    >
      <MapGL
        ref={mapRef}
        mapStyle={MAP_STYLE_URL}
        initialViewState={{
          longitude: center[0],
          latitude: center[1],
          zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        onClick={() => onSelect?.(null)}
      >
        <NavigationControl showCompass={false} />
        {homes.map((home) => {
          const active = home.id === hoveredId || home.id === selectedId;
          return (
            <Marker
              key={home.id}
              longitude={home.lng}
              latitude={home.lat}
              anchor="bottom"
              style={{ zIndex: active ? 5 : 1 }}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onSelect?.(home.id);
              }}
            >
              <button
                type="button"
                data-marker-id={home.id}
                aria-label={`${home.title}, ${formatPrice(home.price)}`}
                onMouseEnter={() => onHover?.(home.id)}
                onMouseLeave={() => onHover?.(null)}
                onFocus={() => onHover?.(home.id)}
                onBlur={() => onHover?.(null)}
                style={{
                  cursor: "pointer",
                  border: `2px solid ${active ? "#0f766e" : "#ffffff"}`,
                  background: active ? "#0f766e" : "#1a202c",
                  color: "#ffffff",
                  font: "600 12px/1 system-ui, sans-serif",
                  padding: "6px 9px",
                  borderRadius: 999,
                  boxShadow: active
                    ? "0 4px 12px rgba(0,0,0,0.35)"
                    : "0 1px 4px rgba(0,0,0,0.3)",
                  transform: active ? "scale(1.18)" : "scale(1)",
                  transition: "transform 0.12s, background 0.12s",
                  whiteSpace: "nowrap",
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
            onClose={() => onSelect?.(null)}
            maxWidth="240px"
          >
            <Box color="black" p="1" minW="180px">
              <Text fontWeight="bold" fontSize="md">
                {formatPrice(selected.price)}
              </Text>
              <Text fontSize="sm">{selected.title}</Text>
              <HStack gap="2" fontSize="xs" color="gray.600" mt="1">
                <span>{bedsLabel(selected.beds)}</span>
                <span>·</span>
                <span>{selected.area_m2} m²</span>
                <span>·</span>
                <span>{selected.district}</span>
              </HStack>
              <NextLink
                href={`/homes/${selected.id}`}
                style={{
                  display: "inline-block",
                  marginTop: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0f766e",
                  textDecoration: "underline",
                }}
              >
                View home
              </NextLink>
            </Box>
          </Popup>
        )}
      </MapGL>
    </Box>
  );
}
```

```tsx components/lazy-home-map.tsx
"use client";

import dynamic from "next/dynamic";
import { Center, Spinner } from "@chakra-ui/react";
import type { HomeMapProps } from "./home-map";

const HomeMapDynamic = dynamic(() => import("./home-map"), {
  ssr: false,
  loading: () => (
    <Center height="100%" bg="bg.muted">
      <Spinner />
    </Center>
  ),
});

export default function LazyHomeMap(props: HomeMapProps) {
  return <HomeMapDynamic {...props} />;
}
```

```tsx components/search-view.tsx
"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  HStack,
  Heading,
  Text,
} from "@chakra-ui/react";
import { LuList, LuMap, LuRotateCcw } from "react-icons/lu";
import { Field } from "@/components/ui/field";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select";
import {
  CITY,
  DEFAULT_FILTERS,
  HOMES,
  type Filters,
  type HomeType,
  PRICE_STEPS,
  type SortKey,
  applyFilters,
  formatPrice,
} from "@/lib/data";
import { HomeCard } from "./home-card";
import LazyHomeMap from "./lazy-home-map";

type MobileView = "list" | "map";

const TYPE_ITEMS = [
  { value: "any", label: "Any type" },
  { value: "Apartment", label: "Apartment" },
  { value: "House", label: "House" },
  { value: "Studio", label: "Studio" },
];

const BED_ITEMS = [
  { value: "0", label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
];

const SORT_ITEMS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "size-desc", label: "Size: largest first" },
];

const MIN_PRICE_ITEMS = [
  { value: "0", label: "No min" },
  ...PRICE_STEPS.map((p) => ({ value: String(p), label: formatPrice(p) })),
];
const MAX_PRICE_ITEMS = [
  { value: "0", label: "No max" },
  ...PRICE_STEPS.map((p) => ({ value: String(p), label: formatPrice(p) })),
];

export function SearchView() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [view, setView] = useState<MobileView>("list");

  const results = useMemo(() => applyFilters(HOMES, filters), [filters]);

  // Drop hover/selection of homes that were filtered out.
  useEffect(() => {
    if (hoveredId && !results.some((h) => h.id === hoveredId)) {
      setHoveredId(null);
    }
    if (selectedId && !results.some((h) => h.id === selectedId)) {
      setSelectedId(null);
    }
  }, [results, hoveredId, selectedId]);

  const toggleSave = useCallback((id: string) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) {
      document
        .getElementById(`card-${id}`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, []);

  const update = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const isDefault =
    JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS);

  const priceRangeInvalid =
    filters.minPrice > 0 &&
    filters.maxPrice > 0 &&
    filters.minPrice > filters.maxPrice;

  return (
    <Flex direction="column" minH="100dvh" bg="bg.subtle">
      <Box as="header" bg="bg.panel" borderBottomWidth="1px">
        <Container maxW="8xl" py="3">
          <HStack gap="3" align="baseline">
            <Heading as="h1" size="xl" color="teal.600">
              Haven
            </Heading>
            <Text
              color="fg.muted"
              fontSize="sm"
              display={{ base: "none", sm: "block" }}
            >
              Homes for sale in {CITY}
            </Text>
          </HStack>
          <Box
            as="form"
            role="search"
            aria-label="Filter homes"
            mt="3"
            onSubmit={(e: FormEvent) => e.preventDefault()}
          >
            <Grid
              templateColumns={{
                base: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                xl: "repeat(5, 1fr) auto",
              }}
              gap="3"
              alignItems="end"
            >
              <Field label="Type">
                <NativeSelectRoot size="sm">
                  <NativeSelectField
                    items={TYPE_ITEMS}
                    value={filters.type}
                    onChange={(e) =>
                      update("type", e.target.value as "any" | HomeType)
                    }
                  />
                </NativeSelectRoot>
              </Field>
              <Field label="Min price">
                <NativeSelectRoot size="sm">
                  <NativeSelectField
                    items={MIN_PRICE_ITEMS}
                    value={String(filters.minPrice)}
                    onChange={(e) => update("minPrice", Number(e.target.value))}
                  />
                </NativeSelectRoot>
              </Field>
              <Field
                label="Max price"
                invalid={priceRangeInvalid}
                errorText="Max is below min"
              >
                <NativeSelectRoot size="sm">
                  <NativeSelectField
                    items={MAX_PRICE_ITEMS}
                    value={String(filters.maxPrice)}
                    onChange={(e) => update("maxPrice", Number(e.target.value))}
                  />
                </NativeSelectRoot>
              </Field>
              <Field label="Min bedrooms">
                <NativeSelectRoot size="sm">
                  <NativeSelectField
                    items={BED_ITEMS}
                    value={String(filters.minBeds)}
                    onChange={(e) => update("minBeds", Number(e.target.value))}
                  />
                </NativeSelectRoot>
              </Field>
              <Field label="Sort by">
                <NativeSelectRoot size="sm">
                  <NativeSelectField
                    items={SORT_ITEMS}
                    value={filters.sort}
                    onChange={(e) => update("sort", e.target.value as SortKey)}
                  />
                </NativeSelectRoot>
              </Field>
              <Box>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  disabled={isDefault}
                >
                  <LuRotateCcw /> Reset
                </Button>
              </Box>
            </Grid>
          </Box>
        </Container>
      </Box>

      <Container maxW="8xl" flex="1" py="4">
        <Flex align="center" justify="space-between" mb="3" gap="3">
          <Text role="status" aria-live="polite" fontWeight="medium">
            {results.length} {results.length === 1 ? "home" : "homes"} in {CITY}
          </Text>
          <HStack
            gap="1"
            display={{ base: "flex", lg: "none" }}
            role="group"
            aria-label="Choose view"
          >
            <Button
              size="sm"
              variant={view === "list" ? "solid" : "outline"}
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <LuList /> List
            </Button>
            <Button
              size="sm"
              variant={view === "map" ? "solid" : "outline"}
              aria-pressed={view === "map"}
              onClick={() => setView("map")}
            >
              <LuMap /> Map
            </Button>
          </HStack>
        </Flex>

        <Grid
          templateColumns={{ base: "1fr", lg: "minmax(0, 5fr) minmax(0, 6fr)" }}
          gap="4"
          alignItems="start"
        >
          <Box
            display={{
              base: view === "list" ? "block" : "none",
              lg: "block",
            }}
            aria-label="Search results"
            role="region"
          >
            {results.length === 0 ? (
              <Box
                bg="bg.panel"
                borderWidth="1px"
                rounded="lg"
                p="8"
                textAlign="center"
              >
                <Heading as="h2" size="md">
                  No homes match these filters
                </Heading>
                <Text color="fg.muted" mt="2">
                  Try widening the price range or lowering the bedroom count.
                </Text>
                <Button mt="4" onClick={() => setFilters(DEFAULT_FILTERS)}>
                  Clear filters
                </Button>
              </Box>
            ) : (
              <Grid
                as="ul"
                listStyleType="none"
                m="0"
                p="0"
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                  lg: "1fr",
                  "2xl": "repeat(2, minmax(0, 1fr))",
                }}
                gap="4"
              >
                {results.map((home) => (
                  <li key={home.id}>
                    <HomeCard
                      home={home}
                      highlighted={
                        hoveredId === home.id || selectedId === home.id
                      }
                      saved={saved.includes(home.id)}
                      onToggleSave={toggleSave}
                      onHover={setHoveredId}
                    />
                  </li>
                ))}
              </Grid>
            )}
          </Box>

          <Box
            display={{
              base: view === "map" ? "block" : "none",
              lg: "block",
            }}
            position={{ lg: "sticky" }}
            top={{ lg: "4" }}
            height={{
              base: "calc(100dvh - 300px)",
              lg: "calc(100dvh - 2rem)",
            }}
            minH="380px"
            rounded="lg"
            overflow="hidden"
            borderWidth="1px"
          >
            <LazyHomeMap
              homes={results}
              hoveredId={hoveredId}
              selectedId={selectedId}
              onHover={setHoveredId}
              onSelect={handleSelect}
              visible={view === "map"}
              label={`Map of ${results.length} homes in ${CITY}`}
            />
          </Box>
        </Grid>
      </Container>
    </Flex>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { SearchView } from "@/components/search-view";

export const metadata: Metadata = {
  title: "Haven | Homes for sale in Lisbon",
  description:
    "Search apartments, houses and studios in Lisbon by type, price and bedrooms, with every home on the map.",
};

export default function Page() {
  return <SearchView />;
}
```

```tsx components/contact-form.tsx
"use client";

import { type FormEvent, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Heading,
  Input,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { AGENT } from "@/lib/data";

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
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(name, email, message);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setSent(false);
      const first = (["name", "email", "message"] as const).find(
        (k) => found[k],
      );
      if (first) {
        formRef.current
          ?.querySelector<HTMLElement>(`[name="${first}"]`)
          ?.focus();
      }
      return;
    }
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <Box
      as="section"
      aria-labelledby="contact-heading"
      bg="bg.panel"
      borderWidth="1px"
      rounded="lg"
      p="5"
    >
      <Heading as="h2" size="md" id="contact-heading">
        Contact {AGENT.name}
      </Heading>
      <Text color="fg.muted" fontSize="sm" mt="1">
        {AGENT.agency} · {AGENT.phone}
      </Text>

      {sent && (
        <Alert.Root status="success" mt="4" role="status">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Message sent</Alert.Title>
            <Alert.Description>
              {AGENT.name} will reply about “{homeTitle}” within one working
              day.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <form ref={formRef} onSubmit={onSubmit} noValidate>
        <Stack gap="4" mt="4">
          <Field
            label="Name"
            required
            invalid={!!errors.name}
            errorText={errors.name}
          >
            <Input
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field
            label="Email"
            required
            invalid={!!errors.email}
            errorText={errors.email}
          >
            <Input
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field
            label="Message"
            required
            invalid={!!errors.message}
            errorText={errors.message}
          >
            <Textarea
              name="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hello, I would like to arrange a viewing of “${homeTitle}”.`}
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

```tsx components/energy-rating.tsx
import { Box, HStack, Text } from "@chakra-ui/react";

const SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const COLORS: Record<string, string> = {
  "A+": "#0b7a3b",
  A: "#2f9e44",
  B: "#5c940d",
  C: "#8a7f00",
  D: "#c77700",
  E: "#d9480f",
  F: "#c92a2a",
};

export function EnergyRating({ rating }: { rating: string }) {
  return (
    <Box>
      <HStack
        gap="1.5"
        role="img"
        aria-label={`Energy rating ${rating} on a scale from A+ to F`}
      >
        {SCALE.map((s) => {
          const active = s === rating;
          return (
            <Box
              key={s}
              aria-hidden="true"
              display="flex"
              alignItems="center"
              justifyContent="center"
              width={active ? "52px" : "36px"}
              height={active ? "52px" : "36px"}
              rounded="md"
              color="white"
              fontWeight="bold"
              fontSize={active ? "lg" : "sm"}
              borderWidth={active ? "3px" : "0"}
              borderColor="fg"
              style={{
                background: COLORS[s],
                opacity: active ? 1 : 0.4,
              }}
            >
              {s}
            </Box>
          );
        })}
      </HStack>
      <Text fontSize="sm" color="fg.muted" mt="2">
        Rated {rating} (A+ is the most efficient)
      </Text>
    </Box>
  );
}
```

```tsx components/gallery-strip.tsx
import { Box, Grid } from "@chakra-ui/react";
import { HomeVisual } from "./home-visual";

const CAPTIONS = [
  "Living room",
  "Kitchen",
  "Main bedroom",
  "Bathroom",
  "Outlook",
];

export function GalleryStrip({ id, title }: { id: string; title: string }) {
  return (
    <Box as="section" aria-label={`Photo gallery for ${title}`}>
      <Grid
        templateColumns={{ base: "1fr 1fr", md: "2fr 1fr 1fr" }}
        templateRows={{ base: "180px 100px", md: "170px 170px" }}
        gap="2"
      >
        <Box
          gridColumn={{ base: "1 / span 2", md: "1" }}
          gridRow={{ base: "1", md: "1 / span 2" }}
          rounded="lg"
          overflow="hidden"
        >
          <HomeVisual
            id={id}
            variant={0}
            label={`${CAPTIONS[0]} of ${title} (placeholder)`}
          />
        </Box>
        {CAPTIONS.slice(1, 5).map((caption, i) => (
          <Box
            key={caption}
            rounded="lg"
            overflow="hidden"
            display={{ base: i < 2 ? "block" : "none", md: "block" }}
          >
            <HomeVisual
              id={id}
              variant={i + 1}
              label={`${caption} of ${title} (placeholder)`}
            />
          </Box>
        ))}
      </Grid>
    </Box>
  );
}
```

```tsx components/detail-map.tsx
"use client";

import { Box } from "@chakra-ui/react";
import { type Home } from "@/lib/data";
import LazyHomeMap from "./lazy-home-map";

export function DetailMap({ home }: { home: Home }) {
  return (
    <Box height="280px" rounded="lg" overflow="hidden" borderWidth="1px">
      <LazyHomeMap
        homes={[home]}
        center={[home.lng, home.lat]}
        zoom={13.5}
        label={`Map showing ${home.title} in ${home.district}`}
      />
    </Box>
  );
}
```

```tsx app/homes/[id]/page.tsx
import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import {
  Badge,
  Box,
  Container,
  Flex,
  Grid,
  HStack,
  Heading,
  Text,
} from "@chakra-ui/react";
import {
  LuArrowLeft,
  LuBath,
  LuBed,
  LuCalendar,
  LuCheck,
  LuRuler,
} from "react-icons/lu";
import { ContactForm } from "@/components/contact-form";
import { DetailMap } from "@/components/detail-map";
import { EnergyRating } from "@/components/energy-rating";
import { GalleryStrip } from "@/components/gallery-strip";
import {
  CITY,
  HOMES,
  bedsLabel,
  formatDate,
  formatPrice,
  getHome,
  isNewListing,
} from "@/lib/data";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return HOMES.map((h) => ({ id: h.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const home = getHome(id);
  if (!home) return { title: "Home not found | Haven" };
  return {
    title: `${home.title}, ${home.district} | Haven`,
    description: `${home.type} in ${home.district}, ${CITY}: ${bedsLabel(home.beds)}, ${home.area_m2} m², ${formatPrice(home.price)}.`,
  };
}

export default async function HomePage({ params }: { params: Params }) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();

  return (
    <Box bg="bg.subtle" minH="100dvh">
      <Box as="header" bg="bg.panel" borderBottomWidth="1px">
        <Container maxW="6xl" py="3">
          <HStack justify="space-between">
            <Text fontWeight="bold" fontSize="xl" color="teal.600">
              Haven
            </Text>
            <NextLink
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 500,
              }}
            >
              <LuArrowLeft aria-hidden="true" /> Back to search
            </NextLink>
          </HStack>
        </Container>
      </Box>

      <Container as="main" maxW="6xl" py={{ base: "4", md: "6" }}>
        <GalleryStrip id={home.id} title={home.title} />

        <Grid
          mt="6"
          gap="6"
          templateColumns={{ base: "1fr", lg: "minmax(0, 3fr) minmax(0, 2fr)" }}
          alignItems="start"
        >
          <Flex direction="column" gap="6" minW="0">
            <Box>
              <HStack gap="2" wrap="wrap">
                <Badge colorPalette="teal">{home.type}</Badge>
                {isNewListing(home) && (
                  <Badge colorPalette="green" variant="solid">
                    New
                  </Badge>
                )}
              </HStack>
              <Heading as="h1" size="3xl" mt="2">
                {home.title}
              </Heading>
              <Text color="fg.muted" mt="1">
                {home.district}, {CITY} · Listed {formatDate(home.listed)}
              </Text>
              <Text fontSize="3xl" fontWeight="bold" mt="3">
                {formatPrice(home.price)}
              </Text>
              <Text color="fg.muted" fontSize="sm">
                {formatPrice(Math.round(home.price / home.area_m2))} per m²
              </Text>
            </Box>

            <Box
              as="section"
              aria-label="Key facts"
              bg="bg.panel"
              borderWidth="1px"
              rounded="lg"
              p="4"
            >
              <Grid
                as="dl"
                templateColumns={{
                  base: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                }}
                gap="4"
                m="0"
              >
                <Box>
                  <Box as="dt" color="fg.muted" fontSize="sm">
                    <HStack gap="1.5">
                      <LuBed aria-hidden="true" />
                      <span>Bedrooms</span>
                    </HStack>
                  </Box>
                  <Box as="dd" m="0" fontSize="xl" fontWeight="semibold">
                    {home.beds === 0 ? "Studio" : home.beds}
                  </Box>
                </Box>
                <Box>
                  <Box as="dt" color="fg.muted" fontSize="sm">
                    <HStack gap="1.5">
                      <LuBath aria-hidden="true" />
                      <span>Bathrooms</span>
                    </HStack>
                  </Box>
                  <Box as="dd" m="0" fontSize="xl" fontWeight="semibold">
                    {home.baths}
                  </Box>
                </Box>
                <Box>
                  <Box as="dt" color="fg.muted" fontSize="sm">
                    <HStack gap="1.5">
                      <LuRuler aria-hidden="true" />
                      <span>Area</span>
                    </HStack>
                  </Box>
                  <Box as="dd" m="0" fontSize="xl" fontWeight="semibold">
                    {home.area_m2} m²
                  </Box>
                </Box>
                <Box>
                  <Box as="dt" color="fg.muted" fontSize="sm">
                    <HStack gap="1.5">
                      <LuCalendar aria-hidden="true" />
                      <span>Built</span>
                    </HStack>
                  </Box>
                  <Box as="dd" m="0" fontSize="xl" fontWeight="semibold">
                    {home.year}
                  </Box>
                </Box>
              </Grid>
            </Box>

            <Box as="section" aria-labelledby="features-heading">
              <Heading as="h2" size="lg" id="features-heading">
                Features
              </Heading>
              <Flex
                as="ul"
                listStyleType="none"
                m="0"
                p="0"
                mt="3"
                gap="2"
                direction="column"
              >
                {home.features.map((feature) => (
                  <HStack as="li" key={feature} gap="2">
                    <Box color="teal.600" display="flex">
                      <LuCheck aria-hidden="true" />
                    </Box>
                    <span>{feature}</span>
                  </HStack>
                ))}
              </Flex>
            </Box>

            <Box as="section" aria-labelledby="energy-heading">
              <Heading as="h2" size="lg" id="energy-heading" mb="3">
                Energy rating
              </Heading>
              <EnergyRating rating={home.energy} />
            </Box>

            <Box as="section" aria-labelledby="location-heading">
              <Heading as="h2" size="lg" id="location-heading" mb="3">
                Location
              </Heading>
              <DetailMap home={home} />
            </Box>
          </Flex>

          <Box position={{ lg: "sticky" }} top={{ lg: "4" }}>
            <ContactForm homeTitle={home.title} />
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}
```