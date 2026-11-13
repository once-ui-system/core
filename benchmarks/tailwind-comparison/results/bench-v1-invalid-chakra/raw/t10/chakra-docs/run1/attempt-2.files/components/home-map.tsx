"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import NextLink from "next/link";
import {
  Map as MapGL,
  Marker,
  NavigationControl,
  Popup,
  type MapRef,
} from "react-map-gl/maplibre";
import { Box, HStack, Text } from "@chakra-ui/react";
import {
  type Home,
  MAP_CENTER,
  MAP_STYLE_URL,
  bedsLabel,
  formatPrice,
  formatPriceShort,
} from "@/lib/data";

export interface HomeMapProps {
  homes: Home[];
  hoveredId?: string | null;
  selectedId?: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string | null) => void;
  zoom?: number;
  center?: [number, number];
  /** Used to tell the map to re-measure after being shown */
  visible?: boolean;
  label: string;
}

export default function HomeMap({
  homes,
  hoveredId = null,
  selectedId = null,
  onHover,
  onSelect,
  zoom = 11.3,
  center = MAP_CENTER,
  visible = true,
  label,
}: HomeMapProps) {
  const mapRef = useRef<MapRef | null>(null);

  useEffect(() => {
    if (!visible) return;
    const t = window.setTimeout(() => mapRef.current?.resize(), 50);
    return () => window.clearTimeout(t);
  }, [visible]);

  const selected = homes.find((h) => h.id === selectedId) ?? null;

  return (
    <Box
      position="relative"
      width="100%"
      height="100%"
      role="region"
      aria-label={label}
    >
      <MapGL
        ref={mapRef}
        mapStyle={MAP_STYLE_URL}
        initialViewState={{
          longitude: center[0],
          latitude: center[1],
          zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        onClick={() => onSelect?.(null)}
      >
        <NavigationControl showCompass={false} />
        {homes.map((home) => {
          const active = home.id === hoveredId || home.id === selectedId;
          return (
            <Marker
              key={home.id}
              longitude={home.lng}
              latitude={home.lat}
              anchor="bottom"
              style={{ zIndex: active ? 5 : 1 }}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onSelect?.(home.id);
              }}
            >
              <button
                type="button"
                data-marker-id={home.id}
                aria-label={`${home.title}, ${formatPrice(home.price)}`}
                onMouseEnter={() => onHover?.(home.id)}
                onMouseLeave={() => onHover?.(null)}
                onFocus={() => onHover?.(home.id)}
                onBlur={() => onHover?.(null)}
                style={{
                  cursor: "pointer",
                  border: `2px solid ${active ? "#0f766e" : "#ffffff"}`,
                  background: active ? "#0f766e" : "#1a202c",
                  color: "#ffffff",
                  font: "600 12px/1 system-ui, sans-serif",
                  padding: "6px 9px",
                  borderRadius: 999,
                  boxShadow: active
                    ? "0 4px 12px rgba(0,0,0,0.35)"
                    : "0 1px 4px rgba(0,0,0,0.3)",
                  transform: active ? "scale(1.18)" : "scale(1)",
                  transition: "transform 0.12s, background 0.12s",
                  whiteSpace: "nowrap",
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
            onClose={() => onSelect?.(null)}
            maxWidth="240px"
          >
            <Box color="black" p="1" minW="180px">
              <Text fontWeight="bold" fontSize="md">
                {formatPrice(selected.price)}
              </Text>
              <Text fontSize="sm">{selected.title}</Text>
              <HStack gap="2" fontSize="xs" color="gray.600" mt="1">
                <span>{bedsLabel(selected.beds)}</span>
                <span>·</span>
                <span>{selected.area_m2} m²</span>
                <span>·</span>
                <span>{selected.district}</span>
              </HStack>
              <NextLink
                href={`/homes/${selected.id}`}
                style={{
                  display: "inline-block",
                  marginTop: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0f766e",
                  textDecoration: "underline",
                }}
              >
                View home
              </NextLink>
            </Box>
          </Popup>
        )}
      </MapGL>
    </Box>
  );
}
