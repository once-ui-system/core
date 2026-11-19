"use client";

import type React from "react";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import type * as Three from "three";
import { SceneParentContext, useScene } from "./SceneContext.js";
import { type ScenePointerProps, type SceneTransformProps, useSceneObject } from "./SceneObject.js";
import type { SceneColor, SceneGeometry } from "./types.js";

export interface SceneMeshProps extends SceneTransformProps, ScenePointerProps {
  /** The shape. Default `"box"`. */
  geometry?: SceneGeometry;
  /**
   * The shape's size, in three.js constructor order:
   * box `[width, height, depth]`, sphere `[radius]`, cylinder
   * `[radiusTop, radiusBottom, height]`, cone `[radius, height]`, capsule
   * `[radius, length]`, torus `[radius, tube]`, plane `[width, height]`,
   * circle `[radius]`, ring `[innerRadius, outerRadius]`. Smoothness is set
   * for you.
   */
  args?: readonly number[];
  /** Default `"neutral-medium"`. A token follows the theme. */
  color?: SceneColor;
  /** A glow colour that ignores the lights: visors, status lights, screens. */
  emissive?: SceneColor;
  /** How strongly `emissive` glows. Default 1 when `emissive` is set. */
  emissiveIntensity?: number;
  /** 0 is plastic, 1 is bare metal. Default 0.1. */
  metalness?: number;
  /** 0 is mirror-smooth, 1 is chalk. Default 0.5. */
  roughness?: number;
  /** Below 1 makes it see-through. Default 1. */
  opacity?: number;
  /** Draws the edges only. Default false. */
  wireframe?: boolean;
  /** Casts and receives the floor shadow when the scene has shadows. Default true. */
  shadow?: boolean;
  /** Objects that move with this one. */
  children?: React.ReactNode;
}

function buildGeometry(three: typeof import("three"), shape: SceneGeometry, args: number[]) {
  const [a, b, c] = args;
  switch (shape) {
    case "sphere":
      return new three.SphereGeometry(a ?? 0.5, 48, 32);
    case "cylinder":
      return new three.CylinderGeometry(a ?? 0.5, b ?? a ?? 0.5, c ?? 1, 48);
    case "cone":
      return new three.ConeGeometry(a ?? 0.5, b ?? 1, 48);
    case "capsule":
      return new three.CapsuleGeometry(a ?? 0.3, b ?? 0.6, 8, 24);
    case "torus":
      return new three.TorusGeometry(a ?? 0.5, b ?? 0.15, 24, 64);
    case "plane":
      return new three.PlaneGeometry(a ?? 1, b ?? a ?? 1);
    case "circle":
      return new three.CircleGeometry(a ?? 0.5, 64);
    case "ring":
      return new three.RingGeometry(a ?? 0.4, b ?? 0.5, 64);
    default:
      return new three.BoxGeometry(a ?? 1, b ?? a ?? 1, c ?? a ?? 1);
  }
}

/**
 * A primitive shape with a material in theme colours: `color="brand-strong"`
 * repaints itself when the theme or brand changes. The ref is the
 * `THREE.Mesh`, for animating it in `useSceneFrame`.
 *
 * @example
 * <SceneMesh geometry="sphere" args={[0.4]} color="accent-strong" position={[0, 0.4, 0]} />
 */
const SceneMesh = forwardRef<Three.Mesh, SceneMeshProps>(
  (
    {
      geometry = "box",
      args,
      color = "neutral-medium",
      emissive,
      emissiveIntensity,
      metalness = 0.1,
      roughness = 0.5,
      opacity = 1,
      wireframe = false,
      shadow = true,
      children,
      onClick,
      onPointerEnter,
      onPointerLeave,
      ...transform
    },
    ref,
  ) => {
    const { three, color: resolve, invalidate, scene } = useScene();
    const argsKey = (args ?? []).join(",");
    // biome-ignore lint/correctness/useExhaustiveDependencies: args compared by value through argsKey
    const shape = useMemo(
      () => buildGeometry(three, geometry, [...(args ?? [])]),
      [three, geometry, argsKey],
    );
    const [material] = useState(() => new three.MeshStandardMaterial());
    const [mesh] = useState(() => new three.Mesh(shape, material));
    useImperativeHandle(ref, () => mesh, [mesh]);

    useEffect(() => {
      const previous = mesh.geometry;
      mesh.geometry = shape;
      invalidate();
      if (previous !== shape) previous.dispose();
    }, [mesh, shape, invalidate]);

    useEffect(
      () => () => {
        mesh.geometry.dispose();
        material.dispose();
      },
      [mesh, material],
    );

    useEffect(() => {
      const base = resolve(color);
      material.color.copy(base.color);
      if (emissive) {
        material.emissive.copy(resolve(emissive).color);
        material.emissiveIntensity = emissiveIntensity ?? 1;
      } else {
        material.emissive.setRGB(0, 0, 0);
        material.emissiveIntensity = emissiveIntensity ?? 0;
      }
      material.metalness = metalness;
      material.roughness = roughness;
      const alpha = opacity * base.alpha;
      material.opacity = alpha;
      material.transparent = alpha < 1;
      material.wireframe = wireframe;
      material.needsUpdate = true;
      invalidate();
    }, [
      material,
      resolve,
      color,
      emissive,
      emissiveIntensity,
      metalness,
      roughness,
      opacity,
      wireframe,
      invalidate,
    ]);

    // The scene decides whether shadows are on; this says whether this mesh takes part.
    useEffect(() => {
      mesh.userData.castShadow = shadow;
      mesh.userData.receiveShadow = shadow;
      const on = Boolean(
        scene.children.some(
          (child) =>
            (child as Three.DirectionalLight).isDirectionalLight &&
            (child as Three.DirectionalLight).castShadow,
        ),
      );
      mesh.castShadow = shadow && on;
      mesh.receiveShadow = shadow && on;
      invalidate();
    }, [mesh, shadow, scene, invalidate]);

    useSceneObject(mesh, transform, { onClick, onPointerEnter, onPointerLeave });
    return children ? (
      <SceneParentContext.Provider value={mesh}>{children}</SceneParentContext.Provider>
    ) : null;
  },
);

SceneMesh.displayName = "SceneMesh";

export { SceneMesh };
