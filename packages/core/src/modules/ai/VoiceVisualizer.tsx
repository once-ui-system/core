"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef, useCallback, useEffect, useRef } from "react";
import { Flex } from "../../components/Flex";
import { VisuallyHidden } from "../../components/VisuallyHidden";
import styles from "./Ai.module.scss";
import { type AudioLevelSource, createAudioMeter } from "./audioLevel";

export type VoiceState = "idle" | "listening" | "thinking" | "speaking";

export interface VoiceVisualizerProps extends Omit<React.ComponentProps<typeof Flex>, "children"> {
  /** What the voice session is doing. Each state has its own motion. */
  state?: VoiceState;
  /** `orb`: a glowing sphere, for a full-screen voice mode. `bars`: a compact meter, for a composer or call bar. */
  variant?: "orb" | "bars";
  /**
   * Loudness from 0 to 1, when you already have it. Takes precedence over `source`.
   * Without either, each state plays a stand-in animation.
   */
  level?: number;
  /** A microphone stream, the `<audio>` element of the reply, or an `AnalyserNode`. */
  source?: AudioLevelSource | null;
  size?: "s" | "m" | "l" | "xl";
  color?: "brand" | "accent" | "neutral";
  /** Number of bars in the `bars` variant. */
  bars?: number;
  /** What screen readers announce. Defaults to the state: "Listening", "Speaking"… */
  ariaLabel?: string;
}

const STATE_LABEL: Record<VoiceState, string> = {
  idle: "Voice ready",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
};

/**
 * The animation for a voice conversation: idle, listening, thinking and
 * speaking each move differently, and with a `level` or an audio `source`
 * the orb swells and the bars dance to the actual sound.
 *
 * Audio levels are written straight to CSS variables every frame, so a live
 * microphone never re-renders React. With reduced motion the stand-in
 * animations are off; real audio still shows, as glow on the orb and as bar
 * height, because that is feedback the person needs.
 */
const VoiceVisualizer = forwardRef<HTMLDivElement, VoiceVisualizerProps>(
  (
    {
      state = "idle",
      variant = "orb",
      level,
      source,
      size = "m",
      color = "brand",
      bars = 5,
      ariaLabel,
      className,
      style,
      ...flex
    },
    forwardedRef,
  ) => {
    const root = useRef<HTMLDivElement | null>(null);
    const ref = useCallback(
      (node: HTMLDivElement | null) => {
        root.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    const live = level !== undefined || Boolean(source);

    // A level from props: one write per change, no loop.
    useEffect(() => {
      const node = root.current;
      if (!node || level === undefined) return;
      const clamped = Math.max(0, Math.min(1, level));
      node.style.setProperty("--voice-level", String(clamped));
      // Without bands, the bars take the level shaped like a voice: louder in the middle.
      for (let i = 0; i < bars; i++) {
        const shape = 1 - Math.abs(i - (bars - 1) / 2) / bars;
        node.style.setProperty(`--voice-bar-${i}`, String(clamped * (0.55 + shape * 0.45)));
      }
    }, [level, bars]);

    // Once nothing drives it, drop the last values so the stand-in starts from rest.
    useEffect(() => {
      const node = root.current;
      if (!node || live) return;
      node.style.removeProperty("--voice-level");
      for (let i = 0; i < bars; i++) node.style.removeProperty(`--voice-bar-${i}`);
    }, [live, bars]);

    // A source: read it every frame and write the variables directly.
    useEffect(() => {
      const node = root.current;
      if (!node || !source || level !== undefined) return;
      const meter = createAudioMeter(source);
      if (!meter) return;
      const bands = new Float32Array(bars);
      // The middle bar gets the strongest band, like a voice meter.
      const order = Array.from({ length: bars }, (_, i) => i).sort(
        (a, b) => Math.abs(a - (bars - 1) / 2) - Math.abs(b - (bars - 1) / 2),
      );
      let frame = 0;
      const tick = () => {
        node.style.setProperty("--voice-level", meter.level().toFixed(3));
        if (variant === "bars") {
          meter.bands(bands);
          order.forEach((bar, band) => {
            node.style.setProperty(`--voice-bar-${bar}`, bands[band].toFixed(3));
          });
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => {
        cancelAnimationFrame(frame);
        meter.disconnect();
      };
    }, [source, level, bars, variant]);

    return (
      <Flex
        ref={ref}
        center
        role="status"
        data-state={state}
        data-live={live || undefined}
        className={classNames(
          styles.voice,
          styles[`voice-${variant}`],
          styles[`voice-${size}`],
          className,
        )}
        style={
          {
            // The hue itself, not --*-solid-*: those turn neutral under data-solid="contrast".
            "--voice-color": `var(--function-${color}-500)`,
            "--voice-glow": `var(--function-${color}-400)`,
            "--voice-soft": `var(--${color}-alpha-medium)`,
            ...style,
          } as React.CSSProperties
        }
        {...flex}
      >
        <VisuallyHidden>{ariaLabel ?? STATE_LABEL[state]}</VisuallyHidden>
        {variant === "orb" ? (
          <>
            <span className={styles.voiceRing} aria-hidden="true" />
            <span
              className={classNames(styles.voiceRing, styles.voiceRingLate)}
              aria-hidden="true"
            />
            <span className={styles.voiceOrb} aria-hidden="true">
              <span className={styles.voiceSwirl} />
            </span>
          </>
        ) : (
          Array.from({ length: bars }, (_, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: bars are positional and never reorder
              key={i}
              className={styles.voiceBar}
              aria-hidden="true"
              style={
                {
                  "--voice-bar": `var(--voice-bar-${i}, 0)`,
                  "--voice-index": i,
                  "--voice-offset": Math.abs(i - (bars - 1) / 2),
                } as React.CSSProperties
              }
            />
          ))
        )}
      </Flex>
    );
  },
);

VoiceVisualizer.displayName = "VoiceVisualizer";

export { VoiceVisualizer };
