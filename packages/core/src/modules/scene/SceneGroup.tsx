"use client";

import type React from "react";
import { forwardRef, useImperativeHandle, useState } from "react";
import type * as Three from "three";
import { SceneParentContext, useScene } from "./SceneContext.js";
import { type ScenePointerProps, type SceneTransformProps, useSceneObject } from "./SceneObject.js";

export interface SceneGroupProps extends SceneTransformProps, ScenePointerProps {
  /** Meshes, models, labels and groups that move together. */
  children?: React.ReactNode;
}

/**
 * Moves, turns and scales its children together: a robot's head with its
 * visor and antenna. The ref is the `THREE.Group`, for animating it in
 * `useSceneFrame`. A click anywhere on its children fires `onClick`.
 */
const SceneGroup = forwardRef<Three.Group, SceneGroupProps>(
  ({ children, onClick, onPointerEnter, onPointerLeave, ...transform }, ref) => {
    const { three } = useScene();
    const [group] = useState(() => new three.Group());
    useImperativeHandle(ref, () => group, [group]);
    useSceneObject(group, transform, { onClick, onPointerEnter, onPointerLeave });
    return <SceneParentContext.Provider value={group}>{children}</SceneParentContext.Provider>;
  },
);

SceneGroup.displayName = "SceneGroup";

export { SceneGroup };
