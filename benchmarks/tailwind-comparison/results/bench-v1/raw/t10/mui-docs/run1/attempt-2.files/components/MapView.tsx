"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useMemo } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "./Link";
import Placeholder from "./Placeholder";
import { Home, SITE, bedsLabel, formatPrice, formatPriceShort } from "@/lib/data";

interface MapViewProps {
  homes: Home[];
  hoveredId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
}

export default function MapView({
  homes,
  hoveredId,
  selectedId,
  onHover,
  onSelect,
}: MapViewProps) {
  const selected = useMemo(
    () => homes.find((h) => h.id === selectedId) ?? null,
    [homes, selectedId],
  );

  return (
    <Map
      mapLib={import("maplibre-gl")}
      mapStyle={SITE.mapStyleUrl}
      initialViewState={{
        longitude: SITE.mapCenter[0],
        latitude: SITE.mapCenter[1],
        zoom: 11.6,
      }}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      onClick={() => onSelect(null)}
      cooperativeGestures={false}
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
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSelect(home.id);
            }}
          >
            <ButtonBase
              onMouseEnter={() => onHover(home.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(home.id)}
              onBlur={() => onHover(null)}
              aria-label={`${home.title}, ${formatPrice(home.price)}. Show details`}
              aria-haspopup="dialog"
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 5,
                fontSize: 13,
                fontWeight: 800,
                lineHeight: 1.2,
                border: "2px solid",
                borderColor: active ? "primary.dark" : "primary.main",
                bgcolor: active ? "primary.main" : "background.paper",
                color: active ? "primary.contrastText" : "primary.main",
                boxShadow: active ? 6 : 2,
                transform: active ? "scale(1.18)" : "none",
                transformOrigin: "bottom center",
                transition: "transform 120ms, background-color 120ms, color 120ms",
                "&:focus-visible": { outline: "3px solid", outlineColor: "secondary.main" },
              }}
            >
              {formatPriceShort(home.price)}
            </ButtonBase>
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
          onClose={() => onSelect(null)}
          maxWidth="260px"
        >
          <Box role="dialog" aria-label={selected.title} sx={{ width: 230, color: "#1d1d1f" }}>
            <Placeholder id={selected.id} height={84} rounded />
            <Stack sx={{ pt: 1, gap: 0.25 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {formatPrice(selected.price)}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selected.title}
              </Typography>
              <Typography variant="caption" sx={{ color: "#555" }}>
                {bedsLabel(selected.beds)} · {selected.baths} bath · {selected.area_m2} m² ·{" "}
                {selected.district}
              </Typography>
              <Box
                component={Link}
                href={`/homes/${selected.id}`}
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0b57d0",
                }}
              >
                View home
              </Box>
            </Stack>
          </Box>
        </Popup>
      )}
    </Map>
  );
}
