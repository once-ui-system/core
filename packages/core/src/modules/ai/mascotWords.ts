/*
 * Words that describe a mascot. A seed like "happy-red-fox" or "sleepyPandaDJ"
 * is split into words and each word it knows sets part of the look: colours
 * set the hue, animals the body (and ears where there are some to wear),
 * moods the eyes, mouth and how it moves, objects add accessories. No React and
 * no styles here, so `mascotSvg` can read seeds on the server too.
 */
import type { MascotAccessory } from "./accessories.js";
import type { MascotLook } from "./Mascot.js";

type Look = Partial<MascotLook>;

interface Word {
  /** Parts of the look this word sets. */
  look?: Look;
  /** A colour used only when no colour word is in the seed (a fox is orange unless you say otherwise). */
  tint?: Look;
  /** Accessories this word puts on. */
  wear?: MascotAccessory[];
}

const hue = (degrees: number): Look => ({ color: `oklch(0.72 0.16 ${degrees})` });
// A dark body gets light eyes, so it still has a face.
const dark = (color: string): Look => ({ color, eyeColor: "#ffffff" });

const COLORS: Record<string, Look> = {
  red: hue(25),
  cherry: hue(18),
  ruby: hue(15),
  rose: hue(8),
  coral: hue(38),
  fire: hue(35),
  orange: hue(55),
  tangerine: hue(58),
  amber: hue(75),
  honey: hue(80),
  sun: hue(88),
  yellow: hue(95),
  lemon: hue(102),
  gold: { color: "oklch(0.8 0.14 85)" },
  lime: hue(125),
  leaf: hue(138),
  green: hue(145),
  forest: hue(150),
  emerald: hue(160),
  jade: hue(165),
  mint: hue(170),
  teal: hue(185),
  aqua: hue(195),
  cyan: hue(205),
  sea: hue(225),
  sky: hue(235),
  ocean: hue(245),
  blue: hue(260),
  indigo: hue(280),
  violet: hue(295),
  purple: hue(305),
  grape: hue(310),
  plum: hue(320),
  magenta: hue(330),
  pink: hue(350),
  lavender: { color: "oklch(0.82 0.08 300)" },
  peach: { color: "oklch(0.84 0.08 55)" },
  cream: { color: "oklch(0.93 0.04 90)" },
  white: { color: "oklch(0.95 0.01 250)" },
  snow: { color: "oklch(0.96 0.01 240)" },
  silver: { color: "oklch(0.8 0.02 250)" },
  grey: { color: "oklch(0.65 0.02 250)" },
  gray: { color: "oklch(0.65 0.02 250)" },
  slate: { color: "oklch(0.55 0.04 255)" },
  brown: { color: "oklch(0.55 0.09 55)" },
  coffee: { color: "oklch(0.5 0.07 55)" },
  choco: { color: "oklch(0.45 0.07 45)" },
  chocolate: { color: "oklch(0.45 0.07 45)" },
  navy: dark("oklch(0.38 0.12 265)"),
  night: dark("oklch(0.3 0.06 275)"),
  ink: dark("oklch(0.25 0.02 270)"),
  black: dark("oklch(0.22 0.01 270)"),
  shadow: dark("oklch(0.3 0.02 270)"),
  brand: { color: "brand" },
  accent: { color: "accent" },
  neutral: { color: "neutral" },
};

const SURFACES: Record<string, Look> = {
  glossy: { surface: "glossy" },
  shiny: { surface: "glossy" },
  matte: { surface: "matte" },
  soft: { surface: "matte" },
  flat: { surface: "flat" },
  glass: { surface: "glass" },
  crystal: { surface: "glass" },
  ice: { surface: "glass", color: "oklch(0.88 0.06 220)" },
};

