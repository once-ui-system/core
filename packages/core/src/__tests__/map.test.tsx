// biome-ignore-all lint/suspicious/noExplicitAny: a stand-in for MapLibre, typed only as far as the tests read it
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LayoutProvider, ThemeProvider } from "../contexts/index.js";
import { clusterPoints } from "../modules/map/cluster.js";

/**
 * MapLibre needs WebGL, which jsdom lacks, so a stand-in records what the
 * components ask of it: where markers go, how the camera moves.
 */
const calls = vi.hoisted(() => ({
  maps: [] as any[],
  markers: [] as any[],
  fail: false,
}));

vi.mock("maplibre-gl", () => {
  class Evented {
    handlers: Record<string, ((event?: any) => void)[]> = {};
    on(type: string, layerOrHandler: any, maybeHandler?: (event?: any) => void) {
      // MapLibre's on(type, layerId, handler) form is keyed "type:layer" here.
      const key = maybeHandler ? `${type}:${layerOrHandler}` : type;
      const handler = maybeHandler ?? layerOrHandler;
      if (!this.handlers[key]) this.handlers[key] = [];
      this.handlers[key].push(handler);
      return this;
    }
    once(type: string, handler: (event?: any) => void) {
      return this.on(type, handler);
    }
    off(type: string, layerOrHandler: any, maybeHandler?: (event?: any) => void) {
      const key = maybeHandler ? `${type}:${layerOrHandler}` : type;
      const handler = maybeHandler ?? layerOrHandler;
      this.handlers[key] = (this.handlers[key] ?? []).filter((h) => h !== handler);
      return this;
    }
    fire(type: string, event?: any) {
      for (const handler of this.handlers[type] ?? []) handler(event);
    }
  }
  class FakeMap extends Evented {
    options: any;
    center: { lng: number; lat: number };
    zoom: number;
    canvas = document.createElement("canvas");
    container: HTMLElement;
    easeTo = vi.fn((options: any) => {
      if (options.center) this.center = { lng: options.center[0], lat: options.center[1] };
      if (options.zoom !== undefined) this.zoom = options.zoom;
    });
    flyTo = vi.fn();
    fitBounds = vi.fn();
    panBy = vi.fn();
    setStyle = vi.fn();
    remove = vi.fn();
    layers: any[] = [
      { id: "background", type: "background" },
      { id: "building", type: "fill", source: "openmaptiles", "source-layer": "building" },
      { id: "place_label", type: "symbol" },
    ];
    setProjection = vi.fn();
    setSky = vi.fn();
    setPaintProperty = vi.fn();
    setLayoutProperty = vi.fn();
    sources: Record<string, any> = {};
    addSource = vi.fn((id: string, source: any) => {
      this.sources[id] = { ...source, setData: vi.fn() };
    });
    removeSource = vi.fn((id: string) => {
      delete this.sources[id];
    });
    getSource = (id: string) => (id === "openmaptiles" ? {} : this.sources[id]);
    getLayer = (id: string) => this.layers.find((layer) => layer.id === id);
    addLayer = vi.fn((layer: any, before?: string) => {
      const at = this.layers.findIndex((l) => l.id === before);
      this.layers.splice(at < 0 ? this.layers.length : at, 0, layer);
    });
    removeLayer = vi.fn((id: string) => {
      this.layers = this.layers.filter((layer) => layer.id !== id);
    });
    constructor(options: any) {
      super();
      if (calls.fail) throw new Error("Failed to initialize WebGL");
      this.options = options;
      this.container = options.container;
      this.container.appendChild(this.canvas);
      this.canvas.setAttribute("tabindex", "0");
      const center = options.center ?? [0, 0];
      this.center = { lng: center[0], lat: center[1] };
      this.zoom = options.zoom ?? 1;
      calls.maps.push(this);
    }
    getCanvas() {
      return this.canvas;
    }
    getContainer() {
      return this.container;
    }
    getCenter() {
      return this.center;
    }
    getZoom() {
      return this.zoom;
    }
    getBearing() {
      return 0;
    }
    getPitch() {
      return 0;
    }
    getBounds() {
      return { contains: () => true };
    }
    getStyle() {
      return { layers: this.layers };
    }
    isStyleLoaded() {
      return true;
    }
  }
  class Marker extends Evented {
    options: any;
    lngLat: [number, number] = [0, 0];
    constructor(options: any) {
      super();
      this.options = options;
      calls.markers.push(this);
    }
    setLngLat(lngLat: [number, number]) {
      this.lngLat = lngLat;
      return this;
    }
    getLngLat() {
      return { lng: this.lngLat[0], lat: this.lngLat[1] };
    }
    addTo(map: FakeMap) {
      // As MapLibre 5 does to every marker element.
      this.options.element.setAttribute("role", "button");
      this.options.element.setAttribute("aria-label", "Map marker");
      this.options.element.setAttribute("tabindex", "0");
      map.container.appendChild(this.options.element);
      return this;
    }
    remove = vi.fn(function (this: Marker) {
      this.options.element.remove();
    });
  }
  return {
    Map: FakeMap,
    Marker,
    getVersion: () => "6.15.0",
    getWorkerUrl: () => "",
    setWorkerUrl: vi.fn(),
  };
});

