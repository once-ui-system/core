I have enough context. Writing the files now.

**Notes on key choices**

-   Reference "today" is fixed at `2026-10-31` so the 7-day badge is deterministic and avoids hydration mismatches.
-   `MapView` is loaded with `next/dynamic` (`ssr: false`) from a client wrapper.
-   Markers are `react-map-gl/maplibre` `Marker`s with real `<button>` elements. Hover state is shared via the parent.

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
  mapCenter: [-9.1393, 38.7223] as [number, number],
  currency: "EUR",
};

export const AGENT = {
  name: "Inês Carvalho",
  agency: "Haven Homes",
  phone: "+351 210 000 123",
  email: "ines@havenhomes.example",
};

/** Fixed reference date so the "new" badge is deterministic on server and client. */
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

const eur = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatPrice(price: number): string {
  return eur.format(price);
}

/** Compact marker label, e.g. 485k or 1.45M. */
export function formatPriceShort(price: number): string {
  if (price >= 1_000_000) {
    const m = price / 1_000_000;
    return `€${Number.isInteger(m) ? m : m.toFixed(2).replace(/0$/, "")}M`;
  }
  return `€${Math.round(price / 1000)}k`;
}

export function daysSinceListed(listed: string): number {
  const ms = Date.parse(TODAY) - Date.parse(listed);
  return Math.floor(ms / 86_400_000);
}

export function isNew(home: Home): boolean {
  return daysSinceListed(home.listed) <= 7;
}

export function formatListed(listed: string): string {
  const d = daysSinceListed(listed);
  if (d <= 0) return "Listed today";
  if (d === 1) return "Listed yesterday";
  return `Listed ${d} days ago`;
}

export function bedsLabel(beds: number): string {
  return beds === 0 ? "Studio" : `${beds} bed${beds === 1 ? "" : "s"}`;
}

/** Deterministic hue from an id so each placeholder looks different. */
export function hueFor(id: string): number {
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n * 31 + id.charCodeAt(i)) % 360;
  return n;
}

export type SortKey = "newest" | "price-asc" | "price-desc" | "size";

export const TYPE_OPTIONS = ["Any", "Apartment", "House", "Studio"] as const;

export const PRICE_MIN = 0;
export const PRICE_MAX = 1_500_000;
export const PRICE_STEP = 50_000;
```

```tsx components/Placeholder.tsx
import Box from "@mui/material/Box";
import { hueFor } from "@/lib/data";

interface PlaceholderProps {
  id: string;
  /** Variant index to vary the composition (used by the gallery). */
  variant?: number;
  height?: number | string | Record<string, number | string>;
  label?: string;
  rounded?: boolean;
}

/**
 * A "photo" drawn purely with CSS: sky gradient, a building silhouette and a ground strip.
 * Decorative, so it is hidden from assistive technology unless a label is given.
 */
