"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import MapGL, { Marker, NavigationControl } from "react-map-gl/maplibre";
import { MapPin } from "lucide-react";
import { type Home, SITE } from "@/lib/data";

export default function DetailMap({ home }: { home: Home }) {
  return (
    <MapGL
      initialViewState={{ longitude: home.lng, latitude: home.lat, zoom: 13.5 }}
      mapStyle={SITE.mapStyleUrl}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Marker longitude={home.lng} latitude={home.lat} anchor="bottom">
        <div
          role="img"
          aria-label={`${home.title} location in ${home.district}`}
          className="flex size-9 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-lg"
        >
          <MapPin className="size-4" aria-hidden="true" />
        </div>
      </Marker>
    </MapGL>
  );
}