const {
  Map: MapView,
  MapArea,
  MapMarker,
  MapMarkers,
  MapPin,
  MapPopup,
} = await import("../modules/map/index.js");

// The map loads its implementation lazily: wait until it has started.
const settle = async () => {
  await vi.waitFor(() => {
    if (calls.maps.length === 0 && !calls.fail) throw new Error("map not started yet");
  });
  await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
};

const wrap = (ui: React.ReactElement) => (
  <ThemeProvider>
    <LayoutProvider>{ui}</LayoutProvider>
  </ThemeProvider>
);

function renderMap(ui: React.ReactElement) {
  const view = render(wrap(ui));
  return { ...view, rerender: (next: React.ReactElement) => view.rerender(wrap(next)) };
}

beforeEach(() => {
  calls.maps.length = 0;
  calls.markers.length = 0;
});
afterEach(() => vi.clearAllMocks());

describe("clusterPoints", () => {
  const near = [
    { id: "a", position: [19.04, 47.5] as [number, number] },
    { id: "b", position: [19.0401, 47.5001] as [number, number] },
    { id: "c", position: [20.5, 48.5] as [number, number] },
  ];

  it("merges points that overlap at a zoom and keeps the far one apart", () => {
    const groups = clusterPoints(near, (item) => item.position, 10);
    expect(groups.filter((group) => group.type === "cluster")).toHaveLength(1);
    const cluster = groups.find((group) => group.type === "cluster");
    expect(cluster?.type === "cluster" && cluster.items.map((item) => item.id)).toEqual(["a", "b"]);
    expect(groups.filter((group) => group.type === "item")).toHaveLength(1);
  });

  it("stops clustering above maxZoom", () => {
    const groups = clusterPoints(near, (item) => item.position, 18);
    expect(groups.every((group) => group.type === "item")).toBe(true);
  });

  it("puts a cluster at its members' centre", () => {
    const [cluster] = clusterPoints(near.slice(0, 2), (item) => item.position, 5);
    expect(cluster.position[0]).toBeCloseTo(19.04005);
  });
});

