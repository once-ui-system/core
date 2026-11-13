"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import { LuList, LuMap } from "react-icons/lu";
import { DEFAULT_FILTERS, FilterBar, type Filters } from "@/components/filter-bar";
import { HomeCard } from "@/components/home-card";
import { SearchMapLazy } from "@/components/search-map-lazy";
import { HOMES, type Home } from "@/lib/data";

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
