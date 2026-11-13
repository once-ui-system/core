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
