/*
 * Canonical mascots: names that stand for a real identity (Once UI, Quasar,
 * each Dopler product) and draw a hand-made character instead of a generated
 * one. A seed that names one of them, in any spelling ("once-ui", "Once UI",
 * "onceui"), resolves here before the generator runs, so the same name shows
 * the same character in every app on core.
 *
 * Plain data and no React, so `mascotSvg` can draw them on the server too.
 * The looks come from the Dopler mascot family (one describing seed per
 * product, kept in `seed` below); Quasar and Once UI are their final kits.
 *
 * Whether a seed may resolve is the app's call: core cannot know who typed
 * it. Apps that seed from text people choose (usernames, agent names) pass
 * `canonical` only when that person owns the identity; see `mascotIdentity`.
 */
import type { MascotLook } from "./Mascot.js";

/**
 * One shape drawn with a canonical mascot, in the body's 200 × 200 box.
 * `fill` and `stroke` take a CSS color, or `body` and `shade` for the body's
 * color and a darker step of it.
 */
export interface MascotIdentityLayer {
  d: string;
  fill?: string;
  stroke?: string;
  /** Stroke width. */
  width?: number;
  /** Stroke ends, `round` by default. */
  cap?: "round" | "butt";
  opacity?: number;
  /** An SVG transform, such as `rotate(-8 94 70)`. */
  transform?: string;
  /** Kept inside the body's outline (a skin, a seam). */
  clip?: boolean;
  /** `back` behind the body, `on` over it (default), `front` over the face. */
  place?: "back" | "on" | "front";
}

export interface MascotIdentity {
  /** The name it answers to, lowercase with dashes. */
  handle: string;
  /** How it is written. */
  name: string;
  /** Other names that resolve to it. Spelling, case and dashes never matter. */
  aliases?: string[];
  /** Who it belongs to. Apps compare this with their own owner before showing it. */
  owner: string;
  /** What the character is, in a sentence. */
  about: string;
  /** The describing seed it was drawn from in the Dopler mascot family. */
  seed: string;
  /** The look. Props passed to `Mascot` still win over it, so an owner can customise. */
  look: MascotLook;
  /** What it wears or carries. */
  layers: MascotIdentityLayer[];
}