const pointy: MascotAccessory[] = ["catEars"];
const ANIMALS: Record<string, Word> = {
  cat: { look: { roundness: 0.75, aspect: 1.1 }, wear: pointy },
  kitty: { look: { roundness: 0.8, aspect: 1.05 }, wear: pointy },
  kitten: { look: { roundness: 0.85, aspect: 1, eyeSize: 1.15 }, wear: pointy },
  fox: { look: { roundness: 0.6, aspect: 1.15 }, tint: hue(55), wear: pointy },
  wolf: {
    look: { roundness: 0.5, aspect: 1.15 },
    tint: { color: "oklch(0.65 0.02 250)" },
    wear: pointy,
  },
  tiger: { look: { roundness: 0.65, aspect: 1.2 }, tint: hue(60), wear: pointy },
  lion: { look: { roundness: 0.8, aspect: 1.2 }, tint: hue(80), wear: pointy },
  lynx: { look: { roundness: 0.65, aspect: 1.1 }, wear: pointy },
  bear: { look: { roundness: 0.9, aspect: 1.15 }, tint: { color: "oklch(0.55 0.09 55)" } },
  panda: { look: { roundness: 0.95, aspect: 1.1 }, tint: { color: "oklch(0.95 0.01 250)" } },
  koala: { look: { roundness: 0.9, aspect: 1.2 }, tint: { color: "oklch(0.7 0.02 250)" } },
  hamster: { look: { roundness: 1, aspect: 1.1, cheeks: true }, tint: hue(70) },
  mouse: {
    look: { roundness: 0.9, aspect: 1.05, eyes: "dot" },
    tint: { color: "oklch(0.75 0.02 250)" },
  },
  bunny: { look: { roundness: 0.85, aspect: 0.85, cheeks: true } },
  rabbit: { look: { roundness: 0.8, aspect: 0.85 } },
  dog: { look: { roundness: 0.75, aspect: 1.1, eyes: "round" } },
  puppy: { look: { roundness: 0.85, aspect: 1.05, eyes: "round", eyeSize: 1.15 } },
  owl: { look: { roundness: 0.8, aspect: 0.9, eyes: "wide", eyeSize: 1.2 }, tint: hue(60) },
  bird: { look: { roundness: 0.95, aspect: 1, mouth: "dot" }, tint: hue(235) },
  chick: { look: { roundness: 1, aspect: 1, mouth: "dot" }, tint: hue(95) },
  duck: { look: { roundness: 0.9, aspect: 1.1, mouth: "dot" }, tint: hue(95) },
  penguin: { look: { roundness: 0.85, aspect: 0.82 }, tint: dark("oklch(0.28 0.02 260)") },
  frog: { look: { roundness: 0.85, aspect: 1.3, eyes: "round", eyeHeight: -0.3 }, tint: hue(145) },
  fish: { look: { roundness: 0.8, aspect: 1.25 }, tint: hue(205) },
  whale: { look: { roundness: 0.9, aspect: 1.3 }, tint: hue(250) },
  octopus: { look: { roundness: 1, aspect: 0.95 }, tint: hue(340) },
  slime: { look: { roundness: 1, aspect: 1.2, surface: "glass" }, tint: hue(140) },
  blob: { look: { roundness: 1, aspect: 1.15 } },
  ghost: {
    look: { roundness: 0.9, aspect: 0.85, surface: "glass" },
    tint: { color: "oklch(0.95 0.01 250)" },
  },
  dino: { look: { roundness: 0.55, aspect: 1.15 }, tint: hue(145) },
  dragon: { look: { roundness: 0.45, aspect: 1.15, brows: true }, tint: hue(25) },
  robot: { look: { roundness: 0.2, aspect: 1, eyes: "tile", surface: "matte" }, wear: ["antenna"] },
  bot: { look: { roundness: 0.25, aspect: 1, eyes: "tile" }, wear: ["antenna"] },
  alien: { look: { roundness: 0.7, aspect: 0.9, eyes: "wide" }, tint: hue(140), wear: ["antenna"] },
  bee: { look: { roundness: 0.9, aspect: 1.1 }, tint: hue(95), wear: ["antenna"] },
};

const MOODS: Record<string, Look> = {
  happy: { eyes: "round", mouth: "smile", personality: "bouncy" },
  joy: { eyes: "round", mouth: "smile", personality: "bouncy" },
  glad: { eyes: "round", mouth: "smile" },
  cheerful: { eyes: "round", mouth: "smile", cheeks: true, personality: "bouncy" },
  sunny: { eyes: "round", mouth: "smile", personality: "bouncy" },
  excited: { eyes: "wide", mouth: "smile", personality: "bouncy" },
  hyper: { eyes: "wide", mouth: "smile", personality: "bouncy" },
  silly: { eyes: "wide", mouth: "smile", personality: "bouncy" },
  calm: { eyes: "pill", mouth: "line", personality: "calm" },
  chill: { eyes: "pill", mouth: "smile", personality: "calm" },
  zen: { eyes: "pill", mouth: "none", personality: "calm" },
  sleepy: { eyes: "pill", eyeSize: 0.85, mouth: "none", personality: "calm" },
  lazy: { eyes: "pill", eyeSize: 0.85, mouth: "line", personality: "calm" },
  shy: { eyes: "dot", mouth: "dot", cheeks: true, personality: "calm" },
  cute: { eyes: "round", eyeSize: 1.15, mouth: "dot", cheeks: true },
  sweet: { eyes: "round", mouth: "smile", cheeks: true },
  curious: { eyes: "wide", mouth: "dot" },
  brave: { eyes: "tile", mouth: "smile", brows: true },
  grumpy: { eyes: "tile", mouth: "line", brows: true, personality: "calm" },
  angry: { eyes: "tile", mouth: "line", brows: true },
  serious: { eyes: "tile", mouth: "line", brows: true, personality: "calm" },
  cool: { eyes: "tile", mouth: "none" },
  smart: { eyes: "tile", mouth: "smile", brows: true },
  wise: { eyes: "pill", mouth: "line", brows: true, personality: "calm" },
  sad: { eyes: "round", mouth: "line", brows: true, personality: "calm" },
  tiny: { eyeSize: 0.85, aspect: 0.95 },
  chonky: { roundness: 1, aspect: 1.3 },
  chubby: { roundness: 1, aspect: 1.25, cheeks: true },
  tall: { aspect: 0.82 },
  wide: { aspect: 1.3 },
  round: { roundness: 1 },
  square: { roundness: 0.15 },
  boxy: { roundness: 0.1 },
};

