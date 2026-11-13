"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import Map, { Marker, NavigationControl, Popup, type MapRef } from "react-map-gl/maplibre";
import { Box, Flex, Link as ChakraLink, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { bedsLabel, formatPrice, shortPrice, SITE, type Home } from "../lib/data";

interface SearchMapProps {
  homes: Home[];
  hoveredId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
}

export default function SearchMap({ homes, hoveredId, selectedId, onHover, onSelect }: SearchMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const selected = homes.find((h) => h.id === selectedId) ?? null;

  // Resize when the container becomes visible (mobile list/map toggle).
  useEffect(() => {
    const map = mapRef.current?.getMap();
    const el = map?.getContainer();
    if (!map || !el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: SITE.mapCenter.lng,
        latitude: SITE.mapCenter.lat,
        zoom: 11.6,
      }}
      mapStyle={SITE.mapStyleUrl}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      onClick={() => onSelect(null)}
    >
      <NavigationControl position="top-right" showCompass={false} />
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
              aria-label={`${home.title}, ${formatPrice(home.price)}. Show details`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(home.id);
              }}
              onMouseEnter={() => onHover(home.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(home.id)}
              onBlur={() => onHover(null)}
              style={{
                background: active ? "#0f766e" : "#ffffff",
                color: active ? "#ffffff" : "#1a202c",
                border: `2px solid ${active ? "#0f766e" : "#4a5568"}`,
                borderRadius: 999,
                padding: "3px 9px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: active ? "0 4px 12px rgba(0,0,0,0.35)" : "0 1px 4px rgba(0,0,0,0.3)",
                transform: active ? "scale(1.18)" : "scale(1)",
                transition: "transform 0.12s, background 0.12s",
                whiteSpace: "nowrap",
              }}
            >
              {shortPrice(home.price)}
            </button>
          </Marker>
        );
      })}
      {selected && (
        <Popup
          longitude={selected.lng}
          latitude={selected.lat}
          anchor="bottom"
          offset={30}
          closeOnClick={false}
          onClose={() => onSelect(null)}
          maxWidth="240px"
        >
          <Box color="gray.900" p={0.5}>
            <Text fontWeight="bold" fontSize="md">
              {formatPrice(selected.price)}
            </Text>
            <Text fontSize="sm" fontWeight="medium">
              {selected.title}
            </Text>
            <Flex gap={2} fontSize="xs" color="gray.600" mt={1} wrap="wrap">
              <span>{bedsLabel(selected.beds)}</span>
              <span>·</span>
              <span>{selected.baths} bath</span>
              <span>·</span>
              <span>{selected.area_m2} m²</span>
            </Flex>
            <Text fontSize="xs" color="gray.600">
              {selected.district}
            </Text>
            <ChakraLink asChild fontSize="sm" color="teal.700" fontWeight="medium" mt={1} display="inline-block">
              <NextLink href={`/homes/${selected.id}`}>View home</NextLink>
            </ChakraLink>
          </Box>
        </Popup>
      )}
    </Map>
  );
}
