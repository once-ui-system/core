"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Column } from "../../components/Column.js";
import { Icon } from "../../components/Icon.js";
import { Text } from "../../components/Text.js";
import { useElementTheme } from "../../hooks/useElementTheme.js";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import { resolveSceneColor } from "./color.js";
import styles from "./Scene.module.scss";
import {
  SceneContext,
  type SceneContextValue,
  type SceneFrame,
  SceneParentContext,
  type ScenePointerHandlers,
} from "./SceneContext.js";
import type { SceneCamera, SceneColor, SceneControls, SceneLighting } from "./types.js";

export interface SceneLabels {
  /** The scene's accessible name. Describe what it shows. Default "3D view". */
  scene: string;
  /** Shown when WebGL is off or the scene fails to start. */
  unavailable: string;
}

const DEFAULT_LABELS: SceneLabels = {
  scene: "3D view",
  unavailable: "The 3D view could not load in this browser.",
};

export interface SceneProps
  extends Omit<React.ComponentProps<typeof Column>, "children" | "onClick" | "onChange"> {
  /** Where the camera starts and what it looks at. Changing it moves the camera. */
  camera?: SceneCamera;
  /** How people move the camera. Default `"orbit"`. */
  controls?: SceneControls;
  /** Turns per minute for `controls="turntable"`. Default 4. */
  autoRotateSpeed?: number;
  /** Scroll and pinch zoom. Default true for `"orbit"`, false otherwise, so the page scrolls past the scene. */
  zoom?: boolean;
  /** The light rig. Default `"studio"`. */
  lighting?: SceneLighting;
  /**
   * What the scene stands on: `"shadow"` catches the key light's soft shadow
   * on an invisible floor, `"grid"` adds a neutral grid under it. Default
   * false (nothing).
   */
  floor?: boolean | "shadow" | "grid";
  /** Meshes cast and receive shadows. Default true when there is a floor. */
  shadows?: boolean;
  /** The sharpest the canvas renders, as a device-pixel ratio. Default 2. */
  maxPixelRatio?: number;
  /** The scene once three.js started, for anything the components do not cover. */
  onSceneLoad?: (context: SceneContextValue) => void;
  labels?: Partial<SceneLabels>;
  /** Meshes, groups, models and labels. */
  children?: React.ReactNode;
}

const DEFAULT_POSITION = [4, 3, 5] as const;
const DEFAULT_TARGET = [0, 0.5, 0] as const;
const THEME_ATTRIBUTES = [
  "data-theme",
  "data-brand",
  "data-accent",
  "data-neutral",
  "data-solid",
  "data-solid-style",
  "data-surface",
];

function toColor(rgba: { r: number; g: number; b: number }) {
  return new THREE.Color().setRGB(rgba.r, rgba.g, rgba.b, THREE.SRGBColorSpace);
}

function disposeTree(root: THREE.Object3D) {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose?.();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) for (const m of material) m.dispose();
    else material?.dispose?.();
  });
}

interface Engine {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls | null;
  /** The point the camera looks at and orbits around. */
  target: THREE.Vector3;
  invalidate: () => void;
  onFrame: SceneContextValue["onFrame"];
  addPickable: SceneContextValue["addPickable"];
  loadModel: SceneContextValue["loadModel"];
  setLooping: (options: { visible?: boolean; reduced?: boolean }) => void;
  lights: {
    hemisphere: THREE.HemisphereLight;
    key: THREE.DirectionalLight;
    rim: THREE.PointLight;
  };
  floor: { shadow: THREE.Mesh; grid: THREE.GridHelper | null };
  dispose: () => void;
}

