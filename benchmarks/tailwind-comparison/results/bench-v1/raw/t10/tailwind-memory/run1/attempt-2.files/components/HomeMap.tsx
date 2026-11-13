"use client";

import { useEffect, useRef } from "react";
import type { Map as MlMap, Marker, Popup } from "maplibre-gl";
import {
  MAP_CENTER,
  MAP_STYLE_URL,
  bedsLabel,
  formatPrice,
  formatPriceShort,
  type Home,
} from "@/lib/data";

type Props = {
  homes: Home[];
  activeId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
};

const BASE =
  "rounded-full border px-2.5 py-1 text-xs font-semibold shadow-md transition-transform cursor-pointer";
const IDLE = `${BASE} border-stone-300 bg-white text-stone-900 hover:scale-105`;
const ACTIVE = `${BASE} scale-110 border-teal-900 bg-teal-800 text-white`;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function buildPopupContent(h: Home, onClose: () => void): HTMLElement {
  const root = el("div", "relative w-52");
  const close = el(
    "button",
    "absolute right-0 top-0 grid size-6 place-items-center rounded-full bg-white text-stone-800 shadow",
    "×",
  );
  close.type = "button";
  close.setAttribute("aria-label", "Close popup");
  close.addEventListener("click", onClose);
  root.appendChild(close);
  root.appendChild(el("p", "pr-6 text-base font-semibold text-stone-900", formatPrice(h.price)));
  root.appendChild(el("p", "text-sm text-stone-800", h.title));
  root.appendChild(
    el(
      "p",
      "text-xs text-stone-600",
      `${bedsLabel(h.beds)} · ${h.area_m2} m² · ${h.district}`,
    ),
  );
  const link = el(
    "a",
    "mt-2 inline-block text-sm font-medium text-teal-800 underline underline-offset-2",
    "View home",
  );
  link.href = `/homes/${h.id}`;
  root.appendChild(link);
  return root;
}

export function HomeMap({
  homes,
  activeId,
  selectedId,
  onHover,
  onSelect,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const libRef = useRef<typeof import("maplibre-gl") | null>(null);
  const markersRef = useRef<Map<string, { marker: Marker; node: HTMLButtonElement }>>(
    new Map(),
  );
  const popupRef = useRef<Popup | null>(null);
  const readyRef = useRef(false);

  // Keep latest props/callbacks reachable from long-lived listeners.
  const propsRef = useRef<Props>({
    homes,
    activeId,
    selectedId,
    onHover,
    onSelect,
  });
  propsRef.current = { homes, activeId, selectedId, onHover, onSelect };

  const syncRef = useRef<() => void>(() => {});
  syncRef.current = () => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!map || !lib || !readyRef.current) return;
    const p = propsRef.current;
    const wanted = new Set(p.homes.map((h) => h.id));

    // Remove markers that were filtered out.
    for (const [id, entry] of markersRef.current) {
      if (!wanted.has(id)) {
        entry.marker.remove();
        markersRef.current.delete(id);
      }
    }

    // Add new markers and update styles.
    for (const h of p.homes) {
      let entry = markersRef.current.get(h.id);
      if (!entry) {
        const node = el("button", IDLE, formatPriceShort(h.price));
        node.type = "button";
        node.setAttribute("aria-label", `${h.title}, ${formatPrice(h.price)}`);
        node.addEventListener("mouseenter", () =>
          propsRef.current.onHover(h.id),
        );
        node.addEventListener("mouseleave", () =>
          propsRef.current.onHover(null),
        );
        node.addEventListener("focus", () => propsRef.current.onHover(h.id));
        node.addEventListener("blur", () => propsRef.current.onHover(null));
        node.addEventListener("click", (e) => {
          e.stopPropagation();
          propsRef.current.onSelect(h.id);
        });
        const marker = new lib.Marker({ element: node, anchor: "bottom" })
          .setLngLat([h.lng, h.lat])
          .addTo(map);
        entry = { marker, node };
        markersRef.current.set(h.id, entry);
      }
      const active = h.id === p.activeId || h.id === p.selectedId;
      entry.node.className = active ? ACTIVE : IDLE;
      entry.node.setAttribute("aria-pressed", String(h.id === p.selectedId));
      entry.marker.getElement().style.zIndex = active ? "10" : "1";
    }

    // Popup for selected home.
    const selected = p.homes.find((h) => h.id === p.selectedId) ?? null;
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
    if (selected) {
      const popup = new lib.Popup({
        offset: 34,
        closeButton: false,
        closeOnClick: false,
        maxWidth: "260px",
      })
        .setLngLat([selected.lng, selected.lat])
        .setDOMContent(
          buildPopupContent(selected, () => propsRef.current.onSelect(null)),
        )
        .addTo(map);
      popupRef.current = popup;
    }
  };

  // Create the map once, on the client only.
  useEffect(() => {
    let cancelled = false;
    const markers = markersRef.current;

    (async () => {
      const [mod] = await Promise.all([
        import("maplibre-gl"),
        import("maplibre-gl/dist/maplibre-gl.css"),
      ]);
      if (cancelled || !containerRef.current) return;
      const lib = (mod as unknown as { default?: typeof import("maplibre-gl") })
        .default ?? mod;
      libRef.current = lib as typeof import("maplibre-gl");

      const map = new lib.Map({
        container: containerRef.current,
        style: MAP_STYLE_URL,
        center: MAP_CENTER,
        zoom: 11.6,
        attributionControl: { compact: true },
      });
      map.addControl(
        new lib.NavigationControl({ showCompass: false }),
        "top-right",
      );
      map.on("click", () => propsRef.current.onSelect(null));
      mapRef.current = map;
      readyRef.current = true;
      syncRef.current();
    })().catch(() => {
      /* map is optional; list remains usable */
    });

    return () => {
      cancelled = true;
      readyRef.current = false;
      popupRef.current?.remove();
      popupRef.current = null;
      markers.forEach((m) => m.marker.remove());
      markers.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-sync markers/popup whenever inputs change.
  useEffect(() => {
    syncRef.current();
  }, [homes, activeId, selectedId]);

  // Resize when the container becomes visible (mobile list/map toggle).
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => mapRef.current?.resize());
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-stone-100"
      aria-label="Interactive map of homes"
    />
  );
}
