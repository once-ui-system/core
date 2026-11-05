import { useId, useRef } from "react";
import { View } from "react-native";
import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";
import { mixColors, toHex } from "../theme/colorScheme";
import { useTheme } from "../theme/ThemeProvider";
import { flexStyle } from "./Flex";
import type { MascotLook, MascotProps } from "./Mascot";
import { BodyDefs, BodyLayers, bodyShape } from "./mascot/body";
import { clamp } from "./mascot/cube/math";
import { type CubeInput, CubeMotion } from "./mascot/cube/state";
import {
  type CubeEyes,
  type CubeLook,
  cubeScene,
  cubeSides,
  hexToRGB,
  mixRGB,
} from "./mascot/cube/view";
import { mascotLook, SCHEMES, SIZE, STATE_LABEL } from "./mascot/look";
import { useFrameTime, useReduceMotion } from "./motion";

/** The look the cube mascot starts from, before a seed or props: core's `CUBE_LOOK`. */
export const CUBE_LOOK: Required<Omit<MascotLook, "bodyPath" | "eyeColor">> = {
  color: "brand",
  roundness: 0.75,
  aspect: 1.12,
  surface: "glossy",
  eyes: "round",
  eyeSize: 1,
  eyeSpacing: 1,
  eyeHeight: 0,
  mouth: "smile",
  brows: true,
  cheeks: false,
  personality: "default",
  face: "3d",
  sides: "classic",
};

const n = (value: number) => Number(value.toFixed(2));

/**
 * The mascot behind `working="cube"`: core's `MascotCube`, drawn with
 * react-native-svg instead of WebGL. At rest it is the flat mascot's body with
 * the cube mode's face; while it thinks the body firms into the 2 × 2 Once UI
 * cube and turns its layers, and when it stops it solves the cube, shows the
 * logo for a beat and softens back. The timeline is core's (`cube/state.ts`),
 * stepped from the frame clock; with reduce motion the cube holds still and
 * the morphs are quick.
 */
