"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import MapGL, { Marker, NavigationControl, Popup, type MapRef } from "react-map-gl/maplibre";
import { cn } from "@/lib/utils";
import { type Home, SITE, formatBeds, formatPrice, formatPriceShort } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { HomePlaceholder } from "@/components/haven/home-placeholder";

export default function HomesMap({
  homes,
  hoveredId,
  onHover,
  selectedId,
  onSelect,
}: {
  homes: Home[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const mapRef = useRef<MapRef | null>(null);
  const selected = useMemo(() => homes.find((h) => h.id === selectedId) ?? null, [homes, selectedId]);

  // Keep the map sized correctly when its container changes (mobile view toggle).
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const container = map.getContainer();
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  return (
    <MapGL
      ref={mapRef}
      initialViewState={{ longitude: SITE.mapCenter[0], latitude: SITE.mapCenter[1], zoom: 11.6 }}
      mapStyle={SITE.mapStyleUrl}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      onClick={() => onSelect(null)}
      cooperativeGestures={false}
    >
      <NavigationControl position="top-right" showCompass={false} />
      {homes.map((home) => {
        const active = hoveredId === home.id || selectedId === home.id;
        return (
          <Marker
            key={home.id}
            longitude={home.lng}
            latitude={home.lat}
            anchor="bottom"
            style={{ zIndex: active ? 10 : 1 }}
          >
            <button
              type="button"
              aria-label={`${formatPrice(home.price)}, ${home.title}, ${home.district}`}
              aria-pressed={selectedId === home.id}
              onMouseEnter={() => onHover(home.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(home.id)}
              onBlur={() => onHover(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(home.id);
              }}
              className={cn(
                "relative rounded-full border px-2.5 py-1 text-xs font-semibold shadow-md transition-transform outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60",
                active
                  ? "z-10 scale-110 border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:scale-105",
              )}
            >
              {formatPriceShort(home.price)}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-full left-1/2 size-2 -translate-x-1/2 -translate-y-1 rotate-45 border-r border-b",
                  active ? "border-primary bg-primary" : "border-border bg-background",
                )}
              />
            </button>
          </Marker>
        );
      })}
      {selected ? (
        <Popup
          longitude={selected.lng}
          latitude={selected.lat}
          anchor="bottom"
          offset={36}
          closeOnClick={false}
          onClose={() => onSelect(null)}
          maxWidth="240px"
        >
          <div className="w-56 overflow-hidden rounded-md text-foreground">
            <HomePlaceholder home={selected} className="aspect-[16/9]" />
            <div className="flex flex-col gap-1 p-2.5">
              <p className="text-base font-semibold">{formatPrice(selected.price)}</p>
              <p className="text-sm leading-snug font-medium">{selected.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatBeds(selected.beds)} · {selected.baths} bath · {selected.area_m2} m² · {selected.district}
              </p>
              <div className="flex items-center justify-between pt-1">
                <Badge variant="secondary">{selected.type}</Badge>
                <Link
                  href={`/homes/${selected.id}`}
                  className="rounded-sm text-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  View home
                </Link>
              </div>
            </div>
          </div>
        </Popup>
      ) : null}
    </MapGL>
  );
}
