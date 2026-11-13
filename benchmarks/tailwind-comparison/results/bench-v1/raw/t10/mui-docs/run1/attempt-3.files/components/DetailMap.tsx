"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import PlaceIcon from "@mui/icons-material/Place";
import { Home, SITE } from "@/lib/data";

export default function DetailMap({ home }: { home: Home }) {
  return (
    <Map
      mapLib={import("maplibre-gl")}
      mapStyle={SITE.mapStyleUrl}
      initialViewState={{ longitude: home.lng, latitude: home.lat, zoom: 14 }}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Marker longitude={home.lng} latitude={home.lat} anchor="bottom">
        <PlaceIcon
          titleAccess={`${home.title}, ${home.district}`}
          sx={{ fontSize: 44, color: "primary.main", filter: "drop-shadow(0 2px 2px rgba(0,0,0,.4))" }}
        />
      </Marker>
    </Map>
  );
}
