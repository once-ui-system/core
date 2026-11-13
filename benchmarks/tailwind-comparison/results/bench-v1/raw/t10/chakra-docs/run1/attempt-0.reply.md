Now the files. First the data module:

```ts
// lib/data.ts
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
export const AGENT = {
  name: "Inês Carvalho",
  agency: "Haven Homes",
  phone: "+351 210 000 123",
  email: "ines@havenhomes.example",
};

// Fixed reference date so server and client render the same "new" badges.
export const TODAY = "2026-10-31";

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

export function getHome(id: string): Home | undefined {
  return HOMES.find((h) => h.id === id);
}

const eur = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatPrice(n: number): string {
  return eur.format(n);
}

/** Compact price for map markers, e.g. €485k or €1.45M */
export function formatPriceShort(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `€${Number.isInteger(m) ? m : m.toFixed(2).replace(/0+$/, "")}M`;
  }
  return `€${Math.round(n / 1000)}k`;
}

export function bedsLabel(beds: number): string {
  return beds === 0 ? "Studio" : `${beds} bed${beds === 1 ? "" : "s"}`;
}

export function daysSinceListed(listed: string): number {
  const ms = Date.parse(TODAY) - Date.parse(listed);
  return Math.floor(ms / 86_400_000);
}

export function isNew(listed: string): boolean {
  const d = daysSinceListed(listed);
  return d >= 0 && d <= 7;
}

export function formatListed(listed: string): string {
  const d = new Date(`${listed}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Deterministic CSS gradient "photo" for a home, varied by index.
const PALETTES: [string, string, string][] = [
  ["#f6d5b8", "#e8a87c", "#c38d9e"],
  ["#cfe3d4", "#8fbf9f", "#41786a"],
  ["#d6dff5", "#93a8e0", "#5a6fb0"],
  ["#f7e1a8", "#eeb868", "#d1783f"],
  ["#e3d3ea", "#b79ac9", "#7b5e96"],
  ["#c9e6ea", "#7cc0c9", "#36808f"],
];

export function placeholderBackground(id: string, shift = 0): string {
  const n = Number(id.replace(/\D/g, "")) + shift;
  const [a, b, c] = PALETTES[n % PALETTES.length];
  const angle = 120 + ((n * 37) % 90);
  return `linear-gradient(${angle}deg, ${a} 0%, ${b} 55%, ${c} 100%)`;
}
```

```tsx
// components/placeholder-photo.tsx
import { Box } from "@chakra-ui/react";
import { placeholderBackground } from "@/lib/data";

interface Props {
  id: string;
  shift?: number;
  height?: string | Record<string, string>;
  rounded?: string;
  label?: string;
}

/** A photo stand-in drawn purely with CSS: gradient sky, sun, and building silhouettes. */
export function PlaceholderPhoto({ id, shift = 0, height = "100%", rounded, label }: Props) {
  return (
    <Box
      role="img"
      aria-label={label ?? "Photo placeholder"}
      position="relative"
      overflow="hidden"
      width="100%"
      height={height}
      borderRadius={rounded}
      style={{ background: placeholderBackground(id, shift) }}
    >
      <Box
        position="absolute"
        top="14%"
        right="16%"
        width="14%"
        paddingBottom="14%"
        borderRadius="full"
        bg="whiteAlpha.700"
      />
      <Box
        position="absolute"
        left="8%"
        bottom={0}
        width="22%"
        height="48%"
        bg="blackAlpha.300"
        borderTopRadius="sm"
      />
      <Box
        position="absolute"
        left="34%"
        bottom={0}
        width="30%"
        height="66%"
        bg="blackAlpha.400"
        borderTopRadius="sm"
      />
      <Box
        position="absolute"
        left="68%"
        bottom={0}
        width="24%"
        height="38%"
        bg="blackAlpha.300"
        borderTopRadius="sm"
      />
    </Box>
  );
}
```

```tsx
// components/home-map.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import Map, { Marker, Popup, NavigationControl, type MapRef } from "react-map-gl/maplibre";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import {
  MAP_CENTER,
  MAP_STYLE_URL,
  bedsLabel,
  formatPrice,
  formatPriceShort,
  type Home,
} from "@/lib/data";

