"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "./map.css";

import { useEffect, useRef } from "react";
import Link from "next/link";
import MapGL, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import {
  SITE,
  bathsLabel,
  bedsLabel,
  formatPrice,
  formatPriceShort,
  type Home,
} from "@/lib/data";
import { Photo } from "./Photo";
import styles from "./haven.module.css";

interface SearchMapProps {
  homes: Home[];
  activeId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  /** True when the map pane is on screen (mobile toggle) so it can resize. */
  visible: boolean;
}

export default function SearchMap({
  homes,
  activeId,
  selectedId,
  onHover,
  onSelect,
  visible,
}: SearchMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const selected = homes.find((h) => h.id === selectedId) ?? null;

  useEffect(() => {
    if (!visible) return;
    // Container may have been display:none; let MapLibre re-measure it.
    const t = window.setTimeout(() => mapRef.current?.resize(), 50);
    return () => window.clearTimeout(t);
  }, [visible]);

  return (
    <MapGL
      ref={mapRef}
      initialViewState={{
        longitude: SITE.mapCenter[0],
        latitude: SITE.mapCenter[1],
        zoom: 11.6,
      }}
      mapStyle={SITE.mapStyleUrl}
      style={{ width: "100%", height: "100%" }}
      minZoom={9}
      attributionControl={{ compact: true }}
      onClick={() => onSelect(null)}
    >
      <NavigationControl position="top-right" showCompass={false} />

      {homes.map((home) => {
        const active = home.id === activeId || home.id === selectedId;
        return (
          <Marker
            key={home.id}
            longitude={home.lng}
            latitude={home.lat}
            anchor="center"
            style={{ zIndex: active ? 10 : 1 }}
          >
            <button
              type="button"
              className={`${styles.marker} ${active ? styles.markerActive : ""}`}
              aria-label={`${home.title}, ${formatPrice(home.price)}, ${home.district}`}
              aria-pressed={home.id === selectedId}
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

      {selected ? (
        <Popup
          longitude={selected.lng}
          latitude={selected.lat}
          anchor="bottom"
          offset={22}
          closeButton={false}
          closeOnClick={false}
          className="haven-popup"
          maxWidth="none"
          onClose={() => onSelect(null)}
        >
          <div className={styles.popupCard}>
            <button
              type="button"
              className={styles.popupClose}
              aria-label="Close preview"
              onClick={() => onSelect(null)}
            >
              ×
            </button>
            <Link href={`/homes/${selected.id}`} className={styles.popupLink}>
              <Photo id={selected.id} small />
              <div className={styles.popupBody}>
                <strong style={{ fontSize: "1.0625rem" }}>{formatPrice(selected.price)}</strong>
                <span style={{ fontSize: "0.875rem" }}>{selected.title}</span>
                <span style={{ fontSize: "0.8125rem", color: "#555" }}>
                  {bedsLabel(selected.beds)} · {bathsLabel(selected.baths)} · {selected.area_m2} m² ·{" "}
                  {selected.district}
                </span>
              </div>
            </Link>
          </div>
        </Popup>
      ) : null}
    </MapGL>
  );
}
