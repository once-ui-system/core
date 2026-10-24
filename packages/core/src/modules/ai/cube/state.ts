/* What the cube mascot is doing, frame by frame, with no drawing in it: the turns of the 2 × 2
   cube, the blob ↔ cube morph, the solved beat and the face's pose. The view reads it. */

import {
  clamp,
  easeInOut,
  mix,
  type Quat,
  quatAxisAngle,
  quatIdentity,
  quatMultiply,
  rotate,
  smooth,
  snapQuarterTurns,
  type Vec3,
} from "./math.js";

export type CubeState = "idle" | "listening" | "thinking" | "speaking" | "sleeping";
export type CubeMood =
  | "neutral"
  | "happy"
  | "surprised"
  | "sad"
  | "skeptical"
  | "wink"
  | "focused"
  | "determined";

export interface CubeInput {
  state: CubeState;
  mood: CubeMood;
  /** Where to look, each from -1 to 1. */
  lookX: number;
  lookY: number;
  /** Loudness from 0 to 1 while speaking. */
  level: number;
  reduced: boolean;
  personality: "calm" | "default" | "bouncy";
  /** How many times it has been poked; each new one squashes it. */
  pokes?: number;
  /** Glyph eyes are drawn over the canvas, so the 3D eyes step aside. */
  hideEyes?: boolean;
  /** A wide open laughing grin. */
  laugh?: boolean;
}

/** A quarter turn of one layer: `axis` x, y or z, the layer on the `side` (+1 or -1), and the direction. */
export interface Move {
  axis: 0 | 1 | 2;
  side: 1 | -1;
  dir: 1 | -1;
}

/** Eyes: scale and tilt per side, lift. Brows: lift and inner-end drop per side. Mouth: bend, width, open, tilt. */
export interface Pose {
  esxL: number;
  esyL: number;
  esxR: number;
  esyR: number;
  edy: number;
  etL: number;
  etR: number;
  byL: number;
  byR: number;
  baL: number;
  baR: number;
  curve: number;
  width: number;
  open: number;
  tilt: number;
}

const BASE: Pose = {
  esxL: 1,
  esyL: 1,
  esxR: 1,
  esyR: 1,
  edy: 0,
  etL: 0,
  etR: 0,
  byL: 0,
  byR: 0,
  baL: 0,
  baR: 0,
  curve: 0.45,
  width: 0.16,
  open: 0,
  tilt: 0,
};

/* Each mood is a pose; the face eases toward it, so a change reads as an expression, not a cut. */
const MOODS: Record<CubeMood | "sleepy", Partial<Pose>> = {
  neutral: {},
  happy: {
    esyL: 0.45,
    esyR: 0.45,
    edy: 0.05,
    byL: 0.05,
    byR: 0.05,
    baL: -0.15,
    baR: -0.15,
    curve: 1,
    width: 0.2,
  },
  surprised: {
    esxL: 1.18,
    esyL: 1.22,
    esxR: 1.18,
    esyR: 1.22,
    byL: 0.11,
    byR: 0.11,
    curve: 0,
    width: 0.06,
    open: 1,
  },
  sad: {
    esyL: 0.85,
    esyR: 0.85,
    edy: -0.02,
    byL: 0.02,
    byR: 0.02,
    baL: -0.45,
    baR: -0.45,
    curve: -0.7,
    width: 0.13,
  },
  skeptical: {
    esyL: 0.55,
    etL: -0.2,
    byL: -0.03,
    baL: 0.3,
    byR: 0.09,
    baR: -0.15,
    curve: 0.1,
    width: 0.13,
    tilt: 0.28,
  },
  wink: { esyL: 0.1, byL: -0.04, baL: 0.1, byR: 0.04, curve: 0.85, width: 0.17, tilt: -0.15 },
  focused: {
    esyL: 0.62,
    esyR: 0.62,
    byL: -0.035,
    byR: -0.035,
    baL: 0.22,
    baR: 0.22,
    curve: 0,
    width: 0.1,
  },
  determined: {
    esyL: 0.72,
    esyR: 0.72,
    byL: -0.04,
    byR: -0.04,
    baL: 0.5,
    baR: 0.5,
    curve: -0.15,
    width: 0.15,
  },
  sleepy: {
    esyL: 0.08,
    esyR: 0.08,
    edy: -0.05,
    byL: -0.05,
    byR: -0.05,
    baL: -0.12,
    baR: -0.12,
    curve: 0.3,
    width: 0.08,
  },
};

const SPEED = { calm: 0.7, default: 1, bouncy: 1.25 } as const;
const HOP = { calm: 0.12, default: 0.3, bouncy: 0.45 } as const;
const SQUASH = { calm: 0.6, default: 1, bouncy: 1.4 } as const;

