import classNames from "clsx";
import type React from "react";
import styles from "./Mascot.module.scss";

/*
 * Kawaii moods: the expressive ones on top of the everyday set. Each is drawn
 * as a base mood (lids, brows, mouth, body) plus effects, small glyphs in the
 * face's own units, so the flat and the cube mascot share them. A glyph is
 * centered at 0,0 and an eye is one unit wide.
 */

/** The everyday moods every renderer draws natively. */
export type MascotBaseMood =
  | "neutral"
  | "happy"
  | "surprised"
  | "sad"
  | "skeptical"
  | "wink"
  | "focused"
  | "determined";

/** The kawaii moods, drawn as a base mood plus effects. */
export type MascotKawaiiMood =
  | "love"
  | "excited"
  | "laughing"
  | "embarrassed"
  | "crying"
  | "angry"
  | "confused";

/**
 * The effects a kawaii mood adds. Pass them in `effects` to show them with any
 * mood. `heartEyes`, `starEyes` and `laughEyes` replace the eyes.
 */
export type MascotEffect =
  | "heartEyes"
  | "starEyes"
  | "laughEyes"
  | "blush"
  | "sweat"
  | "tears"
  | "anger"
  | "hearts"
  | "sparkles"
  | "question";

export const KAWAII: Record<MascotKawaiiMood, { base: MascotBaseMood; effects: MascotEffect[] }> = {
  love: { base: "happy", effects: ["heartEyes", "blush", "hearts"] },
  excited: { base: "surprised", effects: ["starEyes", "sparkles"] },
  laughing: { base: "happy", effects: ["laughEyes", "blush"] },
  embarrassed: { base: "happy", effects: ["blush", "sweat"] },
  crying: { base: "sad", effects: ["tears"] },
  angry: { base: "determined", effects: ["anger"] },
  confused: { base: "skeptical", effects: ["sweat", "question"] },
};

export const isKawaii = (mood: string): mood is MascotKawaiiMood => mood in KAWAII;

/** The mood a renderer draws natively for any mood. */
export function baseMood(mood: string): MascotBaseMood {
  return isKawaii(mood) ? KAWAII[mood].base : (mood as MascotBaseMood);
}

/**
 * The effects to draw: the mood's own unless `effects` is `false`, plus any listed. Laughing
 * opens the mouth wide.
 */
export function effectsFor(
  mood: string,
  effects: boolean | MascotEffect[] = true,
): Set<MascotEffect> {
  const out = new Set<MascotEffect>();
  if (effects === false) return out;
  if (isKawaii(mood)) for (const effect of KAWAII[mood].effects) out.add(effect);
  if (Array.isArray(effects)) for (const effect of effects) out.add(effect);
  return out;
}

/** Which glyph, if any, replaces the eyes. */
export function eyeGlyph(effects: Set<MascotEffect>): "heart" | "star" | "laugh" | undefined {
  if (effects.has("heartEyes")) return "heart";
  if (effects.has("starEyes")) return "star";
  if (effects.has("laughEyes")) return "laugh";
  return undefined;
}

const HEART =
  "M0 0.42C-0.2 0.28-0.56 0.04-0.56-0.18C-0.56-0.38-0.42-0.5-0.27-0.5C-0.14-0.5-0.05-0.42 0-0.32C0.05-0.42 0.14-0.5 0.27-0.5C0.42-0.5 0.56-0.38 0.56-0.18C0.56 0.04 0.2 0.28 0 0.42Z";
const STAR =
  "M0-0.62C0.06-0.2 0.2-0.06 0.62 0C0.2 0.06 0.06 0.2 0 0.62C-0.06 0.2-0.2 0.06-0.62 0C-0.2-0.06-0.06-0.2 0-0.62Z";
const DROP = "M0-0.5C0.22-0.2 0.34 0 0.34 0.16A0.34 0.34 0 0 1-0.34 0.16C-0.34 0 -0.22-0.2 0-0.5Z";

/** An eye replaced by a glyph, one unit wide. `side` mirrors the laughing chevrons. */
export function EyeGlyph({ kind, side }: { kind: "heart" | "star" | "laugh"; side: -1 | 1 }) {
  if (kind === "heart") return <path d={HEART} className={styles.heart} />;
  if (kind === "star") return <path d={STAR} transform="scale(1.1)" className={styles.ink} />;
  return (
    <path
      d={`M${-0.3 * side} -0.3L${0.26 * side} 0L${-0.3 * side} 0.3`}
      className={styles.glyphLine}
    />
  );
}

