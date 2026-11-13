"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "./haven.css";

import { Map as MapGL, Marker } from "react-map-gl/maplibre";
import { formatPriceShort, type Home, listings } from "@/lib/data";

export default function MiniMap({ home }: { home: Home }) {
  return (
    <MapGL
      initialViewState={{ longitude: home.lng, latitude: home.lat, zoom: 14 }}
      mapStyle={listings.map_style_url}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      cooperativeGestures
    >
      <Marker longitude={home.lng} latitude={home.lat} anchor="center">
        <div
          className="haven-marker"
          data-active="true"
          role="img"
          aria-label={`${home.title} location`}
        >
          {formatPriceShort(home.price)}
        </div>
      </Marker>
    </MapGL>
  );
}
