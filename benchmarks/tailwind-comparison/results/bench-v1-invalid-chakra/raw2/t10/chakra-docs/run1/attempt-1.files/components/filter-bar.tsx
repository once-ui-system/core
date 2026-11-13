"use client";

import { Box, Button, Flex, Input, NativeSelect } from "@chakra-ui/react";
import { Field } from "./ui/field";

export interface Filters {
  type: string;
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  sort: string;
}

export const DEFAULT_FILTERS: Filters = {
  type: "any",
  minPrice: "",
  maxPrice: "",
  minBeds: "0",
  sort: "newest",
};

interface FilterBarProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
  canReset: boolean;
}

export function FilterBar({ filters, onChange, onReset, canReset }: FilterBarProps) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  return (
    <Box
      as="form"
      role="search"
      aria-label="Filter homes"
      onSubmit={(e: React.FormEvent) => e.preventDefault()}
      borderBottomWidth="1px"
      bg="bg.muted"
      px={{ base: 4, md: 6 }}
      py={3}
      flexShrink={0}
    >
      <Flex gap={3} wrap="wrap" align="flex-end">
        <Field label="Type" width={{ base: "calc(50% - 6px)", md: "150px" }}>
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              value={filters.type}
              onChange={(e) => set({ type: e.target.value })}
            >
              <option value="any">Any type</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Studio">Studio</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field>
        <Field label="Min price (€)" width={{ base: "calc(50% - 6px)", md: "130px" }}>
          <Input
            size="sm"
            type="number"
            inputMode="numeric"
            min={0}
            step={50000}
            placeholder="No min"
            value={filters.minPrice}
            onChange={(e) => set({ minPrice: e.target.value })}
          />
        </Field>
        <Field label="Max price (€)" width={{ base: "calc(50% - 6px)", md: "130px" }}>
          <Input
            size="sm"
            type="number"
            inputMode="numeric"
            min={0}
            step={50000}
            placeholder="No max"
            value={filters.maxPrice}
            onChange={(e) => set({ maxPrice: e.target.value })}
          />
        </Field>
        <Field label="Min bedrooms" width={{ base: "calc(50% - 6px)", md: "130px" }}>
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              value={filters.minBeds}
              onChange={(e) => set({ minBeds: e.target.value })}
            >
              <option value="0">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field>
        <Field label="Sort by" width={{ base: "calc(50% - 6px)", md: "180px" }}>
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              value={filters.sort}
              onChange={(e) => set({ sort: e.target.value })}
            >
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="size-desc">Size: largest first</option>
              <option value="size-asc">Size: smallest first</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field>
        <Button type="button" size="sm" variant="ghost" onClick={onReset} disabled={!canReset}>
          Reset filters
        </Button>
      </Flex>
    </Box>
  );
}
