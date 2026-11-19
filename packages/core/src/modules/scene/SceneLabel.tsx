"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Scene.module.scss";
import { useScene, useSceneParent } from "./SceneContext.js";
import type { Vec3 } from "./types.js";

export interface SceneLabelProps {
  /** The point it pins to, relative to its parent (a mesh, group or model). Default `[0, 0, 0]`. */
  position?: Vec3;
  /**
   * Which part of the label sits on the point. Default `"bottom"`: the label
   * stands above it, like a tag on a pole.
   */
  anchor?: "center" | "top" | "bottom" | "left" | "right";
  /** Hidden while the point faces away or is behind the camera. Default true. */
  hideBehind?: boolean;
  /** Any Once UI content: a Tag, a Card, a gauge. */
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const ANCHOR = {
  center: "-50%, -50%",
  top: "-50%, 0%",
  bottom: "-50%, -100%",
  left: "0%, -50%",
  right: "-100%, -50%",
} as const;

/**
 * Regular HTML pinned to a point in the scene: it follows the point as the
 * camera or the object moves. Put it inside a mesh, group or model to follow
 * that object. It reads and clicks like the rest of the page.
 *
 * @example
 * <SceneGroup ref={head} position={[0, 2, 0]}>
 *   <SceneLabel position={[0, 0.6, 0]}>
 *     <Tag tone="success" label="82%" />
 *   </SceneLabel>
 * </SceneGroup>
 */
const SceneLabel = ({
  position = [0, 0, 0],
  anchor = "bottom",
  hideBehind = true,
  children,
  className,
  style,
}: SceneLabelProps) => {
  const { three, camera, container, invalidate } = useScene();
  const parent = useSceneParent();
  const element = useRef<HTMLDivElement>(null);
  const [point] = useState(() => new three.Vector3());
  const [x, y, z] = position;

  useEffect(() => {
    const place = () => {
      const node = element.current;
      if (!node) return;
      parent.updateWorldMatrix(true, false);
      point.set(x, y, z).applyMatrix4(parent.matrixWorld);
      const inFront = point.clone().applyMatrix4(camera.matrixWorldInverse).z < 0;
      point.project(camera);
      const width = container.clientWidth;
      const height = container.clientHeight;
      const left = (point.x * 0.5 + 0.5) * width;
      const top = (-point.y * 0.5 + 0.5) * height;
      node.style.transform = `translate(${left}px, ${top}px) translate(${ANCHOR[anchor]})`;
      if (hideBehind && !inFront) node.setAttribute("data-hidden", "");
      else node.removeAttribute("data-hidden");
    };
    container.addEventListener("once-scene-render", place);
    invalidate();
    return () => container.removeEventListener("once-scene-render", place);
  }, [container, camera, parent, point, x, y, z, anchor, hideBehind, invalidate]);

  return createPortal(
    <div
      ref={element}
      className={[styles.label, className].filter(Boolean).join(" ")}
      style={style}
      data-hidden=""
    >
      {children}
    </div>,
    container,
  );
};

SceneLabel.displayName = "SceneLabel";

export { SceneLabel };
