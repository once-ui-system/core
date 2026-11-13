import { isMascotAccessory, type MascotAccessory } from "./accessories.js";

/*
 * A mascot as data: the part of its props a person designs, in a shape that
 * survives JSON. Apps keep it in a database column or a URL, MascotPanel edits
 * it, and `mascotDesignProps` spreads it back onto <Mascot />. No React nodes,
 * no functions, so stored or AI-written values go through `parseMascotDesign`
 * on the way in and come out safe to render.
 */

/** The cube's sides by name, or a color per side. */
export type MascotSides =
  | "classic"
  | "tints"
  | "mono"
  | Partial<Record<"top" | "front" | "right" | "bottom" | "back" | "left", string>>;

/** Everything a person designs about one mascot, as plain JSON. */
export interface MascotDesign {
  /** The format's version, so a stored design can be upgraded later. */
  v: 1;
  /** A scheme (`brand`, `accent`, `neutral`) or a CSS color. */
  color?: "brand" | "accent" | "neutral" | (string & {});
  roundness?: number;
  aspect?: number;
  /** An SVG path in a 200 × 200 box, in place of the body shape. */
  bodyPath?: string;
  surface?: "glossy" | "matte" | "flat" | "glass";
  eyes?: "tile" | "pill" | "round" | "wide" | "dot" | { path: string };
  eyeSize?: number;
  eyeSpacing?: number;
  eyeHeight?: number;
  eyeColor?: string;
  mouth?: "none" | "smile" | "dot" | "line";
  brows?: boolean;
  cheeks?: boolean;
  personality?: "calm" | "default" | "bouncy";
  /** Built-in accessories, by name. */
  accessory?: MascotAccessory[];
  accessoryColor?: string;
  /** How it works: the flat mascot (unset), or the 3D `cube` or `d20`. */
  working?: "cube" | "d20";
  /** With `working`: the sides of the cube or die. */
  sides?: MascotSides;
  /** With `working`: `flat` paints the face on without light. */
  face?: "3d" | "flat";
}

/** The look a mascot has when a design leaves a part out. */
export const MASCOT_DESIGN_DEFAULTS = {
  color: "brand",
  roundness: 0.7,
  aspect: 1,
  surface: "glossy",
  eyes: "tile",
  eyeSize: 1,
  eyeSpacing: 1,
  eyeHeight: 0,
  mouth: "none",
  brows: false,
  cheeks: false,
  personality: "default",
} as const satisfies Omit<MascotDesign, "v">;

/** Where each number is allowed to go. Mirrors the panel's sliders. */
export const MASCOT_DESIGN_RANGES = {
  roundness: [0, 1],
  aspect: [0.6, 1.6],
  eyeSize: [0.5, 1.8],
  eyeSpacing: [0.5, 1.6],
  eyeHeight: [-1, 1],
} as const satisfies Record<string, readonly [number, number]>;

const SURFACES = ["glossy", "matte", "flat", "glass"] as const;
const EYES = ["tile", "pill", "round", "wide", "dot"] as const;
const MOUTHS = ["none", "smile", "dot", "line"] as const;
const PERSONALITIES = ["calm", "default", "bouncy"] as const;
const WORKING = ["cube", "d20"] as const;
const SIDE_NAMES = ["classic", "tints", "mono"] as const;
const SIDE_KEYS = ["top", "front", "right", "bottom", "back", "left"] as const;
const FACES = ["3d", "flat"] as const;

/** A CSS color as people write one: a hex, a name, or a function like `oklch()`. */
const COLOR =
  /^(#[0-9a-f]{3,8}|[a-z]+|(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\([0-9a-z.,%/\s+-]*\))$/i;
/** Path data only: commands, numbers, separators. */
const PATH = /^[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s+-]+$/;
const MAX_PATH = 4000;

const oneOf = <T extends string>(options: readonly T[], value: unknown): T | undefined =>
  typeof value === "string" && (options as readonly string[]).includes(value)
    ? (value as T)
    : undefined;

const color = (value: unknown): string | undefined =>
  typeof value === "string" && value.length <= 64 && COLOR.test(value.trim())
    ? value.trim()
    : undefined;

const path = (value: unknown): string | undefined =>
  typeof value === "string" && value.length <= MAX_PATH && PATH.test(value) ? value : undefined;

const number = (value: unknown, [min, max]: readonly [number, number]): number | undefined =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.round(Math.min(max, Math.max(min, value)) * 1000) / 1000
    : undefined;

const flag = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;

function sides(value: unknown): MascotSides | undefined {
  const named = oneOf(SIDE_NAMES, value);
  if (named) return named;
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const out: Partial<Record<(typeof SIDE_KEYS)[number], string>> = {};
  for (const key of SIDE_KEYS) {
    const side = color((value as Record<string, unknown>)[key]);
    if (side) out[key] = side;
  }
  return Object.keys(out).length ? out : undefined;
}

function eyes(value: unknown): MascotDesign["eyes"] {
  const named = oneOf(EYES, value);
  if (named) return named;
  if (value && typeof value === "object" && "path" in value) {
    const d = path((value as { path: unknown }).path);
    if (d) return { path: d };
  }
  return undefined;
}

function accessories(value: unknown): MascotAccessory[] | undefined {
  const list = Array.isArray(value) ? value : value === undefined ? [] : [value];
  const names = [...new Set(list.filter(isMascotAccessory))];
  return names.length ? names : undefined;
}

/**
 * Reads a stored, posted or AI-written design and returns one that is safe to
 * render. Takes an object or a JSON string; anything it does not recognise is
 * dropped, numbers are clamped to their range, colors and paths must look
 * like colors and paths. Never throws: unreadable input gives `{ v: 1 }`, the
 * default mascot.
 */
export function parseMascotDesign(input: unknown): MascotDesign {
  let raw = input;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return { v: 1 };
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { v: 1 };
  const r = raw as Record<string, unknown>;
  const scheme = oneOf(["brand", "accent", "neutral"] as const, r.color);

  const design: MascotDesign = {
    v: 1,
    color: scheme ?? color(r.color),
    roundness: number(r.roundness, MASCOT_DESIGN_RANGES.roundness),
    aspect: number(r.aspect, MASCOT_DESIGN_RANGES.aspect),
    bodyPath: path(r.bodyPath),
    surface: oneOf(SURFACES, r.surface),
    eyes: eyes(r.eyes),
    eyeSize: number(r.eyeSize, MASCOT_DESIGN_RANGES.eyeSize),
    eyeSpacing: number(r.eyeSpacing, MASCOT_DESIGN_RANGES.eyeSpacing),
    eyeHeight: number(r.eyeHeight, MASCOT_DESIGN_RANGES.eyeHeight),
    eyeColor: color(r.eyeColor),
    mouth: oneOf(MOUTHS, r.mouth),
    brows: flag(r.brows),
    cheeks: flag(r.cheeks),
    personality: oneOf(PERSONALITIES, r.personality),
    accessory: accessories(r.accessory),
    accessoryColor: color(r.accessoryColor),
    working: oneOf(WORKING, r.working),
    sides: sides(r.sides),
    face: oneOf(FACES, r.face),
  };
  for (const key of Object.keys(design) as (keyof MascotDesign)[]) {
    if (design[key] === undefined) delete design[key];
  }
  return design;
}

/**
 * The props a design gives `<Mascot />`. Spread them first and add the live
 * props (state, mood, size) after: `<Mascot {...mascotDesignProps(design)} state="thinking" />`.
 */
export function mascotDesignProps(design: MascotDesign): Omit<MascotDesign, "v"> {
  const { v: _v, ...props } = design;
  return props;
}