/** Every canonical mascot. XESO and client brands are not here on purpose. */
export const MASCOT_IDENTITIES: readonly MascotIdentity[] = [
  {
    handle: "dopler",
    name: "Dopler",
    owner: "dopler",
    about: "A pebble with sound waves at its back: the Doppler effect, a voice coming towards you.",
    seed: "orange-pebble-round-smile-waves",
    look: {
      color: "#fd6325",
      surface: "flat",
      bodyPath: "M80 58H120Q164 58 164 102V122Q164 166 120 166H80Q36 166 36 122V102Q36 58 80 58Z",
      eyes: "round",
      eyeSize: 1,
      eyeSpacing: 0.76,
      eyeHeight: 0.33,
      mouth: "smile",
      cheeks: false,
    },
    layers: [
      {
        d: "M180 74Q198 108 180 142",
        stroke: "body",
        width: 10,
        fill: "none",
      },
      {
        d: "M200 60Q226 108 200 156",
        stroke: "body",
        width: 10,
        fill: "none",
        opacity: 0.55,
      },
    ],
  },
  {
    handle: "once-ui",
    name: "Once UI",
    aliases: ["once"],
    owner: "dopler",
    about:
      "The logo come alive: the mark's diamond is the body, its tiles are the eyes, and the four tiles show as four flat tones.",
    seed: "emerald-diamond-tile-none-notches",
    look: {
      color: "#08a97c",
      surface: "flat",
      bodyPath:
        "M76.2 38.3Q100 14 123.8 38.3L164.2 79.7Q188 104 164 128L124 168Q100 192 76 168L36 128Q12 104 35.8 79.7Z",
      eyes: "tile",
      eyeSize: 0.82,
      eyeSpacing: 0.95,
      eyeHeight: 0.1,
      sides: "tints",
    },
    layers: [
      {
        d: "M100 103L57 60L100 0L143 60Z",
        fill: "#ffffff",
        opacity: 0.16,
        clip: true,
      },
      {
        d: "M100 103L57 60L0 103L57 147Z",
        fill: "#ffffff",
        opacity: 0.06,
        clip: true,
      },
      {
        d: "M100 103L143 60L200 103L143 147Z",
        fill: "#000000",
        opacity: 0.08,
        clip: true,
      },
      {
        d: "M100 103L57 147L100 200L143 147Z",
        fill: "#000000",
        opacity: 0.18,
        clip: true,
      },
    ],
  },
  {
    handle: "stack",
    name: "Stack",
    owner: "dopler",
    about:
      "The builder: Once UI's tile eyes under a hard hat. The hat stays a separate cap in the logo.",
    seed: "blue-block-tile-none-hardhat",
    look: {
      color: "#2d69fa",
      surface: "flat",
      bodyPath: "M74 70H126Q166 70 166 110V134Q166 174 126 174H74Q34 174 34 134V110Q34 70 74 70Z",
      eyes: "tile",
      eyeSize: 0.82,
      eyeSpacing: 0.95,
      eyeHeight: 0.73,
      mouth: "none",
      cheeks: false,
    },
    layers: [
      {
        d: "M54 74Q54 26 100 26Q146 26 146 74Z",
        fill: "#f5b301",
      },
      {
        d: "M100 25H100Q107 25 107 32V64Q107 71 100 71H100Q93 71 93 64V32Q93 25 100 25Z",
        fill: "#ffd54d",
      },
      {
        d: "M46.5 66H153.5Q160 66 160 72.5V72.5Q160 79 153.5 79H46.5Q40 79 40 72.5V72.5Q40 66 46.5 66Z",
        fill: "#dc9a00",
      },
    ],
  },
  {
    handle: "motion",
    name: "Motion",
    owner: "dopler",
    about: "A pebble in a hurry, leaning forward with three speed lines.",
    seed: "magenta-pebble-round-smile-speed",
    look: {
      color: "#bd1de8",
      surface: "flat",
      bodyPath: "M80 58H120Q164 58 164 102V122Q164 166 120 166H80Q36 166 36 122V102Q36 58 80 58Z",
      eyes: "round",
      eyeSize: 1,
      eyeSpacing: 0.76,
      eyeHeight: 0.33,
      mouth: "smile",
      cheeks: false,
    },
    layers: [
      {
        d: "M8 84h26M0 106h36M12 128h26",
        stroke: "body",
        width: 10,
        fill: "none",
      },
    ],
  },
  {
    handle: "magic-docs",
    name: "Magic Docs",
    owner: "dopler",
    about: "A page with a folded corner and a spark of magic. The fold stays in the logo as a cut.",
    seed: "indigo-page-dot-smile-spark",
    look: {
      color: "#7358fa",
      surface: "flat",
      bodyPath: "M56 28H122L158 64V166Q158 180 144 180H56Q42 180 42 166V42Q42 28 56 28Z",
      eyes: "dot",
      eyeSize: 1.2,
      eyeSpacing: 0.83,
      eyeHeight: 0.13,
      mouth: "smile",
      cheeks: false,
    },
    layers: [
      {
        d: "M122 28V52Q122 64 134 64H158Z",
        fill: "shade",
      },
      {
        d: "M164 15Q166.4 27.6 179 30Q166.4 32.4 164 45Q161.6 32.4 149 30Q161.6 27.6 164 15Z",
        fill: "#ffd54d",
      },
    ],
  },
  {
    handle: "aveiro",
    name: "Aveiro",
    owner: "dopler",
    about: "A browser window that talks: window dots on top, a chat tail at the bottom.",
    seed: "cyan-window-round-smile-chat",
    look: {
      color: "#049ee2",
      surface: "flat",
      bodyPath:
        "M54 40H146Q174 40 174 68V138Q174 166 146 166H54Q26 166 26 138V68Q26 40 54 40ZM84 160L38 190L48 150Z",
      eyes: "round",
      eyeSize: 1,
      eyeSpacing: 0.76,
      eyeHeight: 0.6,
      mouth: "smile",
      cheeks: false,
    },
    layers: [
      {
        d: "M26 74H174",
        stroke: "shade",
        width: 5,
        cap: "butt",
        fill: "none",
      },
      {
        d: "M42.5 57A5.5 5.5 0 1 0 53.5 57A5.5 5.5 0 1 0 42.5 57ZM58.5 57A5.5 5.5 0 1 0 69.5 57A5.5 5.5 0 1 0 58.5 57ZM74.5 57A5.5 5.5 0 1 0 85.5 57A5.5 5.5 0 1 0 74.5 57Z",
        fill: "#ffffff",
        opacity: 0.85,
      },
    ],
  },
  {
    handle: "chirio",
    name: "Chirio",
    owner: "dopler",
    about: "A bird that is also a speech bubble: tuft on top, tail at the bottom, a small beak.",
    seed: "green-bubble-dot-beak-cheeks-tuft",
    look: {
      color: "#01cf38",
      surface: "flat",
      bodyPath: "M32 108A68 68 0 1 0 168 108A68 68 0 1 0 32 108ZM48 148L26 188L84 170Z",
      eyes: "dot",
      eyeSize: 1.2,
      eyeSpacing: 0.83,
      eyeHeight: 0.07,
      mouth: "none",
      cheeks: true,
    },
    layers: [
      {
        d: "M100 46Q78 42 74 16Q98 20 100 46ZM100 46Q104 18 128 12Q120 40 100 46Z",
        fill: "shade",
        place: "back",
      },
      {
        d: "M88 116Q100 111 112 116Q106 131 100 133Q94 131 88 116Z",
        fill: "#ffa31a",
        place: "front",
      },
    ],
  },
  {
    handle: "tavilio",
    name: "Tavilio",
    owner: "dopler",
    about: "The host in a beret who greets your guests.",
    seed: "yellow-bun-round-smile-cheeks-beret",
    look: {
      color: "#fecc55",
      surface: "flat",
      bodyPath: "M82 62H118Q170 62 170 114V124Q170 176 118 176H82Q30 176 30 124V114Q30 62 82 62Z",
      eyes: "round",
      eyeSize: 1,
      eyeSpacing: 0.76,
      eyeHeight: 0.67,
      mouth: "smile",
      cheeks: true,
    },
    layers: [
      {
        d: "M94 30H94Q98 30 98 34V40Q98 44 94 44H94Q90 44 90 40V34Q90 30 94 30Z",
        fill: "#3a2a1f",
        transform: "rotate(-8 100 100)",
      },
      {
        d: "M42 64Q42 40 94 38Q148 36 148 58Q148 70 94 72Q42 76 42 64Z",
        fill: "#3a2a1f",
        transform: "rotate(-8 100 100)",
      },
    ],
  },
  {
    handle: "sigilio",
    name: "Sigilio",
    owner: "dopler",
    about:
      "A wax seal with two ribbons, the signature at the end of every contract. Red like real sealing wax.",
    seed: "red-seal-dot-smile-cheeks-ribbons",
    look: {
      color: "#e90507",
      surface: "flat",
      bodyPath:
        "M173 96L172 99.2L169.3 102.2L165.9 104.9L162.9 107.4L161.4 110L161.7 113L163.2 116.5L165.1 120.4L166.2 124.3L165.8 127.7L163.4 130.1L159.7 131.7L155.5 132.6L151.7 133.6L149.3 135.3L148.2 138.1L148 141.9L148.1 146.3L147.4 150.3L145.5 153.1L142.3 154.3L138.3 154L134.1 153L130.3 152.3L127.3 152.8L125.1 154.8L123.4 158.2L121.5 162.1L119.2 165.4L116.2 167.2L112.9 166.9L109.3 164.9L106 162.2L102.9 159.9L100 159L97.1 159.9L94 162.2L90.7 164.9L87.1 166.9L83.8 167.2L80.8 165.4L78.5 162.1L76.6 158.2L74.9 154.8L72.7 152.8L69.7 152.3L65.9 153L61.7 154L57.7 154.3L54.5 153.1L52.6 150.3L51.9 146.3L52 141.9L51.8 138.1L50.7 135.3L48.3 133.6L44.5 132.6L40.3 131.7L36.6 130.1L34.2 127.7L33.8 124.3L34.9 120.4L36.8 116.5L38.3 113L38.6 110L37.1 107.4L34.1 104.9L30.7 102.2L28 99.2L27 96L28 92.8L30.7 89.8L34.1 87.1L37.1 84.6L38.6 82L38.3 79L36.8 75.5L34.9 71.6L33.8 67.7L34.2 64.3L36.6 61.9L40.3 60.3L44.5 59.4L48.3 58.4L50.7 56.7L51.8 53.9L52 50.1L51.9 45.7L52.6 41.7L54.5 38.9L57.7 37.7L61.7 38L65.9 39L69.7 39.7L72.7 39.2L74.9 37.2L76.6 33.8L78.5 29.9L80.8 26.6L83.8 24.8L87.1 25.1L90.7 27.1L94 29.8L97.1 32.1L100 33L102.9 32.1L106 29.8L109.3 27.1L112.9 25.1L116.2 24.8L119.2 26.6L121.5 29.9L123.4 33.8L125.1 37.2L127.3 39.2L130.3 39.7L134.1 39L138.3 38L142.3 37.7L145.5 38.9L147.4 41.7L148.1 45.7L148 50.1L148.2 53.9L149.3 56.7L151.7 58.4L155.5 59.4L159.7 60.3L163.4 61.9L165.8 64.3L166.2 67.7L165.1 71.6L163.2 75.5L161.7 79L161.4 82L162.9 84.6L165.9 87.1L169.3 89.8L172 92.8Z",
      eyes: "dot",
      eyeSize: 1.2,
      eyeSpacing: 0.83,
      eyeHeight: -0.13,
      mouth: "smile",
      cheeks: true,
    },
    layers: [
      {
        d: "M80 151L64 195L77 187L85 197L98 157ZM120 151L136 195L123 187L115 197L102 157Z",
        fill: "#f5b301",
        place: "back",
      },
      {
        d: "M50 96A50 50 0 1 0 150 96A50 50 0 1 0 50 96Z",
        stroke: "shade",
        width: 4,
        fill: "none",
      },
    ],
  },
  {
    handle: "frametic",
    name: "Frametic",
    owner: "dopler",
    about: "A clapperboard on its head, mid-clap. The arm's stripes survive down to 16 px.",
    seed: "aqua-block-round-smile-clapper",
    look: {
      color: "#01c7c3",
      surface: "flat",
      bodyPath: "M74 70H126Q166 70 166 110V134Q166 174 126 174H74Q34 174 34 134V110Q34 70 74 70Z",
      eyes: "round",
      eyeSize: 1,
      eyeSpacing: 0.76,
      eyeHeight: 0.73,
      mouth: "smile",
      cheeks: false,
    },
    layers: [
      {
        d: "M40 48H160Q166 48 166 54V62Q166 68 160 68H40Q34 68 34 62V54Q34 48 40 48Z",
        fill: "shade",
      },
      {
        d: "M40 22H160Q166 22 166 28V36Q166 42 160 42H40Q34 42 34 36V28Q34 22 40 22Z",
        fill: "shade",
        transform: "rotate(-14 34 42)",
      },
      {
        d: "M56 22h16l-12 20h-16zM92 22h16l-12 20h-16zM128 22h16l-12 20h-16z",
        fill: "#ffffff",
        transform: "rotate(-14 34 42)",
      },
    ],
  },
  {
    handle: "liverio",
    name: "Liverio",
    owner: "dopler",
    about: "A little house with a smoking chimney. Someone is home.",
    seed: "pink-house-round-smile-chimney",
    look: {
      color: "#f854be",
      surface: "flat",
      bodyPath:
        "M100 30Q108 30 114 35L170 82Q178 89 178 100L178 160Q178 182 156 182L44 182Q22 182 22 160L22 100Q22 89 30 82L86 35Q92 30 100 30Z",
      eyes: "round",
      eyeSize: 1,
      eyeSpacing: 0.76,
      eyeHeight: 1,
      mouth: "smile",
      cheeks: false,
    },
    layers: [
      {
        d: "M139.32 34H151.32Q156.32 34 156.32 39V69Q156.32 74 151.32 74H139.32Q134.32 74 134.32 69V39Q134.32 34 139.32 34Z",
        fill: "shade",
        place: "back",
      },
      {
        d: "M143.32 20A7 7 0 1 0 157.32 20A7 7 0 1 0 143.32 20ZM157.32 8A5 5 0 1 0 167.32 8A5 5 0 1 0 157.32 8Z",
        fill: "#d9d4cc",
        place: "back",
      },
    ],
  },
  {
    handle: "worldline",
    name: "Worldline",
    owner: "dopler",
    about: "A small planet wearing its orbit. The ring crosses in front, cut clean in the logo.",
    seed: "violet-planet-dot-smile-orbit",
    look: {
      color: "#9745f7",
      surface: "flat",
      bodyPath: "M34 100A66 66 0 1 0 166 100A66 66 0 1 0 34 100Z",
      eyes: "dot",
      eyeSize: 1.2,
      eyeSpacing: 0.83,
      eyeHeight: -0.07,
      mouth: "smile",
      cheeks: false,
    },
    layers: [
      {
        d: "M10 132Q100 180 190 92",
        stroke: "#fb923c",
        width: 10,
        fill: "none",
      },
    ],
  },
  {
    handle: "holo-zone",
    name: "Holo Zone",
    owner: "dopler",
    about: "A holo card that sparkles when you tilt it. Pill eyes keep it slim like a card.",
    seed: "cyan-card-pill-dot-sparkles",
    look: {
      color: "#049ee2",
      surface: "flat",
      bodyPath: "M72 28H128Q146 28 146 46V158Q146 176 128 176H72Q54 176 54 158V46Q54 28 72 28Z",
      eyes: "pill",
      eyeSize: 1,
      eyeSpacing: 0.69,
      eyeHeight: 0,
      mouth: "dot",
      cheeks: false,
    },
    layers: [
      {
        d: "M54 132L146 66V96L54 162Z",
        fill: "#ffffff",
        opacity: 0.2,
      },
      {
        d: "M150 18Q153.2 34.8 170 38Q153.2 41.2 150 58Q146.8 41.2 130 38Q146.8 34.8 150 18Z",
        fill: "#ff4fd8",
      },
      {
        d: "M48 150Q49.6 158.4 58 160Q49.6 161.6 48 170Q46.4 161.6 38 160Q46.4 158.4 48 150Z",
        fill: "#ff4fd8",
      },
    ],
  },
  {
    handle: "quasar",
    name: "Quasar",
    owner: "dopler",
    about:
      "Once UI's AI twin: the founder's blob in a glass helmet, with machine eyes and a cyan rim.",
    seed: "ink-blob-pill-none-helmet-glow-3fe3f2",
    look: {
      color: "#121318",
      eyeColor: "#ffffff",
      surface: "flat",
      bodyPath:
        "M154.6 100.2L155 107.8L155.2 112.3L155 116L154.6 119.3L154.1 122.3L153.5 125L152.6 127.5L151.6 129.9L150.5 132.1L149.1 134.2L147.6 136L145.9 137.8L144.1 139.4L142 140.9L139.7 142.2L137.3 143.5L134.7 144.5L131.8 145.5L128.7 146.3L125.3 147.1L121.5 147.7L117.2 148.2L112 148.6L103.2 149.2L94.3 149.7L89.1 149.8L84.7 149.6L80.9 149.4L77.4 148.9L74.2 148.4L71.2 147.6L68.5 146.8L65.9 145.8L63.4 144.7L61.2 143.5L59.1 142.1L57.2 140.5L55.4 138.8L53.8 137L52.3 135.1L51 133L49.8 130.7L48.8 128.2L47.9 125.5L47.2 122.4L46.5 119L46 114.9L45.4 107.8L45 100.7L44.9 96.6L45.1 93.1L45.4 90L45.9 87.2L46.6 84.6L47.4 82.1L48.4 79.8L49.7 77.7L51 75.7L52.6 73.8L54.2 72L56.1 70.4L58.2 68.8L60.4 67.4L62.8 66L65.4 64.8L68.2 63.7L71.3 62.7L74.8 61.7L78.5 60.9L82.8 60.2L88 59.5L96.8 58.8L105.7 58.1L110.9 57.8L115.2 57.8L119.1 57.8L122.5 58.1L125.7 58.5L128.7 59.1L131.5 59.8L134.1 60.7L136.4 61.7L138.7 62.8L140.8 64.2L142.7 65.7L144.4 67.4L146.1 69.2L147.5 71.2L148.9 73.3L150 75.8L151.1 78.4L152 81.2L152.8 84.5L153.4 88.2L154 92.6Z",
      eyes: "pill",
      eyeSize: 0.58,
      eyeSpacing: 0.5,
      eyeHeight: 0.16,
      mouth: "none",
      cheeks: false,
    },
    layers: [
      {
        d: "M12 100A88 88 0 1 0 188 100A88 88 0 1 0 12 100Z",
        fill: "#07080b",
        place: "back",
      },
      {
        d: "M12 100A88 88 0 1 0 188 100A88 88 0 1 0 12 100Z",
        fill: "#3fe3f2",
        opacity: 0.1,
        place: "back",
      },
      {
        d: "M12 100A88 88 0 1 0 188 100A88 88 0 1 0 12 100Z",
        fill: "none",
        stroke: "#3fe3f2",
        width: 5,
        place: "front",
      },
      {
        d: "M36.6 63A79 79 0 0 1 82.4 24.3",
        fill: "none",
        stroke: "#ffffff",
        width: 3,
        opacity: 0.45,
        place: "front",
      },
    ],
  },
];

