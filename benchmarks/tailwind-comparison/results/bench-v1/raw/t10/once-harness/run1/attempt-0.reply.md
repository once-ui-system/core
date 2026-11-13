I'll write the map components against the `react-map-gl/maplibre` entry point (v8: `Map`, `Marker`, `Popup`, `NavigationControl`, `MapRef`).

```tsx components/SearchMap.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "./map.css";

import { useEffect, useRef } from "react";
import Link from "next/link";
import MapGL, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import {
  SITE,
  bathsLabel,
  bedsLabel,
  formatPrice,
  formatPriceShort,
  type Home,
} from "@/lib/data";
import { Photo } from "./Photo";
import styles from "./haven.module.css";

interface SearchMapProps {
  homes: Home[];
  activeId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  /** Changes when the map becomes visible again (mobile toggle) so it can resize. */
  visible: boolean;
}

export default function SearchMap({
  homes,
  activeId,
  selectedId,
  onHover,
  onSelect,
  visible,
}: SearchMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const selected = homes.find((h) => h.id === selectedId) ?? null;

  useEffect(() => {
    if (visible) {
      // Container may have been display:none; let MapLibre re-measure it.
      const t = window.setTimeout(() => mapRef.current?.resize(), 50);
      return () => window.clearTimeout(t);
    }
  }, [visible]);

  return (
    <MapGL
      ref={mapRef}
      initialViewState={{
        longitude: SITE.mapCenter[0],
        latitude: SITE.mapCenter[1],
        zoom: 11.6,
      }}
      mapStyle={SITE.mapStyleUrl}
      style={{ width: "100%", height: "100%" }}
      minZoom={9}
      attributionControl={{ compact: true }}
      onClick={() => onSelect(null)}
      cooperativeGestures={false}
      reuseMaps={false}
    >
      <NavigationControl position="top-right" showCompass={false} />

      {homes.map((home) => {
        const active = home.id === activeId || home.id === selectedId;
        return (
          <Marker
            key={home.id}
            longitude={home.lng}
            latitude={home.lat}
            anchor="center"
            style={{ zIndex: active ? 10 : 1 }}
          >
            <button
              type="button"
              className={`${styles.marker} ${active ? styles.markerActive : ""}`}
              aria-label={`${home.title}, ${formatPrice(home.price)}, ${home.district}`}
              aria-pressed={home.id === selectedId}
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

      {selected ? (
        <Popup
          longitude={selected.lng}
          latitude={selected.lat}
          anchor="bottom"
          offset={22}
          closeButton={false}
          closeOnClick={false}
          className="haven-popup"
          maxWidth="none"
          onClose={() => onSelect(null)}
        >
          <div className={styles.popupCard}>
            <button
              type="button"
              className={styles.popupClose}
              aria-label="Close preview"
              onClick={() => onSelect(null)}
            >
              ×
            </button>
            <Link href={`/homes/${selected.id}`} className={styles.popupLink}>
              <Photo id={selected.id} small />
              <div className={styles.popupBody}>
                <strong style={{ fontSize: "1.0625rem" }}>{formatPrice(selected.price)}</strong>
                <span style={{ fontSize: "0.875rem" }}>{selected.title}</span>
                <span style={{ fontSize: "0.8125rem", color: "#555" }}>
                  {bedsLabel(selected.beds)} · {bathsLabel(selected.baths)} · {selected.area_m2} m² ·{" "}
                  {selected.district}
                </span>
              </div>
            </Link>
          </div>
        </Popup>
      ) : null}
    </MapGL>
  );
}
```

```tsx components/SearchMapLoader.tsx
"use client";

import dynamic from "next/dynamic";
import styles from "./haven.module.css";

const SearchMap = dynamic(() => import("./SearchMap"), {
  ssr: false,
  loading: () => (
    <div className={styles.mapFallback} role="status">
      Loading map…
    </div>
  ),
});

export default SearchMap;
```

```tsx components/DetailMap.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "./map.css";

import MapGL, { Marker, NavigationControl } from "react-map-gl/maplibre";
import { SITE, formatPriceShort, type Home } from "@/lib/data";
import styles from "./haven.module.css";

export default function DetailMap({ home }: { home: Home }) {
  return (
    <MapGL
      initialViewState={{ longitude: home.lng, latitude: home.lat, zoom: 13.5 }}
      mapStyle={SITE.mapStyleUrl}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      cooperativeGestures
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Marker longitude={home.lng} latitude={home.lat} anchor="center">
        <span
          className={`${styles.marker} ${styles.markerActive}`}
          role="img"
          aria-label={`${home.title} location, ${home.district}`}
          style={{ display: "inline-block" }}
        >
          {formatPriceShort(home.price)}
        </span>
      </Marker>
    </MapGL>
  );
}
```

```tsx components/DetailMapLoader.tsx
"use client";

import dynamic from "next/dynamic";
import styles from "./haven.module.css";

const DetailMap = dynamic(() => import("./DetailMap"), {
  ssr: false,
  loading: () => (
    <div className={styles.mapFallback} role="status">
      Loading map…
    </div>
  ),
});

export default DetailMap;
```

Now the filter bar and result card.

```tsx components/FilterBar.tsx
"use client";

import {
  DEFAULT_FILTERS,
  type Filters,
  type HomeType,
  type SortKey,
} from "@/lib/data";
import styles from "./haven.module.css";

const TYPE_OPTIONS: { value: Filters["type"]; label: string }[] = [
  { value: "any", label: "Any type" },
  { value: "Apartment", label: "Apartment" },
  { value: "House", label: "House" },
  { value: "Studio", label: "Studio" },
];

const MIN_PRICES = [0, 200000, 300000, 400000, 500000, 750000, 1000000];
const MAX_PRICES = [0, 300000, 400000, 500000, 750000, 1000000, 1500000];

const BED_OPTIONS = [0, 1, 2, 3, 4];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "size", label: "Size: largest first" },
];

const eur = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function isDefault(f: Filters) {
  return (
    f.type === DEFAULT_FILTERS.type &&
    f.minPrice === DEFAULT_FILTERS.minPrice &&
    f.maxPrice === DEFAULT_FILTERS.maxPrice &&
    f.minBeds === DEFAULT_FILTERS.minBeds &&
    f.sort === DEFAULT_FILTERS.sort
  );
}

export function FilterBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <form
      className={styles.filterBar}
      role="search"
      aria-label="Filter homes"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="f-type">
          Type
        </label>
        <select
          id="f-type"
          className={styles.select}
          value={filters.type}
          onChange={(e) => set("type", e.target.value as "any" | HomeType)}
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="f-min">
          Min price
        </label>
        <select
          id="f-min"
          className={styles.select}
          value={filters.minPrice}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange({
              ...filters,
              minPrice: v,
              maxPrice: v !== 0 && filters.maxPrice !== 0 && filters.maxPrice < v ? 0 : filters.maxPrice,
            });
          }}
        >
          {MIN_PRICES.map((p) => (
            <option key={p} value={p}>
              {p === 0 ? "No min" : eur.format(p)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="f-max">
          Max price
        </label>
        <select
          id="f-max"
          className={styles.select}
          value={filters.maxPrice}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange({
              ...filters,
              maxPrice: v,
              minPrice: v !== 0 && filters.minPrice > v ? 0 : filters.minPrice,
            });
          }}
        >
          {MAX_PRICES.map((p) => (
            <option key={p} value={p}>
              {p === 0 ? "No max" : eur.format(p)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="f-beds">
          Bedrooms
        </label>
        <select
          id="f-beds"
          className={styles.select}
          value={filters.minBeds}
          onChange={(e) => set("minBeds", Number(e.target.value))}
        >
          {BED_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b === 0 ? "Any" : `${b}+ beds`}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="f-sort">
          Sort by
        </label>
        <select
          id="f-sort"
          className={styles.select}
          value={filters.sort}
          onChange={(e) => set("sort", e.target.value as SortKey)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {!isDefault(filters) ? (
        <button type="button" className={styles.resetBtn} onClick={() => onChange(DEFAULT_FILTERS)}>
          Reset filters
        </button>
      ) : null}
    </form>
  );
}
```

```tsx components/HomeCard.tsx
"use client";

import Link from "next/link";
import {
  bathsLabel,
  bedsLabel,
  formatPrice,
  isNew,
  type Home,
} from "@/lib/data";
import { Photo } from "./Photo";
import { SaveButton } from "./SaveButton";
import styles from "./haven.module.css";

export function HomeCard({
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
  const fresh = isNew(home);

  return (
    <li
      id={`card-${home.id}`}
      className={`${styles.card} ${active ? styles.cardActive : ""}`}
      onMouseEnter={() => onHover(home.id)}
      onMouseLeave={() => onHover(null)}
    >
      <Photo id={home.id} label={home.type} />
      {fresh ? <span className={styles.badgeNew}>New this week</span> : null}
      <SaveButton title={home.title} saved={saved} onToggle={onToggleSave} />
      <div className={styles.cardBody}>
        <span className={styles.price}>{formatPrice(home.price)}</span>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
          <Link
            href={`/homes/${home.id}`}
            className={styles.cardLink}
            onFocus={() => onHover(home.id)}
            onBlur={() => onHover(null)}
          >
            {home.title}
          </Link>
        </h3>
        <ul className={styles.facts} aria-label="Key facts">
          <li>{bedsLabel(home.beds)}</li>
          <li>{bathsLabel(home.baths)}</li>
          <li>{home.area_m2} m²</li>
        </ul>
        <span style={{ fontSize: "0.875rem", opacity: 0.75 }}>{home.district}, Lisbon</span>
      </div>
    </li>
  );
}
```

