"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import {
  type ReactionMotion,
  type ReactionOption,
  reactionLabel,
  reactionMotion,
} from "./reactionMotion";
import styles from "./Social.module.scss";

export interface ReactionProps
  extends ReactionOption,
    Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  size?: "s" | "m" | "l" | "xl";
  /**
   * When the gesture plays: `hover` once per pointer visit, `loop` every few
   * seconds, `manual` only when `playKey` changes.
   */
  trigger?: "hover" | "loop" | "manual";
  /** Change it (a counter works) to play the gesture again. */
  playKey?: number | string;
  /** Hidden from screen readers, when a control around it already names it. */
  decorative?: boolean;
  /** Draws the reaction instead of the emoji or `src`, such as a Lottie player. */
  children?: React.ReactNode;
}

/** The emoji or image inside, so the burst can draw the same thing. */
export const ReactionGlyph = ({ option }: { option: ReactionOption }) =>
  option.src ? (
    // biome-ignore lint/performance/noImgElement: an image optimizer keeps only an animated reaction's first frame
    <img src={option.src} alt="" draggable={false} />
  ) : (
    (option.emoji ?? option.value)
  );

/**
 * One reaction, drawn at a fixed size with its own gesture: a heart beats, a
 * thumbs-up nods, a laugh shakes, fire flickers. Give it `src` for an image of
 * your own, such as an animated WebP, and `motion` to choose its gesture.
 *
 * The gesture never plays on its own at first render, and not at all under
 * reduced motion.
 */
const Reaction = forwardRef<HTMLSpanElement, ReactionProps>(
  (
    {
      value,
      emoji,
      src,
      label,
      motion,
      size = "m",
      trigger = "hover",
      playKey,
      decorative = false,
      children,
      className,
      onPointerEnter,
      ...rest
    },
    ref,
  ) => {
    const option = { value, emoji, src, label, motion };
    const kind: ReactionMotion = reactionMotion(option);
    // Each run remounts the moving span, which restarts its animation.
    const [run, setRun] = useState(0);
    const playing = useRef(false);
    const mounted = useRef(false);

    const play = () => {
      if (kind === "none" || playing.current) return;
      playing.current = true;
      setRun((current) => current + 1);
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: replays on a new key only
    useEffect(() => {
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      if (playKey === undefined) return;
      playing.current = false;
      play();
    }, [playKey]);

    const loop = trigger === "loop" && kind !== "none";
    const active = loop || run > 0;

    // Named, or hidden when the control around it already names it.
    const a11y = decorative
      ? { "aria-hidden": true as const }
      : { role: "img", "aria-label": reactionLabel(option) };

    return (
      <span
        ref={ref}
        {...a11y}
        className={classNames(styles.glyph, styles[size], className)}
        onPointerEnter={(event) => {
          if (trigger === "hover") play();
          onPointerEnter?.(event);
        }}
        {...rest}
      >
        <span
          key={run}
          className={classNames(
            styles.glyph,
            styles.motion,
            styles[size],
            active && [styles.play, styles[kind]],
            loop && styles.loop,
          )}
          onAnimationEnd={() => {
            playing.current = false;
          }}
        >
          {children ?? <ReactionGlyph option={option} />}
        </span>
      </span>
    );
  },
);

Reaction.displayName = "Reaction";

export { Reaction };