interface Props {
  homes: Home[];
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  zoom?: number;
  center?: [number, number];
  /** Re-run map.resize() whenever this changes (e.g. when its container is shown). */
  resizeKey?: unknown;
  label: string;
  interactive?: boolean;
}

export default function HomeMap({
  homes,
  hoveredId = null,
  onHover,
  selectedId = null,
  onSelect,
  zoom = 11.6,
  center = MAP_CENTER,
  resizeKey,
  label,
  interactive = true,
}: Props) {
  const mapRef = useRef<MapRef | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => mapRef.current?.resize(), 50);
    return () => window.clearTimeout(id);
  }, [resizeKey]);

  const selected = homes.find((h) => h.id === selectedId) ?? null;

  return (
    <Box
      position="relative"
      width="100%"
      height="100%"
      role="region"
      aria-label={label}
    >
      <Map
        ref={mapRef}
        mapStyle={MAP_STYLE_URL}
        initialViewState={{ longitude: center[0], latitude: center[1], zoom }}
        style={{ width: "100%", height: "100%" }}
        attributionControl={{ compact: true }}
        onClick={() => onSelect?.(null)}
        scrollZoom={interactive}
        dragPan={interactive}
        doubleClickZoom={interactive}
        keyboard={interactive}
      >
        <NavigationControl showCompass={false} position="top-right" />
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
                aria-label={`${formatPrice(home.price)}, ${home.title}, ${home.district}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(home.id);
                }}
                onMouseEnter={() => onHover?.(home.id)}
                onMouseLeave={() => onHover?.(null)}
                onFocus={() => onHover?.(home.id)}
                onBlur={() => onHover?.(null)}
                style={{
                  cursor: "pointer",
                  border: `2px solid ${active ? "#0f766e" : "#ffffff"}`,
                  background: active ? "#0f766e" : "#1f2937",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 13,
                  lineHeight: 1,
                  padding: "6px 9px",
                  borderRadius: 999,
                  boxShadow: active
                    ? "0 4px 14px rgba(15,118,110,0.55)"
                    : "0 1px 4px rgba(0,0,0,0.35)",
                  transform: active ? "scale(1.18)" : "scale(1)",
                  transition: "transform 120ms ease, background 120ms ease",
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
            closeButton
            closeOnClick={false}
            maxWidth="260px"
            onClose={() => onSelect?.(null)}
          >
            <Box color="gray.900" pr="2" minW="190px">
              <Text fontWeight="bold" fontSize="md">
                {formatPrice(selected.price)}
              </Text>
              <Text fontSize="sm" fontWeight="medium" lineClamp={2}>
                {selected.title}
              </Text>
              <Text fontSize="xs" color="gray.600" mb="2">
                {bedsLabel(selected.beds)} · {selected.baths} bath · {selected.area_m2} m² ·{" "}
                {selected.district}
              </Text>
              <Flex>
                <Button asChild size="xs" colorPalette="teal">
                  <NextLink href={`/homes/${selected.id}`}>View home</NextLink>
                </Button>
              </Flex>
            </Box>
          </Popup>
        )}
      </Map>
    </Box>
  );
}
```

```tsx
// components/home-map-lazy.tsx
"use client";

import dynamic from "next/dynamic";
import { Box, Text } from "@chakra-ui/react";

const HomeMap = dynamic(() => import("@/components/home-map"), {
  ssr: false,
  loading: () => (
    <Box
      width="100%"
      height="100%"
      bg="bg.muted"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Text color="fg.muted" fontSize="sm">
        Loading map…
      </Text>
    </Box>
  ),
});

export default HomeMap;
```

```tsx
// components/home-card.tsx
"use client";

import NextLink from "next/link";
import { Badge, Box, Flex, HStack, IconButton, Text } from "@chakra-ui/react";
import { LuBath, LuBedDouble, LuHeart, LuMaximize } from "react-icons/lu";
import { PlaceholderPhoto } from "@/components/placeholder-photo";
import { bedsLabel, formatPrice, isNew, type Home } from "@/lib/data";

interface Props {
  home: Home;
  highlighted: boolean;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onHover: (id: string | null) => void;
}

export function HomeCard({ home, highlighted, saved, onToggleSave, onHover }: Props) {
  return (
    <Box
      as="article"
      id={`card-${home.id}`}
      position="relative"
      borderWidth="1px"
      borderColor={highlighted ? "teal.500" : "border"}
      boxShadow={highlighted ? "0 0 0 2px var(--chakra-colors-teal-500)" : "sm"}
      borderRadius="lg"
      overflow="hidden"
      bg="bg"
      transition="box-shadow 120ms ease, border-color 120ms ease"
      onMouseEnter={() => onHover(home.id)}
      onMouseLeave={() => onHover(null)}
    >
      <Box position="relative" height="170px">
        <PlaceholderPhoto id={home.id} label={`Photo placeholder for ${home.title}`} />
        {isNew(home.listed) && (
          <Badge
            position="absolute"
            top="3"
            left="3"
            colorPalette="green"
            variant="solid"
          >
            New this week
          </Badge>
        )}
      </Box>

      <Box p="4">
        <Text fontSize="xl" fontWeight="bold" lineHeight="short">
          {formatPrice(home.price)}
        </Text>
        <Text fontWeight="semibold" mt="1" lineClamp={1}>
          <NextLink
            href={`/homes/${home.id}`}
            onFocus={() => onHover(home.id)}
            onBlur={() => onHover(null)}
            style={{ outlineOffset: 4 }}
          >
            {home.title}
            {/* stretch the link over the whole card, save button sits above it */}
            <Box as="span" position="absolute" inset="0" aria-hidden="true" />
          </NextLink>
        </Text>
        <Text color="fg.muted" fontSize="sm">
          {home.type} · {home.district}
        </Text>
        <Flex mt="3" gap="4" wrap="wrap" fontSize="sm" color="fg.muted">
          <HStack gap="1.5">
            <LuBedDouble aria-hidden="true" />
            <Text as="span">{bedsLabel(home.beds)}</Text>
          </HStack>
          <HStack gap="1.5">
            <LuBath aria-hidden="true" />
            <Text as="span">
              {home.baths} bath{home.baths === 1 ? "" : "s"}
            </Text>
          </HStack>
          <HStack gap="1.5">
            <LuMaximize aria-hidden="true" />
            <Text as="span">{home.area_m2} m²</Text>
          </HStack>
        </Flex>
      </Box>

      <IconButton
        position="absolute"
        top="2"
        right="2"
        zIndex={1}
        size="sm"
        rounded="full"
        variant="solid"
        bg="bg"
        color={saved ? "red.500" : "fg"}
        aria-label={saved ? `Remove ${home.title} from saved homes` : `Save ${home.title}`}
        aria-pressed={saved}
        onClick={() => onToggleSave(home.id)}
      >
        <LuHeart fill={saved ? "currentColor" : "none"} />
      </IconButton>
    </Box>
  );
}
```

```tsx
// components/search-page.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import { LuList, LuMap } from "react-icons/lu";
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";
import { Field } from "@/components/ui/field";
import { ColorModeButton } from "@/components/ui/color-mode";
import HomeMap from "@/components/home-map-lazy";
import { HomeCard } from "@/components/home-card";
import { CITY, HOMES, daysSinceListed } from "@/lib/data";

type SortKey = "newest" | "price-asc" | "price-desc" | "size";

const TYPE_ITEMS = [
  { value: "all", label: "Any type" },
  { value: "Apartment", label: "Apartment" },
  { value: "House", label: "House" },
  { value: "Studio", label: "Studio" },
];

const MIN_PRICE_ITEMS = [
  { value: "0", label: "No min" },
  { value: "250000", label: "€250k" },
  { value: "400000", label: "€400k" },
  { value: "600000", label: "€600k" },
  { value: "900000", label: "€900k" },
];

const MAX_PRICE_ITEMS = [
  { value: "0", label: "No max" },
  { value: "300000", label: "€300k" },
  { value: "500000", label: "€500k" },
  { value: "800000", label: "€800k" },
  { value: "1000000", label: "€1M" },
  { value: "1500000", label: "€1.5M" },
];

const BEDS_ITEMS = [
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
  { value: "size", label: "Size: largest" },
];

function FilterSelect({
  label,
  value,
  onChange,
  items,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  items: { value: string; label: string }[];
}) {
  return (
    <Field label={label} minW="0">
      <NativeSelectRoot size="sm">
        <NativeSelectField
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          items={items}
        />
      </NativeSelectRoot>
    </Field>
  );
}

export default function SearchPage() {
  const [type, setType] = useState("all");
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("0");
  const [minBeds, setMinBeds] = useState("0");
  const [sort, setSort] = useState<SortKey>("newest");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"list" | "map">("list");

  const results = useMemo(() => {
    const min = Number(minPrice);
    const max = Number(maxPrice);
    const beds = Number(minBeds);
    const filtered = HOMES.filter(
      (h) =>
        (type === "all" || h.type === type) &&
        (min === 0 || h.price >= min) &&
        (max === 0 || h.price <= max) &&
        h.beds >= beds,
    );
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "size":
          return b.area_m2 - a.area_m2;
        default:
          return daysSinceListed(a.listed) - daysSinceListed(b.listed);
      }
    });
  }, [type, minPrice, maxPrice, minBeds, sort]);

  const priceRangeInvalid =
    Number(maxPrice) !== 0 && Number(minPrice) > Number(maxPrice);

  const toggleSave = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const reset = () => {
    setType("all");
    setMinPrice("0");
    setMaxPrice("0");
    setMinBeds("0");
    setSort("newest");
  };

  const visibleSelected = results.some((h) => h.id === selectedId) ? selectedId : null;

  return (
    <Flex direction="column" minH="100dvh" height={{ lg: "100dvh" }}>
      <Box as="header" borderBottomWidth="1px" bg="bg" px={{ base: "4", md: "6" }} py="3">
        <Flex align="center" justify="space-between" gap="4" wrap="wrap">
          <Box>
            <Heading as="h1" size="lg" letterSpacing="tight">
              Haven
            </Heading>
            <Text fontSize="xs" color="fg.muted">
              Homes for sale in {CITY}
            </Text>
          </Box>
          <ColorModeButton />
        </Flex>

        <Box
          as="form"
          role="search"
          aria-label="Filter homes"
          mt="3"
          onSubmit={(e: React.FormEvent) => e.preventDefault()}
        >
          <Grid
            gap="3"
            templateColumns={{
              base: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
              xl: "repeat(5, minmax(0, 1fr)) auto",
            }}
            alignItems="end"
          >
            <FilterSelect label="Type" value={type} onChange={setType} items={TYPE_ITEMS} />
            <FilterSelect label="Min price" value={minPrice} onChange={setMinPrice} items={MIN_PRICE_ITEMS} />
            <FilterSelect label="Max price" value={maxPrice} onChange={setMaxPrice} items={MAX_PRICE_ITEMS} />
            <FilterSelect label="Min bedrooms" value={minBeds} onChange={setMinBeds} items={BEDS_ITEMS} />
            <FilterSelect
              label="Sort by"
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              items={SORT_ITEMS}
            />
            <Button size="sm" variant="outline" onClick={reset} type="button">
              Reset
            </Button>
          </Grid>
          {priceRangeInvalid && (
            <Text role="alert" color="fg.error" fontSize="sm" mt="2">
              The minimum price is higher than the maximum price.
            </Text>
          )}
        </Box>
      </Box>

      <Flex
        px={{ base: "4", md: "6" }}
        py="2"
        align="center"
        justify="space-between"
        borderBottomWidth="1px"
        bg="bg.subtle"
        gap="3"
      >
        <Text aria-live="polite" fontSize="sm" fontWeight="medium">
          {results.length} {results.length === 1 ? "home" : "homes"} in {CITY}
        </Text>
        <HStack display={{ base: "flex", lg: "none" }} gap="1" role="group" aria-label="Results view">
          <Button
            size="xs"
            variant={view === "list" ? "solid" : "outline"}
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <LuList /> List
          </Button>
          <Button
            size="xs"
            variant={view === "map" ? "solid" : "outline"}
            aria-pressed={view === "map"}
            onClick={() => setView("map")}
          >
            <LuMap /> Map
          </Button>
        </HStack>
      </Flex>

      <Grid
        flex="1"
        minH="0"
        templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 1fr)", xl: "minmax(0, 5fr) minmax(0, 6fr)" }}
      >
        <Box
          as="section"
          aria-label="Search results"
          display={{ base: view === "list" ? "block" : "none", lg: "block" }}
          overflowY={{ lg: "auto" }}
          p={{ base: "4", md: "6" }}
        >
          {results.length === 0 ? (
            <Box textAlign="center" py="16" px="4">
              <Heading as="h2" size="md">
                No homes match these filters
              </Heading>
              <Text color="fg.muted" mt="2" mb="4">
                Try widening the price range or lowering the bedroom count.
              </Text>
              <Button onClick={reset}>Reset filters</Button>
            </Box>
          ) : (
            <Grid
              as="ul"
              listStyleType="none"
              gap="4"
              templateColumns={{ base: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))", lg: "minmax(0, 1fr)", xl: "repeat(2, minmax(0, 1fr))" }}
            >
              {results.map((home) => (
                <li key={home.id}>
                  <HomeCard
                    home={home}
                    highlighted={hoveredId === home.id}
                    saved={saved.has(home.id)}
                    onToggleSave={toggleSave}
                    onHover={setHoveredId}
                  />
                </li>
              ))}
            </Grid>
          )}
        </Box>

        <Box
          display={{ base: view === "map" ? "block" : "none", lg: "block" }}
          height={{ base: "calc(100dvh - 230px)", lg: "auto" }}
          minH={{ base: "420px", lg: "0" }}
          position={{ lg: "relative" }}
        >
          <HomeMap
            homes={results}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            selectedId={visibleSelected}
            onSelect={setSelectedId}
            resizeKey={view}
            label={`Map of ${results.length} homes in ${CITY}`}
          />
        </Box>
      </Grid>
    </Flex>
  );
}
```

```tsx
// app/page.tsx
import type { Metadata } from "next";
import SearchPage from "@/components/search-page";

export const metadata: Metadata = {
  title: "Haven · Homes for sale in Lisbon",
  description: "Search apartments, houses and studios for sale in Lisbon, on the list or on the map.",
};

export default function Page() {
  return <SearchPage />;
}
```

```tsx
// components/contact-form.tsx
"use client";

import { useState } from "react";
import { Alert, Box, Button, Heading, Input, Text, Textarea } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { AGENT } from "@/lib/data";

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(name: string, email: string, message: string): Errors {
  const errors: Errors = {};
  if (!name.trim()) errors.name = "Enter your name.";
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address, like name@example.com.";
  if (!message.trim()) errors.message = "Write a short message for the agent.";
  return errors;
}

export function ContactForm({ homeTitle }: { homeTitle: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(`Hello, I'd like to arrange a viewing of "${homeTitle}".`);
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
  };

  return (
    <Box
      as="form"
      noValidate
      onSubmit={onSubmit}
      aria-labelledby="contact-heading"
      borderWidth="1px"
      borderRadius="lg"
      p="5"
      bg="bg"
      boxShadow="sm"
    >
      <Heading as="h2" id="contact-heading" size="md">
        Contact {AGENT.name}
      </Heading>
      <Text color="fg.muted" fontSize="sm" mt="1" mb="4">
        {AGENT.agency} · {AGENT.phone}
      </Text>

      {sent && (
        <Alert.Root status="success" mb="4" role="status">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Message sent</Alert.Title>
            <Alert.Description>
              Thanks, {name.trim()}. {AGENT.name} will reply to {email.trim()} shortly.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <Box display="flex" flexDirection="column" gap="4">
        <Field label="Name" required invalid={!!errors.name} errorText={errors.name}>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          />
        </Field>
        <Field label="Message" required invalid={!!errors.message} errorText={errors.message}>
          <Textarea
            id="contact-message"
            name="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Field>
        <Button type="submit" colorPalette="teal">
          Send message
        </Button>
      </Box>
    </Box>
  );
}
```

```tsx
// app/homes/[id]/page.tsx
import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import {
  Badge,
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import { LuArrowLeft, LuBath, LuBedDouble, LuCalendar, LuCheck, LuMaximize } from "react-icons/lu";
import { ContactForm } from "@/components/contact-form";
import HomeMap from "@/components/home-map-lazy";
import { PlaceholderPhoto } from "@/components/placeholder-photo";
import {
  HOMES,
  bedsLabel,
  formatListed,
  formatPrice,
  getHome,
  isNew,
} from "@/lib/data";

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
  return {
    title: home ? `${home.title} · Haven` : "Home not found · Haven",
  };
}

const ENERGY_SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const ENERGY_COLORS: Record<string, string> = {
  "A+": "#15803d",
  A: "#22a24a",
  B: "#65b32e",
  C: "#b5c21b",
  D: "#e5b800",
  E: "#ee8a1a",
  F: "#d93a2b",
};
// Dark text on the lighter yellow-green steps, white elsewhere, for contrast.
const ENERGY_TEXT: Record<string, string> = {
  "A+": "#ffffff",
  A: "#0b2a14",
  B: "#10260a",
  C: "#2b2f00",
  D: "#2e2500",
  E: "#2e1700",
  F: "#ffffff",
};

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box borderWidth="1px" borderRadius="md" p="3" bg="bg.subtle">
      <HStack color="fg.muted" fontSize="xs" gap="1.5">
        <span aria-hidden="true">{icon}</span>
        <Text as="span">{label}</Text>
      </HStack>
      <Text fontWeight="semibold" mt="1">
        {value}
      </Text>
    </Box>
  );
}

