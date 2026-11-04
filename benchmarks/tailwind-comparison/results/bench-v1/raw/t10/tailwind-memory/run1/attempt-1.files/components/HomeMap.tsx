"use client";

import { useEffect, useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/maplibre";
import Link from "next/link";
import { X } from "lucide-react";
import {
  MAP_CENTER,
  MAP_STYLE_URL,
  bedsLabel,
  formatPrice,
  formatPriceShort,
  type Home,
} from "@/lib/data";
import { Placeholder } from "./Placeholder";
import { MapStyles } from "./MapStyles";

export function HomeMap({
  homes,
  activeId,
  selectedId,
  onHover,
  onSelect,
}: {
  homes: Home[];
  activeId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const selected = homes.find((h) => h.id === selectedId) ?? null;

  if (!mounted) return null;

  return (
    <>
      <MapStyles />
      <Map
        initialViewState={{
          longitude: MAP_CENTER[0],
          latitude: MAP_CENTER[1],
          zoom: 11.6,
        }}
        mapStyle={MAP_STYLE_URL}
        style={{ width: "100%", height: "100%" }}
        onClick={() => onSelect(null)}
      >
        <NavigationControl position="top-right" showCompass={false} />
        {homes.map((h) => {
          const active = h.id === activeId || h.id === selectedId;
          return (
            <Marker
              key={h.id}
              longitude={h.lng}
              latitude={h.lat}
              anchor="bottom"
              style={{ zIndex: active ? 10 : 1 }}
            >
              <button
                type="button"
                aria-label={`${h.title}, ${formatPrice(h.price)}`}
                aria-pressed={h.id === selectedId}
                onMouseEnter={() => onHover(h.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(h.id)}
                onBlur={() => onHover(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(h.id);
                }}
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold shadow-md transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                  active
                    ? "scale-110 border-teal-900 bg-teal-800 text-white"
                    : "border-stone-300 bg-white text-stone-900 hover:scale-105"
                }`}
              >
                {formatPriceShort(h.price)}
              </button>
            </Marker>
          );
        })}
        {selected && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="bottom"
            offset={34}
            closeButton={false}
            closeOnClick={false}
            maxWidth="260px"
            onClose={() => onSelect(null)}
          >
            <div className="relative w-56">
              <Placeholder seed={selected.id} className="h-24 rounded-md" />
              <button
                type="button"
                onClick={() => onSelect(null)}
                aria-label="Close popup"
                className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-white/90 text-stone-800 shadow hover:bg-white focus-visible:outline-2 focus-visible:outline-teal-700"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
              <p className="mt-2 text-base font-semibold text-stone-900">
                {formatPrice(selected.price)}
              </p>
              <p className="text-sm text-stone-800">{selected.title}</p>
              <p className="text-xs text-stone-600">
                {bedsLabel(selected.beds)} · {selected.area_m2} m² ·{" "}
                {selected.district}
              </p>
              <Link
                href={`/homes/${selected.id}`}
                className="mt-2 inline-block text-sm font-medium text-teal-800 underline underline-offset-2 hover:text-teal-950"
              >
                View home
              </Link>
            </div>
          </Popup>
        )}
      </Map>
    </>
  );
}
