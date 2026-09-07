"use client";

import React, { forwardRef } from "react";
import { BlobFx, CelebrationFx, Flex, MatrixFx, Particle, WeatherFx } from ".";

/**
 * The ambient effects that are interchangeable with one another: each paints a
 * full-bleed decorative layer behind its content and none of them owns any
 * layout. `"none"` renders the content with no layer at all, which is what
 * makes the whole set switchable from a single setting.
 */
type EffectType = "none" | "blob" | "matrix" | "weather" | "particle" | "celebration";

interface EffectProps extends React.ComponentProps<typeof Flex> {
  /**
   * Which ambient layer to paint. This is the whole point of the component: a
   * template can expose one setting and swap its aesthetic without any of its
   * pages knowing which effect they ended up with.
   */
  type?: EffectType;
  /**
   * Palette for the layer, shared across every effect that paints in colour.
   * `particle` takes a single colour, so it uses the first entry. `blob` paints
   * from the accent scheme and ignores this.
   */
  colors?: string[];
  /** Shared animation speed. Ignored by `blob`, which is seeded, not timed. */
  speed?: number;
  reducedMotion?: boolean | "auto";
  /**
   * Per-effect settings. Only the block matching `type` is read, so a template
   * can configure all of them up front and still switch with one prop. Anything
   * set here wins over the shared `colors`/`speed`/`reducedMotion` above.
   */
  blob?: Omit<React.ComponentProps<typeof BlobFx>, "children">;
  matrix?: Omit<React.ComponentProps<typeof MatrixFx>, "children">;
  weather?: Omit<React.ComponentProps<typeof WeatherFx>, "children">;
  particle?: Omit<React.ComponentProps<typeof Particle>, "children">;
  celebration?: Omit<React.ComponentProps<typeof CelebrationFx>, "children">;
  children?: React.ReactNode;
}

const Effect = forwardRef<HTMLDivElement, EffectProps>(
  (
    {
      type = "none",
      colors,
      speed,
      reducedMotion,
      blob,
      matrix,
      weather,
      particle,
      celebration,
      children,
      ...flex
    },
    ref,
  ) => {
    // Every layer is positioned identically and sits under the children, so
    // switching `type` changes the look and nothing else.
    const layer = { position: "absolute", fill: true, top: "0", left: "0" } as const;
    const shared = { speed, reducedMotion };

    const effect = (() => {
      switch (type) {
        case "blob":
          return <BlobFx {...layer} {...blob} />;
        case "matrix":
          return <MatrixFx {...layer} {...shared} colors={colors} {...matrix} />;
        case "weather":
          return <WeatherFx {...layer} {...shared} colors={colors} {...weather} />;
        case "celebration":
          return <CelebrationFx {...layer} {...shared} colors={colors} {...celebration} />;
        case "particle":
          return <Particle {...layer} {...shared} color={colors?.[0]} {...particle} />;
        default:
          return null;
      }
    })();

    return (
      <Flex ref={ref} fill position="relative" overflow="hidden" {...flex}>
        {effect}
        {children}
      </Flex>
    );
  },
);

Effect.displayName = "Effect";

export { Effect };
export type { EffectProps, EffectType };
