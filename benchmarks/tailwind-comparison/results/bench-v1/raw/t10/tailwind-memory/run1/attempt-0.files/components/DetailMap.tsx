"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import { MapPin } from "lucide-react";
import { MAP_STYLE_URL } from "@/lib/data";

export function DetailMap({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label: string;
}) {
  return (
    <Map
      initialViewState={{ longitude: lng, latitude: lat, zoom: 14 }}
      mapStyle={MAP_STYLE_URL}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      scrollZoom={false}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Marker longitude={lng} latitude={lat} anchor="bottom">
        <span
          role="img"
          aria-label={label}
          className="grid size-9 place-items-center rounded-full bg-teal-700 text-white shadow-lg ring-2 ring-white"
        >
          <MapPin className="size-5" aria-hidden="true" />
        </span>
      </Marker>
    </Map>
  );
}
