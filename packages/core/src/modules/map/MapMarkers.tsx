"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { type ClusterGroup, clusterPoints, type MapClusterOptions } from "./cluster.js";
import { useMap } from "./MapContext.js";
import { MapMarker } from "./MapMarker.js";
import { MapPin } from "./MapPin.js";
import type { LngLat } from "./types.js";

export interface MapMarkerItem {
  id: string;
  position: LngLat;
}

export interface MapMarkersProps<T extends MapMarkerItem> {
  items: readonly T[];
  /** One item's marker content. Default a dot pin. */
  renderItem?: (item: T) => React.ReactNode;
  /** The item to lift above the others (hovered in a list, selected). */
  activeId?: string;
  /** Merge markers that overlap. `true` uses the defaults; an object tunes them. */
  cluster?: boolean | MapClusterOptions;
  /**
   * A cluster's content. Default a pill with the count that zooms in to its
   * members when pressed.
   */
  renderCluster?: (cluster: {
    items: T[];
    position: LngLat;
    zoomIn: () => void;
  }) => React.ReactNode;
  /** The cluster pill's accessible name. Default `${count} places, zoom in`. */
  clusterLabel?: (count: number) => string;
}

/**
 * Many markers from data, optionally clustered. Clusters are worked out per
 * whole zoom level in world pixels, so they hold still while the map pans.
 * No clustering library: the greedy pass in cluster.ts is linear in markers.
 */
function MapMarkers<T extends MapMarkerItem>({
  items,
  renderItem,
  activeId,
  cluster = false,
  renderCluster,
  clusterLabel = (count) => `${count} places, zoom in`,
}: MapMarkersProps<T>) {
  const { map, fitTo } = useMap();
  const [zoom, setZoom] = useState(() => Math.floor(map.getZoom()));

  useEffect(() => {
    if (!cluster) return;
    const update = () => setZoom(Math.floor(map.getZoom()));
    update();
    map.on("zoomend", update);
    return () => {
      map.off("zoomend", update);
    };
  }, [map, cluster]);

  // The options object is usually written inline, so its fields are the
  // memo's dependencies, not the object.
  const options = typeof cluster === "object" ? cluster : undefined;
  const radius = options?.radius;
  const maxZoom = options?.maxZoom;
  const minPoints = options?.minPoints;
  const groups = useMemo<ClusterGroup<T>[]>(
    () =>
      cluster
        ? clusterPoints(items, (item) => item.position, zoom, { radius, maxZoom, minPoints })
        : items.map((item) => ({ type: "item", item, position: item.position })),
    [items, zoom, cluster, radius, maxZoom, minPoints],
  );

  return (
    <>
      {groups.map((group) => {
        if (group.type === "item") {
          return (
            <MapMarker
              key={group.item.id}
              position={group.position}
              active={group.item.id === activeId}
            >
              {renderItem ? renderItem(group.item) : undefined}
            </MapMarker>
          );
        }
        const zoomIn = () => {
          fitTo(
            group.items.map((item) => item.position),
            { maxZoom: (maxZoom ?? 16) + 1 },
          );
        };
        const containsActive = group.items.some((item) => item.id === activeId);
        return (
          <MapMarker
            key={group.id}
            position={group.position}
            anchor="center"
            active={containsActive}
          >
            {renderCluster ? (
              renderCluster({ items: group.items, position: group.position, zoomIn })
            ) : (
              <MapPin
                onClick={zoomIn}
                active={containsActive}
                aria-label={clusterLabel(group.items.length)}
              >
                {group.items.length}
              </MapPin>
            )}
          </MapMarker>
        );
      })}
    </>
  );
}

MapMarkers.displayName = "MapMarkers";

export { MapMarkers };
