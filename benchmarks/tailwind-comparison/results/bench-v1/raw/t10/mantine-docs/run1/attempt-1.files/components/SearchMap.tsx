"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Map, { Marker, NavigationControl, Popup, type MapRef } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { Text } from "@mantine/core";
import {
  MAP_CENTER,
  MAP_STYLE_URL,
  bedsLabel,
  formatPrice,
  formatPriceShort,
  type Home,
} from "@/lib/data";
import { Placeholder } from "./Placeholder";
import classes from "./SearchMap.module.css";

interface SearchMapProps {
  homes: Home[];
  hoveredId: string | null;
  selectedId: string | null;
  savedIds: ReadonlySet<string>;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  /** Changes whenever the map container may have changed size (e.g. mobile view toggle). */
  resizeKey: string;
}

export default function SearchMap({
  homes,
  hoveredId,
  selectedId,
  savedIds,
  onHover,
  onSelect,
  resizeKey,
}: SearchMapProps) {
  const mapRef = useRef<MapRef | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => mapRef.current?.resize(), 50);
    return () => window.clearTimeout(id);
  }, [resizeKey]);

  const selected = useMemo(
    () => homes.find((h) => h.id === selectedId) ?? null,
    [homes, selectedId],
  );

  return (
    <div className={classes.wrap}>
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        initialViewState={{ longitude: MAP_CENTER[0], latitude: MAP_CENTER[1], zoom: 11.6 }}
        mapStyle={MAP_STYLE_URL}
        style={{ width: "100%", height: "100%" }}
        attributionControl={{ compact: true }}
        onClick={() => onSelect(null)}
        reuseMaps={false}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {homes.map((home) => {
          const active = hoveredId === home.id || selectedId === home.id;
          const isSaved = savedIds.has(home.id);
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
                className={classes.marker}
                data-active={active || undefined}
                data-saved={isSaved || undefined}
                aria-label={`${formatPrice(home.price)}, ${home.title}, ${home.district}${
                  isSaved ? ", saved" : ""
                }`}
                onMouseEnter={() => onHover(home.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(home.id)}
                onBlur={() => onHover(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(home.id);
                }}
              >
                {formatPriceShort(home.price)}
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
            closeOnClick={false}
            maxWidth="240px"
            onClose={() => onSelect(null)}
          >
            <div className={classes.popupCard} role="group" aria-label={selected.title}>
              <div className={classes.popupPhoto}>
                <Placeholder seed={selected.id} />
              </div>
              <div className={classes.popupBody}>
                <Text fw={700} fz="md" lh={1.2}>
                  {formatPrice(selected.price)}
                </Text>
                <Text fz="sm" fw={600} lh={1.3} mt={2}>
                  {selected.title}
                </Text>
                <Text fz="xs" c="dimmed" mt={2}>
                  {bedsLabel(selected.beds)} · {selected.baths} bath
                  {selected.baths === 1 ? "" : "s"} · {selected.area_m2} m² · {selected.district}
                </Text>
                <Link href={`/homes/${selected.id}`} className={classes.popupLink}>
                  View home
                </Link>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {homes.length === 0 && <div className={classes.empty}>No homes match these filters</div>}
    </div>
  );
}
