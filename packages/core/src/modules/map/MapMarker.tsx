"use client";

import type { Marker, PositionAnchor } from "maplibre-gl";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMap } from "./MapContext";
import { MapPin } from "./MapPin";
import type { LngLat } from "./types";

export interface MapMarkerProps {
  position: LngLat;
  /** What sits on the map: a MapPin, an Avatar, anything. Default a dot pin. */
  children?: React.ReactNode;
  /** Which part of the content touches `position`. Default "bottom". */
  anchor?: PositionAnchor;
  /** Pixels to shift the content by, `[x, y]`. */
  offset?: [number, number];
  /** Lifts the marker above the others, for the hovered or selected one. */
  active?: boolean;
  /** Lets the marker be dragged; `onDragEnd` gets where it was dropped. */
  draggable?: boolean;
  onDragEnd?: (position: LngLat) => void;
}

/**
 * React content pinned to a point. The content is portalled into the element
 * MapLibre moves, so it keeps context (theme, links, handlers) and stays
 * real DOM: a button in it is reachable by Tab, and focusing one off screen
 * pans it into view.
 */
const MapMarker: React.FC<MapMarkerProps> = ({
  position,
  children,
  anchor = "bottom",
  offset,
  active = false,
  draggable = false,
  onDragEnd,
}) => {
  const { map, lib, reducedMotion } = useMap();
  const [element] = useState(() => {
    const div = document.createElement("div");
    // A click on a marker is the marker's, not the map's.
    div.addEventListener("click", (event) => event.stopPropagation());
    div.addEventListener("dblclick", (event) => event.stopPropagation());
    return div;
  });
  const marker = useRef<Marker | null>(null);
  const latest = useRef({ position, onDragEnd, reducedMotion });
  latest.current = { position, onDragEnd, reducedMotion };
  const [lng, lat] = position;

  // The position moves through setLngLat below, not a new marker.
  useEffect(() => {
    const instance = new lib.Marker({ element, anchor, offset, draggable })
      .setLngLat(latest.current.position)
      .addTo(map);
    instance.on("dragend", () => {
      const { lng: x, lat: y } = instance.getLngLat();
      latest.current.onDragEnd?.([x, y]);
    });
    marker.current = instance;
    return () => {
      instance.remove();
      marker.current = null;
    };
  }, [map, lib, element, anchor, offset?.[0], offset?.[1], draggable]);

  useEffect(() => {
    marker.current?.setLngLat([lng, lat]);
  }, [lng, lat]);

  useEffect(() => {
    element.style.zIndex = active ? "2" : "";
  }, [element, active]);

  // Tabbing onto a marker outside the view brings it in.
  useEffect(() => {
    const onFocus = () => {
      if (map.getBounds().contains(latest.current.position)) return;
      map.easeTo({
        center: latest.current.position,
        duration: latest.current.reducedMotion ? 0 : 300,
      });
    };
    element.addEventListener("focusin", onFocus);
    return () => element.removeEventListener("focusin", onFocus);
  }, [map, element]);

  return createPortal(children ?? <MapPin variant="dot" />, element);
};

MapMarker.displayName = "MapMarker";

export { MapMarker };
