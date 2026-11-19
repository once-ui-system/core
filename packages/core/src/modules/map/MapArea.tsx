"use client";

import type { GeoJSONSource, GeoJSONSourceSpecification, MapLayerMouseEvent } from "maplibre-gl";
import { useEffect, useId, useMemo, useRef } from "react";
import { useMap } from "./MapContext.js";
import { tokenColor } from "./tokenColor.js";
import type { LngLat, MapTone } from "./types.js";

/** GeoJSON in any shape MapLibre reads: a geometry, a Feature or a FeatureCollection. */
export type MapAreaData = Exclude<GeoJSONSourceSpecification["data"], string>;

export interface MapAreaProps {
  /** One outline as points; the ring closes itself. Use `data` for anything else. */
  points?: readonly LngLat[];
  /**
   * GeoJSON polygons: a fire perimeter, delivery zones, a park. A
   * FeatureCollection draws every zone in one layer, in one tone.
   */
  data?: MapAreaData;
  /** The token colour family. Default "brand". */
  tone?: MapTone;
  /** Fill opacity, 0 to 1. 0 draws the outline only. Default 0.2. */
  opacity?: number;
  /** The edge: solid, dashed (a forecast, a planned zone) or none. Default "solid". */
  outline?: "solid" | "dashed" | "none";
  /** Edge width in px. Default 2. */
  width?: number;
  /**
   * Called when the area is clicked. A map shape can't take focus, so keep
   * the same action on a list item or button beside the map.
   */
  onSelect?: () => void;
}

const EMPTY: MapAreaData = { type: "FeatureCollection", features: [] };

const ring = (points: readonly LngLat[]): MapAreaData => {
  const coordinates = points.map(([lng, lat]) => [lng, lat] as [number, number]);
  const [first, last] = [coordinates[0], coordinates[coordinates.length - 1]];
  if (first && (first[0] !== last[0] || first[1] !== last[1])) coordinates.push(first);
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [coordinates] },
  };
};

/** The first symbol layer of the basemap: areas go under it so place names stay on top. */
const firstLabelLayer = (layers: { id: string; type: string }[] | undefined) =>
  layers?.find((layer) => layer.type === "symbol")?.id;

/**
 * Polygons on the map in a token colour: a perimeter, a zone, a district.
 * Pass `points` for one outline or `data` for GeoJSON. It draws under the
 * basemap's labels and re-adds itself when the theme swaps the basemap, so
 * nothing needs `setStyle` or hand-added layers.
 */
const MapArea = ({
  points,
  data,
  tone = "brand",
  opacity = 0.2,
  outline = "solid",
  width = 2,
  onSelect,
}: MapAreaProps) => {
  const { map, styleVersion, theme } = useMap();
  const id = `once-ui-area-${useId().replace(/:/g, "")}`;
  const pointsKey = points ? JSON.stringify(points) : "";
  // biome-ignore lint/correctness/useExhaustiveDependencies: `pointsKey` stands for `points`, which callers often rebuild every render
  const shape = useMemo(
    () => data ?? (points && points.length > 2 ? ring(points) : EMPTY),
    [data, pointsKey],
  );
  const select = useRef(onSelect);
  select.current = onSelect;

  // biome-ignore lint/correctness/useExhaustiveDependencies: theme re-reads the token colours
  useEffect(() => {
    if (styleVersion === 0) return;
    const solid = tokenColor(`--${tone}-solid-strong`);
    const before = firstLabelLayer(map.getStyle()?.layers);
    if (!map.getSource(id)) map.addSource(id, { type: "geojson", data: shape });
    if (!map.getLayer(`${id}-fill`)) {
      map.addLayer({ id: `${id}-fill`, type: "fill", source: id, paint: {} }, before);
    }
    if (!map.getLayer(`${id}-line`)) {
      map.addLayer(
        {
          id: `${id}-line`,
          type: "line",
          source: id,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {},
        },
        before,
      );
    }
    map.setPaintProperty(`${id}-fill`, "fill-color", solid);
    map.setPaintProperty(`${id}-fill`, "fill-opacity", opacity);
    map.setPaintProperty(`${id}-line`, "line-color", solid);
    map.setPaintProperty(`${id}-line`, "line-width", width);
    map.setPaintProperty(`${id}-line`, "line-opacity", outline === "none" ? 0 : 1);
    map.setPaintProperty(`${id}-line`, "line-dasharray", outline === "dashed" ? [2, 2] : [1, 0]);
  }, [map, id, styleVersion, theme, tone, opacity, outline, width]);

  useEffect(() => {
    (map.getSource(id) as GeoJSONSource | undefined)?.setData(shape);
  }, [map, id, shape]);

  const selectable = Boolean(onSelect);
  useEffect(() => {
    if (!selectable) return;
    const layer = `${id}-fill`;
    const onClick = (event: MapLayerMouseEvent) => {
      event.originalEvent?.stopPropagation();
      select.current?.();
    };
    const onEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const onLeave = () => {
      map.getCanvas().style.cursor = "";
    };
    map.on("click", layer, onClick);
    map.on("mouseenter", layer, onEnter);
    map.on("mouseleave", layer, onLeave);
    return () => {
      map.off("click", layer, onClick);
      map.off("mouseenter", layer, onEnter);
      map.off("mouseleave", layer, onLeave);
    };
  }, [map, id, selectable]);

  useEffect(
    () => () => {
      // The map may already be gone when the whole tree unmounts.
      try {
        if (map.getLayer(`${id}-line`)) map.removeLayer(`${id}-line`);
        if (map.getLayer(`${id}-fill`)) map.removeLayer(`${id}-fill`);
        if (map.getSource(id)) map.removeSource(id);
      } catch {}
    },
    [map, id],
  );

  return null;
};

MapArea.displayName = "MapArea";

export { MapArea };
