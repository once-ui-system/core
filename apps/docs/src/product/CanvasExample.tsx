"use client";

import { Column, Row, Text } from "@once-ui-system/core";
import {
  Canvas,
  type CanvasGuide,
  CanvasItem,
  type CanvasRect,
  mapRect,
  rectsBounds,
  rectsIntersect,
  SnapGuides,
  snapRect,
  TransformHandles,
  useCanvasApi,
  useCanvasDrag,
} from "@once-ui-system/core/canvas";
import { useMemo, useRef, useState } from "react";

interface Shape extends CanvasRect {
  id: string;
  kind: "frame" | "rect" | "ellipse" | "text";
  fill: string;
  label?: string;
}

const START: Shape[] = [
  {
    id: "frame",
    kind: "frame",
    x: 0,
    y: 0,
    width: 480,
    height: 300,
    fill: "var(--surface-background)",
    label: "Fjell / Home",
  },
  {
    id: "hero",
    kind: "rect",
    x: 32,
    y: 56,
    width: 256,
    height: 120,
    fill: "var(--function-brand-500)",
  },
  {
    id: "dot",
    kind: "ellipse",
    x: 320,
    y: 56,
    width: 120,
    height: 120,
    fill: "var(--function-accent-500)",
  },
  {
    id: "title",
    kind: "text",
    x: 32,
    y: 200,
    width: 300,
    height: 40,
    fill: "transparent",
    label: "Plan the trip",
  },
];

/** Moves the selection with snapping to everything else; selection is the app's, not the canvas's. */
function Shapes({
  shapes,
  selected,
  onSelect,
  onChange,
  onGuides,
}: {
  shapes: Shape[];
  selected: string[];
  onSelect: (ids: string[]) => void;
  onChange: (next: Shape[]) => void;
  onGuides: (guides: CanvasGuide[]) => void;
}) {
  const drag = useCanvasDrag();
  const api = useCanvasApi();
  return (
    <>
      {shapes.map((shape) => (
        <CanvasItem
          key={shape.id}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          rotation={shape.rotation}
          zIndex={shape.kind === "frame" ? 0 : 1}
          onPointerDown={(e) => {
            const ids = selected.includes(shape.id)
              ? selected
              : e.shiftKey
                ? [...selected, shape.id]
                : [shape.id];
            onSelect(ids);
            const start = shapes;
            const moving = start.filter((s) => ids.includes(s.id));
            const bounds = rectsBounds(moving);
            const others = start.filter((s) => !ids.includes(s.id));
            drag(e, {
              onMove: ({ delta }) => {
                if (!bounds) return;
                const snap = snapRect(
                  { ...bounds, x: bounds.x + delta.x, y: bounds.y + delta.y },
                  others,
                  {
                    threshold: 6 / api.getView().zoom,
                  },
                );
                onGuides(snap.guides);
                const dx = delta.x + snap.dx;
                const dy = delta.y + snap.dy;
                onChange(
                  start.map((s) => (ids.includes(s.id) ? { ...s, x: s.x + dx, y: s.y + dy } : s)),
                );
              },
              onEnd: () => onGuides([]),
            });
          }}
          style={{
            background: shape.fill,
            borderRadius: shape.kind === "ellipse" ? "50%" : shape.kind === "frame" ? 0 : 12,
            border: shape.kind === "frame" ? "1px solid var(--neutral-alpha-medium)" : undefined,
            display: "flex",
            alignItems: "center",
            cursor: "default",
          }}
        >
          {shape.kind === "text" && (
            <Text variant="heading-strong-l" onBackground="neutral-strong">
              {shape.label}
            </Text>
          )}
          {shape.kind === "frame" && (
            <Text
              variant="label-default-s"
              onBackground="neutral-weak"
              style={{ position: "absolute", top: -20, left: 0, whiteSpace: "nowrap" }}
            >
              {shape.label}
            </Text>
          )}
        </CanvasItem>
      ))}
    </>
  );
}

export function CanvasExample() {
  const [shapes, setShapes] = useState<Shape[]>(START);
  const [selected, setSelected] = useState<string[]>(["hero"]);
  const [guides, setGuides] = useState<CanvasGuide[]>([]);
  const boxBase = useRef<string[]>([]);
  const bounds = useMemo(() => rectsBounds(shapes), [shapes]);
  const selection = shapes.filter((s) => selected.includes(s.id));
  const selectionRect = rectsBounds(selection);
  const single = selection.length === 1 ? selection[0] : null;
  const transformStart = useRef<Shape[]>([]);

  return (
    <Column fillWidth gap="8">
      <Canvas
        height={420}
        fit={bounds}
        onBackgroundClick={() => setSelected([])}
        onSelectionBox={(rect, { phase, additive }) => {
          if (phase === "start") boxBase.current = additive ? selected : [];
          if (!rect) return;
          const hit = shapes
            .filter((s) => s.kind !== "frame" && rectsIntersect(s, rect))
            .map((s) => s.id);
          setSelected([...new Set([...boxBase.current, ...hit])]);
        }}
        style={{ borderRadius: "var(--radius-l)", border: "1px solid var(--neutral-alpha-medium)" }}
      >
        <Shapes
          shapes={shapes}
          selected={selected}
          onSelect={setSelected}
          onChange={setShapes}
          onGuides={setGuides}
        />
        {selectionRect && (
          <TransformHandles
            rect={single ? single : selectionRect}
            rotatable={!!single}
            keepRatio={single?.kind === "ellipse"}
            onTransform={(next, { phase, start }) => {
              if (phase === "start") transformStart.current = shapes;
              const before = transformStart.current;
              setShapes(
                before.map((s) => {
                  if (!selected.includes(s.id)) return s;
                  return single ? { ...s, ...next } : { ...s, ...mapRect(s, start, next) };
                }),
              );
            }}
          />
        )}
        <SnapGuides guides={guides} />
      </Canvas>
      <Row gap="16" wrap>
        <Text variant="label-default-s" onBackground="neutral-weak">
          Drag to move · Shift-click or drag a box to select several · Space or the middle button to
          pan · ⌘ + wheel to zoom
        </Text>
      </Row>
    </Column>
  );
}