const OBJECTS: Record<string, MascotAccessory[]> = {
  crown: ["crown"],
  king: ["crown"],
  queen: ["crown"],
  royal: ["crown"],
  prince: ["crown"],
  princess: ["crown", "bow"],
  bow: ["bow"],
  ribbon: ["bow"],
  beanie: ["beanie"],
  hat: ["beanie"],
  winter: ["beanie"],
  cozy: ["beanie"],
  headphones: ["headphones"],
  music: ["headphones"],
  dj: ["headphones"],
  beats: ["headphones"],
  audio: ["headphones"],
  podcast: ["headphones"],
  sprout: ["sprout"],
  plant: ["sprout"],
  garden: ["sprout"],
  seed: ["sprout"],
  helmet: ["helmet"],
  astro: ["helmet"],
  astronaut: ["helmet"],
  space: ["helmet"],
  rocket: ["helmet"],
  party: ["partyHat"],
  birthday: ["partyHat"],
  bday: ["partyHat"],
  fiesta: ["partyHat"],
  antenna: ["antenna"],
  radio: ["antenna"],
  signal: ["antenna"],
  ears: ["catEars"],
};

/** Every word a seed can use, for pickers and docs. */
export const MASCOT_SEED_WORDS = {
  colors: Object.keys(COLORS),
  surfaces: Object.keys(SURFACES),
  animals: Object.keys(ANIMALS),
  moods: Object.keys(MOODS),
  objects: Object.keys(OBJECTS),
} as const;

const lookup = (word: string): Word | undefined => {
  if (COLORS[word]) return { look: COLORS[word] };
  if (SURFACES[word]) return { look: SURFACES[word] };
  if (ANIMALS[word]) return ANIMALS[word];
  if (MOODS[word] && OBJECTS[word]) return { look: MOODS[word], wear: OBJECTS[word] };
  if (MOODS[word]) return { look: MOODS[word] };
  if (OBJECTS[word]) return { wear: OBJECTS[word] };
  if (/^#[0-9a-f]{6}$/.test(word)) return { look: { color: word } };
  return undefined;
};

/** Splits a seed into lowercase words at spaces, dashes, underscores, dots, digits and camelCase. */
export function seedWords(seed: string | number): string[] {
  return String(seed)
    .split(/[^A-Za-z0-9#]+/)
    .flatMap((chunk) =>
      // A hex colour stays whole; anything else splits at camelCase and digits.
      /^#[0-9a-f]{6}$/i.test(chunk)
        ? [chunk.toLowerCase()]
        : chunk
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
            .replace(/([A-Za-z])(\d)|(\d)([A-Za-z])/g, "$1$3 $2$4")
            .toLowerCase()
            .split(/[\s#]+/),
    )
    .filter((word) => word && !/^\d+$/.test(word));
}

export interface MascotSeedReading {
  /** The parts of the look the seed's words set. The rest comes from the seed's hash. */
  look: Partial<MascotLook>;
  /** Accessories the words put on, in the order they came. */
  accessory: MascotAccessory[];
  /** The words it understood. */
  matched: string[];
  /** The words it didn't, which only feed the hash. */
  unmatched: string[];
}

/** Reads the words in a seed. Numbers and unknown words leave the look to the hash. */
export function readSeedWords(seed: string | number): MascotSeedReading {
  const look: Look = {};
  let tint: Look | undefined;
  const accessory: MascotAccessory[] = [];
  const matched: string[] = [];
  const unmatched: string[] = [];
  for (const raw of seedWords(seed)) {
    const word =
      lookup(raw) ?? (raw.length > 3 && raw.endsWith("s") ? lookup(raw.slice(0, -1)) : undefined);
    if (!word) {
      unmatched.push(raw);
      continue;
    }
    matched.push(raw);
    Object.assign(look, word.look);
    if (word.tint && !tint) tint = word.tint;
    for (const item of word.wear ?? []) if (!accessory.includes(item)) accessory.push(item);
  }
  // An animal's own colour only when the seed names none.
  const named = matched.some((word) => {
    const known = lookup(word) ?? lookup(word.slice(0, -1));
    return known?.look?.color !== undefined;
  });
  if (tint && !named) Object.assign(look, tint);
  // Glass shows what's behind it more than its own colour, so a seed that names or implies a
  // colour keeps it glossy unless it asks for a surface itself.
  const surfaced = matched.some((word) => SURFACES[word] || ANIMALS[word]?.look?.surface);
  if (look.color && !surfaced) look.surface = "glossy";
  return { look, accessory: accessory.slice(0, 3), matched, unmatched };
}
