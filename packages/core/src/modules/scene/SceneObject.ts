"use client";

import { useEffect, useRef } from "react";
import type * as Three from "three";
import { type ScenePointerHandlers, useScene, useSceneParent } from "./SceneContext.js";
import type { Vec3 } from "./types.js";

/** Placement shared by everything that sits in a scene. */
export interface SceneTransformProps {
  /** Default `[0, 0, 0]`. */
  position?: Vec3;
  /** Euler angles in radians. Default `[0, 0, 0]`. */
  rotation?: Vec3;
  /** One number scales evenly. Default 1. */
  scale?: number | Vec3;
  /** False hides it without unmounting. Default true. */
  visible?: boolean;
  /** A name, for finding it with `scene.getObjectByName`. */
  name?: string;
}

export interface ScenePointerProps extends ScenePointerHandlers {}

/**
 * Attaches `object` to the parent for as long as it is mounted, keeps its
 * transform in step with the props, and wires pointer handlers. Returns
 * nothing: the caller owns the object and disposes what it created.
 */
export function useSceneObject(
  object: Three.Object3D | null,
  { position, rotation, scale, visible = true, name }: SceneTransformProps,
  handlers?: ScenePointerHandlers,
) {
  const { invalidate, addPickable } = useScene();
  const parent = useSceneParent();

  useEffect(() => {
    if (!object) return;
    parent.add(object);
    invalidate();
    return () => {
      parent.remove(object);
      invalidate();
    };
  }, [object, parent, invalidate]);

  const [px, py, pz] = position ?? [0, 0, 0];
  const [rx, ry, rz] = rotation ?? [0, 0, 0];
  const [sx, sy, sz] = typeof scale === "number" ? [scale, scale, scale] : (scale ?? [1, 1, 1]);
  useEffect(() => {
    if (!object) return;
    object.position.set(px, py, pz);
    object.rotation.set(rx, ry, rz);
    object.scale.set(sx, sy, sz);
    object.visible = visible;
    if (name !== undefined) object.name = name;
    invalidate();
  }, [object, px, py, pz, rx, ry, rz, sx, sy, sz, visible, name, invalidate]);

  // Handlers change identity on most renders; the registration reads the
  // latest ones and only re-runs when one appears or goes away.
  const latest = useRef(handlers);
  latest.current = handlers;
  const clickable = Boolean(handlers?.onClick);
  const hoverable = Boolean(handlers?.onPointerEnter || handlers?.onPointerLeave);
  useEffect(() => {
    if (!object || (!clickable && !hoverable)) return;
    return addPickable(object, {
      onClick: clickable ? () => latest.current?.onClick?.() : undefined,
      onPointerEnter: () => latest.current?.onPointerEnter?.(),
      onPointerLeave: () => latest.current?.onPointerLeave?.(),
    });
  }, [object, addPickable, clickable, hoverable]);
}
