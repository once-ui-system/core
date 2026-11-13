"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  type MapRef,
} from "react-map-gl/maplibre";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import {
  MAP_CENTER,
  MAP_STYLE_URL,
  bedsLabel,
  formatPrice,
  formatPriceShort,
  type Home,
} from "@/lib/data";

interface Props {
  homes: Home[];
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  zoom?: number;
  center?: [number, number];
  /** Re-run map.resize() whenever this changes (e.g. when its container is shown). */
  resizeKey?: unknown;
  label: string;
}

export default function HomeMap({
  homes,
  hoveredId = null,
  onHover,
  selectedId = null,
  onSelect,
  zoom = 11.6,
  center = MAP_CENTER,
  resizeKey,
  label,
}: Props) {
  const mapRef = useRef<MapRef | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => mapRef.current?.resize(), 50);
    return () => window.clearTimeout(id);
  }, [resizeKey]);

  const selected = homes.find((h) => h.id === selectedId) ?? null;

  return (
    <Box
      position="relative"
      width="100%"
      height="100%"
      role="region"
      aria-label={label}
    >
      <Map
        ref={mapRef}
        mapStyle={MAP_STYLE_URL}
        initialViewState={{ longitude: center[0], latitude: center[1], zoom }}
        style={{ width: "100%", height: "100%" }}
        attributionControl={{ compact: true }}
        onClick={() => onSelect?.(null)}
      >
        <NavigationControl showCompass={false} position="top-right" />
        {homes.map((home) => {
          const active = home.id === hoveredId || home.id === selectedId;
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
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(home.id);
                }}
                onMouseEnter={() => onHover?.(home.id)}
                onMouseLeave={() => onHover?.(null)}
                onFocus={() => onHover?.(home.id)}
                onBlur={() => onHover?.(null)}
                style={{
                  cursor: "pointer",
                  border: `2px solid ${active ? "#0f766e" : "#ffffff"}`,
                  background: active ? "#0f766e" : "#1f2937",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 13,
                  lineHeight: 1,
                  padding: "6px 9px",
                  borderRadius: 999,
                  boxShadow: active
                    ? "0 4px 14px rgba(15,118,110,0.55)"
                    : "0 1px 4px rgba(0,0,0,0.35)",
                  transform: active ? "scale(1.18)" : "scale(1)",
                  transition: "transform 120ms ease, background 120ms ease",
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
            closeButton
            closeOnClick={false}
            maxWidth="260px"
            onClose={() => onSelect?.(null)}
          >
            <Box color="#111827" pr="2" minW="190px">
              <Text fontWeight="bold" fontSize="md">
                {formatPrice(selected.price)}
              </Text>
              <Text fontSize="sm" fontWeight="medium" lineClamp={2}>
                {selected.title}
              </Text>
              <Text fontSize="xs" color="#4b5563" mb="2">
                {bedsLabel(selected.beds)} · {selected.baths} bath ·{" "}
                {selected.area_m2} m² · {selected.district}
              </Text>
              <Flex>
                <Button asChild size="xs" colorPalette="teal">
                  <NextLink href={`/homes/${selected.id}`}>View home</NextLink>
                </Button>
              </Flex>
            </Box>
          </Popup>
        )}
      </Map>
    </Box>
  );
}
