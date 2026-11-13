"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [mapMounted, setMapMounted] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => applyFilters(HOMES, filters), [filters]);

  // Drop hover/selection for homes that were filtered out.
  const visibleHoveredId = results.some((h) => h.id === hoveredId)
    ? hoveredId
    : null;
  const visibleSelectedId = results.some((h) => h.id === selectedId)
    ? selectedId
    : null;

  // Mount the map lazily once its view is first needed (keeps it alive after).
  useEffect(() => {
    if (view === "map") setMapMounted(true);
  }, [view]);

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

  const activeId = visibleHoveredId;

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
            className={`inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-teal-700 ${
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
            className={`inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-teal-700 ${
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
        <div
          ref={listRef}
          className={`${view === "list" ? "block" : "hidden"} lg:block`}
        >
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
            className="h-[calc(100dvh-16rem)] min-h-[360px] overflow-hidden rounded-xl border border-stone-200 lg:h-[calc(100dvh-9rem)]"
            role="region"
            aria-label="Map of homes"
          >
            {(mapMounted || view === "list") && (
              <MapGate view={view}>
                <HomeMap
                  homes={results}
                  activeId={activeId}
                  selectedId={visibleSelectedId}
                  onHover={setHoveredId}
                  onSelect={selectFromMap}
                />
              </MapGate>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Renders children; on small screens the map is only created once visible. */
function MapGate({
  view,
  children,
}: {
  view: "list" | "map";
  children: React.ReactNode;
}) {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  if (!isDesktop && view !== "map") return null;
  return <>{children}</>;
}