const SceneImpl = ({
  camera: cameraProp,
  controls = "orbit",
  autoRotateSpeed = 4,
  zoom,
  lighting = "studio",
  floor = false,
  shadows,
  maxPixelRatio = 2,
  onSceneLoad,
  labels: labelsProp,
  children,
  className,
  ...flex
}: SceneProps) => {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const container = useRef<HTMLDivElement>(null);
  const theme = useElementTheme(container);
  const { prefersReducedMotion } = useReducedMotion();
  const [engine, setEngine] = useState<Engine | null>(null);
  const [failed, setFailed] = useState(false);
  const [themeVersion, setThemeVersion] = useState(0);
  const floorMode = floor === true ? "shadow" : floor || null;
  const castShadows = shadows ?? floorMode !== null;
  const latest = useRef({ onSceneLoad });
  latest.current = { onSceneLoad };

  // The renderer, scene, camera and loop: created once. Props reach them
  // through the effects below, never through a new WebGL context.
  // biome-ignore lint/correctness/useExhaustiveDependencies: created once; later prop changes go through the effects below
  useEffect(() => {
    const host = container.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (error) {
      console.warn("[@once-ui-system/core] <Scene /> could not start:", error);
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const canvas = renderer.domElement;
    canvas.className = styles.canvas;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", labels.scene);
    host.prepend(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(cameraProp?.fov ?? 40, 1, 0.05, 500);
    camera.position.set(...(cameraProp?.position ?? DEFAULT_POSITION));
    const target = new THREE.Vector3(...(cameraProp?.target ?? DEFAULT_TARGET));
    camera.lookAt(target);

    // Lights: one rig, switched and recoloured by the effects below.
    const hemisphere = new THREE.HemisphereLight(0xffffff, 0x444444, 1.6);
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(4, 8, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -6;
    key.shadow.camera.right = 6;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -6;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 30;
    key.shadow.radius = 6;
    key.shadow.bias = -0.0005;
    const rim = new THREE.PointLight(0xffffff, 18, 20, 2);
    rim.position.set(-4, 3, -3);
    scene.add(hemisphere, key, rim);

    const shadowFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.ShadowMaterial({ opacity: 0.2 }),
    );
    shadowFloor.rotation.x = -Math.PI / 2;
    shadowFloor.receiveShadow = true;
    shadowFloor.userData.onceUiHelper = true;
    scene.add(shadowFloor);

    let controlsInstance: OrbitControls | null = null;

    // The loop. It draws on demand (`invalidate`) and runs continuously only
    // while something animates: a frame callback, the turntable, or damping
    // settling after a drag. Off screen or in a hidden tab it stops.
    const frameCallbacks = new Set<(frame: SceneFrame) => void>();
    let frameId = 0;
    let dirty = true;
    let visible = false;
    let reduced = false;
    let settling = false;
    let last = performance.now();
    let elapsed = 0;

    const live = () => visible && document.visibilityState !== "hidden";
    const animating = () =>
      !reduced && (frameCallbacks.size > 0 || (controlsInstance?.autoRotate ?? false) || settling);

    const tick = (now: number) => {
      frameId = 0;
      const delta = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!reduced) elapsed += delta;
      settling = controlsInstance ? controlsInstance.update(reduced ? 0 : delta) : false;
      const frame = { delta: reduced ? 0 : delta, elapsed };
      for (const callback of frameCallbacks) callback(frame);
      renderer.render(scene, camera);
      host.dispatchEvent(new Event("once-scene-render"));
      dirty = false;
      if (live() && animating()) schedule();
    };
    const schedule = () => {
      if (frameId || !live()) return;
      last = Math.min(last, performance.now());
      frameId = requestAnimationFrame(tick);
    };
    const invalidate = () => {
      dirty = true;
      schedule();
    };
    const setLooping = (options: { visible?: boolean; reduced?: boolean }) => {
      if (options.visible !== undefined) visible = options.visible;
      if (options.reduced !== undefined) reduced = options.reduced;
      if (live() && (dirty || animating())) {
        last = performance.now();
        schedule();
      }
    };

    const onFrame: SceneContextValue["onFrame"] = (callback) => {
      frameCallbacks.add(callback);
      invalidate();
      return () => {
        frameCallbacks.delete(callback);
      };
    };

    // Picking: a click is a press and release within a few pixels.
    const pickables = new Map<THREE.Object3D, ScenePointerHandlers>();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered: THREE.Object3D | null = null;
    let down: { x: number; y: number } | null = null;

    const pick = (event: PointerEvent): THREE.Object3D | null => {
      if (pickables.size === 0) return null;
      const rect = canvas.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects([...pickables.keys()], true);
      for (const hit of hits) {
        for (let node: THREE.Object3D | null = hit.object; node; node = node.parent) {
          if (pickables.has(node)) return node;
        }
      }
      return null;
    };
    const onPointerDown = (event: PointerEvent) => {
      down = { x: event.clientX, y: event.clientY };
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!down) return;
      const moved = Math.hypot(event.clientX - down.x, event.clientY - down.y);
      down = null;
      if (moved > 5) return;
      const target = pick(event);
      if (target) pickables.get(target)?.onClick?.();
    };
    const onPointerMove = (event: PointerEvent) => {
      if (pickables.size === 0 || event.buttons) return;
      const target = pick(event);
      if (target === hovered) return;
      if (hovered) pickables.get(hovered)?.onPointerLeave?.();
      hovered = target;
      if (target) pickables.get(target)?.onPointerEnter?.();
      const handlers = target ? pickables.get(target) : null;
      canvas.style.cursor = handlers?.onClick ? "pointer" : "";
    };
    const onPointerLeave = () => {
      if (hovered) pickables.get(hovered)?.onPointerLeave?.();
      hovered = null;
      canvas.style.cursor = "";
    };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    const addPickable: SceneContextValue["addPickable"] = (object, handlers) => {
      pickables.set(object, handlers);
      return () => {
        pickables.delete(object);
        if (hovered === object) {
          hovered = null;
          canvas.style.cursor = "";
        }
      };
    };

    // Models: loaded once per URL, cloned per use.
    const models = new Map<string, Promise<THREE.Object3D>>();
    const loadModel: SceneContextValue["loadModel"] = (src) => {
      let pending = models.get(src);
      if (!pending) {
        pending = import("three/addons/loaders/GLTFLoader.js").then(
          ({ GLTFLoader }) =>
            new Promise<THREE.Object3D>((resolve, reject) => {
              new GLTFLoader().load(src, (gltf) => resolve(gltf.scene), undefined, reject);
            }),
        );
        models.set(src, pending);
        pending.catch(() => models.delete(src));
      }
      return pending.then((model) => model.clone(true));
    };

    // Size: follows the frame; the canvas never sets the layout.
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      invalidate();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const viewObserver = new IntersectionObserver(([entry]) =>
      setLooping({ visible: entry.isIntersecting }),
    );
    viewObserver.observe(host);
    const onVisibility = () => setLooping({});
    document.addEventListener("visibilitychange", onVisibility);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      setFailed(true);
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    const instance: Engine = {
      renderer,
      scene,
      camera,
      get controls() {
        return controlsInstance;
      },
      set controls(value) {
        controlsInstance = value;
      },
      target,
      invalidate,
      onFrame,
      addPickable,
      loadModel,
      setLooping,
      lights: { hemisphere, key, rim },
      floor: { shadow: shadowFloor, grid: null },
      dispose: () => {
        if (frameId) cancelAnimationFrame(frameId);
        resizeObserver.disconnect();
        viewObserver.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerleave", onPointerLeave);
        canvas.removeEventListener("webglcontextlost", onContextLost);
        controlsInstance?.dispose();
        disposeTree(scene);
        renderer.dispose();
        canvas.remove();
      },
    };
    setEngine(instance);
    return () => {
      setEngine(null);
      instance.dispose();
    };
  }, []);

  // Reduced motion: stops the turntable and per-frame animation.
  useEffect(() => {
    engine?.setLooping({ reduced: prefersReducedMotion });
  }, [engine, prefersReducedMotion]);

  // Controls: rebuilt when the mode or zoom changes.
  useEffect(() => {
    if (!engine) return;
    const target = engine.target;
    if (controls === "none") {
      engine.camera.lookAt(target);
      engine.invalidate();
      return;
    }
    const orbit = new OrbitControls(engine.camera, engine.renderer.domElement);
    orbit.target.copy(target);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.08;
    orbit.enablePan = controls === "orbit";
    orbit.enableZoom = zoom ?? controls === "orbit";
    orbit.minDistance = 0.5;
    orbit.maxDistance = 60;
    orbit.maxPolarAngle = Math.PI * 0.495;
    orbit.autoRotate = controls === "turntable";
    // With a frame delta, OrbitControls turns `autoRotateSpeed` times a minute.
    orbit.autoRotateSpeed = autoRotateSpeed;
    orbit.listenToKeyEvents(engine.renderer.domElement);
    orbit.addEventListener("change", engine.invalidate);
    orbit.update();
    engine.controls = orbit;
    engine.renderer.domElement.tabIndex = 0;
    engine.setLooping({});
    engine.invalidate();
    return () => {
      orbit.removeEventListener("change", engine.invalidate);
      orbit.dispose();
      engine.controls = null;
      engine.renderer.domElement.removeAttribute("tabindex");
    };
  }, [engine, controls, zoom, autoRotateSpeed]);

  // Camera prop: moves the camera when its value changes.
  const cameraKey = JSON.stringify(cameraProp ?? null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: compared by value through cameraKey
  useEffect(() => {
    if (!engine || !cameraProp) return;
    const target = engine.target;
    if (cameraProp.position) engine.camera.position.set(...cameraProp.position);
    if (cameraProp.target) target.set(...cameraProp.target);
    if (cameraProp.fov) {
      engine.camera.fov = cameraProp.fov;
      engine.camera.updateProjectionMatrix();
    }
    engine.controls?.target.copy(target);
    engine.camera.lookAt(target);
    engine.controls?.update();
    engine.invalidate();
  }, [engine, cameraKey]);

  // Theme: any data-theme, brand, accent or neutral change above the scene.
  useEffect(() => {
    const host = container.current;
    if (!host) return;
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.target instanceof Element && m.target.contains(host))) {
        setThemeVersion((version) => version + 1);
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: THEME_ATTRIBUTES,
    });
    return () => observer.disconnect();
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new function per theme makes consumers re-read tokens
  const color = useMemo<SceneContextValue["color"]>(
    () => (value: SceneColor) => {
      const rgba = resolveSceneColor(value, container.current);
      return { color: toColor(rgba), alpha: rgba.a };
    },
    [theme, themeVersion],
  );

  // Lights and floor: switched by props, recoloured with the theme.
  useEffect(() => {
    if (!engine) return;
    const { hemisphere, key, rim } = engine.lights;
    const on = lighting !== "none";
    hemisphere.visible = on;
    key.visible = on;
    rim.visible = lighting === "studio";
    hemisphere.color = new THREE.Color(0xffffff);
    hemisphere.groundColor = color("--neutral-background-strong").color;
    hemisphere.intensity = theme === "dark" ? 1.3 : 1.7;
    rim.color = color("brand-medium").color;
    key.castShadow = castShadows;

    const shadow = engine.floor.shadow;
    shadow.visible = floorMode !== null;
    (shadow.material as THREE.ShadowMaterial).opacity = theme === "dark" ? 0.5 : 0.16;
    // A shadow is an absence of light: black, deeper on a dark page.
    (shadow.material as THREE.ShadowMaterial).color = new THREE.Color(0x000000);

    if (engine.floor.grid) {
      engine.scene.remove(engine.floor.grid);
      engine.floor.grid.dispose();
      engine.floor.grid = null;
    }
    if (floorMode === "grid") {
      const grid = new THREE.GridHelper(
        12,
        24,
        color("--neutral-border-strong").color,
        color("--neutral-border-medium").color,
      );
      grid.userData.onceUiHelper = true;
      grid.position.y = 0.001;
      engine.scene.add(grid);
      engine.floor.grid = grid;
    }
    engine.scene.traverse((object) => {
      if (object.userData.onceUiHelper) return;
      if ((object as THREE.Mesh).isMesh) {
        object.castShadow = castShadows && object.userData.castShadow !== false;
        object.receiveShadow = castShadows && object.userData.receiveShadow !== false;
      }
    });
    engine.invalidate();
  }, [engine, lighting, floorMode, castShadows, color, theme]);

  useEffect(() => {
    engine?.renderer.domElement.setAttribute("aria-label", labels.scene);
  }, [engine, labels.scene]);

  const context = useMemo<SceneContextValue | null>(
    () =>
      engine && container.current
        ? {
            three: THREE,
            scene: engine.scene,
            camera: engine.camera,
            renderer: engine.renderer,
            container: container.current,
            invalidate: engine.invalidate,
            color,
            themeVersion,
            theme,
            reducedMotion: prefersReducedMotion,
            onFrame: engine.onFrame,
            addPickable: engine.addPickable,
            loadModel: engine.loadModel,
          }
        : null,
    [engine, color, themeVersion, theme, prefersReducedMotion],
  );

  const loaded = useRef(false);
  useEffect(() => {
    if (!context || loaded.current) return;
    loaded.current = true;
    latest.current.onSceneLoad?.(context);
  }, [context]);

  return (
    <Column
      fillWidth
      radius="l"
      overflow="hidden"
      border="neutral-alpha-weak"
      background="neutral-alpha-weak"
      position="relative"
      className={[styles.scene, className].filter(Boolean).join(" ")}
      {...flex}
    >
      <div ref={container} className={styles.stage} data-scene-shadows={castShadows || undefined}>
        {failed && (
          <Column fill center gap="8" padding="24" className={styles.fallback}>
            <Icon name="cube" onBackground="neutral-weak" />
            <Text textVariant="body-default-s" onBackground="neutral-weak" align="center">
              {labels.unavailable}
            </Text>
          </Column>
        )}
        {context && !failed && (
          <SceneContext.Provider value={context}>
            <SceneParentContext.Provider value={context.scene}>
              {children}
            </SceneParentContext.Provider>
          </SceneContext.Provider>
        )}
      </div>
    </Column>
  );
};

SceneImpl.displayName = "Scene";

export default SceneImpl;
