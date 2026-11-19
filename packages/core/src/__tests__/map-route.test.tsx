// biome-ignore-all lint/suspicious/noExplicitAny: a stand-in for MapLibre, typed only as far as the tests read it
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MapContext } from "../modules/map/MapContext.js";
import { MapRoute, splitPath } from "../modules/map/MapRoute.js";
import type { LngLat } from "../modules/map/types.js";

/** A map that records its sources and layers, enough for a route. */
function fakeMap() {
  const sources = new Map<string, { data: any; setData: (data: any) => void }>();
  const layers = new Map<string, any>();
  const paint: Record<string, Record<string, unknown>> = {};
  const map = {
    getSource: (id: string) => sources.get(id),
    addSource: vi.fn((id: string, source: any) => {
      const entry = {
        data: source.data,
        setData(data: any) {
          entry.data = data;
        },
      };
      sources.set(id, entry);
    }),
    removeSource: vi.fn((id: string) => sources.delete(id)),
    getLayer: (id: string) => layers.get(id),
    addLayer: vi.fn((layer: any) => layers.set(layer.id, layer)),
    removeLayer: vi.fn((id: string) => layers.delete(id)),
    setPaintProperty: vi.fn((id: string, key: string, value: unknown) => {
      paint[id] = { ...paint[id], [key]: value };
    }),
  };
  return { map, sources, layers, paint };
}

const wrap = (map: any, children: React.ReactNode) => (
  <MapContext.Provider
    value={{
      map,
      lib: {} as any,
      reducedMotion: false,
      theme: "dark",
      styleVersion: 1,
      fitTo: () => {},
    }}
  >
    {children}
  </MapContext.Provider>
);

const path: LngLat[] = [
  [19.0, 47.5],
  [19.01, 47.5],
  [19.02, 47.5],
];

describe("splitPath", () => {
  it("splits at a fraction of the length, sharing the split point", () => {
    const { behind, ahead } = splitPath(path, 0.25);
    expect(behind).toHaveLength(2);
    expect(behind[1][0]).toBeCloseTo(19.005, 4);
    expect(ahead[0]).toEqual(behind[behind.length - 1]);
    expect(ahead[ahead.length - 1]).toEqual([19.02, 47.5]);
  });

  it("clamps progress to the route", () => {
    expect(splitPath(path, -1).behind[1]).toEqual([19.0, 47.5]);
    expect(splitPath(path, 2).behind.at(-1)).toEqual([19.02, 47.5]);
  });
});

describe("MapRoute", () => {
  it("adds a casing, a dashed part ahead and a solid part behind, and removes them", () => {
    const fake = fakeMap();
    const { unmount } = render(
      wrap(fake.map, <MapRoute path={path} progress={0.75} tone="success" />),
    );
    const ids = [...fake.layers.keys()];
    expect(ids).toHaveLength(3);
    expect(ids.map((id) => id.split("-").pop())).toEqual(["casing", "ahead", "behind"]);
    const ahead = ids[1];
    expect(fake.paint[ahead]["line-dasharray"]).toEqual([1, 2]);
    expect(fake.sources.get(ids[2])?.data.geometry.coordinates).toHaveLength(3);
    unmount();
    expect(fake.layers.size).toBe(0);
    expect(fake.sources.size).toBe(0);
  });

  it("moves the split when progress changes", () => {
    const fake = fakeMap();
    const { rerender } = render(wrap(fake.map, <MapRoute path={path} progress={0.1} />));
    const behind = [...fake.layers.keys()][2];
    const before = fake.sources.get(behind)?.data.geometry.coordinates.at(-1)[0];
    rerender(wrap(fake.map, <MapRoute path={path} progress={0.9} />));
    const after = fake.sources.get(behind)?.data.geometry.coordinates.at(-1)[0];
    expect(after).toBeGreaterThan(before);
  });

  it("draws a planned route dashed, with nothing behind", () => {
    const fake = fakeMap();
    render(wrap(fake.map, <MapRoute path={path} dashed />));
    const [, ahead, behind] = [...fake.layers.keys()];
    expect(fake.sources.get(ahead)?.data.geometry.coordinates).toHaveLength(3);
    expect(fake.sources.get(behind)?.data.geometry.coordinates).toHaveLength(0);
  });
});
