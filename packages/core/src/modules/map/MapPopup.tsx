"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { Column } from "../../components/Column";
import { IconButton } from "../../components/IconButton";
import { useMap } from "./MapContext";
import { MapMarker } from "./MapMarker";
import type { LngLat } from "./types";

export interface MapPopupProps
  extends Omit<React.ComponentProps<typeof Column>, "children" | "position"> {
  position: LngLat;
  children: React.ReactNode;
  /** Closes on Escape and the close button. Without it there is no close button. */
  onClose?: () => void;
  /** Pixels between the point and the popup's bottom edge, to clear a pin. Default 40. */
  gap?: number;
  /** The close button's accessible name. Default "Close". */
  closeLabel?: string;
}

/**
 * A card above a point, drawn with core surfaces. Render it while it is open,
 * as you would a Dialog; Escape and the close button call `onClose`.
 */
const MapPopup: React.FC<MapPopupProps> = ({
  position,
  children,
  onClose,
  gap = 40,
  closeLabel = "Close",
  ...flex
}) => {
  const { map, reducedMotion } = useMap();
  const card = useRef<HTMLDivElement>(null);
  const [lng, lat] = position;

  // A popup on a pin near the edge would open half outside the frame: pan
  // the map just enough to show all of it and the pin under it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-check when the point moves
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (!card.current) return;
      const box = card.current.getBoundingClientRect();
      const view = map.getContainer().getBoundingClientRect();
      const margin = 16;
      const dx =
        box.left < view.left + margin
          ? box.left - view.left - margin
          : box.right > view.right - margin
            ? box.right - view.right + margin
            : 0;
      const dy =
        box.top < view.top + margin
          ? box.top - view.top - margin
          : box.bottom + gap > view.bottom - margin
            ? box.bottom + gap - view.bottom + margin
            : 0;
      if (dx || dy) map.panBy([dx, dy], { duration: reducedMotion ? 0 : 300 });
    });
    return () => cancelAnimationFrame(frame);
  }, [map, lng, lat, gap]);

  useEffect(() => {
    if (!onClose) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <MapMarker position={position} anchor="bottom" offset={[0, -gap]} active>
      <Column
        ref={card}
        role="dialog"
        background="surface"
        border="neutral-alpha-medium"
        radius="l"
        shadow="l"
        padding="16"
        gap="8"
        minWidth={14}
        maxWidth={20}
        position="relative"
        style={{ zIndex: 3, cursor: "auto" }}
        {...flex}
      >
        {onClose && (
          <IconButton
            icon="close"
            size="s"
            variant="ghost"
            aria-label={closeLabel}
            onClick={onClose}
            style={{ position: "absolute", top: 8, right: 8 }}
          />
        )}
        {children}
      </Column>
    </MapMarker>
  );
};

MapPopup.displayName = "MapPopup";

export { MapPopup };
