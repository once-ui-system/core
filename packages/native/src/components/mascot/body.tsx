/**
 * The mascot's body: its outline and the layers of light on it. `Mascot`
 * draws it with its face; the cube mode (`MascotCube`) draws the same body as
 * the blob end of its morph, so the two read as one character.
 */
import {
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { mixColors } from "../../theme/colorScheme";
import type { MascotLook } from "../Mascot";

/** How much of each layer shows, per surface (Mascot.module.scss). */
export const SURFACE = {
  glossy: { light: 1, shade: 1, rim: 1, spec: 0.32 },
  matte: { light: 0.45, shade: 1, rim: 0, spec: 0 },
  flat: { light: 0, shade: 0, rim: 0, spec: 0 },
  glass: { light: 1, shade: 0.5, rim: 1, spec: 0.6 },
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const n = (value: number) => Number(value.toFixed(2));

/** A superellipse around (100, 104): exponent 2 is a circle, higher is squarer. */
export function bodyShape(roundness: number, aspect: number) {
  const exponent = 2 + (1 - clamp(roundness, 0, 1)) * 4;
  const scale = clamp(aspect, 0.6, 1.6);
  const a = scale >= 1 ? 82 : 82 * scale;
  const b = scale >= 1 ? 78 / scale : 78;
  const points: string[] = [];
  for (let i = 0; i < 72; i++) {
    const t = (i / 72) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = 100 + a * Math.sign(c) * Math.abs(c) ** (2 / exponent);
    const y = 104 + b * Math.sign(s) * Math.abs(s) ** (2 / exponent);
    points.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return { d: `M${points.join("L")}Z`, top: 104 - b, bottom: 104 + b, halfWidth: a };
}

/** The gradients and clip the body's layers use; put them once in the drawing's `Defs`. */
export function BodyDefs({ id, d }: { id: string; d: string }) {
  return (
    <Defs>
      <RadialGradient id={`${id}-light`} cx="34%" cy="26%" r="62%">
        <Stop offset="0%" stopColor="#fff" stopOpacity={0.5} />
        <Stop offset="100%" stopColor="#fff" stopOpacity={0} />
      </RadialGradient>
      <RadialGradient id={`${id}-shade`} cx="44%" cy="38%" r="70%">
        <Stop offset="55%" stopColor="#000" stopOpacity={0} />
        <Stop offset="100%" stopColor="#000" stopOpacity={0.42} />
      </RadialGradient>
      <LinearGradient id={`${id}-rim`} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="72%" stopColor="#fff" stopOpacity={0} />
        <Stop offset="100%" stopColor="#fff" stopOpacity={0.22} />
      </LinearGradient>
      <ClipPath id={`${id}-clip`}>
        <Path d={d} />
      </ClipPath>
    </Defs>
  );
}

/** The filled outline with its shade, rim, light and highlight, the light moving against the gaze. */
export function BodyLayers({
  id,
  d,
  top,
  body,
  surface,
  lookX,
  lookY,
}: {
  id: string;
  d: string;
  top: number;
  body: string;
  surface: NonNullable<MascotLook["surface"]>;
  lookX: number;
  lookY: number;
}) {
  const glass = surface === "glass";
  const layers = SURFACE[surface];
  return (
    <>
      <Path d={d} fill={glass ? mixColors(body, "transparent", 0.45) : body} />
      <G clipPath={`url(#${id}-clip)`}>
        <Path d={d} fill={`url(#${id}-shade)`} opacity={layers.shade} />
        <Path d={d} fill={`url(#${id}-rim)`} opacity={layers.rim} />
        <G transform={`translate(${n(lookX * -9)} ${n(lookY * -7)})`}>
          <Path d={d} fill={`url(#${id}-light)`} opacity={layers.light} />
          <Ellipse cx={70} cy={top + 26} rx={20} ry={11} fill="#fff" opacity={layers.spec} />
        </G>
      </G>
      {glass && (
        <Path
          d={d}
          fill="none"
          stroke={mixColors(body, "#ffffff", 0.4)}
          strokeOpacity={0.6}
          strokeWidth={2}
        />
      )}
    </>
  );
}
