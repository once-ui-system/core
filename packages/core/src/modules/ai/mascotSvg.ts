/**
 * `mascotSvg`: the mascot as a still SVG string, drawn without React or CSS.
 *
 * The animated `Mascot` is a client component: its look comes from CSS
 * variables and `color-mix()`, and its expressions from CSS transforms. Open
 * Graph images, emails and favicons have none of that, so this draws the same
 * geometry with every color and pose written out. It shares its shapes with
 * `Mascot` (`mascotShape.ts`), so a product's mascot looks the same in its app
 * and in a link preview.
 */
import { mixColors, parseColor } from "../../utils/colorMath.js";
import type { MascotLook, MascotMood } from "./Mascot.js";
import { type MascotIdentityLayer, mascotIdentity } from "./mascotIdentities.js";
import { bodyShape, clamp, DEFAULT_LOOK, EYE_BOX, mascotLook, TILE } from "./mascotShape.js";

export interface MascotSvgOptions extends MascotLook {
  /** A string or number that picks a whole look, as on `Mascot`. Options you pass win over it. */
  seed?: string | number;
  /** Whether a seed that names a canonical mascot draws it, as on `Mascot`. On by default. */
  canonical?: boolean;
  /** The expression. Kawaii moods draw their base mood (`love` is `happy`, with blush). */
  mood?: MascotMood;
  /** SVG markup drawn with the body in its 200 × 200 box: a hat, an antenna. */
  accessory?: string;
  /**
   * The colors `brand`, `accent` and `neutral` stand for. There is no CSS on
   * the server, so a scheme name needs one; without it the mascot is drawn in
   * a neutral blue.
   */
  schemes?: Partial<Record<"brand" | "accent" | "neutral", string>>;
  /** Where the eyes look, each from -1 to 1. Ahead by default. */
  lookAt?: { x: number; y: number };
  /** The soft shadow under it. On by default. */
  shadow?: boolean;
  /** Width and height attributes, in pixels. 200 by default. */
  size?: number;
  /** Read by screen readers when the SVG is inlined. */
  title?: string;
}

type Lid = { lt?: number; lb?: number; tilt?: number; scale?: number; flip?: boolean };
type Pose = { left: Lid; right: Lid; gy?: number; rotate?: number };

/* The same lids, tilts and turns as the `data-mood` rules in Mascot.module.scss. */
const POSES: Record<string, Pose> = {
  neutral: { left: {}, right: {} },
  happy: { left: { lb: 0.38, flip: true }, right: { lb: 0.38, flip: true } },
  surprised: { left: { scale: 1.3 }, right: { scale: 1.3 } },
  sad: { left: { lt: 0.32, tilt: -16 }, right: { lt: 0.32, tilt: 16 }, gy: 0.45 },
  determined: { left: { lt: 0.3, tilt: 18 }, right: { lt: 0.3, tilt: -18 } },
  focused: { left: { lt: 0.3, lb: 0.14 }, right: { lt: 0.3, lb: 0.14 } },
  skeptical: { left: { lt: 0.45 }, right: { scale: 1.12 } },
  wink: { left: { lt: 0.44, lb: 0.44 }, right: { lb: 0.34, flip: true }, rotate: -4 },
};

/* Kawaii moods drawn as their base mood; the ones that blush keep the blush. */
const KAWAII_BASE: Record<string, { base: string; blush?: boolean }> = {
  love: { base: "happy", blush: true },
  excited: { base: "surprised" },
  laughing: { base: "happy", blush: true },
  embarrassed: { base: "happy", blush: true },
  crying: { base: "sad" },
  angry: { base: "determined" },
  confused: { base: "skeptical" },
};

const FALLBACK = "#5b7cfa";
const n = (value: number) => Number(value.toFixed(2));

