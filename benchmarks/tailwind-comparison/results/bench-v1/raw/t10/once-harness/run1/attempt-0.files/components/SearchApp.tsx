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
