The server printed "Ready" but the check still failed, so the likely cause is that the first request errored or took too long to compile. The biggest suspect is `react-map-gl/maplibre`. In v8 it requires `maplibre-gl` as a peer and resolves it through its own export map, and that import can fail under Turbopack. To remove that risk, I'm dropping `react-map-gl` and using `maplibre-gl` directly. It will be imported dynamically inside `useEffect`, so nothing touches the server bundle.

Other changes:

-   The inlined CSS is replaced by a dynamic `import("maplibre-gl/dist/maplibre-gl.css")` inside the effect, which keeps the global CSS out of the server render path. The side-effect import is typed through a declaration file, so type-checking passes.
-   Markers are DOM elements created with `maplibregl.Marker`. They are updated imperatively as the filtered list and hover state change.
-   The popup is a `maplibregl.Popup` with DOM content built through safe DOM APIs, with no `innerHTML` for data.
-   `MapStyles.tsx` is removed.

```ts lib/data.ts
export type Home = {
  id: string;
  title: string;
  type: "Apartment" | "House" | "Studio";
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

/** Fixed reference date so the "new" badge is deterministic. */
export const TODAY = "2026-11-02";

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

export function formatPrice(n: number): string {
  const digits = String(Math.round(n));
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `€${grouped}`;
}

/** Short price for map markers: €485k, €1.45M */
export function formatPriceShort(n: number): string {
  if (n >= 1_000_000) {
    const m = Math.round(n / 10_000) / 100;
    return `€${m}M`;
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
  return daysSinceListed(listed) <= 7;
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

export function formatDate(listed: string): string {
  const [y, m, d] = listed.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
```

```ts lib/css-modules.d.ts
declare module "maplibre-gl/dist/maplibre-gl.css";
```

```tsx components/Placeholder.tsx
import { Home as HomeIcon } from "lucide-react";

const PALETTES: [string, string, string][] = [
  ["#fde68a", "#fb923c", "#9a3412"],
  ["#bae6fd", "#38bdf8", "#075985"],
  ["#bbf7d0", "#4ade80", "#166534"],
  ["#fbcfe8", "#f472b6", "#9d174d"],
  ["#ddd6fe", "#a78bfa", "#5b21b6"],
  ["#fecaca", "#f87171", "#991b1b"],
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** CSS-drawn photo placeholder: gradient sky, sun and a skyline silhouette. */
export function Placeholder({
  seed,
  variant = 0,
  className = "",
}: {
  seed: string;
  variant?: number;
  className?: string;
}) {
  const [a, b, c] = PALETTES[(hash(seed) + variant) % PALETTES.length];
  const sunLeft = 15 + ((hash(seed) + variant * 23) % 60);
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(160deg, ${a} 0%, ${b} 100%)` }}
    >
      <div
        className="absolute top-[14%] size-[18%] rounded-full bg-white/70"
        style={{ left: `${sunLeft}%` }}
      />
      <div className="absolute inset-x-0 bottom-0 flex h-[48%] items-end gap-[3%] px-[4%]">
        {[55, 80, 62, 95, 70, 85, 58].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              height: `${h - ((variant + i) % 3) * 8}%`,
              background: c,
              opacity: 0.55 + ((i + variant) % 4) * 0.12,
            }}
          />
        ))}
      </div>
      <HomeIcon className="absolute right-3 top-3 size-5 text-white/80" />
    </div>
  );
}
```

```tsx components/Header.tsx
import Link from "next/link";
import { Home as HomeIcon } from "lucide-react";
import { CITY } from "@/lib/data";

export function Header() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md font-semibold tracking-tight text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-teal-700 text-white">
            <HomeIcon className="size-4" aria-hidden="true" />
          </span>
          Haven
        </Link>
        <span className="text-sm text-stone-600">Homes in {CITY}</span>
      </div>
    </header>
  );
}
```

```tsx components/HomeMap.tsx
"use client";

import { useEffect, useRef } from "react";
import type { Map as MlMap, Marker, Popup } from "maplibre-gl";
import {
  MAP_CENTER,
  MAP_STYLE_URL,
  bedsLabel,
  formatPrice,
  formatPriceShort,
  type Home,
} from "@/lib/data";

type Props = {
  homes: Home[];
  activeId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
};