export default function Placeholder({
  id,
  variant = 0,
  height = 160,
  label,
  rounded = false,
}: PlaceholderProps) {
  const hue = (hueFor(id) + variant * 28) % 360;
  const sky = `linear-gradient(180deg, hsl(${hue} 70% 82%) 0%, hsl(${(hue + 30) % 360} 75% 92%) 100%)`;
  const wall = `hsl(${(hue + 190) % 360} 28% 42%)`;
  const wallLight = `hsl(${(hue + 190) % 360} 30% 55%)`;
  const ground = `hsl(${(hue + 120) % 360} 25% 36%)`;
  const windows = `repeating-linear-gradient(90deg, rgba(255,236,170,0.9) 0 10px, transparent 10px 24px)`;
  const towerLeft = 12 + ((variant * 7) % 14);
  const towerHeight = 52 + ((variant * 9) % 18);

  return (
    <Box
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      sx={{
        position: "relative",
        height,
        width: "100%",
        overflow: "hidden",
        background: sky,
        borderRadius: rounded ? 2 : 0,
        flexShrink: 0,
      }}
    >
      {/* sun */}
      <Box
        sx={{
          position: "absolute",
          top: "14%",
          right: `${12 + ((variant * 11) % 30)}%`,
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: `hsl(${(hue + 40) % 360} 95% 75%)`,
          opacity: 0.9,
        }}
      />
      {/* main building */}
      <Box
        sx={{
          position: "absolute",
          bottom: "16%",
          left: `${towerLeft}%`,
          width: "42%",
          height: `${towerHeight}%`,
          background: wall,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          boxShadow: "inset -14px 0 0 rgba(0,0,0,0.12)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: "14% 12% 30% 12%",
            background: windows,
            opacity: 0.85,
            maskImage: "repeating-linear-gradient(180deg, #000 0 14px, transparent 14px 26px)",
            WebkitMaskImage:
              "repeating-linear-gradient(180deg, #000 0 14px, transparent 14px 26px)",
          }}
        />
      </Box>
      {/* side building */}
      <Box
        sx={{
          position: "absolute",
          bottom: "16%",
          left: `${towerLeft + 38}%`,
          width: "30%",
          height: `${towerHeight - 22}%`,
          background: wallLight,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 4,
        }}
      />
      {/* ground */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "17%",
          background: ground,
        }}
      />
    </Box>
  );
}
```

```tsx components/HomeCard.tsx
"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BedOutlinedIcon from "@mui/icons-material/BedOutlined";
import BathtubOutlinedIcon from "@mui/icons-material/BathtubOutlined";
import SquareFootOutlinedIcon from "@mui/icons-material/SquareFootOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import Placeholder from "./Placeholder";
import { Home, bedsLabel, formatPrice, isNew } from "@/lib/data";

interface HomeCardProps {
  home: Home;
  highlighted: boolean;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onHover: (id: string | null) => void;
}

