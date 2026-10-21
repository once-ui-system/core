"use client";

import type { Map as MapLibreMap, MapOptions } from "maplibre-gl";
import * as maplibre from "maplibre-gl";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Column } from "../../components/Column";
import { Icon } from "../../components/Icon";
import { IconButton } from "../../components/IconButton";
import { Text } from "../../components/Text";
import { useTheme } from "../../contexts/ThemeProvider";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import styles from "./Map.module.scss";
import { MapContext, type MapContextValue } from "./MapContext";
import { DEFAULT_MAP_STYLE } from "./mapStyles";
import { tokenColor } from "./tokenColor";
import type { LngLat, MapStyle, MapStyleSource, MapViewport } from "./types";

export interface MapLabels {
  /** The map's accessible name. Default "Map". */
  map: string;
  zoomIn: string;
  zoomOut: string;
  /** Shown when WebGL is off or the map fails to start. */
  unavailable: string;
}

const DEFAULT_LABELS: MapLabels = {
  map: "Map",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  unavailable: "The map could not load in this browser.",
};

export interface MapProps
  extends Omit<React.ComponentProps<typeof Column>, "children" | "onClick" | "onChange"> {
  /** Controlled camera. Pair with `onViewportChange`. */
  viewport?: MapViewport;
  /** Where the camera starts when `viewport` is not controlled. */
  defaultViewport?: MapViewport;
  /** Fires when a pan, zoom or rotation ends, with where the camera stopped. */
  onViewportChange?: (viewport: MapViewport) => void;
  /**
   * Positions to frame. The map fits them on first render and again whenever
   * the list changes, so a new search result set is always in view.
   */
  bounds?: readonly LngLat[];
  /** Space around fitted positions, in pixels. Default 56. */
  boundsPadding?: number;
  /** The closest a fit zooms in, so one result does not fill the screen. Default 15. */
  boundsMaxZoom?: number;
  /** The basemap. Default OpenFreeMap positron (light) and dark. */
  mapStyle?: MapStyle;
  /**
   * Repaint the basemap's background with the page background token, so the
   * map sits on the same surface as the page. Default true.
   */
  tint?: boolean;
  /** The zoom buttons. Default true. */
  controls?: boolean;
  /** False draws a static map: no pan, zoom or keyboard. Default true. */
  interactive?: boolean;
  /** Scroll zooms only with Ctrl/⌘ and touch pans with two fingers. Default false. */
  cooperativeGestures?: boolean;
  minZoom?: number;
  maxZoom?: number;
  /** Fires on a click on the map itself (not on a marker). */
  onMapClick?: (position: LngLat) => void;
  /** The MapLibre instance once the first style loaded, for custom layers. */
  onMapLoad?: (map: MapLibreMap) => void;
  /**
   * Where MapLibre 6 loads its worker from. Bundlers split maplibre-gl into
   * chunks, so the worker file it looks for beside itself is not there; by
   * default it comes from jsDelivr at the installed version. Self-host it by
   * copying `maplibre-gl/dist/maplibre-gl-worker.mjs` into `public/` and
   * passing its URL. MapLibre 5 inlines its worker and ignores this.
   */
  workerUrl?: string;
  /** Adds a key or header to tile requests, for a keyed provider. */
  transformRequest?: MapOptions["transformRequest"];
  labels?: Partial<MapLabels>;
  /** Markers, popups and shapes. */
  children?: React.ReactNode;
}

const WORLD: MapViewport = { center: [0, 20], zoom: 1 };

function pickStyle(style: MapStyle, theme: "light" | "dark"): MapStyleSource {
  if (typeof style === "object" && style !== null && "light" in style && "dark" in style) {
    return style[theme];
  }
  return style as MapStyleSource;
}