/** Blush on one cheek: a soft oval with three short strokes. */
export function Blush() {
  return (
    <g>
      <ellipse rx={0.55} ry={0.3} className={styles.blush} />
      {[-0.22, 0, 0.22].map((x) => (
        <path key={x} d={`M${x - 0.06} 0.1L${x + 0.06} -0.1`} className={styles.blushLine} />
      ))}
    </g>
  );
}

/** A tear running down from under one eye. */
export function Tear({ delay = 0 }: { delay?: number }) {
  return (
    <g className={styles.tearTrack}>
      <path
        d={DROP}
        transform="scale(0.5)"
        className={styles.tear}
        style={{ animationDelay: `${delay}s` } as React.CSSProperties}
      />
    </g>
  );
}

export function Sweat() {
  return <path d={DROP} className={classNames(styles.water, styles.sweat)} />;
}

export function Anger() {
  return (
    <g className={styles.anger}>
      {[0, 90, 180, 270].map((r) => (
        <path key={r} d="M0.14 -0.42Q0.14 -0.14 0.42 -0.14" transform={`rotate(${r})`} />
      ))}
    </g>
  );
}

/** Symbols rising off the head, staggered. */
export function Floaters({ kind }: { kind: "hearts" | "sparkles" | "question" }) {
  const spots = [
    { x: -0.9, delay: 0, s: 0.8 },
    { x: 0.2, delay: 0.7, s: 1 },
    { x: 1.0, delay: 1.4, s: 0.7 },
  ];
  return (
    <g>
      {(kind === "question" ? spots.slice(1, 2) : spots).map(({ x, delay, s }) => (
        <g key={x} transform={`translate(${x} 0) scale(${s})`}>
          <g
            className={styles.floater}
            style={{ animationDelay: `${delay}s` } as React.CSSProperties}
          >
            {kind === "hearts" ? (
              <path d={HEART} className={styles.heart} />
            ) : kind === "sparkles" ? (
              <path d={STAR} className={styles.sparkle} />
            ) : (
              <text className={styles.question} textAnchor="middle" dominantBaseline="central">
                ?
              </text>
            )}
          </g>
        </g>
      ))}
    </g>
  );
}

/** Where a face's parts sit, in the drawing's own units. */
export interface FaceAnchors {
  /** Left and right eye centers. */
  eyes: [[number, number], [number, number]];
  /** One eye's width; every glyph scales from it. */
  unit: number;
  /** The top of the head. */
  top: number;
  /** The head's half width. */
  halfWidth: number;
}

/**
 * Everything kawaii except glyph eyes, laid out around a face. The flat
 * mascot draws it inside its face; the cube draws it over its canvas.
 */
export function KawaiiLayer({ effects, at }: { effects: Set<MascotEffect>; at: FaceAnchors }) {
  if (effects.size === 0) return null;
  const [[lx, ly], [rx, ry]] = at.eyes;
  const u = at.unit;
  const cx = (lx + rx) / 2;
  const float = effects.has("hearts")
    ? "hearts"
    : effects.has("sparkles")
      ? "sparkles"
      : effects.has("question")
        ? "question"
        : undefined;
  return (
    <g className={styles.kawaii}>
      {effects.has("blush") &&
        [
          [lx - u * 0.35, ly + u * 0.95],
          [rx + u * 0.35, ry + u * 0.95],
        ].map(([x, y]) => (
          <g key={x} transform={`translate(${x} ${y}) scale(${u})`}>
            <Blush />
          </g>
        ))}
      {effects.has("tears") &&
        [
          [lx, ly + u * 0.55],
          [rx, ry + u * 0.55],
        ].map(([x, y], i) => (
          <g key={x} transform={`translate(${x} ${y}) scale(${u})`}>
            <Tear delay={i * 0.45} />
          </g>
        ))}
      {effects.has("sweat") && (
        <g
          transform={`translate(${cx + at.halfWidth * 0.78} ${at.top + u * 1.6}) scale(${u * 0.9})`}
        >
          <Sweat />
        </g>
      )}
      {effects.has("anger") && (
        <g
          transform={`translate(${cx + at.halfWidth * 0.62} ${at.top + u * 0.9}) scale(${u * 1.2})`}
        >
          <Anger />
        </g>
      )}
      {float && (
        <g transform={`translate(${cx} ${at.top - u * 0.4}) scale(${u})`}>
          <Floaters kind={float} />
        </g>
      )}
    </g>
  );
}
