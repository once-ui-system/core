import type { CSSProperties } from "react";
import classes from "./Placeholder.module.css";

interface Palette {
  bg: string;
  sun: string;
  hillA: string;
  hillB: string;
  wall: string;
  roof: string;
}

const PALETTES: Palette[] = [
  { bg: "#dbeafe", sun: "#fde68a", hillA: "#86efac", hillB: "#4ade80", wall: "#fff7ed", roof: "#c2410c" },
  { bg: "#fce7f3", sun: "#fef3c7", hillA: "#c4b5fd", hillB: "#a78bfa", wall: "#ffffff", roof: "#9d174d" },
  { bg: "#ccfbf1", sun: "#fef08a", hillA: "#7dd3fc", hillB: "#38bdf8", wall: "#f8fafc", roof: "#0f766e" },
  { bg: "#fef3c7", sun: "#fffbeb", hillA: "#fdba74", hillB: "#fb923c", wall: "#fffbeb", roof: "#7c2d12" },
  { bg: "#e0e7ff", sun: "#fde68a", hillA: "#a5b4fc", hillB: "#818cf8", wall: "#f5f3ff", roof: "#3730a3" },
  { bg: "#dcfce7", sun: "#fef9c3", hillA: "#bef264", hillB: "#84cc16", wall: "#f7fee7", roof: "#365314" },
];

export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

interface PlaceholderProps {
  seed: string;
  /** Offsets the palette so gallery frames of one home differ from each other. */
  variant?: number;
}

/** A decorative, CSS-only "photo" of a home. Hidden from assistive tech. */
export function Placeholder({ seed, variant = 0 }: PlaceholderProps) {
  const p = PALETTES[(hashString(seed) + variant) % PALETTES.length];
  const style = {
    "--ph-bg": p.bg,
    "--ph-sun": p.sun,
    "--ph-hill-a": p.hillA,
    "--ph-hill-b": p.hillB,
    "--ph-wall": p.wall,
    "--ph-roof": p.roof,
  } as CSSProperties;

  return (
    <div className={classes.root} style={style} aria-hidden="true">
      <div className={classes.sun} />
      <div className={classes.hill} />
      <div className={classes.hill2} />
      <div className={classes.house}>
        <div className={classes.roof} />
        <div className={classes.body} />
        <div className={`${classes.window} ${classes.windowL}`} />
        <div className={`${classes.window} ${classes.windowR}`} />
        <div className={classes.door} />
      </div>
    </div>
  );
}