/** A seed as the registry compares it: lowercase letters and digits only. */
export function mascotIdentityKey(seed: string | number): string {
  return String(seed)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const BY_KEY = new Map<string, MascotIdentity>();
for (const identity of MASCOT_IDENTITIES) {
  for (const name of [identity.handle, identity.name, ...(identity.aliases ?? [])]) {
    BY_KEY.set(mascotIdentityKey(name), identity);
  }
}

/**
 * The canonical mascot a seed names, or `undefined` when it names none.
 * The whole seed has to be the name: "once-ui" resolves, "once-ui-fan" does not.
 *
 * Use it to guard text people choose: show the canonical mascot only when the
 * person owns it, and otherwise pass `canonical={false}` so they get the
 * generated one.
 *
 *     const owned = mascotIdentity(agent.name)?.owner === myOrg.slug;
 *     <Mascot seed={agent.name} canonical={owned} />
 */
export function mascotIdentity(seed: string | number | undefined): MascotIdentity | undefined {
  if (seed === undefined) return undefined;
  const key = mascotIdentityKey(seed);
  return key ? BY_KEY.get(key) : undefined;
}

/** Every name the registry holds, as keys: for reserving them in a sign-up or a name claim. */
export const MASCOT_IDENTITY_KEYS: readonly string[] = [...BY_KEY.keys()];