export interface Cubie {
  home: Vec3;
  q: Quat;
}

export class CubeMotion {
  cubies: Cubie[] = [];
  mode: "idle" | "thinking" | "solving" = "idle";
  /** 0 is the blob, 1 the cube. */
  morph = 0;
  /** 1 while the face shows, 0 while it works as the cube. */
  face = 1;
  /** Seconds left on the solved cube's logo beat. */
  hold = 0;
  hop = 0;
  celebrate = 0;
  /** Seconds since the last poke. */
  pokeT = 9;
  /** How far a poke presses it in now: positive is squashed, negative stretched. */
  squash = 0;
  rot = { x: 0.12, y: 0, spin: 0 };
  pose: Pose = { ...BASE };
  /** 0 open, 1 shut. */
  blink = 0;
  breathe = 0;
  history: Move[] = [];
  active: {
    move: Move;
    turning: Cubie[];
    start: Quat[];
    angle: number;
    t: number;
    duration: number;
  } | null = null;

  private morphFrom = 0;
  private morphTo = 0;
  private morphT = 1;
  private morphDuration = 1;
  private pause = 0;
  private time = 0;
  private nextBlink = 2;
  private blinkT = 1;
  private pokesSeen = 0;

  constructor(private random: () => number = Math.random) {
    for (const x of [-1, 1]) {
      for (const y of [-1, 1]) {
        for (const z of [-1, 1])
          this.cubies.push({ home: [x * 0.5, y * 0.5, z * 0.5], q: quatIdentity() });
      }
    }
  }

  /** True when every piece is home and nothing is turning. */
  get solved() {
    return !this.active && this.history.length === 0;
  }

  private startMove(move: Move, solving: boolean, speed: number) {
    const turning = this.cubies.filter(
      (c) => Math.sign(rotate(c.q, c.home)[move.axis]) === move.side,
    );
    this.active = {
      move,
      turning,
      start: turning.map((c) => [...c.q] as Quat),
      // clockwise as seen from the turned face
      angle: (-move.side * move.dir * Math.PI) / 2,
      t: 0,
      duration: (solving ? 0.2 : 0.34) / speed,
    };
  }

  private stepMove(dt: number) {
    const a = this.active;
    if (!a) return;
    a.t = Math.min(1, a.t + dt / a.duration);
    const turn = quatAxisAngle(a.move.axis, a.angle * easeInOut(a.t));
    a.turning.forEach((c, i) => {
      c.q = quatMultiply(turn, a.start[i]);
    });
    if (a.t >= 1) {
      for (const c of a.turning) c.q = snapQuarterTurns(c.q);
      this.active = null;
    }
  }

  private randomMove(): Move {
    const last = this.history[this.history.length - 1];
    let move: Move;
    do {
      move = {
        axis: Math.floor(this.random() * 3) as 0 | 1 | 2,
        side: this.random() < 0.5 ? 1 : -1,
        dir: this.random() < 0.5 ? 1 : -1,
      };
    } while (last && last.axis === move.axis);
    return move;
  }

