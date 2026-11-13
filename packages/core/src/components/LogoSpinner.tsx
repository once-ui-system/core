import classNames from "clsx";
import type React from "react";
import type { LeafPropsOf } from "../interfaces.js";
import type { TShirtSizes } from "../types.js";
import { Flex } from "./Flex.js";
import styles from "./LogoSpinner.module.scss";

/** The tones the mark takes: the brand or accent hue, the strongest neutral text, or the surrounding text color. */
export type LogoSpinnerTone = "brand" | "accent" | "neutral" | "inherit";

export interface LogoSpinnerProps extends Omit<LeafPropsOf<"div">, "children"> {
  size?: TShirtSizes;
  /**
   * `twist`: the four tiles part, turn a quarter and click back together.
   * `wave`: the tiles lift outward one after another, clockwise.
   */
  variant?: "twist" | "wave";
  /** `brand` by default, so it takes a chat theme's color inside a themed scope. */
  tone?: LogoSpinnerTone;
  /** Seconds per cycle. */
  speed?: number;
  /** What assistive tech announces; "Loading" by default. */
  "aria-label"?: string;
}

/* The hue at full strength whatever `data-solid` says (brand and accent),
   the way --brand-color-strong is; neutral is the strongest text color. */
const TONE: Record<Exclude<LogoSpinnerTone, "inherit">, string> = {
  brand: "var(--brand-color-strong)",
  accent: "var(--function-accent-500)",
  neutral: "var(--neutral-on-background-strong)",
};

/**
 * The four tiles of the Once UI mark, top, right, bottom, left, in the order
 * the wave visits them. Each carries the direction it moves when it lifts.
 */
const TILES = [
  {
    d: "M173.08 155.146L247.587 80.6393C273.772 54.4536 316.228 54.4536 342.413 80.6393L416.92 155.146L308.547 263.52C301.065 271.002 288.935 271.002 281.453 263.52L173.08 155.146Z",
    dx: 0,
    dy: -1,
  },
  {
    d: "M325.48 307.547C317.998 300.065 317.998 287.935 325.48 280.453L433.854 172.08L508.361 246.587C534.546 272.772 534.546 315.228 508.361 341.413L433.854 415.92L325.48 307.547Z",
    dx: 1,
    dy: 0,
  },
  {
    d: "M173.08 432.854L281.453 324.48C288.935 316.998 301.065 316.998 308.547 324.48L416.92 432.854L342.413 507.361C316.228 533.546 273.772 533.546 247.587 507.361L173.08 432.854Z",
    dx: 0,
    dy: 1,
  },
  {
    d: "M81.6393 341.413C55.4536 315.228 55.4536 272.772 81.6393 246.587L156.146 172.08L264.52 280.453C272.002 287.935 272.002 300.065 264.52 307.547L156.146 415.92L81.6393 341.413Z",
    dx: -1,
    dy: 0,
  },
];

/**
 * A loader drawn from the Once UI mark: the same four tiles as the logo,
 * moving. Use it where a product's own loader belongs, such as an assistant
 * working on a reply; `Spinner` stays the neutral one for buttons and fields.
 *
 * With reduced motion the tiles stop moving and fade in turn instead, so the
 * loader still says something is happening.
 */
const LogoSpinner = ({
  ref,
  size = "m",
  variant = "twist",
  tone = "brand",
  speed,
  "aria-label": ariaLabel = "Loading",
  className,
  style,
  ...rest
}: LogoSpinnerProps) => {
  return (
    <Flex
      ref={ref}
      center
      role="status"
      aria-label={ariaLabel}
      data-motion="essential"
      className={classNames(styles.root, styles[size], styles[variant], className)}
      style={
        {
          ...(tone !== "inherit" && { color: TONE[tone] }),
          ...(speed && { "--logo-spinner-duration": `${speed}s` }),
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <svg
        className={styles.mark}
        viewBox="0 0 590 589"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        {TILES.map((tile, index) => (
          <path
            key={tile.d}
            d={tile.d}
            className={styles.tile}
            style={
              {
                "--tile-x": tile.dx,
                "--tile-y": tile.dy,
                "--tile-index": index,
              } as React.CSSProperties
            }
          />
        ))}
      </svg>
    </Flex>
  );
};

LogoSpinner.displayName = "LogoSpinner";

export { LogoSpinner };
