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
