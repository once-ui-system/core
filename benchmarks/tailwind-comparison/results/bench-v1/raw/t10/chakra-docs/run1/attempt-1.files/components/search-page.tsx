"use client";

import { useMemo, useState } from "react";
import { Box, Button, Flex, Grid, Heading, HStack, Text } from "@chakra-ui/react";
import { LuList, LuMap } from "react-icons/lu";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select";
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

  const visibleSelected = results.some((h) => h.id === selectedId)
    ? selectedId
    : null;

  return (
    <Flex direction="column" minH="100dvh" height={{ lg: "100dvh" }}>
      <Box
        as="header"
        borderBottomWidth="1px"
        bg="bg"
        px={{ base: "4", md: "6" }}
        py="3"
      >
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
            <FilterSelect
              label="Type"
              value={type}
              onChange={setType}
              items={TYPE_ITEMS}
            />
            <FilterSelect
              label="Min price"
              value={minPrice}
              onChange={setMinPrice}
              items={MIN_PRICE_ITEMS}
            />
            <FilterSelect
              label="Max price"
              value={maxPrice}
              onChange={setMaxPrice}
              items={MAX_PRICE_ITEMS}
            />
            <FilterSelect
              label="Min bedrooms"
              value={minBeds}
              onChange={setMinBeds}
              items={BEDS_ITEMS}
            />
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
        <HStack
          display={{ base: "flex", lg: "none" }}
          gap="1"
          role="group"
          aria-label="Results view"
        >
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
        templateColumns={{
          base: "minmax(0, 1fr)",
          lg: "minmax(0, 1fr) minmax(0, 1fr)",
          xl: "minmax(0, 5fr) minmax(0, 6fr)",
        }}
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
              templateColumns={{
                base: "minmax(0, 1fr)",
                md: "repeat(2, minmax(0, 1fr))",
                lg: "minmax(0, 1fr)",
                xl: "repeat(2, minmax(0, 1fr))",
              }}
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
          position="relative"
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
