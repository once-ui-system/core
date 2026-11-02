import type { ExpressionSpecification, Map as MapLibreMap } from "maplibre-gl";
import { tokenColor } from "./tokenColor";
import type { MapBuildings, MapProjection } from "./types";

const BUILDINGS_3D = "once-buildings-3d";

/** The basemap's own flat building layers (OpenMapTiles schema). */
function flatBuildingLayers(map: MapLibreMap) {
  return (map.getStyle()?.layers ?? []).filter(
    (layer) =>
      layer.id !== BUILDINGS_3D &&
      layer.type === "fill" &&
      "source-layer" in layer &&
      layer["source-layer"] === "building",
  );
}

/**
 * Applies the projection and the building look to the current style. A style
 * swap (theme change) drops both, so this runs again after every style load.
 */
export function applyScene(
  map: MapLibreMap,
  { projection, buildings }: { projection: MapProjection; buildings: MapBuildings },
) {
  // MapLibre 5+ only; older builds have neither.
  if (typeof map.setProjection === "function") {
    map.setProjection({ type: projection });
    // The default atmosphere is a fixed blue halo that ignores the theme.
    if (projection === "globe" && typeof map.setSky === "function") {
      map.setSky({ "atmosphere-blend": 0 });
    }
  }

  const flat = flatBuildingLayers(map);
  for (const layer of flat) {
    map.setLayoutProperty(layer.id, "visibility", buildings === "3d" ? "none" : "visible");
  }

  if (buildings !== "3d") {
    if (map.getLayer(BUILDINGS_3D)) map.removeLayer(BUILDINGS_3D);
    return;
  }

  const source = flat[0] && "source" in flat[0] ? flat[0].source : "openmaptiles";
  if (!map.getSource(source)) return;
  const height: ExpressionSpecification = ["coalesce", ["get", "render_height"], 10];
  // Low buildings sit on the neutral surface; the tallest rise into the
  // brand hue (the solid tokens can be plain white or black), so the skyline
  // follows the theme like the rest of the map.
  const color: ExpressionSpecification = [
    "interpolate",
    ["linear"],
    height,
    0,
    tokenColor("--neutral-background-strong"),
    25,
    tokenColor("--brand-background-strong"),
    70,
    tokenColor("--brand-on-background-weak"),
  ];
  if (!map.getLayer(BUILDINGS_3D)) {
    // Above roads and water, which would otherwise draw over the walls, and
    // below the labels that follow them, so names stay readable.
    const layers = map.getStyle()?.layers ?? [];
    let lastShape = -1;
    layers.forEach((layer, index) => {
      if (layer.type !== "symbol") lastShape = index;
    });
    const firstSymbol = layers[lastShape + 1]?.id;
    map.addLayer(
      {
        id: BUILDINGS_3D,
        type: "fill-extrusion",
        source,
        "source-layer": "building",
        minzoom: 13,
        paint: {
          "fill-extrusion-height": height,
          "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
          "fill-extrusion-opacity": 0.9,
          "fill-extrusion-vertical-gradient": true,
        },
      },
      firstSymbol,
    );
  }
  map.setPaintProperty(BUILDINGS_3D, "fill-extrusion-color", color);
}
