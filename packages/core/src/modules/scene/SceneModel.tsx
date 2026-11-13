"use client";

import type React from "react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type * as Three from "three";
import { SceneParentContext, useScene } from "./SceneContext.js";
import { type ScenePointerProps, type SceneTransformProps, useSceneObject } from "./SceneObject.js";
import type { SceneColor } from "./types.js";

export interface SceneModelProps extends SceneTransformProps, ScenePointerProps {
  /** A `.glb` or `.gltf` URL. Loaded once per scene, however many times it is placed. */
  src: string;
  /**
   * Repaints every material in this colour, so a plain model wears the
   * theme. Leave it unset to keep the model's own colours.
   */
  color?: SceneColor;
  /** Casts and receives the floor shadow when the scene has shadows. Default true. */
  shadow?: boolean;
  /** Fires once the model is in the scene, with its root object. */
  onLoad?: (model: Three.Object3D) => void;
  /** Fires when the file cannot be loaded or parsed. */
  onError?: (error: unknown) => void;
  /** Objects that move with the model, such as a label. */
  children?: React.ReactNode;
}

/**
 * A glTF model. The loader is part of `three` and loads on first use. The ref
 * is a `THREE.Group` that holds the model, there before the file arrives,
 * so it can be animated and placed right away.
 *
 * @example
 * <SceneModel src="/models/rover.glb" scale={0.5} onLoad={(m) => console.log(m)} />
 */
const SceneModel = forwardRef<Three.Group, SceneModelProps>(
  (
    {
      src,
      color,
      shadow = true,
      onLoad,
      onError,
      children,
      onClick,
      onPointerEnter,
      onPointerLeave,
      ...transform
    },
    ref,
  ) => {
    const { three, loadModel, invalidate, color: resolve } = useScene();
    const [holder] = useState(() => new three.Group());
    const [model, setModel] = useState<Three.Object3D | null>(null);
    useImperativeHandle(ref, () => holder, [holder]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: reload only when the file changes
    useEffect(() => {
      let cancelled = false;
      let loaded: Three.Object3D | null = null;
      loadModel(src).then(
        (object) => {
          if (cancelled) return;
          loaded = object;
          holder.add(object);
          setModel(object);
          invalidate();
          onLoad?.(object);
        },
        (error) => {
          if (cancelled) return;
          console.warn(`[@once-ui-system/core] <SceneModel /> could not load ${src}:`, error);
          onError?.(error);
        },
      );
      return () => {
        cancelled = true;
        if (loaded) holder.remove(loaded);
        setModel(null);
        invalidate();
      };
    }, [src, holder, loadModel, invalidate]);

    useEffect(() => {
      if (!model) return;
      const tint = color ? resolve(color).color : null;
      model.traverse((object) => {
        const mesh = object as Three.Mesh;
        if (!mesh.isMesh) return;
        mesh.userData.castShadow = shadow;
        mesh.userData.receiveShadow = shadow;
        mesh.castShadow = shadow;
        mesh.receiveShadow = shadow;
        if (!tint) return;
        // Clones share materials with the cached original: tint a copy.
        if (!mesh.userData.onceUiTinted) {
          mesh.material = Array.isArray(mesh.material)
            ? mesh.material.map((m) => m.clone())
            : mesh.material.clone();
          mesh.userData.onceUiTinted = true;
        }
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          const standard = material as Three.MeshStandardMaterial;
          standard.color?.copy(tint);
        }
      });
      invalidate();
    }, [model, color, resolve, shadow, invalidate]);

    useSceneObject(holder, transform, { onClick, onPointerEnter, onPointerLeave });
    return children ? (
      <SceneParentContext.Provider value={holder}>{children}</SceneParentContext.Provider>
    ) : null;
  },
);

SceneModel.displayName = "SceneModel";

export { SceneModel };
