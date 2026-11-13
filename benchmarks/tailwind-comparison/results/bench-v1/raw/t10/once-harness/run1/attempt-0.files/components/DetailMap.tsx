"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "./map.css";

import MapGL, { Marker, NavigationControl } from "react-map-gl/maplibre";
import { SITE, formatPriceShort, type Home } from "@/lib/data";
import styles from "./haven.module.css";

export default function DetailMap({ home }: { home: Home }) {
  return (
    <MapGL
      initialViewState={{ longitude: home.lng, latitude: home.lat, zoom: 13.5 }}
      mapStyle={SITE.mapStyleUrl}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Marker longitude={home.lng} latitude={home.lat} anchor="center">
        <span
          className={`${styles.marker} ${styles.markerActive}`}
          role="img"
          aria-label={`${home.title} location, ${home.district}`}
          style={{ display: "inline-block" }}
        >
          {formatPriceShort(home.price)}
        </span>
      </Marker>
    </MapGL>
  );
}