describe("Map", () => {
  it("renders an empty frame on the server", () => {
    const html = renderToString(
      <ThemeProvider>
        <MapView labels={{ map: "Listings" }} />
      </ThemeProvider>,
    );
    expect(html).toContain('aria-label="Listings"');
  });

  it("starts at the default viewport and names the canvas", async () => {
    renderMap(
      <MapView defaultViewport={{ center: [19, 47.5], zoom: 12 }} labels={{ map: "Budapest" }} />,
    );
    await settle();
    expect(calls.maps).toHaveLength(1);
    expect(calls.maps[0].options).toMatchObject({ center: [19, 47.5], zoom: 12 });
    expect(calls.maps[0].getCanvas().getAttribute("aria-label")).toBe("Budapest");
  });

  it("pins the canvas container inline, so an app's maplibre-gl.css cannot collapse it", async () => {
    renderMap(<MapView />);
    await settle();
    const container = calls.maps[0].container as HTMLElement;
    expect(container.style.position).toBe("absolute");
    expect(container.style.inset).toBe("0px");
  });

  it("frames bounds on first render and again when they change", async () => {
    const view = renderMap(
      <MapView
        bounds={[
          [19, 47],
          [20, 48],
        ]}
      />,
    );
    await settle();
    expect(calls.maps[0].options.bounds).toEqual([
      [19, 47],
      [20, 48],
    ]);
    view.rerender(
      <MapView
        bounds={[
          [18, 46],
          [20, 48],
        ]}
      />,
    );
    await settle();
    expect(calls.maps[0].fitBounds).toHaveBeenCalledTimes(1);
  });

  it("follows a controlled viewport and reports where a move ends", async () => {
    const onViewportChange = vi.fn();
    const view = renderMap(
      <MapView viewport={{ center: [19, 47], zoom: 10 }} onViewportChange={onViewportChange} />,
    );
    await settle();
    view.rerender(
      <MapView viewport={{ center: [19.5, 47.5], zoom: 14 }} onViewportChange={onViewportChange} />,
    );
    await settle();
    const map = calls.maps[0];
    expect(map.easeTo).toHaveBeenCalledWith(
      expect.objectContaining({ center: [19.5, 47.5], zoom: 14 }),
    );
    act(() => map.fire("moveend"));
    expect(onViewportChange).toHaveBeenCalledWith(
      expect.objectContaining({ center: [19.5, 47.5], zoom: 14 }),
    );
  });

  it("zooms with its buttons", async () => {
    renderMap(<MapView defaultViewport={{ center: [0, 0], zoom: 5 }} />);
    await settle();
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(calls.maps[0].easeTo).toHaveBeenCalledWith(expect.objectContaining({ zoom: 6 }));
  });

  it("portals React content into a marker at its position", async () => {
    renderMap(
      <MapView defaultViewport={{ center: [19, 47.5], zoom: 12 }}>
        <MapMarker position={[19.05, 47.51]}>
          <MapPin href="/listing/1">45M Ft</MapPin>
        </MapMarker>
      </MapView>,
    );
    await settle();
    expect(calls.markers[0].lngLat).toEqual([19.05, 47.51]);
    expect(screen.getByRole("link", { name: "45M Ft" })).toBeTruthy();
    // The wrapper MapLibre made a button is a plain box again: one control, one name.
    const box = calls.markers[0].options.element as HTMLElement;
    expect(box.contains(screen.getByRole("link", { name: "45M Ft" }))).toBe(true);
    expect(box.hasAttribute("role")).toBe(false);
    expect(box.hasAttribute("aria-label")).toBe(false);
    expect(box.hasAttribute("tabindex")).toBe(false);
  });

  it("clusters items into a pill that zooms in", async () => {
    renderMap(
      <MapView defaultViewport={{ center: [19, 47.5], zoom: 10 }}>
        <MapMarkers
          cluster
          items={[
            { id: "a", position: [19.04, 47.5] },
            { id: "b", position: [19.0401, 47.5001] },
          ]}
        />
      </MapView>,
    );
    await settle();
    fireEvent.click(screen.getByRole("button", { name: "2 places, zoom in" }));
    expect(calls.maps[0].fitBounds).toHaveBeenCalled();
  });

  it("closes a popup on Escape", async () => {
    const onClose = vi.fn();
    renderMap(
      <MapView defaultViewport={{ center: [19, 47.5], zoom: 12 }}>
        <MapPopup position={[19, 47.5]} onClose={onClose}>
          Listing
        </MapPopup>
      </MapView>,
    );
    await settle();
    expect(screen.getByRole("dialog").textContent).toContain("Listing");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("says so when the map cannot start", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    calls.fail = true;
    renderMap(<MapView />);
    expect(await screen.findByText("The map could not load in this browser.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Zoom in" })).toBeNull();
    calls.fail = false;
    warn.mockRestore();
  });

  it("draws a globe and 3D buildings once the style loads", async () => {
    const view = renderMap(
      <MapView
        defaultViewport={{ center: [19, 47.5], zoom: 15, pitch: 50 }}
        projection="globe"
        buildings="3d"
      />,
    );
    await settle();
    const map = calls.maps[0];
    act(() => map.fire("style.load"));
    expect(map.setProjection).toHaveBeenCalledWith({ type: "globe" });
    expect(map.setLayoutProperty).toHaveBeenCalledWith("building", "visibility", "none");
    const layer = map.addLayer.mock.calls[0][0];
    expect(layer.type).toBe("fill-extrusion");
    expect(layer["source-layer"]).toBe("building");
    // Under the labels, so names stay on top of the skyline.
    expect(map.addLayer.mock.calls[0][1]).toBe("place_label");

    view.rerender(<MapView defaultViewport={{ center: [19, 47.5], zoom: 15 }} buildings="flat" />);
    expect(map.removeLayer).toHaveBeenCalledWith(layer.id);
    expect(map.setLayoutProperty).toHaveBeenLastCalledWith("building", "visibility", "visible");
    expect(map.setProjection).toHaveBeenLastCalledWith({ type: "mercator" });
  });
});