const BASE =
  "rounded-full border px-2.5 py-1 text-xs font-semibold shadow-md transition-transform cursor-pointer";
const IDLE = `${BASE} border-stone-300 bg-white text-stone-900 hover:scale-105`;
const ACTIVE = `${BASE} scale-110 border-teal-900 bg-teal-800 text-white`;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function buildPopupContent(h: Home, onClose: () => void): HTMLElement {
  const root = el("div", "relative w-52");
  const close = el(
    "button",
    "absolute right-0 top-0 grid size-6 place-items-center rounded-full bg-white text-stone-800 shadow",
    "×",
  );
  close.type = "button";
  close.setAttribute("aria-label", "Close popup");
  close.addEventListener("click", onClose);
  root.appendChild(close);
  root.appendChild(el("p", "pr-6 text-base font-semibold text-stone-900", formatPrice(h.price)));
  root.appendChild(el("p", "text-sm text-stone-800", h.title));
  root.appendChild(
    el(
      "p",
      "text-xs text-stone-600",
      `${bedsLabel(h.beds)} · ${h.area_m2} m² · ${h.district}`,
    ),
  );
  const link = el(
    "a",
    "mt-2 inline-block text-sm font-medium text-teal-800 underline underline-offset-2",
    "View home",
  );
  link.href = `/homes/${h.id}`;
  root.appendChild(link);
  return root;
}

export function HomeMap({
  homes,
  activeId,
  selectedId,
  onHover,
  onSelect,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const libRef = useRef<typeof import("maplibre-gl") | null>(null);
  const markersRef = useRef<Map<string, { marker: Marker; node: HTMLButtonElement }>>(
    new Map(),
  );
  const popupRef = useRef<Popup | null>(null);
  const readyRef = useRef(false);

  // Keep latest props/callbacks reachable from long-lived listeners.
  const propsRef = useRef<Props>({
    homes,
    activeId,
    selectedId,
    onHover,
    onSelect,
  });
  propsRef.current = { homes, activeId, selectedId, onHover, onSelect };

  const syncRef = useRef<() => void>(() => {});
  syncRef.current = () => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!map || !lib || !readyRef.current) return;
    const p = propsRef.current;
    const wanted = new Set(p.homes.map((h) => h.id));

    // Remove markers that were filtered out.
    for (const [id, entry] of markersRef.current) {
      if (!wanted.has(id)) {
        entry.marker.remove();
        markersRef.current.delete(id);
      }
    }

    // Add new markers and update styles.
    for (const h of p.homes) {
      let entry = markersRef.current.get(h.id);
      if (!entry) {
        const node = el("button", IDLE, formatPriceShort(h.price));
        node.type = "button";
        node.setAttribute("aria-label", `${h.title}, ${formatPrice(h.price)}`);
        node.addEventListener("mouseenter", () =>
          propsRef.current.onHover(h.id),
        );
        node.addEventListener("mouseleave", () =>
          propsRef.current.onHover(null),
        );
        node.addEventListener("focus", () => propsRef.current.onHover(h.id));
        node.addEventListener("blur", () => propsRef.current.onHover(null));
        node.addEventListener("click", (e) => {
          e.stopPropagation();
          propsRef.current.onSelect(h.id);
        });
        const marker = new lib.Marker({ element: node, anchor: "bottom" })
          .setLngLat([h.lng, h.lat])
          .addTo(map);
        entry = { marker, node };
        markersRef.current.set(h.id, entry);
      }
      const active = h.id === p.activeId || h.id === p.selectedId;
      entry.node.className = active ? ACTIVE : IDLE;
      entry.node.setAttribute("aria-pressed", String(h.id === p.selectedId));
      entry.marker.getElement().style.zIndex = active ? "10" : "1";
    }

    // Popup for selected home.
    const selected = p.homes.find((h) => h.id === p.selectedId) ?? null;
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
    if (selected) {
      const popup = new lib.Popup({
        offset: 34,
        closeButton: false,
        closeOnClick: false,
        maxWidth: "260px",
      })
        .setLngLat([selected.lng, selected.lat])
        .setDOMContent(
          buildPopupContent(selected, () => propsRef.current.onSelect(null)),
        )
        .addTo(map);
      popupRef.current = popup;
    }
  };

  // Create the map once, on the client only.
  useEffect(() => {
    let cancelled = false;
    const markers = markersRef.current;

    (async () => {
      const [mod] = await Promise.all([
        import("maplibre-gl"),
        import("maplibre-gl/dist/maplibre-gl.css"),
      ]);
      if (cancelled || !containerRef.current) return;
      const lib = (mod as unknown as { default?: typeof import("maplibre-gl") })
        .default ?? mod;
      libRef.current = lib as typeof import("maplibre-gl");

      const map = new lib.Map({
        container: containerRef.current,
        style: MAP_STYLE_URL,
        center: MAP_CENTER,
        zoom: 11.6,
        attributionControl: { compact: true },
      });
      map.addControl(
        new lib.NavigationControl({ showCompass: false }),
        "top-right",
      );
      map.on("click", () => propsRef.current.onSelect(null));
      mapRef.current = map;
      readyRef.current = true;
      syncRef.current();
    })().catch(() => {
      /* map is optional; list remains usable */
    });

    return () => {
      cancelled = true;
      readyRef.current = false;
      popupRef.current?.remove();
      popupRef.current = null;
      markers.forEach((m) => m.marker.remove());
      markers.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-sync markers/popup whenever inputs change.
  useEffect(() => {
    syncRef.current();
  }, [homes, activeId, selectedId]);

  // Resize when the container becomes visible (mobile list/map toggle).
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => mapRef.current?.resize());
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-stone-100"
      aria-label="Interactive map of homes"
    />
  );
}
```

```tsx components/HomeCard.tsx
"use client";

