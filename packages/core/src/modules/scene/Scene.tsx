"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Column } from "../../components/Column.js";
import { MissingDependency } from "../../utils/MissingDependency.js";
import type { SceneProps } from "./Scene.impl.js";

const SceneImpl = React.lazy<React.ComponentType<SceneProps>>(() =>
  import("./Scene.impl.js").catch(() => {
    console.warn(
      '[@once-ui-system/core] <Scene /> requires the "three" package. Install it with: npm install three',
    );
    return {
      default: () => <MissingDependency component="Scene" packageName="three" />,
    };
  }),
);

/**
 * The frame the scene draws into, on the server and until three.js loads,
 * so the page does not shift when the canvas arrives.
 */
const SceneFrame = ({
  camera: _camera,
  controls: _controls,
  autoRotateSpeed: _autoRotateSpeed,
  lighting: _lighting,
  floor: _floor,
  shadows: _shadows,
  zoom: _zoom,
  maxPixelRatio: _maxPixelRatio,
  onSceneLoad: _onSceneLoad,
  labels,
  children: _children,
  ...flex
}: SceneProps) => (
  <Column
    fillWidth
    minHeight={256}
    radius="l"
    overflow="hidden"
    border="neutral-alpha-weak"
    background="neutral-alpha-weak"
    role="img"
    aria-label={labels?.scene ?? "3D view"}
    aria-busy
    {...flex}
  />
);

/**
 * A 3D viewport on three.js that wears the theme: materials and lights take
 * Once UI tokens and follow light and dark, the brand and any `data-theme`
 * around it. It mounts on the client only and `three` is an optional peer
 * that loads when a scene renders. It pauses off screen and in hidden tabs,
 * resizes with its frame, and holds still when motion is reduced.
 *
 * @example
 * <Scene controls="turntable" floor height={24}>
 *   <SceneMesh geometry="box" color="brand-strong" position={[0, 0.5, 0]} />
 * </Scene>
 */
const Scene = (props: SceneProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <SceneFrame {...props} />;
  return (
    <Suspense fallback={<SceneFrame {...props} />}>
      <SceneImpl {...props} />
    </Suspense>
  );
};

Scene.displayName = "Scene";

export type { SceneLabels, SceneProps } from "./Scene.impl.js";
export { Scene };