`.cardLink` has `display: flex; flex: 1`, and its `::after` stretches the link over the whole card. That makes the entire card clickable while the save button (z-index 3) stays on top. Now the search app that wires state together.

```tsx components/SearchApp.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Column, Heading, Row, Text } from "@once-ui-system/core";
import {
  DEFAULT_FILTERS,
  HOMES,
  SITE,
  applyFilters,
  type Filters,
} from "@/lib/data";
import { useSaved } from "@/lib/useSaved";
import { FilterBar } from "./FilterBar";
import { HomeCard } from "./HomeCard";
import SearchMap from "./SearchMapLoader";
import styles from "./haven.module.css";

type View = "list" | "map";

export function SearchApp() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<View>("list");
  const { saved, toggle } = useSaved();

  const results = useMemo(() => applyFilters(HOMES, filters), [filters]);

  // Drop hover/selection for homes that were filtered out.
  useEffect(() => {
    if (hoveredId && !results.some((h) => h.id === hoveredId)) setHoveredId(null);
    if (selectedId && !results.some((h) => h.id === selectedId)) setSelectedId(null);
  }, [results, hoveredId, selectedId]);

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) {
      const el = document.getElementById(`card-${id}`);
      // Only scroll the card into view when the list is on screen.
      if (el && el.offsetParent !== null) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, []);

  const count = results.length;

  return (
    <Column fillWidth horizontal="center" paddingX="16" paddingY="16" gap="16">
      <Column fillWidth maxWidth={90 as never} style={{ maxWidth: "90rem" }} gap="16">
        <Column gap="4">
          <Heading as="h1" variant="heading-strong-xl">
            Homes for sale in {SITE.city}
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Browse listings, compare on the map and save the ones you like.
          </Text>
        </Column>

        <FilterBar filters={filters} onChange={setFilters} />

        <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
          <Text as="p" variant="label-default-m" aria-live="polite" role="status">
            {count === 0 ? "No homes match" : `${count} ${count === 1 ? "home" : "homes"}`} in {SITE.city}
          </Text>
          <div className={styles.viewToggle} role="group" aria-label="Choose view">
            <button
              type="button"
              className={`${styles.toggleBtn} ${view === "list" ? styles.toggleBtnActive : ""}`}
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              List
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${view === "map" ? styles.toggleBtnActive : ""}`}
              aria-pressed={view === "map"}
              onClick={() => setView("map")}
            >
              Map
            </button>
          </div>
        </Row>

        <div className={styles.searchShell}>
          <section
            className={`${styles.listPane} ${view === "map" ? styles.hiddenOnSmall : ""}`}
            aria-label="Search results"
          >
            {count === 0 ? (
              <div className={styles.empty}>
                <Heading as="h2" variant="heading-strong-m">
                  No homes match these filters
                </Heading>
                <Text as="p" onBackground="neutral-weak" marginTop="8">
                  Try widening the price range or lowering the minimum bedrooms.
                </Text>
                <Row horizontal="center" marginTop="16">
                  <button
                    type="button"
                    className={styles.toggleBtn}
                    style={{ borderRadius: "0.5rem", borderLeft: "1px solid var(--neutral-alpha-strong)" }}
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                  >
                    Reset filters
                  </button>
                </Row>
              </div>
            ) : (
              <ul className={styles.cardGrid}>
                {results.map((home) => (
                  <HomeCard
                    key={home.id}
                    home={home}
                    active={hoveredId === home.id || selectedId === home.id}
                    saved={saved.includes(home.id)}
                    onToggleSave={() => toggle(home.id)}
                    onHover={setHoveredId}
                  />
                ))}
              </ul>
            )}
          </section>

          <div
            className={`${styles.mapPane} ${view === "list" ? styles.hiddenOnSmall : ""}`}
            role="region"
            aria-label="Map of homes"
          >
            <SearchMap
              homes={results}
              activeId={hoveredId}
              selectedId={selectedId}
              onHover={setHoveredId}
              onSelect={handleSelect}
              visible={view === "map"}
            />
          </div>
        </div>
      </Column>
    </Column>
  );
}
```

I used `maxWidth={90 as never}` plus a style override, which is a hack. I'll use only the inline style (`maxWidth: "90rem"`) via a plain wrapper. Corrected file:

```tsx components/SearchApp.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Column, Heading, Row, Text } from "@once-ui-system/core";
import {
  DEFAULT_FILTERS,
  HOMES,
  SITE,
  applyFilters,
  type Filters,
} from "@/lib/data";
import { useSaved } from "@/lib/useSaved";
import { FilterBar } from "./FilterBar";
import { HomeCard } from "./HomeCard";
import SearchMap from "./SearchMapLoader";
import styles from "./haven.module.css";

type View = "list" | "map";

export function SearchApp() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<View>("list");
  const { saved, toggle } = useSaved();

  const results = useMemo(() => applyFilters(HOMES, filters), [filters]);

  // Drop hover/selection for homes that were filtered out.
  useEffect(() => {
    if (hoveredId && !results.some((h) => h.id === hoveredId)) setHoveredId(null);
    if (selectedId && !results.some((h) => h.id === selectedId)) setSelectedId(null);
  }, [results, hoveredId, selectedId]);

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) {
      const el = document.getElementById(`card-${id}`);
      // Only scroll the card into view when the list is on screen.
      if (el && el.offsetParent !== null) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, []);

  const count = results.length;

  return (
    <Column fillWidth horizontal="center" paddingX="16" paddingY="16">
      <Column fillWidth gap="16" style={{ maxWidth: "90rem" }}>
        <Column gap="4">
          <Heading as="h1" variant="heading-strong-xl">
            Homes for sale in {SITE.city}
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Browse listings, compare on the map and save the ones you like.
          </Text>
        </Column>

        <FilterBar filters={filters} onChange={setFilters} />

        <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
          <Text as="p" variant="label-default-m" aria-live="polite" role="status">
            {count === 0 ? "No homes match" : `${count} ${count === 1 ? "home" : "homes"}`} in {SITE.city}
          </Text>
          <div className={styles.viewToggle} role="group" aria-label="Choose view">
            <button
              type="button"
              className={`${styles.toggleBtn} ${view === "list" ? styles.toggleBtnActive : ""}`}
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              List
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${view === "map" ? styles.toggleBtnActive : ""}`}
              aria-pressed={view === "map"}
              onClick={() => setView("map")}
            >
              Map
            </button>
          </div>
        </Row>

        <div className={styles.searchShell}>
          <section
            className={`${styles.listPane} ${view === "map" ? styles.hiddenOnSmall : ""}`}
            aria-label="Search results"
          >
            {count === 0 ? (
              <div className={styles.empty}>
                <Heading as="h2" variant="heading-strong-m">
                  No homes match these filters
                </Heading>
                <Text as="p" onBackground="neutral-weak" marginTop="8">
                  Try widening the price range or lowering the minimum bedrooms.
                </Text>
                <Row horizontal="center" marginTop="16">
                  <button
                    type="button"
                    className={styles.toggleBtn}
                    style={{ borderRadius: "0.5rem", border: "1px solid var(--neutral-alpha-strong)" }}
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                  >
                    Reset filters
                  </button>
                </Row>
              </div>
            ) : (
              <ul className={styles.cardGrid}>
                {results.map((home) => (
                  <HomeCard
                    key={home.id}
                    home={home}
                    active={hoveredId === home.id || selectedId === home.id}
                    saved={saved.includes(home.id)}
                    onToggleSave={() => toggle(home.id)}
                    onHover={setHoveredId}
                  />
                ))}
              </ul>
            )}
          </section>

          <div
            className={`${styles.mapPane} ${view === "list" ? styles.hiddenOnSmall : ""}`}
            role="region"
            aria-label="Map of homes"
          >
            <SearchMap
              homes={results}
              activeId={hoveredId}
              selectedId={selectedId}
              onHover={setHoveredId}
              onSelect={handleSelect}
              visible={view === "map"}
            />
          </div>
        </div>
      </Column>
    </Column>
  );
}
```

`Text`/`Heading` use `textVariant` (not `variant`) in this version, so I'll fix those props in the final files below. The home page:

```tsx app/page.tsx
import type { Metadata } from "next";
import { SearchApp } from "@/components/SearchApp";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Haven — homes for sale in Lisbon",
  description: "Search homes in Lisbon by type, price and bedrooms, and compare them on the map.",
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <SearchApp />
      </main>
    </>
  );
}
```

Corrected `SearchApp` with `textVariant` (the final version to use):

```tsx components/SearchApp.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Column, Heading, Row, Text } from "@once-ui-system/core";
import {
  DEFAULT_FILTERS,
  HOMES,
  SITE,
  applyFilters,
  type Filters,
} from "@/lib/data";
import { useSaved } from "@/lib/useSaved";
import { FilterBar } from "./FilterBar";
import { HomeCard } from "./HomeCard";
import SearchMap from "./SearchMapLoader";
import styles from "./haven.module.css";

type View = "list" | "map";

export function SearchApp() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<View>("list");
  const { saved, toggle } = useSaved();

  const results = useMemo(() => applyFilters(HOMES, filters), [filters]);

  // Drop hover/selection for homes that were filtered out.
  useEffect(() => {
    if (hoveredId && !results.some((h) => h.id === hoveredId)) setHoveredId(null);
    if (selectedId && !results.some((h) => h.id === selectedId)) setSelectedId(null);
  }, [results, hoveredId, selectedId]);

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) {
      const el = document.getElementById(`card-${id}`);
      // Only scroll the card into view when the list is on screen.
      if (el && el.offsetParent !== null) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, []);

  const count = results.length;

  return (
    <Column fillWidth horizontal="center" paddingX="16" paddingY="16">
      <Column fillWidth gap="16" style={{ maxWidth: "90rem" }}>
        <Column gap="4">
          <Heading as="h1" textVariant="heading-strong-xl">
            Homes for sale in {SITE.city}
          </Heading>
          <Text textVariant="body-default-m" onBackground="neutral-weak">
            Browse listings, compare on the map and save the ones you like.
          </Text>
        </Column>

        <FilterBar filters={filters} onChange={setFilters} />

        <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
          <Text as="p" textVariant="label-default-m" aria-live="polite" role="status">
            {count === 0 ? "No homes match" : `${count} ${count === 1 ? "home" : "homes"}`} in {SITE.city}
          </Text>
          <div className={styles.viewToggle} role="group" aria-label="Choose view">
            <button
              type="button"
              className={`${styles.toggleBtn} ${view === "list" ? styles.toggleBtnActive : ""}`}
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              List
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${view === "map" ? styles.toggleBtnActive : ""}`}
              aria-pressed={view === "map"}
              onClick={() => setView("map")}
            >
              Map
            </button>
          </div>
        </Row>

        <div className={styles.searchShell}>
          <section
            className={`${styles.listPane} ${view === "map" ? styles.hiddenOnSmall : ""}`}
            aria-label="Search results"
          >
            {count === 0 ? (
              <div className={styles.empty}>
                <Heading as="h2" textVariant="heading-strong-m">
                  No homes match these filters
                </Heading>
                <Text as="p" onBackground="neutral-weak" marginTop="8">
                  Try widening the price range or lowering the minimum bedrooms.
                </Text>
                <Row horizontal="center" marginTop="16">
                  <button
                    type="button"
                    className={styles.toggleBtn}
                    style={{ borderRadius: "0.5rem", border: "1px solid var(--neutral-alpha-strong)" }}
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                  >
                    Reset filters
                  </button>
                </Row>
              </div>
            ) : (
              <ul className={styles.cardGrid}>
                {results.map((home) => (
                  <HomeCard
                    key={home.id}
                    home={home}
                    active={hoveredId === home.id || selectedId === home.id}
                    saved={saved.includes(home.id)}
                    onToggleSave={() => toggle(home.id)}
                    onHover={setHoveredId}
                  />
                ))}
              </ul>
            )}
          </section>

          <div
            className={`${styles.mapPane} ${view === "list" ? styles.hiddenOnSmall : ""}`}
            role="region"
            aria-label="Map of homes"
          >
            <SearchMap
              homes={results}
              activeId={hoveredId}
              selectedId={selectedId}
              onHover={setHoveredId}
              onSelect={handleSelect}
              visible={view === "map"}
            />
          </div>
        </div>
      </Column>
    </Column>
  );
}
```

The same prop fix applies to `SiteHeader`:

```tsx components/SiteHeader.tsx
import Link from "next/link";
import { Row, Text } from "@once-ui-system/core";
import { SITE } from "@/lib/data";
import styles from "./haven.module.css";