import Link from "next/link";
import { Bath, BedDouble, Heart, Maximize2, MapPin } from "lucide-react";
import { bedsLabel, formatPrice, isNew, type Home } from "@/lib/data";
import { Placeholder } from "./Placeholder";

export function HomeCard({
  home,
  highlighted,
  saved,
  onToggleSave,
  onHover,
}: {
  home: Home;
  highlighted: boolean;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  return (
    <article
      id={`card-${home.id}`}
      onMouseEnter={() => onHover(home.id)}
      onMouseLeave={() => onHover(null)}
      className={`relative overflow-hidden rounded-xl border bg-white transition-shadow ${
        highlighted
          ? "border-teal-700 shadow-lg ring-2 ring-teal-700/40"
          : "border-stone-200 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="relative">
        <Placeholder seed={home.id} className="h-40 w-full" />
        {isNew(home.listed) && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-300 px-2.5 py-0.5 text-xs font-semibold text-amber-950">
            New this week
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => onToggleSave(home.id)}
        aria-pressed={saved}
        aria-label={
          saved ? `Remove ${home.title} from saved` : `Save ${home.title}`
        }
        className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-white/95 shadow hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        <Heart
          aria-hidden="true"
          className={`size-5 ${saved ? "fill-rose-600 text-rose-600" : "text-stone-700"}`}
        />
      </button>
      <div className="p-4">
        <p className="text-xl font-semibold tracking-tight text-stone-900">
          {formatPrice(home.price)}
        </p>
        <h3 className="mt-0.5 text-base font-medium text-stone-900">
          <Link
            href={`/homes/${home.id}`}
            className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            {home.title}
          </Link>
        </h3>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-700">
          <li className="flex items-center gap-1.5">
            <BedDouble className="size-4" aria-hidden="true" />
            {bedsLabel(home.beds)}
          </li>
          <li className="flex items-center gap-1.5">
            <Bath className="size-4" aria-hidden="true" />
            {home.baths} bath{home.baths === 1 ? "" : "s"}
          </li>
          <li className="flex items-center gap-1.5">
            <Maximize2 className="size-4" aria-hidden="true" />
            {home.area_m2} m²
          </li>
        </ul>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-stone-600">
          <MapPin className="size-4" aria-hidden="true" />
          {home.district} · {home.type}
        </p>
      </div>
    </article>
  );
}
```

```tsx components/FilterBar.tsx
"use client";

export type Filters = {
  type: string;
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  sort: string;
};

export const DEFAULT_FILTERS: Filters = {
  type: "any",
  minPrice: "",
  maxPrice: "",
  minBeds: "0",
  sort: "newest",
};

const PRICE_STEPS = [
  200000, 300000, 400000, 500000, 600000, 800000, 1000000, 1500000,
];

const eurShort = (n: number) =>
  n >= 1_000_000 ? `€${n / 1_000_000}M` : `€${n / 1000}k`;

const selectCls =
  "h-10 w-full rounded-lg border border-stone-300 bg-white px-2.5 text-sm text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-xs font-medium text-stone-700"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function FilterBar({
  filters,
  onChange,
  onReset,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <form
      role="search"
      aria-label="Filter homes"
      onSubmit={(e) => e.preventDefault()}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
    >
      <Field label="Type" htmlFor="f-type">
        <select
          id="f-type"
          className={selectCls}
          value={filters.type}
          onChange={(e) => set({ type: e.target.value })}
        >
          <option value="any">Any type</option>
          <option value="Apartment">Apartment</option>
          <option value="House">House</option>
          <option value="Studio">Studio</option>
        </select>
      </Field>
      <Field label="Min price" htmlFor="f-min">
        <select
          id="f-min"
          className={selectCls}
          value={filters.minPrice}
          onChange={(e) => set({ minPrice: e.target.value })}
        >
          <option value="">No min</option>
          {PRICE_STEPS.map((p) => (
            <option key={p} value={p}>
              {eurShort(p)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Max price" htmlFor="f-max">
        <select
          id="f-max"
          className={selectCls}
          value={filters.maxPrice}
          onChange={(e) => set({ maxPrice: e.target.value })}
        >
          <option value="">No max</option>
          {PRICE_STEPS.map((p) => (
            <option key={p} value={p}>
              {eurShort(p)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Bedrooms" htmlFor="f-beds">
        <select
          id="f-beds"
          className={selectCls}
          value={filters.minBeds}
          onChange={(e) => set({ minBeds: e.target.value })}
        >
          <option value="0">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </Field>
      <Field label="Sort by" htmlFor="f-sort">
        <select
          id="f-sort"
          className={selectCls}
          value={filters.sort}
          onChange={(e) => set({ sort: e.target.value })}
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="size-desc">Size: largest first</option>
          <option value="size-asc">Size: smallest first</option>
        </select>
      </Field>
      <div className="flex items-end">
        <button
          type="button"
          onClick={onReset}
          className="h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm font-medium text-stone-800 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700"
        >
          Reset filters
        </button>
      </div>
    </form>
  );
}
```

```tsx components/SearchView.tsx
"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { List, Map as MapIcon, SearchX } from "lucide-react";
import { HOMES, type Home } from "@/lib/data";
import { DEFAULT_FILTERS, FilterBar, type Filters } from "./FilterBar";
import { HomeCard } from "./HomeCard";

const HomeMap = dynamic(() => import("./HomeMap").then((m) => m.HomeMap), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-stone-100 text-sm text-stone-600">
      Loading map…
    </div>
  ),
});

function applyFilters(homes: Home[], f: Filters): Home[] {
  const min = f.minPrice ? Number(f.minPrice) : 0;
  const max = f.maxPrice ? Number(f.maxPrice) : Infinity;
  const beds = Number(f.minBeds);
  const out = homes.filter(
    (h) =>
      (f.type === "any" || h.type === f.type) &&
      h.price >= min &&
      h.price <= max &&
      h.beds >= beds,
  );
  out.sort((a, b) => {
    switch (f.sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "size-asc":
        return a.area_m2 - b.area_m2;
      case "size-desc":
        return b.area_m2 - a.area_m2;
      default:
        return b.listed.localeCompare(a.listed);
    }
  });
  return out;
}

export function SearchView() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [view, setView] = useState<"list" | "map">("list");

  const results = useMemo(() => applyFilters(HOMES, filters), [filters]);

  const activeId = results.some((h) => h.id === hoveredId) ? hoveredId : null;
  const visibleSelectedId = results.some((h) => h.id === selectedId)
    ? selectedId
    : null;

  const toggleSave = (id: string) =>
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const selectFromMap = (id: string | null) => {
    setSelectedId(id);
    if (id) {
      document
        .getElementById(`card-${id}`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  };

  const toggleBase =
    "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-teal-700";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-stone-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-[1600px]">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-3">
        <h1 className="text-lg font-semibold text-stone-900">
          Homes for sale in Lisbon
          <span
            role="status"
            aria-live="polite"
            className="ml-2 text-sm font-normal text-stone-600"
          >
            {results.length} {results.length === 1 ? "home" : "homes"}
          </span>
        </h1>
        <div
          className="inline-flex rounded-lg border border-stone-300 bg-white p-0.5 lg:hidden"
          role="group"
          aria-label="Choose view"
        >
          <button
            type="button"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
            className={`${toggleBase} ${
              view === "list"
                ? "bg-teal-700 text-white"
                : "text-stone-800 hover:bg-stone-100"
            }`}
          >
            <List className="size-4" aria-hidden="true" />
            List
          </button>
          <button
            type="button"
            aria-pressed={view === "map"}
            onClick={() => setView("map")}
            className={`${toggleBase} ${
              view === "map"
                ? "bg-teal-700 text-white"
                : "text-stone-800 hover:bg-stone-100"
            }`}
          >
            <MapIcon className="size-4" aria-hidden="true" />
            Map
          </button>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 gap-4 px-4 pb-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className={`${view === "list" ? "block" : "hidden"} lg:block`}>
          {results.length === 0 ? (
            <div className="grid place-items-center rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
              <SearchX className="size-8 text-stone-500" aria-hidden="true" />
              <p className="mt-3 font-medium text-stone-900">
                No homes match these filters
              </p>
              <p className="mt-1 text-sm text-stone-600">
                Try widening the price range or lowering the bedrooms.
              </p>
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {results.map((h) => (
                <li key={h.id} className="min-w-0">
                  <HomeCard
                    home={h}
                    highlighted={h.id === activeId || h.id === visibleSelectedId}
                    saved={saved.includes(h.id)}
                    onToggleSave={toggleSave}
                    onHover={setHoveredId}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className={`${view === "map" ? "block" : "hidden"} lg:sticky lg:top-4 lg:block lg:self-start`}
        >
          <div
            className="h-[70vh] min-h-[360px] overflow-hidden rounded-xl border border-stone-200 lg:h-[calc(100vh-10rem)]"
            role="region"
            aria-label="Map of homes"
          >
            <HomeMap
              homes={results}
              activeId={activeId}
              selectedId={visibleSelectedId}
              onHover={setHoveredId}
              onSelect={selectFromMap}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

```tsx app/page.tsx
import { Header } from "@/components/Header";
import { SearchView } from "@/components/SearchView";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <Header />
      <main className="flex min-h-0 flex-1 flex-col">
        <SearchView />
      </main>
    </div>
  );
}
```

```tsx components/DetailMap.tsx
"use client";

import { useEffect, useRef } from "react";
import type { Map as MlMap } from "maplibre-gl";
import { MAP_STYLE_URL } from "@/lib/data";

export function DetailMap({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let map: MlMap | null = null;

    (async () => {
      const [mod] = await Promise.all([
        import("maplibre-gl"),
        import("maplibre-gl/dist/maplibre-gl.css"),
      ]);
      if (cancelled || !containerRef.current) return;
      const lib = ((mod as unknown as { default?: typeof import("maplibre-gl") })
        .default ?? mod) as typeof import("maplibre-gl");

      map = new lib.Map({
        container: containerRef.current,
        style: MAP_STYLE_URL,
        center: [lng, lat],
        zoom: 14,
        scrollZoom: false,
        attributionControl: { compact: true },
      });
      map.addControl(
        new lib.NavigationControl({ showCompass: false }),
        "top-right",
      );

      const pin = document.createElement("span");
      pin.setAttribute("role", "img");
      pin.setAttribute("aria-label", label);
      pin.className =
        "block size-5 rounded-full border-4 border-white bg-teal-700 shadow-lg";
      new lib.Marker({ element: pin, anchor: "center" })
        .setLngLat([lng, lat])
        .addTo(map);
    })().catch(() => {
      /* map is decorative; page remains usable */
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lng, label]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-stone-100"
      aria-label={label}
    />
  );
}
```

```tsx components/DetailMapLoader.tsx
"use client";

import dynamic from "next/dynamic";

const DetailMap = dynamic(
  () => import("./DetailMap").then((m) => m.DetailMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center bg-stone-100 text-sm text-stone-600">
        Loading map…
      </div>
    ),
  },
);

export function DetailMapLoader(props: {
  lat: number;
  lng: number;
  label: string;
}) {
  return <DetailMap {...props} />;
}
```

```tsx components/ContactForm.tsx
"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AGENT } from "@/lib/data";

type Values = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

const inputCls =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700";

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Please enter your name.";
  if (!v.email.trim()) e.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
    e.email = "Enter a valid email address, like name@example.com.";
  if (!v.message.trim()) e.message = "Please write a message for the agent.";
  return e;
}

export function ContactForm({ homeTitle }: { homeTitle: string }) {
  const [values, setValues] = useState<Values>({
    name: "",
    email: "",
    message: `Hello ${AGENT.name.split(" ")[0]}, I'd like to arrange a viewing of "${homeTitle}".`,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const e = validate(values);
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setSent(true);
      return;
    }
    const first = (["name", "email", "message"] as const).find((k) => e[k]);
    if (first) document.getElementById(`c-${first}`)?.focus();
  }

  function update(key: keyof Values, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (errors[key]) setErrors({ ...errors, [key]: validate(next)[key] });
  }

  if (sent) {
    return (
      <div
        role="status"
        className="rounded-xl border border-teal-200 bg-teal-50 p-5"
      >
        <CheckCircle2 className="size-6 text-teal-700" aria-hidden="true" />
        <p className="mt-2 font-semibold text-teal-950">Message sent</p>
        <p className="mt-1 text-sm text-teal-900">
          Thanks, {values.name.trim()}. {AGENT.name} will reply to{" "}
          {values.email.trim()} shortly.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-3 text-sm font-medium text-teal-900 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-teal-700"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label
          htmlFor="c-name"
          className="mb-1 block text-sm font-medium text-stone-800"
        >
          Name
        </label>
        <input
          id="c-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "c-name-err" : undefined}
          className={`${inputCls} ${errors.name ? "border-red-600" : "border-stone-300"}`}
        />
        {errors.name && (
          <p id="c-name-err" className="mt-1 text-sm text-red-700">
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="c-email"
          className="mb-1 block text-sm font-medium text-stone-800"
        >
          Email
        </label>
        <input
          id="c-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "c-email-err" : undefined}
          className={`${inputCls} ${errors.email ? "border-red-600" : "border-stone-300"}`}
        />
        {errors.email && (
          <p id="c-email-err" className="mt-1 text-sm text-red-700">
            {errors.email}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="c-message"
          className="mb-1 block text-sm font-medium text-stone-800"
        >
          Message
        </label>
        <textarea
          id="c-message"
          name="message"
          rows={5}
          required
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "c-message-err" : undefined}
          className={`${inputCls} ${errors.message ? "border-red-600" : "border-stone-300"}`}
        />
        {errors.message && (
          <p id="c-message-err" className="mt-1 text-sm text-red-700">
            {errors.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        Contact {AGENT.name.split(" ")[0]}
      </button>
    </form>
  );
}
```

```tsx components/EnergyRating.tsx
const SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const COLORS = [
  "bg-green-700 text-white",
  "bg-green-600 text-white",
  "bg-lime-600 text-white",
  "bg-yellow-400 text-yellow-950",
  "bg-amber-500 text-amber-950",
  "bg-orange-600 text-white",
  "bg-red-700 text-white",
];

export function EnergyRating({ rating }: { rating: string }) {
  return (
    <div>
      <div
        className="flex items-end gap-1"
        role="img"
        aria-label={`Energy rating ${rating} on a scale from A+ (best) to F (worst)`}
      >
        {SCALE.map((s, i) => {
          const active = s === rating;
          return (
            <div
              key={s}
              className={`grid place-items-center rounded-md text-sm font-semibold ${COLORS[i]} ${
                active
                  ? "h-12 w-12 ring-2 ring-stone-900 ring-offset-2"
                  : "h-8 w-9 opacity-45"
              }`}
            >
              {s}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-stone-600">
        Rated <strong className="text-stone-900">{rating}</strong>. A+ is the
        most efficient, F the least.
      </p>
    </div>
  );
}
```

```tsx app/homes/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Calendar,
  Check,
  Mail,
  Maximize2,
  Phone,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Placeholder } from "@/components/Placeholder";
import { EnergyRating } from "@/components/EnergyRating";
import { ContactForm } from "@/components/ContactForm";
import { DetailMapLoader } from "@/components/DetailMapLoader";
import {
  AGENT,
  HOMES,
  bedsLabel,
  formatDate,
  formatPrice,
  getHome,
  isNew,
} from "@/lib/data";

export function generateStaticParams() {
  return HOMES.map((h) => ({ id: h.id }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();

  const facts = [
    { icon: BedDouble, label: "Bedrooms", value: bedsLabel(home.beds) },
    { icon: Bath, label: "Bathrooms", value: String(home.baths) },
    { icon: Maximize2, label: "Area", value: `${home.area_m2} m²` },
    { icon: Calendar, label: "Built", value: String(home.year) },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-teal-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to search
        </Link>

        <section aria-label="Photo gallery" className="mt-4">
          <ul className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">
            {[0, 1, 2, 3].map((i) => (
              <li
                key={i}
                className={`shrink-0 max-md:w-[80%] ${
                  i === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <Placeholder
                  seed={home.id}
                  variant={i}
                  className={`w-full rounded-xl ${
                    i === 0
                      ? "h-56 md:h-full md:min-h-[22rem]"
                      : "h-56 md:h-[10.5rem]"
                  }`}
                />
                <span className="sr-only">Photo placeholder {i + 1} of 4</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-8">
            <section aria-labelledby="home-title">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-medium text-stone-800">
                  {home.type}
                </span>
                {isNew(home.listed) && (
                  <span className="rounded-full bg-amber-300 px-2.5 py-0.5 text-xs font-semibold text-amber-950">
                    New this week
                  </span>
                )}
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                {formatPrice(home.price)}
              </p>
              <h1 id="home-title" className="mt-1 text-xl font-medium">
                {home.title}
              </h1>
              <p className="mt-1 text-stone-600">
                {home.district}, Lisbon · Listed {formatDate(home.listed)}
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-stone-200 bg-white p-3"
                  >
                    <dt className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                      <Icon className="size-4" aria-hidden="true" />
                      {label}
                    </dt>
                    <dd className="mt-1 text-lg font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section aria-labelledby="features-h">
              <h2 id="features-h" className="text-lg font-semibold">
                Features
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {home.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-stone-800">
                    <Check
                      className="size-4 shrink-0 text-teal-700"
                      aria-hidden="true"
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="energy-h">
              <h2 id="energy-h" className="text-lg font-semibold">
                Energy rating
              </h2>
              <div className="mt-3">
                <EnergyRating rating={home.energy} />
              </div>
            </section>

            <section aria-labelledby="location-h">
              <h2 id="location-h" className="text-lg font-semibold">
                Location
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                {home.district}, Lisbon
              </p>
              <div
                className="mt-3 h-72 overflow-hidden rounded-xl border border-stone-200"
                role="region"
                aria-label={`Map showing ${home.title}`}
              >
                <DetailMapLoader
                  lat={home.lat}
                  lng={home.lng}
                  label={`${home.title}, ${home.district}`}
                />
              </div>
            </section>
          </div>

          <aside
            aria-labelledby="contact-h"
            className="lg:sticky lg:top-4 lg:self-start"
          >
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <h2 id="contact-h" className="text-lg font-semibold">
                Contact the agent
              </h2>
              <div className="mt-3 flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="grid size-11 place-items-center rounded-full bg-teal-700 text-sm font-semibold text-white"
                >
                  IC
                </div>
                <div className="text-sm">
                  <p className="font-medium">{AGENT.name}</p>
                  <p className="text-stone-600">{AGENT.agency}</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-stone-700">
                <li className="flex items-center gap-2">
                  <Phone className="size-4" aria-hidden="true" />
                  {AGENT.phone}
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="size-4" aria-hidden="true" />
                  {AGENT.email}
                </li>
              </ul>
              <div className="mt-5 border-t border-stone-200 pt-5">
                <ContactForm homeTitle={home.title} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
```

```tsx app/homes/[id]/not-found.tsx
import Link from "next/link";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Header />
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">
          We couldn&apos;t find that home
        </h1>
        <p className="mt-2 text-stone-600">
          It may have been sold or the link may be wrong.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          Back to search
        </Link>
      </main>
    </div>
  );
}
```