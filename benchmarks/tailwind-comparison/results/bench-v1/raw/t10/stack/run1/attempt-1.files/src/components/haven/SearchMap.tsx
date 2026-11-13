"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "./haven.css";

import { Column, Row, Text } from "@once-ui-system/core";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { Map as MapGL, Marker, Popup, type MapRef } from "react-map-gl/maplibre";
import {
  bedsLabel,
  formatPrice,
  formatPriceShort,
  type Home,
  listings,
} from "@/lib/data";
import { Placeholder } from "./Placeholder";

type Props = {
  homes: Home[];
  highlightedId: string | null;
  onHighlight: (id: string | null) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export default function SearchMap({
  homes,
  highlightedId,
  onHighlight,
  selectedId,
  onSelect,
}: Props) {
  const mapRef = useRef<MapRef | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const fit = useCallback(
    (duration: number) => {
      const map = mapRef.current;
      if (!map || homes.length === 0) return;
      const lngs = homes.map((h) => h.lng);
      const lats = homes.map((h) => h.lat);
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 64, maxZoom: 14, duration },
      );
    },
    [homes],
  );

  // Refit when the filtered set changes.
  useEffect(() => {
    fit(500);
  }, [fit]);

  // The map column is display:none on phones in list view; resize and refit
  // when it becomes visible.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let lastWidth = el.clientWidth;
    const observer = new ResizeObserver(() => {
      const width = el.clientWidth;
      if (width > 0 && lastWidth === 0) {
        mapRef.current?.resize();
        fit(0);
      }
      lastWidth = width;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [fit]);

  const selected = homes.find((h) => h.id === selectedId) ?? null;

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%" }}>
      <MapGL
        ref={mapRef}
        initialViewState={{
          longitude: listings.map_center[0],
          latitude: listings.map_center[1],
          zoom: 11.3,
        }}
        mapStyle={listings.map_style_url}
        style={{ width: "100%", height: "100%" }}
        attributionControl={{ compact: true }}
        onClick={() => onSelect(null)}
        onLoad={() => fit(0)}
      >
        {homes.map((home) => {
          const active = home.id === highlightedId || home.id === selectedId;
          return (
            <Marker
              key={home.id}
              longitude={home.lng}
              latitude={home.lat}
              anchor="center"
              style={{ zIndex: active ? 5 : 1 }}
            >
              <button
                type="button"
                className="haven-marker"
                data-active={active}
                aria-label={`${home.title}, ${formatPrice(home.price)}`}
                aria-pressed={home.id === selectedId}
                onMouseEnter={() => onHighlight(home.id)}
                onMouseLeave={() => onHighlight(null)}
                onFocus={() => onHighlight(home.id)}
                onBlur={() => onHighlight(null)}
                onClick={(event) => {
                  event.stopPropagation();
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
            offset={22}
            maxWidth="260px"
            className="haven-popup"
            closeOnClick={false}
            onClose={() => onSelect(null)}
          >
            <Column style={{ width: 240 }}>
              <div style={{ height: 90 }}>
                <Placeholder seed={selected.id} />
              </div>
              <Column padding="12" gap="4">
                <Text variant="label-strong-m">{formatPrice(selected.price)}</Text>
                <Text variant="body-default-s">{selected.title}</Text>
                <Row gap="8" wrap>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    {bedsLabel(selected.beds)} · {selected.area_m2} m² · {selected.district}
                  </Text>
                </Row>
                <Link
                  href={`/homes/${selected.id}`}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--brand-on-background-strong)",
                    marginTop: 4,
                  }}
                >
                  View home
                </Link>
              </Column>
            </Column>
          </Popup>
        )}
      </MapGL>
    </div>
  );
}
