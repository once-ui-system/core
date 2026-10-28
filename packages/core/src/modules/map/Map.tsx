"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Column } from "../../components/Column.js";
import { MissingDependency } from "../../utils/MissingDependency.js";
import type { MapProps } from "./Map.impl.js";

const MapImpl = React.lazy(() =>
  import("./Map.impl.js").catch(() => {
    console.warn(
      '[@once-ui-system/core] <Map /> requires the "maplibre-gl" package. Install it with: npm install maplibre-gl',
    );
    return {
      default: () => <MissingDependency component="Map" packageName="maplibre-gl" />,
    };
  }),
);

/**
 * The frame the map draws into, on the server and until MapLibre loads, so
 * the page does not shift when the canvas arrives.
 */
const MapFrame: React.FC<MapProps> = ({
  viewport: _viewport,
  defaultViewport: _defaultViewport,
  onViewportChange: _onViewportChange,
  bounds: _bounds,
  boundsPadding: _boundsPadding,
  boundsMaxZoom: _boundsMaxZoom,
  mapStyle: _mapStyle,
  tint: _tint,
  controls: _controls,
  interactive: _interactive,
  cooperativeGestures: _cooperativeGestures,
  minZoom: _minZoom,
  maxZoom: _maxZoom,
  onMapClick: _onMapClick,
  onMapLoad: _onLoad,
  transformRequest: _transformRequest,
  workerUrl: _workerUrl,
  labels,
  children: _children,
  ...flex
}) => (
  <Column
    fillWidth
    minHeight={256}
    radius="l"
    overflow="hidden"
    border="neutral-alpha-weak"
    background="neutral-alpha-weak"
    aria-label={labels?.map ?? "Map"}
    aria-busy
    {...flex}
  />
);

/**
 * An interactive map on MapLibre GL with free OpenStreetMap tiles. It mounts
 * on the client only: WebGL has nothing to draw on the server, and
 * `maplibre-gl` is an optional peer that loads when a map renders.
 */
// biome-ignore lint/suspicious/noShadowRestrictedNames: the component is the map; import it as another name where the global Map is needed
const Map: React.FC<MapProps> = (props) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <MapFrame {...props} />;
  return (
    <Suspense fallback={<MapFrame {...props} />}>
      <MapImpl {...props} />
    </Suspense>
  );
};

Map.displayName = "Map";

export type { MapLabels, MapProps } from "./Map.impl.js";
export { Map };