function escapeText(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* A short, stable id from the options, so two inlined mascots never share defs. */
function idFor(input: string) {
  let h = 2166136261;
  for (const char of input) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return `m${(h >>> 0).toString(36)}`;
}

function mouthPath(kind: MascotLook["mouth"], mood: string, ink: string) {
  if (kind === "none") return "";
  if (kind === "dot") {
    const r = mood === "surprised" ? 6 : 4;
    return `<ellipse cx="0" cy="0" rx="${r}" ry="${n(r * 1.15)}" fill="${ink}"/>`;
  }
  if (mood === "surprised") return `<ellipse cx="0" cy="1" rx="6" ry="7.5" fill="${ink}"/>`;
  const curve =
    mood === "happy" || mood === "wink"
      ? 9
      : mood === "sad"
        ? -6
        : mood === "skeptical" || mood === "determined"
          ? 0
          : kind === "line"
            ? 1
            : 5;
  const tilt = mood === "skeptical" ? 3 : 0;
  return `<path d="M-11 ${n(-tilt - curve / 3)} Q0 ${curve} 11 ${n(tilt - curve / 3)}" fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>`;
}

const attr = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/* A canonical mascot's layers as markup, in the same three places as on `Mascot`. */
function identitySvg(layers: readonly MascotIdentityLayer[], color: string, clip: string) {
  const paint = (value?: string) =>
    value === "body" ? color : value === "shade" ? mixColors(color, "#000000", 0.32) : value;
  const path = (layer: MascotIdentityLayer) => {
    const fill = paint(layer.fill) ?? "none";
    const stroke = paint(layer.stroke);
    return `<path d="${attr(layer.d)}" fill="${attr(fill)}"${
      stroke
        ? ` stroke="${attr(stroke)}" stroke-width="${layer.width ?? 1}" stroke-linecap="${layer.cap ?? "round"}" stroke-linejoin="round"`
        : ""
    }${layer.opacity !== undefined ? ` opacity="${layer.opacity}"` : ""}${
      layer.transform ? ` transform="${attr(layer.transform)}"` : ""
    }/>`;
  };
  const draw = (place: "back" | "on" | "front") => {
    const shapes = layers.filter((layer) => (layer.place ?? "on") === place);
    const clipped = shapes
      .filter((layer) => layer.clip)
      .map(path)
      .join("");
    return (
      (clipped ? `<g clip-path="${clip}">${clipped}</g>` : "") +
      shapes
        .filter((layer) => !layer.clip)
        .map(path)
        .join("")
    );
  };
  return { back: draw("back"), on: draw("on"), front: draw("front") };
}

/**
 * The mascot as a standalone SVG string: same look options as `Mascot`, one
 * still expression. Use it where React can't animate: Open Graph images
 * (`createOgImageRoute` draws the skin's mascot with it), emails, favicons.
 *
 *     mascotSvg({ color: "#10b981", eyes: "round", mouth: "smile", mood: "happy" })
 */
export function mascotSvg(options: MascotSvgOptions = {}): string {
  const {
    seed,
    canonical = true,
    mood = "neutral",
    accessory,
    schemes,
    lookAt,
    shadow = true,
    size = 200,
    title,
    bodyPath,
    eyeColor,
    ...passed
  } = options;
  const defined = Object.fromEntries(
    Object.entries(passed).filter(([, value]) => value !== undefined),
  );
  const identity = canonical ? mascotIdentity(seed) : undefined;
  const seeded = seed !== undefined ? mascotLook(seed, { canonical }) : {};
  const look = {
    ...DEFAULT_LOOK,
    ...seeded,
    ...defined,
  } as typeof DEFAULT_LOOK;

  const scheme = String(look.color);
  const named = schemes?.[scheme as "brand" | "accent" | "neutral"];
  const color =
    scheme === "brand" || scheme === "accent" || scheme === "neutral"
      ? (named ?? FALLBACK)
      : parseColor(scheme)
        ? scheme
        : FALLBACK;
  const seededEyes = passed.color === undefined ? seeded.eyeColor : undefined;
  const ink = eyeColor ?? seededEyes ?? mixColors(color, "#0c0b12", 0.12);
  const kawaii = KAWAII_BASE[mood];
  const base = kawaii?.base ?? mood;
  const pose = POSES[base] ?? POSES.neutral;
  const cheeks = look.cheeks || Boolean(kawaii?.blush);

  const shape = bodyShape(look.roundness, look.aspect);
  const outline = bodyPath ?? seeded.bodyPath;
  const body = outline ? { d: outline, top: 26, bottom: 182, halfWidth: 82 } : shape;
  const spread = Math.min(29 * look.eyeSpacing, body.halfWidth - 22);
  const eyeY = 96 + clamp(look.eyeHeight, -1, 1) * 30;
  const gx = clamp(lookAt?.x ?? 0, -1, 1);
  const gy = clamp((lookAt?.y ?? 0) + (pose.gy ?? 0), -1, 1);
  const id = idFor(JSON.stringify([options, size]));
  // A canonical mascot's own layers, unless an `accessory` replaces them.
  const worn =
    identity && accessory === undefined
      ? identitySvg(identity.layers, color, `url(#${id}-clip)`)
      : { back: "", on: accessory ? `<g>${accessory}</g>` : "", front: "" };
  const surface = look.surface;
  const glossy = surface === "glossy" || surface === "glass";

  const box = typeof look.eyes === "object" ? EYE_BOX.custom : EYE_BOX[look.eyes];
  const w = box.w * look.eyeSize;
  const h = box.h * look.eyeSize;

  const eye = (side: -1 | 1) => {
    const lid = side < 0 ? pose.left : pose.right;
    const x = 100 + side * spread;
    const name = side < 0 ? "l" : "r";
    const lt = (lid.lt ?? 0) * (h + 8);
    const lb = (lid.lb ?? 0) * (h + 8);
    const tilt = lid.tilt ?? 0;
    // The nearer eye narrows as the gaze turns, as in the animated mascot.
    const away = side < 0 ? Math.max(0, -gx) : Math.max(0, gx);
    const toward = side < 0 ? Math.max(0, gx) : Math.max(0, -gx);
    const sx = 1 - 0.45 * away + 0.1 * toward;
    const sy = 1 - 0.2 * Math.abs(gy);
    let shape: string;
    if (look.eyes === "tile") {
      shape = `<g transform="rotate(${lid.flip ? 180 : 0})"><path d="${TILE}" transform="scale(${n(w / 244)}) translate(-295 -165)" fill="${ink}" stroke="${ink}" stroke-width="34" stroke-linejoin="round"/></g>`;
    } else if (typeof look.eyes === "object") {
      shape = `<path d="${look.eyes.path}" fill="${ink}"/>`;
    } else {
      const glint =
        surface === "flat"
          ? ""
          : `<ellipse cx="${n(-w * 0.16)}" cy="${n(-h * 0.24)}" rx="${n(w * 0.17)}" ry="${n(Math.min(w, h) * 0.17)}" fill="#fff" fill-opacity="0.85"/>`;
      shape = `<rect x="${n(-w / 2)}" y="${n(-h / 2)}" width="${n(w)}" height="${n(h)}" rx="${n(Math.min(w, h) / 2)}" fill="${ink}"/>${glint}`;
    }
    return `<clipPath id="${id}-t${name}"><rect x="${n(x - w)}" y="${n(eyeY - h / 2 - 4)}" width="${n(w * 2)}" height="${n(h * 3)}" transform="translate(0 ${n(lt)}) rotate(${tilt} ${n(x)} ${n(eyeY)})"/></clipPath><clipPath id="${id}-b${name}"><rect x="${n(x - w)}" y="${n(eyeY + h / 2 + 4 - h * 3)}" width="${n(w * 2)}" height="${n(h * 3)}" transform="translate(0 ${n(-lb)})"/></clipPath><g transform="translate(${n(x)} ${n(eyeY)}) scale(${n(sx)} ${n(sy)}) translate(${n(-x)} ${n(-eyeY)})"><g clip-path="url(#${id}-t${name})"><g clip-path="url(#${id}-b${name})"><g transform="translate(${n(x)} ${n(eyeY)}) scale(${lid.scale ?? 1})">${shape}</g></g></g></g>`;
  };

  const brows = look.brows
    ? ([-1, 1] as const)
        .map(
          (side) =>
            `<path d="M${n(100 + side * spread - 9)} ${n(eyeY - 26 * look.eyeSize)} L${n(100 + side * spread + 9)} ${n(eyeY - 26 * look.eyeSize)}" fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>`,
        )
        .join("")
    : "";
  const cheekColor = mixColors("#ff6b8a", color, 0.55);
  const cheekMarks = cheeks
    ? ([-1, 1] as const)
        .map(
          (side) =>
            `<ellipse cx="${n(100 + side * (spread + 8))}" cy="${n(eyeY + 22 * look.eyeSize)}" rx="9" ry="5" fill="${cheekColor}" fill-opacity="0.5"/>`,
        )
        .join("")
    : "";
  const mouth = mouthPath(look.mouth, base, ink);
  const mouthY = eyeY + 34 * Math.max(0.8, look.eyeSize);

  const fillOpacity = surface === "glass" ? 0.45 : 1;
  const sheen =
    surface === "flat"
      ? ""
      : `<g clip-path="url(#${id}-clip)"><path d="${body.d}" fill="url(#${id}-shade)"${surface === "glass" ? ' fill-opacity="0.5"' : ""}/>${
          glossy ? `<path d="${body.d}" fill="url(#${id}-rim)"/>` : ""
        }<path d="${body.d}" fill="url(#${id}-light)"${surface === "matte" ? ' fill-opacity="0.45"' : ""}/>${
          glossy
            ? `<ellipse cx="${n(70 - gx * 9)}" cy="${n(body.top + 26 - gy * 7)}" rx="20" ry="11" fill="#fff" fill-opacity="0.55"/>`
            : ""
        }</g>`;
  const edge =
    surface === "glass"
      ? `<path d="${body.d}" fill="none" stroke="${mixColors(color, "#ffffff", 0.4)}" stroke-opacity="0.6" stroke-width="2"/>`
      : "";

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}"${title ? ' role="img"' : ' aria-hidden="true"'}>`,
    title ? `<title>${escapeText(title)}</title>` : "",
    `<defs><radialGradient id="${id}-light" cx="34%" cy="26%" r="62%"><stop offset="0%" stop-color="#fff" stop-opacity="0.5"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${id}-shade" cx="44%" cy="38%" r="70%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.42"/></radialGradient>`,
    `<linearGradient id="${id}-rim" x1="0" y1="0" x2="0" y2="1"><stop offset="72%" stop-color="#fff" stop-opacity="0"/><stop offset="100%" stop-color="#fff" stop-opacity="0.22"/></linearGradient>`,
    `<clipPath id="${id}-clip"><path d="${body.d}"/></clipPath></defs>`,
    shadow
      ? `<ellipse cx="100" cy="196" rx="56" ry="5" fill="${mixColors(color, "#000000", 0.35)}" fill-opacity="0.22"/>`
      : "",
    `<g transform="rotate(${pose.rotate ?? 0} 100 ${n(body.bottom)})">`,
    worn.back,
    `<path d="${body.d}" fill="${color}" fill-opacity="${fillOpacity}"/>`,
    sheen,
    edge,
    worn.on,
    `<g transform="translate(${n(gx * 24)} ${n(gy * 16)})">`,
    brows,
    eye(-1),
    eye(1),
    cheekMarks,
    mouth ? `<g transform="translate(100 ${n(mouthY)})">${mouth}</g>` : "",
    "</g>",
    worn.front,
    "</g></svg>",
  ].join("");
}

/** The SVG as a `data:` URL, ready for an `<img src>`, including inside `ImageResponse`. */
export function mascotDataUrl(options: MascotSvgOptions = {}): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(mascotSvg(options))}`;
}
