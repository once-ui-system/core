"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
            onSubmit={(e: React.FormEvent) => e.preventDefault()}
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