describe("MapArea", () => {
  const zone: [number, number][] = [
    [19, 47.5],
    [19.1, 47.5],
    [19.1, 47.6],
  ];

  it("closes a ring of points and draws it under the basemap's labels", async () => {
    renderMap(
      <MapView defaultViewport={{ center: [19, 47.5], zoom: 10 }}>
        <MapArea points={zone} tone="danger" outline="dashed" />
      </MapView>,
    );
    await settle();
    const map = calls.maps[0];
    act(() => map.fire("style.load"));
    const [id, source] = map.addSource.mock.calls[0];
    const ring = source.data.geometry.coordinates[0];
    expect(ring).toHaveLength(4);
    expect(ring[3]).toEqual(ring[0]);
    const added = map.addLayer.mock.calls.filter(([layer]: any[]) => layer.source === id);
    expect(added.map(([layer]: any[]) => layer.type)).toEqual(["fill", "line"]);
    expect(added.every(([, before]: any[]) => before === "place_label")).toBe(true);
    expect(map.setPaintProperty).toHaveBeenCalledWith(`${id}-line`, "line-dasharray", [2, 2]);
  });

  it("takes GeoJSON, updates it in place and calls onSelect on a click", async () => {
    const onSelect = vi.fn();
    const first = { type: "FeatureCollection" as const, features: [] };
    const view = renderMap(
      <MapView defaultViewport={{ center: [19, 47.5], zoom: 10 }}>
        <MapArea data={first} onSelect={onSelect} />
      </MapView>,
    );
    await settle();
    const map = calls.maps[0];
    act(() => map.fire("style.load"));
    const [id] = map.addSource.mock.calls[0];
    act(() => map.fire(`click:${id}-fill`, {}));
    expect(onSelect).toHaveBeenCalledTimes(1);

    const next = {
      type: "Feature" as const,
      properties: {},
      geometry: { type: "Polygon" as const, coordinates: [[...zone, zone[0]]] },
    };
    view.rerender(
      <MapView defaultViewport={{ center: [19, 47.5], zoom: 10 }}>
        <MapArea data={next} onSelect={onSelect} />
      </MapView>,
    );
    expect(map.sources[id].setData).toHaveBeenLastCalledWith(next);

    view.rerender(<MapView defaultViewport={{ center: [19, 47.5], zoom: 10 }} />);
    expect(map.removeSource).toHaveBeenCalledWith(id);
  });
});