export default function HomeCard({
  home,
  highlighted,
  saved,
  onToggleSave,
  onHover,
}: HomeCardProps) {
  const fresh = isNew(home);

  return (
    <Card
      component="article"
      id={`card-${home.id}`}
      variant="outlined"
      aria-labelledby={`title-${home.id}`}
      onMouseEnter={() => onHover(home.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(home.id)}
      onBlur={() => onHover(null)}
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: { xs: "column", sm: "row", lg: "column", xl: "row" },
        overflow: "hidden",
        transition: "box-shadow 150ms, border-color 150ms, transform 150ms",
        borderColor: highlighted ? "primary.main" : "divider",
        boxShadow: highlighted ? 6 : 0,
        outline: highlighted ? "2px solid" : "none",
        outlineColor: "primary.main",
        outlineOffset: -1,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: { xs: "100%", sm: 220, lg: "100%", xl: 220 },
          flexShrink: 0,
        }}
      >
        <Placeholder id={home.id} height={{ xs: 150, sm: "100%", lg: 150, xl: "100%" }} />
        {fresh && (
          <Chip
            label="New"
            size="small"
            color="secondary"
            sx={{ position: "absolute", top: 10, left: 10, fontWeight: 700 }}
          />
        )}
      </Box>

      <Box sx={{ flex: 1, p: 2, minWidth: 0 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <Typography variant="h6" component="p" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {formatPrice(home.price)}
          </Typography>
          <IconButton
            size="small"
            onClick={() => onToggleSave(home.id)}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${home.title} from saved homes` : `Save ${home.title}`}
            color={saved ? "error" : "default"}
            sx={{ position: "relative", zIndex: 2, mt: -0.5, mr: -0.5 }}
          >
            {saved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Stack>

        <Typography
          variant="subtitle1"
          component="h3"
          id={`title-${home.id}`}
          sx={{ fontWeight: 600, lineHeight: 1.3, mt: 0.5 }}
        >
          <Box
            component={Link}
            href={`/homes/${home.id}`}
            sx={{
              color: "inherit",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
              "&::after": { content: '""', position: "absolute", inset: 0, zIndex: 1 },
              "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main" },
            }}
          >
            {home.title}
          </Box>
        </Typography>

        <Stack
          direction="row"
          useFlexGap
          sx={{ gap: 0.5, alignItems: "center", color: "text.secondary", mt: 0.5 }}
        >
          <PlaceOutlinedIcon fontSize="small" />
          <Typography variant="body2">
            {home.district}, {home.type}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          useFlexGap
          sx={{ mt: 1.5, columnGap: 2, rowGap: 0.5, flexWrap: "wrap", color: "text.secondary" }}
        >
          <Fact icon={<BedOutlinedIcon fontSize="small" />} text={bedsLabel(home.beds)} />
          <Fact
            icon={<BathtubOutlinedIcon fontSize="small" />}
            text={`${home.baths} bath${home.baths === 1 ? "" : "s"}`}
          />
          <Fact icon={<SquareFootOutlinedIcon fontSize="small" />} text={`${home.area_m2} m²`} />
        </Stack>
      </Box>
    </Card>
  );
}

function Fact({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
      {icon}
      <Typography variant="body2">{text}</Typography>
    </Stack>
  );
}
```

```tsx components/MapView.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useMemo } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Link from "next/link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Placeholder from "./Placeholder";
import { Home, SITE, bedsLabel, formatPrice, formatPriceShort } from "@/lib/data";

interface MapViewProps {
  homes: Home[];
  hoveredId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
}

export default function MapView({
  homes,
  hoveredId,
  selectedId,
  onHover,
  onSelect,
}: MapViewProps) {
  const selected = useMemo(
    () => homes.find((h) => h.id === selectedId) ?? null,
    [homes, selectedId],
  );

  return (
    <Map
      mapLib={import("maplibre-gl")}
      mapStyle={SITE.mapStyleUrl}
      initialViewState={{
        longitude: SITE.mapCenter[0],
        latitude: SITE.mapCenter[1],
        zoom: 11.6,
      }}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      onClick={() => onSelect(null)}
      cooperativeGestures={false}
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
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSelect(home.id);
            }}
          >
            <ButtonBase
              onMouseEnter={() => onHover(home.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(home.id)}
              onBlur={() => onHover(null)}
              aria-label={`${home.title}, ${formatPrice(home.price)}. Show details`}
              aria-haspopup="dialog"
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 5,
                fontSize: 13,
                fontWeight: 800,
                lineHeight: 1.2,
                border: "2px solid",
                borderColor: active ? "primary.dark" : "primary.main",
                bgcolor: active ? "primary.main" : "background.paper",
                color: active ? "primary.contrastText" : "primary.main",
                boxShadow: active ? 6 : 2,
                transform: active ? "scale(1.18)" : "none",
                transformOrigin: "bottom center",
                transition: "transform 120ms, background-color 120ms, color 120ms",
                "&:focus-visible": { outline: "3px solid", outlineColor: "secondary.main" },
              }}
            >
              {formatPriceShort(home.price)}
            </ButtonBase>
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
          onClose={() => onSelect(null)}
          maxWidth="260px"
        >
          <Box role="dialog" aria-label={selected.title} sx={{ width: 230, color: "#1d1d1f" }}>
            <Placeholder id={selected.id} height={84} rounded />
            <Stack sx={{ pt: 1, gap: 0.25 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {formatPrice(selected.price)}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selected.title}
              </Typography>
              <Typography variant="caption" sx={{ color: "#555" }}>
                {bedsLabel(selected.beds)} · {selected.baths} bath · {selected.area_m2} m² ·{" "}
                {selected.district}
              </Typography>
              <Box
                component={Link}
                href={`/homes/${selected.id}`}
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0b57d0",
                }}
              >
                View home
              </Box>
            </Stack>
          </Box>
        </Popup>
      )}
    </Map>
  );
}
```

```tsx components/MapClient.tsx
"use client";

import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Skeleton variant="rectangular" width="100%" height="100%" />
    </Box>
  ),
});

export default MapView;
```

```tsx components/DetailMap.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import PlaceIcon from "@mui/icons-material/Place";
import { Home, SITE } from "@/lib/data";

export default function DetailMap({ home }: { home: Home }) {
  return (
    <Map
      mapLib={import("maplibre-gl")}
      mapStyle={SITE.mapStyleUrl}
      initialViewState={{ longitude: home.lng, latitude: home.lat, zoom: 14 }}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Marker longitude={home.lng} latitude={home.lat} anchor="bottom">
        <PlaceIcon
          titleAccess={`${home.title}, ${home.district}`}
          sx={{ fontSize: 44, color: "primary.main", filter: "drop-shadow(0 2px 2px rgba(0,0,0,.4))" }}
        />
      </Marker>
    </Map>
  );
}
```

```tsx components/DetailMapClient.tsx
"use client";

import dynamic from "next/dynamic";
import Skeleton from "@mui/material/Skeleton";

const DetailMap = dynamic(() => import("./DetailMap"), {
  ssr: false,
  loading: () => <Skeleton variant="rectangular" width="100%" height="100%" />,
});

export default DetailMap;
```

```tsx components/SearchPage.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import HomeCard from "./HomeCard";
import MapClient from "./MapClient";
import {
  HOMES,
  Home,
  PRICE_MAX,
  PRICE_MIN,
  PRICE_STEP,
  SITE,
  SortKey,
  TYPE_OPTIONS,
  formatPrice,
} from "@/lib/data";

type TypeFilter = (typeof TYPE_OPTIONS)[number];

const BED_OPTIONS = [
  { value: 0, label: "Any" },
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "size", label: "Size: largest first" },
];

function sortHomes(homes: Home[], sort: SortKey): Home[] {
  const list = [...homes];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "size":
      return list.sort((a, b) => b.area_m2 - a.area_m2);
    default:
      return list.sort((a, b) => Date.parse(b.listed) - Date.parse(a.listed));
  }
}

export default function SearchPage() {
  const [type, setType] = useState<TypeFilter>("Any");
  const [price, setPrice] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [minBeds, setMinBeds] = useState(0);
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<"list" | "map">("list");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);

  const results = useMemo(() => {
    const filtered = HOMES.filter((h) => {
      if (type !== "Any" && h.type !== type) return false;
      if (h.price < price[0]) return false;
      // The top of the slider means "no upper limit".
      if (price[1] < PRICE_MAX && h.price > price[1]) return false;
      if (h.beds < minBeds) return false;
      return true;
    });
    return sortHomes(filtered, sort);
  }, [type, price, minBeds, sort]);

  const toggleSave = useCallback((id: string) => {
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const handleHover = useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) {
      const el = document.getElementById(`card-${id}`);
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, []);

  const resetFilters = () => {
    setType("Any");
    setPrice([PRICE_MIN, PRICE_MAX]);
    setMinBeds(0);
  };

  const priceLabel = `${formatPrice(price[0])} – ${
    price[1] >= PRICE_MAX ? `${formatPrice(PRICE_MAX)}+` : formatPrice(price[1])
  }`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Paper
        component="header"
        square
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Container maxWidth={false} sx={{ py: 1.5 }}>
          <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
            <HomeWorkIcon color="primary" aria-hidden />
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}
            >
              {SITE.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", display: { xs: "none", sm: "block" }, ml: 1 }}
            >
              Homes for sale in {SITE.city}
            </Typography>
          </Stack>
        </Container>
      </Paper>

      <Paper
        component="section"
        aria-label="Search filters"
        square
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider", position: "relative", zIndex: 2 }}
      >
        <Container maxWidth={false} sx={{ py: 2 }}>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              alignItems: "center",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "minmax(150px,1fr) minmax(260px,1.6fr) minmax(220px,1fr) minmax(180px,1fr)",
              },
            }}
          >
            <FormControl size="small" fullWidth>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                id="type-select"
                label="Type"
                value={type}
                onChange={(e) => setType(e.target.value as TypeFilter)}
              >
                {TYPE_OPTIONS.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t === "Any" ? "Any type" : t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ px: 1 }}>
              <Typography id="price-label" variant="caption" sx={{ color: "text.secondary" }}>
                Price: {priceLabel}
              </Typography>
              <Slider
                size="small"
                value={price}
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                onChange={(_, v) => setPrice(v as [number, number])}
                valueLabelDisplay="off"
                disableSwap
                getAriaLabel={(i) => (i === 0 ? "Minimum price" : "Maximum price")}
                getAriaValueText={(v) => formatPrice(v)}
                aria-labelledby="price-label"
              />
            </Box>

            <Box>
              <Typography
                id="beds-label"
                variant="caption"
                sx={{ color: "text.secondary", display: "block" }}
              >
                Minimum bedrooms
              </Typography>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={minBeds}
                onChange={(_, v: number | null) => {
                  if (v !== null) setMinBeds(v);
                }}
                aria-labelledby="beds-label"
                fullWidth
              >
                {BED_OPTIONS.map((o) => (
                  <ToggleButton
                    key={o.value}
                    value={o.value}
                    aria-label={o.value === 0 ? "Any number of bedrooms" : `${o.value} or more bedrooms`}
                    sx={{ px: 1 }}
                  >
                    {o.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <FormControl size="small" fullWidth>
              <InputLabel id="sort-label">Sort by</InputLabel>
              <Select
                labelId="sort-label"
                id="sort-select"
                label="Sort by"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                {SORT_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Container>
      </Paper>

      <Container
        maxWidth={false}
        sx={{ py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}
      >
        <Typography variant="subtitle1" component="h2" role="status" aria-live="polite" sx={{ fontWeight: 700 }}>
          {results.length} {results.length === 1 ? "home" : "homes"} in {SITE.city}
        </Typography>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_, v: "list" | "map" | null) => {
            if (v) setView(v);
          }}
          aria-label="Results view"
          sx={{ display: { xs: "inline-flex", md: "none" } }}
        >
          <ToggleButton value="list" aria-label="Show list">
            <ViewListOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} /> List
          </ToggleButton>
          <ToggleButton value="map" aria-label="Show map">
            <MapOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} /> Map
          </ToggleButton>
        </ToggleButtonGroup>
      </Container>

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(360px, 5fr) 7fr", lg: "minmax(420px, 5fr) 7fr" },
          gap: 2,
          px: { xs: 2, sm: 3 },
          pb: 2,
          minHeight: 0,
        }}
      >
        <Box
          component="section"
          aria-label="Search results"
          sx={{
            display: { xs: view === "list" ? "block" : "none", md: "block" },
            minWidth: 0,
            maxHeight: { md: "calc(100dvh - 220px)" },
            minHeight: { md: 480 },
            overflowY: { md: "auto" },
            pr: { md: 0.5 },
          }}
        >
          {results.length === 0 ? (
            <Stack
              sx={{ alignItems: "center", textAlign: "center", py: 8, gap: 1.5, color: "text.secondary" }}
            >
              <SearchOffIcon sx={{ fontSize: 48 }} />
              <Typography variant="h6" component="p" sx={{ color: "text.primary" }}>
                No homes match these filters
              </Typography>
              <Typography variant="body2">Try widening the price range or bedrooms.</Typography>
              <Button variant="outlined" onClick={resetFilters}>
                Reset filters
              </Button>
            </Stack>
          ) : (
            <Box
              component="ul"
              sx={{
                listStyle: "none",
                m: 0,
                p: 0,
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0,1fr))", md: "1fr" },
              }}
            >
              {results.map((home) => (
                <li key={home.id}>
                  <HomeCard
                    home={home}
                    highlighted={hoveredId === home.id || selectedId === home.id}
                    saved={saved.includes(home.id)}
                    onToggleSave={toggleSave}
                    onHover={handleHover}
                  />
                </li>
              ))}
            </Box>
          )}
        </Box>

        <Box
          component="section"
          aria-label={`Map of ${results.length} homes in ${SITE.city}`}
          sx={{
            display: { xs: view === "map" ? "block" : "none", md: "block" },
            height: { xs: "calc(100dvh - 280px)", md: "calc(100dvh - 220px)" },
            minHeight: { xs: 360, md: 480 },
            position: { md: "sticky" },
            top: { md: 16 },
            borderRadius: 2,
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
          }}
        >
          <MapClient
            homes={results}
            hoveredId={hoveredId}
            selectedId={selectedId}
            onHover={handleHover}
            onSelect={handleSelect}
          />
        </Box>
      </Box>
    </Box>
  );
}
```

```tsx components/ContactForm.tsx
"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import SendIcon from "@mui/icons-material/Send";

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
  else if (!EMAIL_RE.test(v.email.trim())) errors.email = "Enter a valid email address.";
  if (!v.message.trim()) errors.message = "Write a message for the agent.";
  return errors;
}

export default function ContactForm({
  homeTitle,
  agentName,
}: {
  homeTitle: string;
  agentName: string;
}) {
  const [values, setValues] = useState<Values>({
    name: "",
    email: "",
    message: `Hello, I'd like to arrange a viewing of "${homeTitle}".`,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [sent, setSent] = useState(false);

  const update = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [key]: e.target.value };
    setValues(next);
    if (touched[key] || errors[key]) setErrors(validate(next));
    setSent(false);
  };

  const blur = (key: keyof Values) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(values));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(found).length === 0) {
      setSent(true);
      setValues((v) => ({ ...v, name: "", email: "", message: "" }));
      setTouched({});
    }
  };

  const show = (key: keyof Values) => (touched[key] || errors[key] ? errors[key] : undefined);

  return (
    <Stack component="form" noValidate onSubmit={onSubmit} sx={{ gap: 2 }} aria-label={`Contact ${agentName}`}>
      {sent && (
        <Alert severity="success" role="status">
          Message sent. {agentName} will reply to you shortly.
        </Alert>
      )}
      <TextField
        label="Name"
        name="name"
        autoComplete="name"
        required
        value={values.name}
        onChange={update("name")}
        onBlur={blur("name")}
        error={Boolean(show("name"))}
        helperText={show("name")}
        fullWidth
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={values.email}
        onChange={update("email")}
        onBlur={blur("email")}
        error={Boolean(show("email"))}
        helperText={show("email")}
        fullWidth
      />
      <TextField
        label="Message"
        name="message"
        required
        multiline
        minRows={4}
        value={values.message}
        onChange={update("message")}
        onBlur={blur("message")}
        error={Boolean(show("message"))}
        helperText={show("message")}
        fullWidth
      />
      <Button type="submit" variant="contained" size="large" endIcon={<SendIcon />}>
        Send message
      </Button>
    </Stack>
  );
}
```

```tsx components/HomeDetail.tsx
import Link from "next/link";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BedOutlinedIcon from "@mui/icons-material/BedOutlined";
import BathtubOutlinedIcon from "@mui/icons-material/BathtubOutlined";
import SquareFootOutlinedIcon from "@mui/icons-material/SquareFootOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import Placeholder from "./Placeholder";
import ContactForm from "./ContactForm";
import DetailMapClient from "./DetailMapClient";
import {
  AGENT,
  Home,
  SITE,
  bedsLabel,
  formatListed,
  formatPrice,
  isNew,
} from "@/lib/data";