function readViewport(map: MapLibreMap): MapViewport {
  const { lng, lat } = map.getCenter();
  return {
    center: [lng, lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
}

function sameViewport(a: MapViewport, b: MapViewport): boolean {
  const near = (x = 0, y = 0, epsilon = 1e-6) => Math.abs(x - y) < epsilon;
  return (
    near(a.center[0], b.center[0]) &&
    near(a.center[1], b.center[1]) &&
    near(a.zoom, b.zoom, 1e-3) &&
    near(a.bearing, b.bearing, 1e-3) &&
    near(a.pitch, b.pitch, 1e-3)
  );
}

function boundsOf(positions: readonly LngLat[]): [LngLat, LngLat] {
  let [west, south] = positions[0];
  let [east, north] = positions[0];
  for (const [lng, lat] of positions) {
    west = Math.min(west, lng);
    east = Math.max(east, lng);
    south = Math.min(south, lat);
    north = Math.max(north, lat);
  }
  return [
    [west, south],
    [east, north],
  ];
}

/**
 * MapLibre 6 resolves its worker next to its own module URL, which a bundled
 * chunk does not have. Point it at the same version on jsDelivr unless the
 * app set a URL. One global setting, so it only has to happen before the
 * first map starts.
 */
function ensureWorker(workerUrl?: string) {
  if (workerUrl) {
    maplibre.setWorkerUrl(workerUrl);
    return;
  }
  if (typeof maplibre.getWorkerUrl !== "function" || maplibre.getWorkerUrl()) return;
  const version = maplibre.getVersion();
  if (Number(version.split(".")[0]) < 6) return;
  maplibre.setWorkerUrl(
    `https://cdn.jsdelivr.net/npm/maplibre-gl@${version}/dist/maplibre-gl-worker.mjs`,
  );
}

/** Paints the style's background layers with the page background token. */
function tintStyle(map: MapLibreMap) {
  const background = tokenColor("--page-background");
  for (const layer of map.getStyle()?.layers ?? []) {
    if (layer.type === "background") {
      map.setPaintProperty(layer.id, "background-color", background);
    }
  }
}

const MapImpl: React.FC<MapProps> = ({
  viewport,
  defaultViewport,
  onViewportChange,
  bounds,
  boundsPadding = 56,
  boundsMaxZoom = 15,
  mapStyle = DEFAULT_MAP_STYLE,
  tint = true,
  controls = true,
  interactive = true,
  cooperativeGestures = false,
  minZoom,
  maxZoom,
  onMapClick,
  onMapLoad,
  transformRequest,
  workerUrl,
  labels: labelsProp,
  children,
  className,
  ...flex
}) => {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const container = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const { shouldAnimate } = useReducedMotion();
  const reducedMotion = !shouldAnimate;
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [styleVersion, setStyleVersion] = useState(0);
  const [failed, setFailed] = useState(false);

  // Callbacks and options the long-lived listeners read without re-binding.
  const latest = useRef({ onViewportChange, onMapClick, onMapLoad, tint, reducedMotion });
  latest.current = { onViewportChange, onMapClick, onMapLoad, tint, reducedMotion };
  const appliedStyle = useRef<MapStyleSource | null>(null);
  const boundsKey = bounds && bounds.length > 0 ? JSON.stringify(bounds) : "";
  const framedKey = useRef("");

  const fitTo = useCallback<MapContextValue["fitTo"]>(
    (positions, options = {}) => {
      if (!map || positions.length === 0) return;
      const duration = latest.current.reducedMotion ? 0 : 400;
      const padding = options.padding ?? boundsPadding;
      const zoomCap = options.maxZoom ?? boundsMaxZoom;
      if (positions.length === 1) {
        map.easeTo({ center: positions[0], zoom: Math.max(map.getZoom(), zoomCap - 1), duration });
        return;
      }
      map.fitBounds(boundsOf(positions), { padding, maxZoom: zoomCap, duration });
    },
    [map, boundsPadding, boundsMaxZoom],
  );

  // The map: created once. The theme, the viewport and the fitted positions
  // reach it through the effects below, never through a new instance.
  // biome-ignore lint/correctness/useExhaustiveDependencies: created once; later prop changes go through the effects below
  useEffect(() => {
    if (!container.current) return;
    const style = pickStyle(mapStyle, resolvedTheme);
    const start = viewport ?? defaultViewport;
    let instance: MapLibreMap;
    try {
      ensureWorker(workerUrl);
      instance = new maplibre.Map({
        container: container.current,
        style,
        ...(start
          ? {
              center: start.center,
              zoom: start.zoom,
              bearing: start.bearing ?? 0,
              pitch: start.pitch ?? 0,
            }
          : bounds && bounds.length > 1
            ? {
                bounds: boundsOf(bounds),
                fitBoundsOptions: { padding: boundsPadding, maxZoom: boundsMaxZoom },
              }
            : bounds && bounds.length === 1
              ? { center: bounds[0], zoom: boundsMaxZoom - 1 }
              : { center: WORLD.center, zoom: WORLD.zoom }),
        interactive,
        cooperativeGestures,
        minZoom,
        maxZoom,
        transformRequest,
        attributionControl: { compact: false },
        locale: { "Map.Title": labels.map },
      });
    } catch (error) {
      console.warn("[@once-ui-system/core] <Map /> could not start:", error);
      setFailed(true);
      return;
    }
    appliedStyle.current = style;
    framedKey.current = boundsKey;

    instance.on("style.load", () => {
      if (latest.current.tint) tintStyle(instance);
      setStyleVersion((version) => version + 1);
    });
    instance.once("load", () => latest.current.onMapLoad?.(instance));
    instance.on("moveend", () => latest.current.onViewportChange?.(readViewport(instance)));
    instance.on("click", (event) => {
      latest.current.onMapClick?.([event.lngLat.lng, event.lngLat.lat]);
    });
    instance.on("error", (event) => {
      // Tile and sprite misses are routine (offline, a provider hiccup); a
      // lost WebGL context is not.
      if (/webgl/i.test(String(event.error?.message))) setFailed(true);
    });
    const canvas = instance.getCanvas();
    canvas.setAttribute("aria-label", labels.map);
    if (!interactive) canvas.removeAttribute("tabindex");

    setMap(instance);
    return () => {
      setMap(null);
      instance.remove();
    };
  }, []);

  // Theme: a `{ light, dark }` style swaps; a single style re-tints.
  useEffect(() => {
    if (!map) return;
    const next = pickStyle(mapStyle, resolvedTheme);
    if (next !== appliedStyle.current) {
      appliedStyle.current = next;
      // A diffed swap (both styles on one schema) keeps the map drawn but
      // fires no style.load: re-tint and re-add shapes once it settles.
      map.setStyle(next);
      map.once("idle", () => {
        if (latest.current.tint) tintStyle(map);
        setStyleVersion((version) => version + 1);
      });
    } else if (tint && map.isStyleLoaded()) {
      tintStyle(map);
      setStyleVersion((version) => version + 1);
    }
  }, [map, mapStyle, resolvedTheme, tint]);

  // Controlled viewport: follow the prop when it differs from the camera.
  useEffect(() => {
    if (!map || !viewport) return;
    if (sameViewport(viewport, readViewport(map))) return;
    map.easeTo({
      center: viewport.center,
      zoom: viewport.zoom,
      bearing: viewport.bearing ?? 0,
      pitch: viewport.pitch ?? 0,
      duration: reducedMotion ? 0 : 300,
    });
  }, [map, viewport, reducedMotion]);

  // Fit: on a new set of positions, frame them.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `bounds` is compared by value through boundsKey
  useEffect(() => {
    if (!map || !bounds || boundsKey === framedKey.current) return;
    framedKey.current = boundsKey;
    fitTo(bounds);
  }, [map, boundsKey, fitTo]);

  const zoomBy = (delta: number) => {
    if (!map) return;
    map.easeTo({ zoom: map.getZoom() + delta, duration: reducedMotion ? 0 : 200 });
  };

  const context = useMemo<MapContextValue | null>(
    () =>
      map ? { map, lib: maplibre, reducedMotion, theme: resolvedTheme, styleVersion, fitTo } : null,
    [map, reducedMotion, resolvedTheme, styleVersion, fitTo],
  );

  return (
    <Column
      fillWidth
      radius="l"
      overflow="hidden"
      border="neutral-alpha-weak"
      background="neutral-alpha-weak"
      position="relative"
      className={[styles.map, className].filter(Boolean).join(" ")}
      {...flex}
    >
      <div ref={container} className={styles.canvas} />
      {failed ? (
        <Column fill center gap="8" padding="24" className={styles.fallback}>
          <Icon name="world" onBackground="neutral-weak" />
          <Text variant="body-default-s" onBackground="neutral-weak" align="center">
            {labels.unavailable}
          </Text>
        </Column>
      ) : (
        controls &&
        interactive && (
          <Column
            gap="2"
            padding="2"
            radius="m"
            background="surface"
            border="neutral-alpha-medium"
            shadow="s"
            className={styles.controls}
          >
            <IconButton
              icon="plus"
              size="m"
              variant="ghost"
              aria-label={labels.zoomIn}
              onClick={() => zoomBy(1)}
            />
            <IconButton
              icon="minus"
              size="m"
              variant="ghost"
              aria-label={labels.zoomOut}
              onClick={() => zoomBy(-1)}
            />
          </Column>
        )
      )}
      {context && <MapContext.Provider value={context}>{children}</MapContext.Provider>}
    </Column>
  );
};

MapImpl.displayName = "Map";

export default MapImpl;
