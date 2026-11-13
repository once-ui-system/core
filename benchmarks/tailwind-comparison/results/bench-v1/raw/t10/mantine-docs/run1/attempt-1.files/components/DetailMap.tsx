"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { MAP_STYLE_URL, formatPriceShort, type Home } from "@/lib/data";
import classes from "./DetailMap.module.css";

export default function DetailMap({ home }: { home: Home }) {
  return (
    <div className={classes.wrap}>
      <Map
        mapLib={maplibregl}
        initialViewState={{ longitude: home.lng, latitude: home.lat, zoom: 13.5 }}
        mapStyle={MAP_STYLE_URL}
        style={{ width: "100%", height: "100%", minHeight: 260 }}
        attributionControl={{ compact: true }}
        reuseMaps={false}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <Marker longitude={home.lng} latitude={home.lat} anchor="bottom">
          <span className={classes.pin} role="img" aria-label={`${home.title} location in ${home.district}`}>
            {formatPriceShort(home.price)}
          </span>
        </Marker>
      </Map>
    </div>
  );
}
