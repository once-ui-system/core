import type { LngLat } from "./types.js";

export interface MapClusterOptions {
  /** How close, in pixels, two markers must be to merge. Default 56. */
  radius?: number;
  /** Above this zoom nothing clusters. Default 16. */
  maxZoom?: number;
  /** The fewest markers a cluster holds. Default 2. */
  minPoints?: number;
}

export type ClusterGroup<T> =
  | { type: "item"; item: T; position: LngLat }
  | { type: "cluster"; id: string; items: T[]; position: LngLat };

const TILE = 512;

/** Web Mercator world pixels at zoom `z`: stable while the map pans. */
function project([lng, lat]: LngLat, z: number): [number, number] {
  const scale = TILE * 2 ** z;
  const sin = Math.min(Math.max(Math.sin((lat * Math.PI) / 180), -0.9999), 0.9999);
  return [
    ((lng + 180) / 360) * scale,
    (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  ];
}

/**
 * Greedy distance clustering, the way supercluster does it, at one integer
 * zoom. Points are compared in world pixels, so the groups hold still while
 * the map pans and only change when the zoom crosses a whole level. A grid
 * of `radius`-sized cells keeps it linear: each point looks at its own cell
 * and the eight around it.
 */
export function clusterPoints<T>(
  items: readonly T[],
  getPosition: (item: T) => LngLat,
  zoom: number,
  options: MapClusterOptions = {},
): ClusterGroup<T>[] {
  const { radius = 56, maxZoom = 16, minPoints = 2 } = options;
  const z = Math.floor(zoom);
  if (z > maxZoom || items.length < minPoints) {
    return items.map((item) => ({ type: "item", item, position: getPosition(item) }));
  }

  const points = items.map((item) => {
    const position = getPosition(item);
    return { item, position, xy: project(position, z), taken: false };
  });
  const grid = new Map<string, number[]>();
  const cell = (x: number, y: number) => `${Math.floor(x / radius)}:${Math.floor(y / radius)}`;
  points.forEach((point, index) => {
    const key = cell(point.xy[0], point.xy[1]);
    const bucket = grid.get(key);
    if (bucket) bucket.push(index);
    else grid.set(key, [index]);
  });

  const groups: ClusterGroup<T>[] = [];
  for (const point of points) {
    if (point.taken) continue;
    point.taken = true;
    const members = [point];
    const cx = Math.floor(point.xy[0] / radius);
    const cy = Math.floor(point.xy[1] / radius);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (const index of grid.get(`${cx + dx}:${cy + dy}`) ?? []) {
          const other = points[index];
          if (other.taken) continue;
          if (Math.hypot(other.xy[0] - point.xy[0], other.xy[1] - point.xy[1]) <= radius) {
            other.taken = true;
            members.push(other);
          }
        }
      }
    }
    if (members.length < minPoints) {
      for (const member of members) {
        groups.push({ type: "item", item: member.item, position: member.position });
      }
      continue;
    }
    const lng = members.reduce((sum, member) => sum + member.position[0], 0) / members.length;
    const lat = members.reduce((sum, member) => sum + member.position[1], 0) / members.length;
    groups.push({
      type: "cluster",
      // The first member's key plus the size: stable across renders at one zoom.
      id: `${members.length}@${members[0].position.join(",")}`,
      items: members.map((member) => member.item),
      position: [lng, lat],
    });
  }
  return groups;
}