export function SiteHeader() {
  return (
    <Row as="header" fillWidth paddingY="16" paddingX="16" horizontal="center" borderBottom>
      <div className={styles.siteHeader} style={{ width: "100%", maxWidth: "90rem" }}>
        <Link href="/" className={styles.brand} aria-label={`${SITE.name} home`}>
          <span className={styles.brandMark} aria-hidden="true" />
          {SITE.name}
        </Link>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Homes in {SITE.city}
        </Text>
      </div>
    </Row>
  );
}
```

`SiteHeader` is a server component using Once UI `Row` and `Text` from the package root. This is fine for correctness, and the bundle-size note only affects performance.

Now the detail page pieces: the contact form, then the page.

```tsx components/ContactForm.tsx
"use client";

import { useId, useState } from "react";
import { Column, Heading, Text } from "@once-ui-system/core";
import { AGENT } from "@/lib/data";
import styles from "./haven.module.css";

interface Values {
  name: string;
  email: string;
  message: string;
}
type Errors = Partial<Record<keyof Values, string>>;

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Enter your name.";
  if (!v.email.trim()) e.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Enter a valid email address, like name@example.com.";
  if (!v.message.trim()) e.message = "Write a message for the agent.";
  return e;
}

export function ContactForm({ homeTitle }: { homeTitle: string }) {
  const uid = useId();
  const [values, setValues] = useState<Values>({
    name: "",
    email: "",
    message: `Hello ${AGENT.name.split(" ")[0]}, I'd like to know more about "${homeTitle}" and arrange a viewing.`,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const ids = {
    name: `${uid}-name`,
    email: `${uid}-email`,
    message: `${uid}-message`,
  };

  const update = (key: keyof Values, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    // Re-validate a field that already shows an error as the user fixes it.
    if (errors[key]) {
      const fresh = validate(next);
      setErrors((prev) => ({ ...prev, [key]: fresh[key] }));
    }
  };

  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const found = validate(values);
    setErrors(found);
    const first = (Object.keys(found) as (keyof Values)[])[0];
    if (first) {
      document.getElementById(ids[first])?.focus();
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className={styles.success} role="status">
        <Heading as="h3" textVariant="heading-strong-m">
          Message sent
        </Heading>
        <Text as="p" onBackground="neutral-medium" marginTop="8">
          Thanks, {values.name.trim()}. {AGENT.name} will reply to {values.email.trim()} within one working day.
        </Text>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label={`Contact ${AGENT.name}`}>
      <Column gap="16">
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor={ids.name}>
            Name
          </label>
          <input
            id={ids.name}
            name="name"
            type="text"
            autoComplete="name"
            required
            className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${ids.name}-err` : undefined}
          />
          {errors.name ? (
            <p id={`${ids.name}-err`} className={styles.errorText}>
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor={ids.email}>
            Email
          </label>
          <input
            id={ids.email}
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${ids.email}-err` : undefined}
          />
          {errors.email ? (
            <p id={`${ids.email}-err`} className={styles.errorText}>
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor={ids.message}>
            Message
          </label>
          <textarea
            id={ids.message}
            name="message"
            required
            className={`${styles.textarea} ${errors.message ? styles.inputError : ""}`}
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? `${ids.message}-err` : undefined}
          />
          {errors.message ? (
            <p id={`${ids.message}-err`} className={styles.errorText}>
              {errors.message}
            </p>
          ) : null}
        </div>

        <button type="submit" className={styles.submitBtn}>
          Send message
        </button>
      </Column>
    </form>
  );
}
```

```tsx components/DetailSave.tsx
"use client";

import { SaveButton } from "./SaveButton";
import { useSaved } from "@/lib/useSaved";

export function DetailSave({ id, title }: { id: string; title: string }) {
  const { saved, toggle } = useSaved();
  return <SaveButton inline title={title} saved={saved.includes(id)} onToggle={() => toggle(id)} />;
}
```

The detail route is statically generated for every home:

```tsx app/homes/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { ContactForm } from "@/components/ContactForm";
import DetailMap from "@/components/DetailMapLoader";
import { DetailSave } from "@/components/DetailSave";
import { Photo } from "@/components/Photo";
import { SiteHeader } from "@/components/SiteHeader";
import styles from "@/components/haven.module.css";
import {
  AGENT,
  HOMES,
  bathsLabel,
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
  if (!home) return { title: "Home not found — Haven" };
  return {
    title: `${home.title}, ${home.district} — Haven`,
    description: `${bedsLabel(home.beds)}, ${home.area_m2} m² ${home.type.toLowerCase()} in ${home.district}, Lisbon for ${formatPrice(home.price)}.`,
  };
}

const ENERGY_SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const ENERGY_COLORS: Record<string, string> = {
  "A+": "#2f9e44",
  A: "#51b25a",
  B: "#8fcf5a",
  C: "#d3e04f",
  D: "#f5cf47",
  E: "#f59f3d",
  F: "#e8590c",
};

export default async function HomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();

  const pricePerM2 = Math.round(home.price / home.area_m2);
  const galleryLabels = ["Living room", "Kitchen", "Bedroom", "Bathroom", "Outdoor"];

  return (
    <>
      <SiteHeader />
      <main id="main">
        <Column fillWidth horizontal="center" paddingX="16" paddingY="24">
          <Column fillWidth gap="24" style={{ maxWidth: "72rem" }}>
            <Link href="/" className={styles.backLink}>
              <span aria-hidden="true">←</span> Back to search
            </Link>

            <ul className={styles.gallery} aria-label="Photo gallery">
              {galleryLabels.map((label, i) => (
                <li key={label} className={styles.galleryItem}>
                  <div
                    className={styles.galleryFill}
                    style={{ ...galleryStyle(home.id, i) }}
                    role="img"
                    aria-label={`${label} (placeholder image)`}
                  >
                    <span className={styles.photoLabel}>{label}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.detailLayout}>
              <Column gap="32" minWidth={0}>
                <Column gap="12">
                  <Row gap="8" wrap vertical="center">
                    <Tag label={home.type} size="s" />
                    {isNew(home) ? <Tag label="New this week" tone="brand" size="s" /> : null}
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {formatListed(home.listed)}
                    </Text>
                  </Row>
                  <Heading as="h1" textVariant="display-strong-xs">
                    {home.title}
                  </Heading>
                  <Text textVariant="body-default-m" onBackground="neutral-weak">
                    {home.district}, Lisbon
                  </Text>
                  <Row gap="16" vertical="center" wrap>
                    <Text as="p" textVariant="display-strong-xs">
                      {formatPrice(home.price)}
                    </Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {formatPrice(pricePerM2)} per m²
                    </Text>
                    <DetailSave id={home.id} title={home.title} />
                  </Row>
                </Column>

                <section aria-labelledby="facts-h">
                  <Heading as="h2" id="facts-h" textVariant="heading-strong-l" marginBottom="12">
                    Key facts
                  </Heading>
                  <dl className={styles.factGrid}>
                    <Fact label="Bedrooms" value={home.beds === 0 ? "Studio" : String(home.beds)} />
                    <Fact label="Bathrooms" value={String(home.baths)} />
                    <Fact label="Area" value={`${home.area_m2} m²`} />
                    <Fact label="Built" value={String(home.year)} />
                    <Fact label="Type" value={home.type} />
                    <Fact label="Energy" value={home.energy} />
                  </dl>
                  <Text as="p" onBackground="neutral-weak" marginTop="12" textVariant="body-default-s">
                    {bedsLabel(home.beds)} · {bathsLabel(home.baths)} · {home.area_m2} m²
                  </Text>
                </section>

                <section aria-labelledby="features-h">
                  <Heading as="h2" id="features-h" textVariant="heading-strong-l" marginBottom="12">
                    Features
                  </Heading>
                  <ul className={styles.featureList}>
                    {home.features.map((f) => (
                      <li key={f} className={styles.featureItem}>
                        <span aria-hidden="true">✓</span>
                        <Text textVariant="body-default-m">{f}</Text>
                      </li>
                    ))}
                  </ul>
                </section>

                <section aria-labelledby="energy-h">
                  <Heading as="h2" id="energy-h" textVariant="heading-strong-l" marginBottom="12">
                    Energy rating
                  </Heading>
                  <ul className={styles.energyScale} aria-label={`Energy rating ${home.energy} on a scale from A+ to F`}>
                    {ENERGY_SCALE.map((grade) => {
                      const active = grade === home.energy;
                      return (
                        <li
                          key={grade}
                          className={`${styles.energyStep} ${active ? styles.energyStepActive : ""}`}
                          style={{ background: ENERGY_COLORS[grade] }}
                          aria-current={active ? "true" : undefined}
                        >
                          {grade}
                        </li>
                      );
                    })}
                  </ul>
                  <Text as="p" onBackground="neutral-weak" marginTop="8" textVariant="body-default-s">
                    This home is rated {home.energy}. A+ is the most efficient, F the least.
                  </Text>
                </section>

                <section aria-labelledby="location-h">
                  <Heading as="h2" id="location-h" textVariant="heading-strong-l" marginBottom="12">
                    Location
                  </Heading>
                  <div className={styles.smallMap}>
                    <DetailMap home={home} />
                  </div>
                </section>
              </Column>

              <aside className={styles.stickyAside} aria-labelledby="contact-h">
                <Column background="surface" border radius="l" padding="24" gap="16">
                  <Column gap="4">
                    <Heading as="h2" id="contact-h" textVariant="heading-strong-l">
                      Contact the agent
                    </Heading>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {AGENT.name}, {AGENT.agency}
                    </Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {AGENT.phone} · {AGENT.email}
                    </Text>
                  </Column>
                  <ContactForm homeTitle={home.title} />
                </Column>
              </aside>
            </div>
          </Column>
        </Column>
      </main>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.fact}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function galleryStyle(id: string, i: number): React.CSSProperties {
  return placeholderStyle(id, i + 1);
}
```

`page.tsx` references `placeholderStyle` without importing it, so this needs a fix. I'll replace the helper with a direct import in the final file:

```tsx app/homes/[id]/page.tsx
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { ContactForm } from "@/components/ContactForm";
import DetailMap from "@/components/DetailMapLoader";
import { DetailSave } from "@/components/DetailSave";
import { SiteHeader } from "@/components/SiteHeader";
import styles from "@/components/haven.module.css";
import {
  AGENT,
  HOMES,
  bathsLabel,
  bedsLabel,
  formatListed,
  formatPrice,
  getHome,
  isNew,
} from "@/lib/data";
import { placeholderStyle } from "@/lib/placeholder";

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
  if (!home) return { title: "Home not found — Haven" };
  return {
    title: `${home.title}, ${home.district} — Haven`,
    description: `${bedsLabel(home.beds)}, ${home.area_m2} m² ${home.type.toLowerCase()} in ${home.district}, Lisbon for ${formatPrice(home.price)}.`,
  };
}

const ENERGY_SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const ENERGY_COLORS: Record<string, string> = {
  "A+": "#2f9e44",
  A: "#51b25a",
  B: "#8fcf5a",
  C: "#d3e04f",
  D: "#f5cf47",
  E: "#f59f3d",
  F: "#e8590c",
};

const GALLERY_LABELS = ["Living room", "Kitchen", "Bedroom", "Bathroom", "Outdoor"];

function galleryStyle(id: string, i: number): CSSProperties {
  return placeholderStyle(id, i + 1);
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.fact}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default async function HomeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();

  const pricePerM2 = Math.round(home.price / home.area_m2);

  return (
    <>
      <SiteHeader />
      <main id="main">
        <Column fillWidth horizontal="center" paddingX="16" paddingY="24">
          <Column fillWidth gap="24" style={{ maxWidth: "72rem" }}>
            <Link href="/" className={styles.backLink}>
              <span aria-hidden="true">←</span> Back to search
            </Link>

            <ul className={styles.gallery} aria-label="Photo gallery">
              {GALLERY_LABELS.map((label, i) => (
                <li key={label} className={styles.galleryItem}>
                  <div
                    className={styles.galleryFill}
                    style={galleryStyle(home.id, i)}
                    role="img"
                    aria-label={`${label} (placeholder image)`}
                  >
                    <span className={styles.photoLabel}>{label}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.detailLayout}>
              <Column gap="32" fillWidth>
                <Column gap="12">
                  <Row gap="8" wrap vertical="center">
                    <Tag label={home.type} size="s" />
                    {isNew(home) ? <Tag label="New this week" tone="brand" size="s" /> : null}
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {formatListed(home.listed)}
                    </Text>
                  </Row>
                  <Heading as="h1" textVariant="display-strong-xs">
                    {home.title}
                  </Heading>
                  <Text textVariant="body-default-m" onBackground="neutral-weak">
                    {home.district}, Lisbon
                  </Text>
                  <Row gap="16" vertical="center" wrap>
                    <Text as="p" textVariant="display-strong-xs">
                      {formatPrice(home.price)}
                    </Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {formatPrice(pricePerM2)} per m²
                    </Text>
                    <DetailSave id={home.id} title={home.title} />
                  </Row>
                </Column>

                <section aria-labelledby="facts-h">
                  <Heading as="h2" id="facts-h" textVariant="heading-strong-l" marginBottom="12">
                    Key facts
                  </Heading>
                  <dl className={styles.factGrid}>
                    <Fact label="Bedrooms" value={home.beds === 0 ? "Studio" : String(home.beds)} />
                    <Fact label="Bathrooms" value={String(home.baths)} />
                    <Fact label="Area" value={`${home.area_m2} m²`} />
                    <Fact label="Built" value={String(home.year)} />
                    <Fact label="Type" value={home.type} />
                    <Fact label="Energy" value={home.energy} />
                  </dl>
                  <Text as="p" onBackground="neutral-weak" marginTop="12" textVariant="body-default-s">
                    {bedsLabel(home.beds)} · {bathsLabel(home.baths)} · {home.area_m2} m²
                  </Text>
                </section>

                <section aria-labelledby="features-h">
                  <Heading as="h2" id="features-h" textVariant="heading-strong-l" marginBottom="12">
                    Features
                  </Heading>
                  <ul className={styles.featureList}>
                    {home.features.map((f) => (
                      <li key={f} className={styles.featureItem}>
                        <span aria-hidden="true">✓</span>
                        <Text textVariant="body-default-m">{f}</Text>
                      </li>
                    ))}
                  </ul>
                </section>

                <section aria-labelledby="energy-h">
                  <Heading as="h2" id="energy-h" textVariant="heading-strong-l" marginBottom="12">
                    Energy rating
                  </Heading>
                  <ul
                    className={styles.energyScale}
                    aria-label={`Energy rating ${home.energy} on a scale from A+ to F`}
                  >
                    {ENERGY_SCALE.map((grade) => {
                      const active = grade === home.energy;
                      return (
                        <li
                          key={grade}
                          className={`${styles.energyStep} ${active ? styles.energyStepActive : ""}`}
                          style={{ background: ENERGY_COLORS[grade] }}
                          aria-current={active ? "true" : undefined}
                        >
                          {grade}
                        </li>
                      );
                    })}
                  </ul>
                  <Text as="p" onBackground="neutral-weak" marginTop="8" textVariant="body-default-s">
                    This home is rated {home.energy}. A+ is the most efficient, F the least.
                  </Text>
                </section>

                <section aria-labelledby="location-h">
                  <Heading as="h2" id="location-h" textVariant="heading-strong-l" marginBottom="12">
                    Location
                  </Heading>
                  <div className={styles.smallMap} role="region" aria-label={`Map showing ${home.district}`}>
                    <DetailMap home={home} />
                  </div>
                </section>
              </Column>

              <aside className={styles.stickyAside} aria-labelledby="contact-h">
                <Column background="surface" border radius="l" padding="24" gap="16">
                  <Column gap="4">
                    <Heading as="h2" id="contact-h" textVariant="heading-strong-l">
                      Contact the agent
                    </Heading>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {AGENT.name}, {AGENT.agency}
                    </Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {AGENT.phone} · {AGENT.email}
                    </Text>
                  </Column>
                  <ContactForm homeTitle={home.title} />
                </Column>
              </aside>
            </div>
          </Column>
        </Column>
      </main>
    </>
  );
}
```

`Photo` no longer needs to be imported in the detail page, and `components/Photo.tsx` is used by the cards and the map popup. Everything is now in place.

**Notes**
- Once UI `Text`/`Heading` take `textVariant`, so the first `SiteHeader` draft (which used `variant`) is replaced by the version above. Use the later `SiteHeader`, `SearchApp` and `app/homes/[id]/page.tsx` versions and ignore the earlier drafts.
- The only network resources are the style URL and its tiles via MapLibre.

Here is the final, consolidated set of files, one block per path:

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
```

```ts lib/placeholder.ts
import type { CSSProperties } from "react";

/** Deterministic CSS-drawn "photo": gradient sky, sun and a skyline silhouette. */
export function placeholderStyle(id: string, shift = 0): CSSProperties {
  const n = Number(id.replace(/\D/g, "")) + shift * 37;
  const hue = (n * 47) % 360;
  const hue2 = (hue + 40 + (n % 5) * 10) % 360;
  const sunX = 18 + ((n + shift * 3) % 5) * 15;
  return {
    backgroundImage: [
      `radial-gradient(circle at ${sunX}% 28%, hsla(${hue2}, 90%, 90%, 0.95) 0 9%, transparent 10%)`,
      `linear-gradient(180deg, transparent 0 62%, hsla(${hue}, 35%, 22%, 0.55) 62% 100%)`,
      `linear-gradient(160deg, hsl(${hue}, 48%, 66%) 0%, hsl(${hue2}, 52%, 42%) 100%)`,
    ].join(", "),
  };
}
```

```ts lib/useSaved.ts
"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "haven-saved";

export function useSaved() {
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSaved(parsed.filter((v): v is string => typeof v === "string"));
        }
      }
    } catch {
      /* ignore unavailable storage */
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { saved, toggle };
}
```

```css components/haven.module.css
/* ---------- shared ---------- */
.photo {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
}

.photoSmall {
  aspect-ratio: 16 / 9;
}

.photoLabel {
  position: absolute;
  left: 0.5rem;
  bottom: 0.5rem;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
}

/* ---------- filter bar ---------- */
.filterBar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  align-items: flex-end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.fieldLabel {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--neutral-on-background-medium);
}

.select {
  appearance: none;
  height: 2.5rem;
  padding: 0 2rem 0 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--neutral-alpha-strong);
  background-color: var(--surface-background);
  color: var(--neutral-on-background-strong);
  font: inherit;
  font-size: 0.875rem;
  background-image: linear-gradient(45deg, transparent 50%, currentColor 50%),
    linear-gradient(135deg, currentColor 50%, transparent 50%);
  background-position: calc(100% - 1rem) 50%, calc(100% - 0.7rem) 50%;
  background-size: 0.3rem 0.3rem, 0.3rem 0.3rem;
  background-repeat: no-repeat;
  cursor: pointer;
}

.select:focus-visible,
.cardLink:focus-visible,
.saveBtn:focus-visible,
.toggleBtn:focus-visible,
.marker:focus-visible,
.input:focus-visible,
.textarea:focus-visible,
.popupClose:focus-visible,
.galleryItem:focus-visible,
.popupLink:focus-visible {
  outline: 2px solid var(--brand-solid-strong);
  outline-offset: 2px;
}

.resetBtn {
  height: 2.5rem;
  padding: 0 0.75rem;
  border: 0;
  background: transparent;
  color: var(--brand-on-background-strong);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 0.5rem;
}

.resetBtn:focus-visible {
  outline: 2px solid var(--brand-solid-strong);
}

/* ---------- search layout ---------- */
.searchShell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.listPane {
  min-width: 0;
}

.mapPane {
  position: sticky;
  top: 1rem;
  height: calc(100dvh - 2rem);
  min-height: 24rem;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid var(--neutral-alpha-medium);
}

.cardGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.viewToggle {
  display: none;
}

@media (max-width: 1024px) {
  .searchShell {
    grid-template-columns: minmax(0, 1fr);
  }
  .mapPane {
    position: relative;
    top: 0;
    height: calc(100dvh - 16rem);
    min-height: 22rem;
  }
  .hiddenOnSmall {
    display: none;
  }
  .viewToggle {
    display: inline-flex;
  }
}

.toggleBtn {
  appearance: none;
  border: 1px solid var(--neutral-alpha-strong);
  background: var(--surface-background);
  color: var(--neutral-on-background-strong);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  height: 2.5rem;
  padding: 0 1rem;
  cursor: pointer;
}

.toggleBtn:first-child {
  border-radius: 0.5rem 0 0 0.5rem;
}

.toggleBtn:last-child {
  border-radius: 0 0.5rem 0.5rem 0;
  border-left: 0;
}

.toggleBtnActive {
  background: var(--brand-solid-strong);
  color: var(--brand-on-solid-strong);
  border-color: var(--brand-solid-strong);
}

/* ---------- result card ---------- */
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
  border: 1px solid var(--neutral-alpha-medium);
  background: var(--surface-background);
  overflow: hidden;
  transition: box-shadow 150ms ease, border-color 150ms ease;
}

.cardActive {
  border-color: var(--brand-solid-strong);
  box-shadow: 0 0 0 2px var(--brand-solid-strong), 0 8px 24px rgba(0, 0, 0, 0.12);
}

.cardLink {
  color: inherit;
  text-decoration: none;
}

.cardLink::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
}

.cardBody {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.875rem 1rem 1rem;
}

.price {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  font-size: 0.875rem;
  color: var(--neutral-on-background-medium);
  margin: 0;
  padding: 0;
  list-style: none;
}

.badgeNew {
  position: absolute;
  top: 0.625rem;
  left: 0.625rem;
  z-index: 2;
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--brand-solid-strong);
  color: var(--brand-on-solid-strong);
}

.saveBtn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 3;
  width: 2.25rem;
  height: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 0;
  background: rgba(255, 255, 255, 0.94);
  color: #333;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}

.saveBtnOn {
  color: #d6336c;
}

.saveBtnInline {
  position: static;
  width: auto;
  padding: 0 1rem;
  gap: 0.5rem;
  background: var(--surface-background);
  border: 1px solid var(--neutral-alpha-strong);
  color: var(--neutral-on-background-strong);
  box-shadow: none;
  font: inherit;
  font-weight: 600;
  font-size: 0.875rem;
}

.saveBtnInline.saveBtnOn {
  color: #d6336c;
}

.empty {
  padding: 2.5rem 1rem;
  text-align: center;
  border: 1px dashed var(--neutral-alpha-strong);
  border-radius: 1rem;
}

/* ---------- map markers ---------- */
.marker {
  appearance: none;
  border: 1px solid rgba(0, 0, 0, 0.35);
  background: #fff;
  color: #1a1a1a;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1;
  padding: 0.4375rem 0.625rem;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  white-space: nowrap;
  transition: transform 120ms ease, background 120ms ease, color 120ms ease;
}

.markerActive {
  background: var(--brand-solid-strong);
  color: var(--brand-on-solid-strong);
  border-color: var(--brand-solid-strong);
  transform: scale(1.18);
}

.popupCard {
  width: 15rem;
  color: #1a1a1a;
  background: #fff;
  position: relative;
}

.popupLink {
  color: inherit;
  text-decoration: none;
  display: block;
}

.popupBody {
  padding: 0.625rem 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.popupClose {
  position: absolute;
  top: 0.375rem;
  right: 0.375rem;
  z-index: 2;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 999px;
  border: 0;
  background: rgba(255, 255, 255, 0.94);
  color: #222;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.mapFallback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 1rem;
  text-align: center;
  background: var(--neutral-alpha-weak);
}

/* ---------- detail ---------- */
.detailLayout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 24rem;
  gap: 2rem;
  align-items: start;
}

.stickyAside {
  position: sticky;
  top: 1rem;
}

@media (max-width: 1024px) {
  .detailLayout {
    grid-template-columns: minmax(0, 1fr);
  }
  .stickyAside {
    position: static;
  }
}

.gallery {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: repeat(2, 9rem);
  gap: 0.5rem;
  border-radius: 1rem;
  overflow: hidden;
  list-style: none;
  margin: 0;
  padding: 0;
}

.galleryItem {
  position: relative;
  min-width: 0;
}

.galleryItem:first-child {
  grid-row: span 2;
}

.galleryFill {
  position: absolute;
  inset: 0;
}

@media (max-width: 640px) {
  .gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: 12rem 6rem;
  }
  .galleryItem:first-child {
    grid-column: span 2;
    grid-row: auto;
  }
  .galleryItem:nth-child(n + 4) {
    display: none;
  }
}

.factGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
  gap: 0.75rem;
  margin: 0;
}

.fact {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--neutral-alpha-medium);
  border-radius: 0.75rem;
  background: var(--surface-background);
}

.fact dt {
  font-size: 0.75rem;
  color: var(--neutral-on-background-medium);
}

.fact dd {
  margin: 0;
  font-weight: 700;
  font-size: 1.125rem;
}

.featureList {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.featureItem {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.energyScale {
  display: flex;
  gap: 0.375rem;
  align-items: flex-end;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0.25rem;
}

.energyStep {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  min-width: 2.5rem;
  padding: 0 0.5rem;
  border-radius: 0.375rem;
  font-weight: 700;
  font-size: 0.875rem;
  color: #111;
  opacity: 0.5;
}

.energyStepActive {
  opacity: 1;
  height: 2.75rem;
  outline: 3px solid var(--neutral-on-background-strong);
  outline-offset: 2px;
}

.smallMap {
  height: 18rem;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid var(--neutral-alpha-medium);
}

/* ---------- form ---------- */
.formField {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.formLabel {
  font-size: 0.875rem;
  font-weight: 600;
}

.input,
.textarea {
  width: 100%;
  font: inherit;
  font-size: 0.9375rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--neutral-alpha-strong);
  background: var(--page-background);
  color: var(--neutral-on-background-strong);
  box-sizing: border-box;
}

.textarea {
  min-height: 7.5rem;
  resize: vertical;
}

.inputError {
  border-color: var(--danger-solid-strong);
}

.errorText {
  font-size: 0.8125rem;
  color: var(--danger-on-background-strong);
  margin: 0;
}

.submitBtn {
  appearance: none;
  border: 0;
  height: 2.75rem;
  border-radius: 0.5rem;
  background: var(--brand-solid-strong);
  color: var(--brand-on-solid-strong);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.submitBtn:focus-visible {
  outline: 2px solid var(--brand-on-background-strong);
  outline-offset: 2px;
}

.success {
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--success-alpha-strong);
  background: var(--success-alpha-weak);
}

.backLink {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--brand-on-background-strong);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9375rem;
}

.backLink:hover {
  text-decoration: underline;
}

.backLink:focus-visible {
  outline: 2px solid var(--brand-solid-strong);
  outline-offset: 2px;
}

.siteHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: inherit;
  text-decoration: none;
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}

.brand:focus-visible {
  outline: 2px solid var(--brand-solid-strong);
  outline-offset: 2px;
}

.brandMark {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, var(--brand-solid-strong), var(--accent-solid-strong));
}
```

```css components/map.css
.haven-popup .maplibregl-popup-content {
  padding: 0;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.haven-popup .maplibregl-popup-tip {
  display: none;
}

.haven-popup.maplibregl-popup {
  max-width: none !important;
}

.maplibregl-ctrl-attrib {
  font-size: 0.6875rem;
}
```

```tsx components/Photo.tsx
import { placeholderStyle } from "@/lib/placeholder";
import styles from "./haven.module.css";

/** A decorative photo placeholder drawn entirely with CSS gradients. */
export function Photo({
  id,
  shift = 0,
  label,
  small = false,
}: {
  id: string;
  shift?: number;
  label?: string;
  small?: boolean;
}) {
  return (
    <div
      className={`${styles.photo} ${small ? styles.photoSmall : ""}`}
      style={placeholderStyle(id, shift)}
      aria-hidden="true"
    >
      {label ? <span className={styles.photoLabel}>{label}</span> : null}
    </div>
  );
}
```

```tsx components/SiteHeader.tsx
import Link from "next/link";
import { Row, Text } from "@once-ui-system/core";
import { SITE } from "@/lib/data";
import styles from "./haven.module.css";

export function SiteHeader() {
  return (
    <Row as="header" fillWidth paddingY="16" paddingX="16" horizontal="center" borderBottom>
      <div className={styles.siteHeader} style={{ width: "100%", maxWidth: "90rem" }}>
        <Link href="/" className={styles.brand} aria-label={`${SITE.name} home`}>
          <span className={styles.brandMark} aria-hidden="true" />
          {SITE.name}
        </Link>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Homes in {SITE.city}
        </Text>
      </div>
    </Row>
  );
}
```

```tsx components/SaveButton.tsx
"use client";

import styles from "./haven.module.css";

export function SaveButton({
  title,
  saved,
  onToggle,
  inline = false,
}: {
  title: string;
  saved: boolean;
  onToggle: () => void;
  inline?: boolean;
}) {
  return (
    <button
      type="button"
      className={`${styles.saveBtn} ${saved ? styles.saveBtnOn : ""} ${inline ? styles.saveBtnInline : ""}`}
      aria-pressed={saved}
      aria-label={`${saved ? "Remove from saved" : "Save"}: ${title}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21s-7.5-4.6-9.6-9.2C.8 8.3 3 4.5 6.6 4.5c2 0 3.7 1.1 5.4 3.2 1.7-2.1 3.4-3.2 5.4-3.2 3.6 0 5.8 3.8 4.2 7.3C19.5 16.4 12 21 12 21z" />
      </svg>
      {inline ? <span>{saved ? "Saved" : "Save"}</span> : null}
    </button>
  );
}
```

```tsx components/DetailSave.tsx
"use client";

import { SaveButton } from "./SaveButton";
import { useSaved } from "@/lib/useSaved";

export function DetailSave({ id, title }: { id: string; title: string }) {
  const { saved, toggle } = useSaved();
  return <SaveButton inline title={title} saved={saved.includes(id)} onToggle={() => toggle(id)} />;
}
```

```tsx components/SearchMap.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "./map.css";

import { useEffect, useRef } from "react";
import Link from "next/link";
import MapGL, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import {
  SITE,
  bathsLabel,
  bedsLabel,
  formatPrice,
  formatPriceShort,
  type Home,
} from "@/lib/data";
import { Photo } from "./Photo";
import styles from "./haven.module.css";

interface SearchMapProps {
  homes: Home[];
  activeId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  /** True when the map pane is on screen (mobile toggle) so it can resize. */
  visible: boolean;
}

export default function SearchMap({
  homes,
  activeId,
  selectedId,
  onHover,
  onSelect,
  visible,
}: SearchMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const selected = homes.find((h) => h.id === selectedId) ?? null;

  useEffect(() => {
    if (!visible) return;
    // Container may have been display:none; let MapLibre re-measure it.
    const t = window.setTimeout(() => mapRef.current?.resize(), 50);
    return () => window.clearTimeout(t);
  }, [visible]);

  return (
    <MapGL
      ref={mapRef}
      initialViewState={{
        longitude: SITE.mapCenter[0],
        latitude: SITE.mapCenter[1],
        zoom: 11.6,
      }}
      mapStyle={SITE.mapStyleUrl}
      style={{ width: "100%", height: "100%" }}
      minZoom={9}
      attributionControl={{ compact: true }}
      onClick={() => onSelect(null)}
    >
      <NavigationControl position="top-right" showCompass={false} />

      {homes.map((home) => {
        const active = home.id === activeId || home.id === selectedId;
        return (
          <Marker
            key={home.id}
            longitude={home.lng}
            latitude={home.lat}
            anchor="center"
            style={{ zIndex: active ? 10 : 1 }}
          >
            <button
              type="button"
              className={`${styles.marker} ${active ? styles.markerActive : ""}`}
              aria-label={`${home.title}, ${formatPrice(home.price)}, ${home.district}`}
              aria-pressed={home.id === selectedId}
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

      {selected ? (
        <Popup
          longitude={selected.lng}
          latitude={selected.lat}
          anchor="bottom"
          offset={22}
          closeButton={false}
          closeOnClick={false}
          className="haven-popup"
          maxWidth="none"
          onClose={() => onSelect(null)}
        >
          <div className={styles.popupCard}>
            <button
              type="button"
              className={styles.popupClose}
              aria-label="Close preview"
              onClick={() => onSelect(null)}
            >
              ×
            </button>
            <Link href={`/homes/${selected.id}`} className={styles.popupLink}>
              <Photo id={selected.id} small />
              <div className={styles.popupBody}>
                <strong style={{ fontSize: "1.0625rem" }}>{formatPrice(selected.price)}</strong>
                <span style={{ fontSize: "0.875rem" }}>{selected.title}</span>
                <span style={{ fontSize: "0.8125rem", color: "#555" }}>
                  {bedsLabel(selected.beds)} · {bathsLabel(selected.baths)} · {selected.area_m2} m² ·{" "}
                  {selected.district}
                </span>
              </div>
            </Link>
          </div>
        </Popup>
      ) : null}
    </MapGL>
  );
}
```

```tsx components/SearchMapLoader.tsx
"use client";

import dynamic from "next/dynamic";
import styles from "./haven.module.css";

const SearchMap = dynamic(() => import("./SearchMap"), {
  ssr: false,
  loading: () => (
    <div className={styles.mapFallback} role="status">
      Loading map…
    </div>
  ),
});

export default SearchMap;
```

```tsx components/DetailMap.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "./map.css";

import MapGL, { Marker, NavigationControl } from "react-map-gl/maplibre";
import { SITE, formatPriceShort, type Home } from "@/lib/data";
import styles from "./haven.module.css";

export default function DetailMap({ home }: { home: Home }) {
  return (
    <MapGL
      initialViewState={{ longitude: home.lng, latitude: home.lat, zoom: 13.5 }}
      mapStyle={SITE.mapStyleUrl}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Marker longitude={home.lng} latitude={home.lat} anchor="center">
        <span
          className={`${styles.marker} ${styles.markerActive}`}
          role="img"
          aria-label={`${home.title} location, ${home.district}`}
          style={{ display: "inline-block" }}
        >
          {formatPriceShort(home.price)}
        </span>
      </Marker>
    </MapGL>
  );
}
```

```tsx components/DetailMapLoader.tsx
"use client";

import dynamic from "next/dynamic";
import styles from "./haven.module.css";

const DetailMap = dynamic(() => import("./DetailMap"), {
  ssr: false,
  loading: () => (
    <div className={styles.mapFallback} role="status">
      Loading map…
    </div>
  ),
});

export default DetailMap;
```

```tsx components/FilterBar.tsx
"use client";

import {
  DEFAULT_FILTERS,
  type Filters,
  type HomeType,
  type SortKey,
} from "@/lib/data";
import styles from "./haven.module.css";

const TYPE_OPTIONS: { value: Filters["type"]; label: string }[] = [
  { value: "any", label: "Any type" },
  { value: "Apartment", label: "Apartment" },
  { value: "House", label: "House" },
  { value: "Studio", label: "Studio" },
];

const MIN_PRICES = [0, 200000, 300000, 400000, 500000, 750000, 1000000];
const MAX_PRICES = [0, 300000, 400000, 500000, 750000, 1000000, 1500000];

const BED_OPTIONS = [0, 1, 2, 3, 4];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "size", label: "Size: largest first" },
];

const eur = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function isDefault(f: Filters) {
  return (
    f.type === DEFAULT_FILTERS.type &&
    f.minPrice === DEFAULT_FILTERS.minPrice &&
    f.maxPrice === DEFAULT_FILTERS.maxPrice &&
    f.minBeds === DEFAULT_FILTERS.minBeds &&
    f.sort === DEFAULT_FILTERS.sort
  );
}

export function FilterBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  return (
    <form
      className={styles.filterBar}
      role="search"
      aria-label="Filter homes"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="f-type">
          Type
        </label>
        <select
          id="f-type"
          className={styles.select}
          value={filters.type}
          onChange={(e) => onChange({ ...filters, type: e.target.value as "any" | HomeType })}
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="f-min">
          Min price
        </label>
        <select
          id="f-min"
          className={styles.select}
          value={filters.minPrice}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange({
              ...filters,
              minPrice: v,
              maxPrice: v !== 0 && filters.maxPrice !== 0 && filters.maxPrice < v ? 0 : filters.maxPrice,
            });
          }}
        >
          {MIN_PRICES.map((p) => (
            <option key={p} value={p}>
              {p === 0 ? "No min" : eur.format(p)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="f-max">
          Max price
        </label>
        <select
          id="f-max"
          className={styles.select}
          value={filters.maxPrice}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange({
              ...filters,
              maxPrice: v,
              minPrice: v !== 0 && filters.minPrice > v ? 0 : filters.minPrice,
            });
          }}
        >
          {MAX_PRICES.map((p) => (
            <option key={p} value={p}>
              {p === 0 ? "No max" : eur.format(p)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="f-beds">
          Bedrooms
        </label>
        <select
          id="f-beds"
          className={styles.select}
          value={filters.minBeds}
          onChange={(e) => onChange({ ...filters, minBeds: Number(e.target.value) })}
        >
          {BED_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b === 0 ? "Any" : `${b}+ beds`}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="f-sort">
          Sort by
        </label>
        <select
          id="f-sort"
          className={styles.select}
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as SortKey })}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {!isDefault(filters) ? (
        <button type="button" className={styles.resetBtn} onClick={() => onChange(DEFAULT_FILTERS)}>
          Reset filters
        </button>
      ) : null}
    </form>
  );
}
```

```tsx components/HomeCard.tsx
"use client";

import Link from "next/link";
import {
  bathsLabel,
  bedsLabel,
  formatPrice,
  isNew,
  type Home,
} from "@/lib/data";
import { Photo } from "./Photo";
import { SaveButton } from "./SaveButton";
import styles from "./haven.module.css";

export function HomeCard({
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
  const fresh = isNew(home);

  return (
    <li
      id={`card-${home.id}`}
      className={`${styles.card} ${active ? styles.cardActive : ""}`}
      onMouseEnter={() => onHover(home.id)}
      onMouseLeave={() => onHover(null)}
    >
      <Photo id={home.id} label={home.type} />
      {fresh ? <span className={styles.badgeNew}>New this week</span> : null}
      <SaveButton title={home.title} saved={saved} onToggle={onToggleSave} />
      <div className={styles.cardBody}>
        <span className={styles.price}>{formatPrice(home.price)}</span>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
          <Link
            href={`/homes/${home.id}`}
            className={styles.cardLink}
            onFocus={() => onHover(home.id)}
            onBlur={() => onHover(null)}
          >
            {home.title}
          </Link>
        </h3>
        <ul className={styles.facts} aria-label="Key facts">
          <li>{bedsLabel(home.beds)}</li>
          <li>{bathsLabel(home.baths)}</li>
          <li>{home.area_m2} m²</li>
        </ul>
        <span style={{ fontSize: "0.875rem", opacity: 0.75 }}>{home.district}, Lisbon</span>
      </div>
    </li>
  );
}
```

```tsx components/SearchApp.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Column, Heading, Row, Text } from "@once-ui-system/core";
import {
  DEFAULT_FILTERS,
  HOMES,
  SITE,
  applyFilters,
  type Filters,
} from "@/lib/data";
import { useSaved } from "@/lib/useSaved";
import { FilterBar } from "./FilterBar";
import { HomeCard } from "./HomeCard";
import SearchMap from "./SearchMapLoader";
import styles from "./haven.module.css";

type View = "list" | "map";

export function SearchApp() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<View>("list");
  const { saved, toggle } = useSaved();

  const results = useMemo(() => applyFilters(HOMES, filters), [filters]);

  // Drop hover/selection for homes that were filtered out.
  useEffect(() => {
    if (hoveredId && !results.some((h) => h.id === hoveredId)) setHoveredId(null);
    if (selectedId && !results.some((h) => h.id === selectedId)) setSelectedId(null);
  }, [results, hoveredId, selectedId]);

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) {
      const el = document.getElementById(`card-${id}`);
      // Only scroll the card into view when the list is on screen.
      if (el && el.offsetParent !== null) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, []);

  const count = results.length;

  return (
    <Column fillWidth horizontal="center" paddingX="16" paddingY="16">
      <Column fillWidth gap="16" style={{ maxWidth: "90rem" }}>
        <Column gap="4">
          <Heading as="h1" textVariant="heading-strong-xl">
            Homes for sale in {SITE.city}
          </Heading>
          <Text textVariant="body-default-m" onBackground="neutral-weak">
            Browse listings, compare on the map and save the ones you like.
          </Text>
        </Column>

        <FilterBar filters={filters} onChange={setFilters} />

        <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
          <Text as="p" textVariant="label-default-m" aria-live="polite" role="status">
            {count === 0 ? "No homes match" : `${count} ${count === 1 ? "home" : "homes"}`} in {SITE.city}
          </Text>
          <div className={styles.viewToggle} role="group" aria-label="Choose view">
            <button
              type="button"
              className={`${styles.toggleBtn} ${view === "list" ? styles.toggleBtnActive : ""}`}
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              List
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${view === "map" ? styles.toggleBtnActive : ""}`}
              aria-pressed={view === "map"}
              onClick={() => setView("map")}
            >
              Map
            </button>
          </div>
        </Row>

        <div className={styles.searchShell}>
          <section
            className={`${styles.listPane} ${view === "map" ? styles.hiddenOnSmall : ""}`}
            aria-label="Search results"
          >
            {count === 0 ? (
              <div className={styles.empty}>
                <Heading as="h2" textVariant="heading-strong-m">
                  No homes match these filters
                </Heading>
                <Text as="p" onBackground="neutral-weak" marginTop="8">
                  Try widening the price range or lowering the minimum bedrooms.
                </Text>
                <Row horizontal="center" marginTop="16">
                  <button
                    type="button"
                    className={styles.toggleBtn}
                    style={{ borderRadius: "0.5rem", border: "1px solid var(--neutral-alpha-strong)" }}
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                  >
                    Reset filters
                  </button>
                </Row>
              </div>
            ) : (
              <ul className={styles.cardGrid}>
                {results.map((home) => (
                  <HomeCard
                    key={home.id}
                    home={home}
                    active={hoveredId === home.id || selectedId === home.id}
                    saved={saved.includes(home.id)}
                    onToggleSave={() => toggle(home.id)}
                    onHover={setHoveredId}
                  />
                ))}
              </ul>
            )}
          </section>

          <div
            className={`${styles.mapPane} ${view === "list" ? styles.hiddenOnSmall : ""}`}
            role="region"
            aria-label="Map of homes"
          >
            <SearchMap
              homes={results}
              activeId={hoveredId}
              selectedId={selectedId}
              onHover={setHoveredId}
              onSelect={handleSelect}
              visible={view === "map"}
            />
          </div>
        </div>
      </Column>
    </Column>
  );
}
```

```tsx components/ContactForm.tsx
"use client";

import { useId, useState } from "react";
import { Column, Heading, Text } from "@once-ui-system/core";
import { AGENT } from "@/lib/data";
import styles from "./haven.module.css";

interface Values {
  name: string;
  email: string;
  message: string;
}
type Errors = Partial<Record<keyof Values, string>>;

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Enter your name.";
  if (!v.email.trim()) e.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
    e.email = "Enter a valid email address, like name@example.com.";
  if (!v.message.trim()) e.message = "Write a message for the agent.";
  return e;
}

export function ContactForm({ homeTitle }: { homeTitle: string }) {
  const uid = useId();
  const [values, setValues] = useState<Values>({
    name: "",
    email: "",
    message: `Hello ${AGENT.name.split(" ")[0]}, I'd like to know more about "${homeTitle}" and arrange a viewing.`,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const ids = {
    name: `${uid}-name`,
    email: `${uid}-email`,
    message: `${uid}-message`,
  };

  const update = (key: keyof Values, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    // Re-validate a field that already shows an error as the user fixes it.
    if (errors[key]) {
      const fresh = validate(next);
      setErrors((prev) => ({ ...prev, [key]: fresh[key] }));
    }
  };

  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const found = validate(values);
    setErrors(found);
    const first = (Object.keys(found) as (keyof Values)[])[0];
    if (first) {
      document.getElementById(ids[first])?.focus();
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className={styles.success} role="status">
        <Heading as="h3" textVariant="heading-strong-m">
          Message sent
        </Heading>
        <Text as="p" onBackground="neutral-medium" marginTop="8">
          Thanks, {values.name.trim()}. {AGENT.name} will reply to {values.email.trim()} within one
          working day.
        </Text>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label={`Contact ${AGENT.name}`}>
      <Column gap="16">
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor={ids.name}>
            Name
          </label>
          <input
            id={ids.name}
            name="name"
            type="text"
            autoComplete="name"
            required
            className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${ids.name}-err` : undefined}
          />
          {errors.name ? (
            <p id={`${ids.name}-err`} className={styles.errorText}>
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor={ids.email}>
            Email
          </label>
          <input
            id={ids.email}
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${ids.email}-err` : undefined}
          />
          {errors.email ? (
            <p id={`${ids.email}-err`} className={styles.errorText}>
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor={ids.message}>
            Message
          </label>
          <textarea
            id={ids.message}
            name="message"
            required
            className={`${styles.textarea} ${errors.message ? styles.inputError : ""}`}
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? `${ids.message}-err` : undefined}
          />
          {errors.message ? (
            <p id={`${ids.message}-err`} className={styles.errorText}>
              {errors.message}
            </p>
          ) : null}
        </div>

        <button type="submit" className={styles.submitBtn}>
          Send message
        </button>
      </Column>
    </form>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { SearchApp } from "@/components/SearchApp";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Haven — homes for sale in Lisbon",
  description: "Search homes in Lisbon by type, price and bedrooms, and compare them on the map.",
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <SearchApp />
      </main>
    </>
  );
}
```

```tsx app/homes/[id]/page.tsx
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { ContactForm } from "@/components/ContactForm";
import DetailMap from "@/components/DetailMapLoader";
import { DetailSave } from "@/components/DetailSave";
import { SiteHeader } from "@/components/SiteHeader";
import styles from "@/components/haven.module.css";
import {
  AGENT,
  HOMES,
  bathsLabel,
  bedsLabel,
  formatListed,
  formatPrice,
  getHome,
  isNew,
} from "@/lib/data";
import { placeholderStyle } from "@/lib/placeholder";

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
  if (!home) return { title: "Home not found — Haven" };
  return {
    title: `${home.title}, ${home.district} — Haven`,
    description: `${bedsLabel(home.beds)}, ${home.area_m2} m² ${home.type.toLowerCase()} in ${home.district}, Lisbon for ${formatPrice(home.price)}.`,
  };
}

const ENERGY_SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const ENERGY_COLORS: Record<string, string> = {
  "A+": "#2f9e44",
  A: "#51b25a",
  B: "#8fcf5a",
  C: "#d3e04f",
  D: "#f5cf47",
  E: "#f59f3d",
  F: "#e8590c",
};

const GALLERY_LABELS = ["Living room", "Kitchen", "Bedroom", "Bathroom", "Outdoor"];

function galleryStyle(id: string, i: number): CSSProperties {
  return placeholderStyle(id, i + 1);
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.fact}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default async function HomeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();

  const pricePerM2 = Math.round(home.price / home.area_m2);

  return (
    <>
      <SiteHeader />
      <main id="main">
        <Column fillWidth horizontal="center" paddingX="16" paddingY="24">
          <Column fillWidth gap="24" style={{ maxWidth: "72rem" }}>
            <Link href="/" className={styles.backLink}>
              <span aria-hidden="true">←</span> Back to search
            </Link>

            <ul className={styles.gallery} aria-label="Photo gallery">
              {GALLERY_LABELS.map((label, i) => (
                <li key={label} className={styles.galleryItem}>
                  <div
                    className={styles.galleryFill}
                    style={galleryStyle(home.id, i)}
                    role="img"
                    aria-label={`${label} (placeholder image)`}
                  >
                    <span className={styles.photoLabel}>{label}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.detailLayout}>
              <Column gap="32" fillWidth>
                <Column gap="12">
                  <Row gap="8" wrap vertical="center">
                    <Tag label={home.type} size="s" />
                    {isNew(home) ? <Tag label="New this week" tone="brand" size="s" /> : null}
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {formatListed(home.listed)}
                    </Text>
                  </Row>
                  <Heading as="h1" textVariant="display-strong-xs">
                    {home.title}
                  </Heading>
                  <Text textVariant="body-default-m" onBackground="neutral-weak">
                    {home.district}, Lisbon
                  </Text>
                  <Row gap="16" vertical="center" wrap>
                    <Text as="p" textVariant="display-strong-xs">
                      {formatPrice(home.price)}
                    </Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {formatPrice(pricePerM2)} per m²
                    </Text>
                    <DetailSave id={home.id} title={home.title} />
                  </Row>
                </Column>

                <section aria-labelledby="facts-h">
                  <Heading as="h2" id="facts-h" textVariant="heading-strong-l" marginBottom="12">
                    Key facts
                  </Heading>
                  <dl className={styles.factGrid}>
                    <Fact label="Bedrooms" value={home.beds === 0 ? "Studio" : String(home.beds)} />
                    <Fact label="Bathrooms" value={String(home.baths)} />
                    <Fact label="Area" value={`${home.area_m2} m²`} />
                    <Fact label="Built" value={String(home.year)} />
                    <Fact label="Type" value={home.type} />
                    <Fact label="Energy" value={home.energy} />
                  </dl>
                  <Text as="p" onBackground="neutral-weak" marginTop="12" textVariant="body-default-s">
                    {bedsLabel(home.beds)} · {bathsLabel(home.baths)} · {home.area_m2} m²
                  </Text>
                </section>

                <section aria-labelledby="features-h">
                  <Heading as="h2" id="features-h" textVariant="heading-strong-l" marginBottom="12">
                    Features
                  </Heading>
                  <ul className={styles.featureList}>
                    {home.features.map((f) => (
                      <li key={f} className={styles.featureItem}>
                        <span aria-hidden="true">✓</span>
                        <Text textVariant="body-default-m">{f}</Text>
                      </li>
                    ))}
                  </ul>
                </section>

                <section aria-labelledby="energy-h">
                  <Heading as="h2" id="energy-h" textVariant="heading-strong-l" marginBottom="12">
                    Energy rating
                  </Heading>
                  <ul
                    className={styles.energyScale}
                    aria-label={`Energy rating ${home.energy} on a scale from A+ to F`}
                  >
                    {ENERGY_SCALE.map((grade) => {
                      const active = grade === home.energy;
                      return (
                        <li
                          key={grade}
                          className={`${styles.energyStep} ${active ? styles.energyStepActive : ""}`}
                          style={{ background: ENERGY_COLORS[grade] }}
                          aria-current={active ? "true" : undefined}
                        >
                          {grade}
                        </li>
                      );
                    })}
                  </ul>
                  <Text as="p" onBackground="neutral-weak" marginTop="8" textVariant="body-default-s">
                    This home is rated {home.energy}. A+ is the most efficient, F the least.
                  </Text>
                </section>

                <section aria-labelledby="location-h">
                  <Heading as="h2" id="location-h" textVariant="heading-strong-l" marginBottom="12">
                    Location
                  </Heading>
                  <div
                    className={styles.smallMap}
                    role="region"
                    aria-label={`Map showing ${home.district}`}
                  >
                    <DetailMap home={home} />
                  </div>
                </section>
              </Column>

              <aside className={styles.stickyAside} aria-labelledby="contact-h">
                <Column background="surface" border radius="l" padding="24" gap="16">
                  <Column gap="4">
                    <Heading as="h2" id="contact-h" textVariant="heading-strong-l">
                      Contact the agent
                    </Heading>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {AGENT.name}, {AGENT.agency}
                    </Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {AGENT.phone} · {AGENT.email}
                    </Text>
                  </Column>
                  <ContactForm homeTitle={home.title} />
                </Column>
              </aside>
            </div>
          </Column>
        </Column>
      </main>
    </>
  );
}
```