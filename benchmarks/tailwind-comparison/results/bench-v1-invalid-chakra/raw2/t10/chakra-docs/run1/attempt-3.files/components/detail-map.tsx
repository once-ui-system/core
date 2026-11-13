"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import { SITE, shortPrice, type Home } from "../lib/data";

export default function DetailMap({ home }: { home: Home }) {
  return (
    <Map
      initialViewState={{ longitude: home.lng, latitude: home.lat, zoom: 14 }}
      mapStyle={SITE.mapStyleUrl}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      scrollZoom={false}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Marker longitude={home.lng} latitude={home.lat} anchor="bottom">
        <div
          role="img"
          aria-label={`${home.title} location, ${home.district}`}
          style={{
            background: "#0f766e",
            color: "#fff",
            border: "2px solid #fff",
            borderRadius: 999,
            padding: "3px 10px",
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
            whiteSpace: "nowrap",
          }}
        >
          {shortPrice(home.price)}
        </div>
      </Marker>
    </Map>
  );
}