export function MascotCube({
  state = "idle",
  mood = "neutral",
  seed,
  color,
  roundness,
  aspect,
  bodyPath: _bodyPath,
  surface,
  eyes,
  eyeSize,
  eyeSpacing,
  eyeHeight,
  eyeColor,
  mouth,
  brows,
  cheeks,
  personality,
  sides,
  face,
  accessory: _accessory,
  lookAt = "pointer",
  level,
  size = "l",
  "aria-label": ariaLabel,
  ...flex
}: Omit<MascotProps, "working">) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const id = `c${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { style, rest, userStyle, hidden } = flexStyle(theme, { center: true, ...flex });

  // Seeded look, then the props that were passed.
  const passed = Object.fromEntries(
    Object.entries({
      color,
      roundness,
      aspect,
      surface,
      eyes,
      eyeSize,
      eyeSpacing,
      eyeHeight,
      mouth,
      brows,
      cheeks,
      personality,
      sides,
      face,
    }).filter(([, value]) => value !== undefined),
  );
  const look = {
    ...CUBE_LOOK,
    ...(seed !== undefined ? mascotLook(seed) : {}),
    ...passed,
  } as typeof CUBE_LOOK;

  const scheme = String(look.color);
  const body = SCHEMES.has(scheme) ? theme.color(`function-${scheme}-500`) : toHex(scheme);
  const rgb = hexToRGB(body);
  const cubeLook: CubeLook = {
    color: rgb,
    sides: cubeSides(look.sides, rgb, (css) => hexToRGB(toHex(css))),
    eyeColor: eyeColor ? hexToRGB(toHex(eyeColor)) : mixRGB([0.05, 0.055, 0.07], rgb, 0.12),
    roundness: look.roundness,
    aspect: look.aspect,
    eyes: typeof look.eyes === "object" ? "round" : (look.eyes as CubeEyes),
    eyeSize: look.eyeSize,
    eyeSpacing: look.eyeSpacing,
    eyeHeight: look.eyeHeight,
    brows: look.brows,
    mouth: look.mouth !== "none",
    cheeks: look.cheeks,
    face: look.face,
    surface: look.surface === "flat" ? "solid" : look.surface === "matte" ? "matte" : "glossy",
  };
  const input: CubeInput = {
    state,
    mood,
    lookX: typeof lookAt === "object" ? clamp(lookAt.x, -1, 1) : 0,
    lookY: typeof lookAt === "object" ? clamp(lookAt.y, -1, 1) : 0,
    level: level !== undefined ? clamp(level, 0, 1) : 0,
    reduced: reduceMotion,
    personality: look.personality,
  };

  // The motion keeps its own time, stepped by the frame clock. With reduce motion the clock
  // stops once the cube has settled and turned to rest, and a change of state starts it again.
  const motion = useRef<CubeMotion | null>(null);
  if (!motion.current) motion.current = new CubeMotion();
  const now = motion.current;
  const settled =
    reduceMotion &&
    !now.active &&
    now.hold === 0 &&
    now.celebrate === 0 &&
    (state === "thinking"
      ? now.mode === "thinking" && now.morph === 1
      : now.mode === "idle" && now.morph === 0);
  const last = useRef<number | null>(null);
  const quietSince = useRef(0);
  const time = useFrameTime(
    !reduceMotion || !settled || (last.current ?? 0) - quietSince.current < 2.5,
  );
  const dt = last.current === null ? 0 : Math.min(0.05, Math.max(0, time - last.current));
  last.current = time;
  now.update(dt, input);
  if (!settled) quietSince.current = time;

  if (hidden) return null;

  const px = typeof size === "number" ? size : SIZE[size];
  const scene = cubeScene(now, cubeLook, input);
  const outline = bodyShape(look.roundness, look.aspect);
  const { blob } = scene;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={ariaLabel ?? STATE_LABEL[state]}
      {...rest}
      style={[style, { width: px, height: px, flexShrink: 0 }, userStyle]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 200 200" style={{ overflow: "visible" }}>
        <BodyDefs id={id} d={outline.d} />
        <Ellipse
          cx={100}
          cy={196}
          rx={56}
          ry={5}
          fill={mixColors(body, "#000000", 0.35)}
          opacity={n(0.22 * scene.shadow.opacity)}
          transform={`translate(100 196) scale(${n(scene.shadow.scale)} 1) translate(-100 -196)`}
        />
        {scene.pieces.length > 0 && (
          <G opacity={n(scene.piecesOpacity)}>
            {scene.core && (
              <Circle
                cx={scene.core.cx}
                cy={scene.core.cy}
                r={scene.core.r}
                fill={scene.core.fill}
              />
            )}
            {scene.pieces.map((piece, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: faces are redrawn far to near each frame
              <Path key={i} {...piece} strokeLinejoin="round" />
            ))}
          </G>
        )}
        {blob.opacity > 0.005 && (
          <G
            opacity={n(blob.opacity)}
            transform={`translate(${n(blob.x)} ${n(blob.y)}) scale(${n(blob.sx)} ${n(blob.sy)}) translate(-100 -104)`}
          >
            <BodyLayers
              id={id}
              d={outline.d}
              top={outline.top}
              body={body}
              surface={look.surface}
              lookX={input.lookX}
              lookY={input.lookY}
            />
          </G>
        )}
        {scene.features.length > 0 && (
          <G opacity={n(scene.faceOpacity)}>
            {scene.features.map((feature, i) => (
              <Path
                // biome-ignore lint/suspicious/noArrayIndexKey: the face's features in a fixed order
                key={i}
                d={feature.d}
                fill={feature.fill ?? "none"}
                stroke={feature.stroke}
                strokeWidth={feature.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={feature.opacity}
              />
            ))}
          </G>
        )}
      </Svg>
    </View>
  );
}
