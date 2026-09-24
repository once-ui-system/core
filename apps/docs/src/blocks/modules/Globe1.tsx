"use client";

import { Row } from "@once-ui-system/core";
import type { Feature } from "geojson";
import {
  forwardRef,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { dev } from "@/utils/dev-logger";

declare global {
  interface Window {
    topojson: {
      feature: (topology: unknown, object: unknown) => { features: Feature[] };
    };
  }
}

interface Point {
  lat: number;
  lng: number;
  name: string;
  element?: ReactNode;
  color?: string;
  size?: number;
}

interface WorldMapProps {
  height?: string | number;
  width?: string | number;
  activePointId?: string | null;
}

interface Globe1Handle {
  centerOnPoint: (lat: number, lng: number) => void;
}

const locations = [
  {
    id: "amsterdam",
    lat: 52.3779,
    lng: 4.8971,
    name: "Amsterdam",
  },
  {
    id: "azores",
    lat: 37.7412,
    lng: -25.6756,
    name: "Azores",
  },
  {
    id: "bohinj",
    lat: 46.2808,
    lng: 13.8494,
    name: "Bohinj",
  },
  {
    id: "crete",
    lat: 35.2401,
    lng: 24.8093,
    name: "Crete",
  },
  {
    id: "dubai",
    lat: 25.2048,
    lng: 55.2708,
    name: "Dubai",
  },
  {
    id: "madeira",
    lat: 32.7607,
    lng: -16.9595,
    name: "Madeira",
  },
  {
    id: "porto",
    lat: 41.1579,
    lng: -8.6291,
    name: "Porto",
  },
  {
    id: "seoul",
    lat: 37.5665,
    lng: 126.978,
    name: "Seoul",
  },
  {
    id: "zakopane",
    lat: 49.2992,
    lng: 19.9496,
    name: "Zakopane",
  },
];

export const Globe1 = forwardRef<Globe1Handle, WorldMapProps>(
  ({ height = "100%", width = "100%", activePointId = null }, ref) => {
    const globeEl = useRef<GlobeMethods | undefined>(undefined);
    const [landPolygons, setLandPolygons] = useState<Feature[]>([]);
    const [mountPoints, setMountPoints] = useState<Map<string, HTMLElement>>(new Map());

    // Memoize points to keep identity stable across renders
    const points = useMemo(
      () =>
        locations.map((location) => ({
          lat: location.lat,
          lng: location.lng,
          element: (
            <>
              <Row width="4" height="4" solid="brand-strong" />
              <Row
                position="absolute"
                top="8"
                style={{ left: "50%", transform: "translateX(-50%)" }}
                textVariant="label-default-s"
              >
                {location.name}
              </Row>
            </>
          ),
        })),
      [],
    );

    // Load world map data
    useEffect(() => {
      fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then((res) => res.json())
        .then((worldData) => {
          try {
            // Load topojson-client from CDN if needed
            if (!window.topojson) {
              const script = document.createElement("script");
              script.src = "https://unpkg.com/topojson-client@3/dist/topojson-client.min.js";
              script.onload = () => {
                if (window.topojson) {
                  const features = window.topojson.feature(
                    worldData,
                    worldData.objects.countries,
                  ).features;
                  setLandPolygons(features);
                }
              };
              document.head.appendChild(script);
            } else {
              const features = window.topojson.feature(
                worldData,
                worldData.objects.countries,
              ).features;
              setLandPolygons(features);
            }
          } catch (err) {
            dev.error("Error processing map data:", err);
          }
        })
        .catch((err) => {
          dev.error("Error loading map data:", err);
        });
    }, []);

    // Auto-rotate - stop when a point is selected
    useEffect(() => {
      if (globeEl.current) {
        // Only auto-rotate when no point is selected
        globeEl.current.controls().autoRotate = activePointId === null;
        globeEl.current.controls().autoRotateSpeed = 0.5;
      }
    }, [activePointId]);

    // Stable reference for mount points to prevent re-renders
    const mountPointsRef = useRef(new Map<string, HTMLElement>());
    // Track mounted state to avoid setState before mount or after unmount
    const isMountedRef = useRef(false);
    useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
      };
    }, []);

    // Ensure portals render at first paint: sync any pre-created mount points after mount
    useEffect(() => {
      if (mountPointsRef.current.size > 0) {
        setMountPoints(new Map(mountPointsRef.current));
      }
    }, []);

    // Custom HTML element renderer function - with memoization to prevent recreation
    const htmlElementRenderer = (d: unknown) => {
      const point = d as Point;

      // Create a unique ID for this point
      const pointId = `point-${point.lat}-${point.lng}`;

      // Check if we already have an element for this point
      let el = mountPointsRef.current.get(pointId);

      // If not, create a new one
      if (!el) {
        el = document.createElement("div");
        el.id = pointId;
        el.style.pointerEvents = "auto";
        el.style.cursor = "pointer";

        if (!point.element) {
          // Default element if no custom element is provided
          el.innerHTML = `"Please add an element"`;
        } else {
          // Store the element for React portals
          mountPointsRef.current.set(pointId, el);
          // Defer the state update to after mount to avoid updating during render
          // and to prevent React warnings about updating state on not-yet-mounted components
          setTimeout(() => {
            if (isMountedRef.current) {
              setMountPoints(new Map(mountPointsRef.current));
            }
          }, 0);
        }
      }

      return el;
    };

    // Expose methods to the parent component
    useImperativeHandle(
      ref,
      () => ({
        centerOnPoint: (lat: number, lng: number) => {
          if (globeEl.current) {
            // Get current altitude (zoom level) before changing position
            const currentPOV = globeEl.current.pointOfView();
            const currentAltitude = currentPOV.altitude;

            // Use the current altitude to maintain zoom level
            globeEl.current.pointOfView({ lat, lng, altitude: currentAltitude }, 1000);
          }
        },
      }),
      [],
    );

    return (
      <Row fill style={{ width, height }}>
        <Globe
          ref={globeEl}
          htmlElementsData={points}
          htmlElement={htmlElementRenderer}
          htmlTransitionDuration={200}
          onGlobeReady={() => {
            if (globeEl.current && points.length > 0) {
              globeEl.current.pointOfView(
                { lat: points[0].lat, lng: points[0].lng, altitude: 2.5 },
                1000,
              );
            }
          }}
          polygonsData={landPolygons}
          polygonCapColor={() => "rgba(127, 116, 201, 0.1)"} // fill
          polygonSideColor={() => "rgba(127, 116, 201, 0)"} // sides
          polygonStrokeColor={() => "rgb(128, 140, 194)"} // outlines
          polygonAltitude={0.008} // elevation
          atmosphereColor="#000000" // atmosphere (alpha not supported by THREE.Color)
        />

        {useMemo(() => {
          const portals = points.map((point, index) => {
            if (point.element) {
              const pointId = `point-${point.lat}-${point.lng}`;
              const mountPoint = mountPoints.get(pointId);

              if (mountPoint) {
                return createPortal(
                  <Row key={index} pointerEvents="all">
                    {point.element}
                  </Row>,
                  mountPoint,
                  pointId,
                );
              }
            }
            return null;
          });
          return <span style={{ display: "contents" }}>{portals}</span>;
        }, [points, mountPoints])}
      </Row>
    );
  },
);