export default async function HomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();

  return (
    <Box minH="100dvh" bg="bg">
      <Container maxW="6xl" py={{ base: "4", md: "8" }} px={{ base: "4", md: "6" }}>
        <Box as="nav" aria-label="Breadcrumb" mb="4">
          <NextLink href="/">
            <HStack gap="1.5" color="teal.fg" fontSize="sm" fontWeight="medium">
              <LuArrowLeft aria-hidden="true" />
              <span>Back to search</span>
            </HStack>
          </NextLink>
        </Box>

        {/* Gallery strip */}
        <Box
          as="section"
          aria-label="Photo gallery"
          mb="6"
          overflowX="auto"
          tabIndex={0}
          borderRadius="lg"
        >
          <Flex gap="3" minW="max-content">
            {[0, 1, 2, 3].map((i) => (
              <Box
                key={i}
                flex="none"
                width={{ base: "260px", md: i === 0 ? "420px" : "260px" }}
                height={{ base: "180px", md: "260px" }}
              >
                <PlaceholderPhoto
                  id={home.id}
                  shift={i}
                  rounded="lg"
                  label={`${home.title}, photo ${i + 1} of 4 (placeholder)`}
                />
              </Box>
            ))}
          </Flex>
        </Box>

        <Grid
          templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 3fr) minmax(0, 2fr)" }}
          gap={{ base: "8", lg: "10" }}
          alignItems="start"
        >
          <Box as="main">
            <Flex align="center" gap="3" wrap="wrap">
              <Text as="p" fontSize="3xl" fontWeight="bold">
                {formatPrice(home.price)}
              </Text>
              {isNew(home.listed) && (
                <Badge colorPalette="green" variant="solid">
                  New this week
                </Badge>
              )}
            </Flex>
            <Heading as="h1" size="xl" mt="1">
              {home.title}
            </Heading>
            <Text color="fg.muted" mt="1">
              {home.type} in {home.district}, Lisbon
            </Text>

            <Grid
              as="dl"
              mt="5"
              gap="3"
              templateColumns={{ base: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }}
              style={{ margin: 0 }}
            >
              <Fact icon={<LuBedDouble />} label="Bedrooms" value={bedsLabel(home.beds)} />
              <Fact icon={<LuBath />} label="Bathrooms" value={String(home.baths)} />
              <Fact icon={<LuMaximize />} label="Area" value={`${home.area_m2} m²`} />
              <Fact icon={<LuCalendar />} label="Built" value={String(home.year)} />
            </Grid>
            <Text fontSize="sm" color="fg.muted" mt="3">
              Listed {formatListed(home.listed)} · {formatPrice(Math.round(home.price / home.area_m2))} per m²
            </Text>

            <Box as="section" mt="8" aria-labelledby="features-heading">
              <Heading as="h2" id="features-heading" size="md" mb="3">
                Features
              </Heading>
              <Grid
                as="ul"
                listStyleType="none"
                gap="2"
                templateColumns={{ base: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }}
              >
                {home.features.map((f) => (
                  <HStack as="li" key={f} gap="2">
                    <Box color="teal.fg" aria-hidden="true">
                      <LuCheck />
                    </Box>
                    <Text>{f}</Text>
                  </HStack>
                ))}
              </Grid>
            </Box>

            <Box as="section" mt="8" aria-labelledby="energy-heading">
              <Heading as="h2" id="energy-heading" size="md" mb="3">
                Energy rating
              </Heading>
              <Flex gap="1.5" role="img" aria-label={`Energy rating ${home.energy} on a scale from A+ to F`}>
                {ENERGY_SCALE.map((grade) => {
                  const active = grade === home.energy;
                  return (
                    <Flex
                      key={grade}
                      align="center"
                      justify="center"
                      width={active ? "56px" : "40px"}
                      height={active ? "48px" : "36px"}
                      alignSelf="center"
                      borderRadius="md"
                      fontWeight="bold"
                      fontSize={active ? "lg" : "sm"}
                      opacity={active ? 1 : 0.45}
                      outline={active ? "3px solid" : "none"}
                      outlineColor="fg"
                      outlineOffset="2px"
                      style={{ background: ENERGY_COLORS[grade], color: ENERGY_TEXT[grade] }}
                    >
                      {grade}
                    </Flex>
                  );
                })}
              </Flex>
            </Box>

            <Box as="section" mt="8" aria-labelledby="location-heading">
              <Heading as="h2" id="location-heading" size="md" mb="3">
                Location
              </Heading>
              <Box height="280px" borderRadius="lg" overflow="hidden" borderWidth="1px">
                <HomeMap
                  homes={[home]}
                  selectedId={null}
                  center={[home.lng, home.lat]}
                  zoom={14}
                  label={`Map showing ${home.title} in ${home.district}`}
                />
              </Box>
            </Box>
          </Box>

          <Box as="aside" position={{ lg: "sticky" }} top={{ lg: "6" }}>
            <ContactForm homeTitle={home.title} />
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}
```