  update(dt: number, input: CubeInput) {
    this.time += dt;
    const speed = SPEED[input.personality];
    const working = input.state === "thinking";

    if (working && this.mode !== "thinking") {
      this.mode = "thinking";
      this.pause = 0.35;
    } else if (!working && this.mode === "thinking") {
      this.mode = this.solved ? "idle" : "solving";
      if (this.mode === "idle") this.hold = input.reduced ? 0.3 : 1.3;
    }

    // after the last turn the solved cube shows the logo for a beat, then softens back into the blob
    const wasHolding = this.hold > 0;
    this.hold = Math.max(0, this.hold - dt);
    if (wasHolding && this.hold === 0) {
      this.hop = input.reduced ? 0 : 1;
      this.celebrate = 1.8;
    }
    const morphTarget = this.mode !== "idle" || !this.solved || this.hold > 0 ? 1 : 0;
    if (morphTarget !== this.morphTo) {
      this.morphFrom = this.morph;
      this.morphTo = morphTarget;
      this.morphT = 0;
      this.morphDuration =
        ((0.5 + 0.8 * Math.abs(this.morphTo - this.morphFrom)) * (input.reduced ? 0.3 : 1)) / speed;
    }
    if (this.morphT < 1) {
      this.morphT = Math.min(1, this.morphT + dt / this.morphDuration);
      this.morph = mix(this.morphFrom, this.morphTo, easeInOut(this.morphT));
    }
    const canTurn = this.morph >= 0.999;

    // With reduced motion the cube holds still instead of turning.
    if (this.mode === "thinking" && canTurn && !this.active && !input.reduced) {
      this.pause -= dt;
      if (this.pause <= 0) {
        if (this.history.length >= 14 || (this.history.length >= 8 && this.random() < 0.35)) {
          const last = this.history.pop() as Move;
          this.startMove({ ...last, dir: -last.dir as 1 | -1 }, false, speed);
        } else {
          const move = this.randomMove();
          this.history.push(move);
          this.startMove(move, false, speed);
        }
        // the odd hesitation reads as thinking
        this.pause = (this.random() < 0.18 ? 0.45 : 0.06) / speed;
      }
    }
    if (this.mode === "solving" && !this.active) {
      if (this.history.length && canTurn) {
        const last = this.history.pop() as Move;
        this.startMove({ ...last, dir: -last.dir as 1 | -1 }, true, speed);
      } else if (!this.history.length) {
        this.mode = "idle";
        this.hold = input.reduced ? 0.3 : 1.3;
      }
    }
    this.stepMove(dt);

    // The face belongs to the blob: it fades as the body firms into a cube, and returns as it softens.
    this.face = 1 - smooth(0, 0.45, this.morph);

    // Three-quarter view while working, the logo diamond when solved, face on as the blob.
    const logo = this.hold > 0 && this.mode === "idle";
    const still = input.reduced ? 0 : 1;
    const sway = Math.sin(this.time * 0.5) * 0.12 * still;
    // lookY is positive downward; tipping the top toward the viewer looks down
    const tx = this.mode !== "idle" ? 0.5 : logo ? 0.04 : 0.12 + input.lookY * 0.3;
    const ty = this.mode !== "idle" ? -0.68 + sway : logo ? 0 : input.lookX * 0.5;
    const tz = logo ? Math.PI / 4 : 0;
    const k = 1 - Math.exp(-dt * 4 * speed);
    this.rot.x += (tx - this.rot.x) * k;
    this.rot.y += (ty - this.rot.y) * k;
    this.rot.spin += (tz - this.rot.spin) * k;

    // A poke presses it in, then it wobbles back like a spring, and blinks.
    const pokes = input.pokes ?? 0;
    if (pokes !== this.pokesSeen) {
      this.pokesSeen = pokes;
      this.pokeT = 0;
      if (!input.reduced) this.blinkT = 0;
    }
    this.pokeT += dt;
    this.squash =
      input.reduced || this.pokeT > 1.2
        ? 0
        : Math.exp(-this.pokeT * 6) * Math.sin(this.pokeT * 22) * 0.16 * SQUASH[input.personality];

    this.hop = Math.max(0, this.hop - dt * 1.6);
    const breatheRate = input.state === "sleeping" ? 1.1 : 2.2;
    this.breathe = Math.sin(this.time * breatheRate) * 0.02 * (1 - this.morph) * still;
    this.celebrate = Math.max(0, this.celebrate - dt);

    // Blink: eases shut and open over a quarter second; now and then twice. Never while asleep.
    this.nextBlink -= dt;
    this.blinkT += dt;
    if (this.nextBlink < 0 && input.state !== "sleeping" && !input.reduced) {
      this.blinkT = 0;
      this.nextBlink = this.random() < 0.15 ? 0.32 : 2.4 + this.random() * 3;
    }
    const b = this.blinkT / 0.26;
    this.blink = b < 1 ? Math.sin(Math.PI * b) ** 1.4 : 0;

    const target = poseFor(
      this.pokeT < 0.6 ? "surprised" : this.celebrate > 0 ? "happy" : input.mood,
      input,
    );
    const ease = input.reduced ? 1 : 1 - Math.exp(-dt * 11);
    for (const key of Object.keys(this.pose) as (keyof Pose)[]) {
      this.pose[key] += (target[key] - this.pose[key]) * ease;
    }
  }

  /** How high the solved hop is now, scaled by personality. */
  hopHeight(personality: CubeInput["personality"]) {
    return Math.sin((1 - this.hop) * Math.PI) * this.hop * HOP[personality];
  }
}

export function poseFor(mood: CubeMood, input: Pick<CubeInput, "state" | "level" | "laugh">): Pose {
  const pose: Pose = { ...BASE, ...MOODS[mood] };
  if (input.state === "sleeping") Object.assign(pose, MOODS.sleepy);
  if (input.state === "listening") {
    pose.esxL *= 1.08;
    pose.esxR *= 1.08;
    pose.esyL *= 1.08;
    pose.esyR *= 1.08;
    pose.byL += 0.04;
    pose.byR += 0.04;
  }
  if (input.state === "speaking") {
    pose.open = clamp(0.25 + input.level * 0.75, 0, 1);
  } else if (input.laugh) {
    pose.open = 0.8;
  }
  return pose;
}