const ENERGY_SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const ENERGY_COLORS: Record<string, string> = {
  "A+": "#0a7d3c",
  A: "#2e9e44",
  B: "#7bb52f",
  C: "#c9c21a",
  D: "#f0b429",
  E: "#ee7d22",
  F: "#d93a2b",
};

function EnergyRating({ rating }: { rating: string }) {
  return (
    <Box>
      <Stack
        direction="row"
        role="img"
        aria-label={`Energy rating ${rating} on a scale from A+ (best) to F (worst)`}
        sx={{ gap: 0.5, flexWrap: "wrap" }}
      >
        {ENERGY_SCALE.map((s) => {
          const active = s === rating;
          return (
            <Box
              key={s}
              aria-hidden
              sx={{
                minWidth: active ? 54 : 40,
                height: active ? 54 : 40,
                alignSelf: "center",
                display: "grid",
                placeItems: "center",
                borderRadius: 1,
                fontWeight: 800,
                fontSize: active ? 22 : 14,
                color: "#fff",
                textShadow: "0 1px 1px rgba(0,0,0,0.35)",
                bgcolor: ENERGY_COLORS[s],
                opacity: active ? 1 : 0.4,
                outline: active ? "3px solid" : "none",
                outlineColor: "text.primary",
                outlineOffset: 2,
              }}
            >
              {s}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

function KeyFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Stack sx={{ gap: 0.25 }}>
      <Stack direction="row" sx={{ alignItems: "center", gap: 0.75, color: "text.secondary" }}>
        {icon}
        <Typography variant="caption" component="dt">
          {label}
        </Typography>
      </Stack>
      <Typography variant="subtitle1" component="dd" sx={{ fontWeight: 700, m: 0 }}>
        {value}
      </Typography>
    </Stack>
  );
}

export default function HomeDetail({ home }: { home: Home }) {
  const fresh = isNew(home);
  const pricePerM2 = Math.round(home.price / home.area_m2);

  return (
    <Box component="main" sx={{ pb: 6 }}>
      <Paper component="header" square elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Container maxWidth="lg" sx={{ py: 1.5 }}>
          <Breadcrumbs aria-label="Breadcrumb">
            <Box
              component={Link}
              href="/"
              sx={{ color: "primary.main", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
            >
              {SITE.name}
            </Box>
            <Typography color="text.primary">{home.title}</Typography>
          </Breadcrumbs>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ pt: 3 }}>
        {/* Gallery strip */}
        <Box
          component="ul"
          aria-label="Photo gallery"
          sx={{
            listStyle: "none",
            m: 0,
            p: 0,
            pb: 1,
            display: "flex",
            gap: 1.5,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
          }}
          tabIndex={0}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Box
              component="li"
              key={i}
              sx={{
                flex: "0 0 auto",
                width: { xs: "82%", sm: 360, md: 380 },
                scrollSnapAlign: "start",
              }}
            >
              <Placeholder
                id={home.id}
                variant={i}
                height={{ xs: 200, md: 240 }}
                rounded
                label={`${home.title}, photo ${i + 1} of 5`}
              />
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            mt: 3,
            display: "grid",
            gap: 4,
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 7fr) minmax(300px, 4fr)" },
            alignItems: "start",
          }}
        >
          {/* Facts column */}
          <Stack sx={{ gap: 4, minWidth: 0 }}>
            <Box component="section" aria-labelledby="home-title">
              <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: "center", flexWrap: "wrap", mb: 1 }}>
                <Chip label={home.type} size="small" variant="outlined" />
                {fresh && <Chip label="New" size="small" color="secondary" sx={{ fontWeight: 700 }} />}
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {formatListed(home.listed)}
                </Typography>
              </Stack>
              <Typography variant="h3" component="h1" id="home-title" sx={{ fontWeight: 800, fontSize: { xs: 28, sm: 36 }, lineHeight: 1.15 }}>
                {home.title}
              </Typography>
              <Stack direction="row" sx={{ alignItems: "center", gap: 0.5, color: "text.secondary", mt: 0.5 }}>
                <PlaceOutlinedIcon fontSize="small" />
                <Typography variant="body1">
                  {home.district}, {SITE.city}
                </Typography>
              </Stack>
              <Typography variant="h4" component="p" sx={{ fontWeight: 800, mt: 2, color: "primary.main" }}>
                {formatPrice(home.price)}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {formatPrice(pricePerM2)} per m²
              </Typography>
            </Box>

            <Box component="section" aria-labelledby="facts-heading">
              <Typography variant="h6" component="h2" id="facts-heading" sx={{ fontWeight: 700, mb: 1.5 }}>
                Key facts
              </Typography>
              <Box
                component="dl"
                sx={{
                  m: 0,
                  display: "grid",
                  gap: 2.5,
                  gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
                }}
              >
                <KeyFact icon={<BedOutlinedIcon fontSize="small" />} label="Bedrooms" value={bedsLabel(home.beds)} />
                <KeyFact
                  icon={<BathtubOutlinedIcon fontSize="small" />}
                  label="Bathrooms"
                  value={String(home.baths)}
                />
                <KeyFact
                  icon={<SquareFootOutlinedIcon fontSize="small" />}
                  label="Area"
                  value={`${home.area_m2} m²`}
                />
                <KeyFact
                  icon={<CalendarMonthOutlinedIcon fontSize="small" />}
                  label="Built"
                  value={String(home.year)}
                />
              </Box>
            </Box>

            <Divider />

            <Box component="section" aria-labelledby="features-heading">
              <Typography variant="h6" component="h2" id="features-heading" sx={{ fontWeight: 700, mb: 1.5 }}>
                Features
              </Typography>
              <Box
                component="ul"
                sx={{
                  listStyle: "none",
                  m: 0,
                  p: 0,
                  display: "grid",
                  gap: 1,
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                }}
              >
                {home.features.map((f) => (
                  <Stack component="li" key={f} direction="row" sx={{ alignItems: "center", gap: 1 }}>
                    <CheckCircleOutlineIcon color="success" fontSize="small" />
                    <Typography variant="body1">{f}</Typography>
                  </Stack>
                ))}
              </Box>
            </Box>

            <Box component="section" aria-labelledby="energy-heading">
              <Typography variant="h6" component="h2" id="energy-heading" sx={{ fontWeight: 700, mb: 1.5 }}>
                Energy rating
              </Typography>
              <EnergyRating rating={home.energy} />
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.5 }}>
                This home is rated {home.energy} on the A+ to F certificate scale.
              </Typography>
            </Box>

            <Box component="section" aria-labelledby="location-heading">
              <Typography variant="h6" component="h2" id="location-heading" sx={{ fontWeight: 700, mb: 1.5 }}>
                Location
              </Typography>
              <Box
                sx={{
                  height: { xs: 260, sm: 320 },
                  borderRadius: 2,
                  overflow: "hidden",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <DetailMapClient home={home} />
              </Box>
            </Box>
          </Stack>

          {/* Contact column */}
          <Paper
            component="aside"
            variant="outlined"
            aria-labelledby="contact-heading"
            sx={{ p: { xs: 2, sm: 3 }, position: { md: "sticky" }, top: { md: 16 } }}
          >
            <Typography variant="h6" component="h2" id="contact-heading" sx={{ fontWeight: 700 }}>
              Contact the agent
            </Typography>
            <Stack sx={{ mt: 1, mb: 2.5, gap: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {AGENT.name}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {AGENT.agency}
              </Typography>
              <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                <PhoneOutlinedIcon fontSize="small" color="action" />
                <Typography variant="body2">{AGENT.phone}</Typography>
              </Stack>
              <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                <EmailOutlinedIcon fontSize="small" color="action" />
                <Typography variant="body2">{AGENT.email}</Typography>
              </Stack>
            </Stack>
            <ContactForm homeTitle={home.title} agentName={AGENT.name} />
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import SearchPage from "@/components/SearchPage";

export const metadata: Metadata = {
  title: "Haven · Homes for sale in Lisbon",
  description: "Search apartments, houses and studios for sale in Lisbon on an interactive map.",
};

export default function Page() {
  return <SearchPage />;
}
```

```tsx app/homes/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomeDetail from "@/components/HomeDetail";
import { HOMES, formatPrice, getHome } from "@/lib/data";

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
  return {
    title: `${home.title}, ${home.district} · ${formatPrice(home.price)} · Haven`,
    description: `${home.type} in ${home.district}, Lisbon with ${home.beds} beds and ${home.area_m2} m².`,
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();
  return <HomeDetail home={home} />;
}
```