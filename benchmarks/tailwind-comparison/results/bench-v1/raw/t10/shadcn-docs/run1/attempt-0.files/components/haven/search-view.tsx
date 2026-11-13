"use client";

import { useMemo, useState } from "react";
import { List, Map as MapIcon, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { HOMES, SITE } from "@/lib/data";
import { HomeCard } from "@/components/haven/home-card";
import { HomesMapLoader } from "@/components/haven/homes-map-loader";

type TypeFilter = "any" | "Apartment" | "House" | "Studio";
type SortKey = "newest" | "price-asc" | "price-desc" | "size-desc";

const MIN_PRICE_OPTIONS = [
  { value: "any", label: "No min" },
  { value: "200000", label: "€200k" },
  { value: "400000", label: "€400k" },
  { value: "600000", label: "€600k" },
  { value: "800000", label: "€800k" },
  { value: "1000000", label: "€1M" },
];

const MAX_PRICE_OPTIONS = [
  { value: "any", label: "No max" },
  { value: "300000", label: "€300k" },
  { value: "500000", label: "€500k" },
  { value: "700000", label: "€700k" },
  { value: "900000", label: "€900k" },
  { value: "1200000", label: "€1.2M" },
];

const BED_OPTIONS = [
  { value: "0", label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
];

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function SearchView() {
  const [type, setType] = useState<TypeFilter>("any");
  const [minPrice, setMinPrice] = useState("any");
  const [maxPrice, setMaxPrice] = useState("any");
  const [minBeds, setMinBeds] = useState("0");
  const [sort, setSort] = useState<SortKey>("newest");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const results = useMemo(() => {
    const min = minPrice === "any" ? 0 : Number(minPrice);
    const max = maxPrice === "any" ? Infinity : Number(maxPrice);
    const beds = Number(minBeds);
    const filtered = HOMES.filter(
      (h) =>
        (type === "any" || h.type === type) &&
        h.price >= min &&
        h.price <= max &&
        h.beds >= beds,
    );
    const sorted = [...filtered];
    switch (sort) {
      case "newest":
        sorted.sort((a, b) => Date.parse(b.listed) - Date.parse(a.listed));
        break;
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "size-desc":
        sorted.sort((a, b) => b.area_m2 - a.area_m2);
        break;
    }
    return sorted;
  }, [type, minPrice, maxPrice, minBeds, sort]);

  const filtersActive = type !== "any" || minPrice !== "any" || maxPrice !== "any" || minBeds !== "0";

  function reset() {
    setType("any");
    setMinPrice("any");
    setMaxPrice("any");
    setMinBeds("0");
  }

  function handleSelect(id: string | null) {
    setSelectedId(id);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section aria-label="Search filters" className="border-b bg-background">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto grid max-w-screen-2xl grid-cols-2 gap-3 px-4 py-3 sm:grid-cols-3 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto] lg:items-end"
        >
          <FilterSelect
            id="filter-type"
            label="Type"
            value={type}
            onChange={(v) => setType(v as TypeFilter)}
            options={[
              { value: "any", label: "All types" },
              { value: "Apartment", label: "Apartment" },
              { value: "House", label: "House" },
              { value: "Studio", label: "Studio" },
            ]}
          />
          <FilterSelect id="filter-min-price" label="Min price" value={minPrice} onChange={setMinPrice} options={MIN_PRICE_OPTIONS} />
          <FilterSelect id="filter-max-price" label="Max price" value={maxPrice} onChange={setMaxPrice} options={MAX_PRICE_OPTIONS} />
          <FilterSelect id="filter-beds" label="Bedrooms" value={minBeds} onChange={setMinBeds} options={BED_OPTIONS} />
          <FilterSelect
            id="filter-sort"
            label="Sort by"
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            options={[
              { value: "newest", label: "Newest" },
              { value: "price-asc", label: "Price: low to high" },
              { value: "price-desc", label: "Price: high to low" },
              { value: "size-desc", label: "Size: largest first" },
            ]}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={reset}
            disabled={!filtersActive}
            className="col-span-2 sm:col-span-1"
          >
            Clear filters
          </Button>
        </form>
      </section>

      {/* Mobile view toggle */}
      <div className="border-b bg-background px-4 py-2 lg:hidden">
        <div role="group" aria-label="Results view" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          <Button
            type="button"
            size="sm"
            variant={mobileView === "list" ? "default" : "ghost"}
            aria-pressed={mobileView === "list"}
            onClick={() => setMobileView("list")}
          >
            <List aria-hidden="true" /> List
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mobileView === "map" ? "default" : "ghost"}
            aria-pressed={mobileView === "map"}
            onClick={() => setMobileView("map")}
          >
            <MapIcon aria-hidden="true" /> Map
          </Button>
        </div>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(0,640px)_minmax(0,1fr)]">
        <section
          aria-label="Search results"
          className={cn(
            "min-h-0 flex-col px-4 py-4 lg:flex lg:overflow-y-auto",
            mobileView === "list" ? "flex" : "hidden",
          )}
        >
          <h1 className="text-2xl font-semibold tracking-tight">Homes for sale in {SITE.city}</h1>
          <p className="mt-1 mb-4 text-sm text-muted-foreground" role="status" aria-live="polite">
            <span className="font-medium text-foreground">{results.length}</span>{" "}
            {results.length === 1 ? "home" : "homes"} found
          </p>
          {results.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {results.map((home) => (
                <li key={home.id}>
                  <HomeCard home={home} active={hoveredId === home.id} onHover={setHoveredId} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
              <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="font-medium">No homes match these filters</p>
              <p className="text-sm text-muted-foreground">Try widening the price range or lowering the bedroom count.</p>
              <Button type="button" variant="outline" size="sm" onClick={reset}>
                Clear filters
              </Button>
            </div>
          )}
        </section>

        <section
          aria-label="Map of results"
          className={cn(
            "relative min-h-[420px] flex-1 lg:sticky lg:top-0 lg:block lg:h-[calc(100svh-9.5rem)] lg:min-h-0 lg:flex-none",
            mobileView === "map" ? "block" : "hidden",
          )}
        >
          <div className="absolute inset-0">
            <HomesMapLoader
              homes={results}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
