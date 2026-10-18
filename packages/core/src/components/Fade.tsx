import classNames from "clsx";
import React, { forwardRef, ReactNode } from "react";
import { ColorScheme, ColorWeight, CSSUnit, SpacingToken } from "../types.js";
import styles from "./Fade.module.scss";
import { Flex } from "./Flex.js";

export type BaseColor =
  | `${ColorScheme}-${ColorWeight}`
  | `${ColorScheme}-alpha-${ColorWeight}`
  | "surface"
  | "overlay"
  | "page"
  | "transparent";

interface FadeProps extends React.ComponentProps<typeof Flex> {
  className?: string;
  to?: "bottom" | "top" | "left" | "right";
  base?: BaseColor;
  /** Backdrop blur: a number is px, a string a CSS length. Default 0.5rem (a number was rem until 3.0). */
  blur?: number | CSSUnit;
  pattern?: {
    display?: boolean;
    size?: SpacingToken;
  };
  style?: React.CSSProperties;
  children?: ReactNode;
}

const Fade = forwardRef<HTMLDivElement, FadeProps>(
  (
    {
      to = "bottom",
      base = "page",
      pattern = {
        display: false,
        size: "4",
      },
      blur,
      children,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const getBaseVar = (base: BaseColor) => {
      if (base === "page") return "var(--page-background)";
      if (base === "surface") return "var(--surface-background)";
      if (base === "overlay") return "var(--backdrop)";
      if (base === "transparent") return "var(--static-transparent)";

      const [scheme, weight] = base.includes("alpha") ? base.split("-alpha-") : base.split("-");

      return base.includes("alpha")
        ? `var(--${scheme}-alpha-${weight})`
        : `var(--${scheme}-background-${weight})`;
    };

    return (
      <Flex
        ref={ref}
        fillWidth
        style={
          {
            "--base-color": getBaseVar(base),
            "--gradient-direction":
              to === "top"
                ? "0deg"
                : to === "right"
                  ? "90deg"
                  : to === "bottom"
                    ? "180deg"
                    : "270deg",
            ...(pattern.display && {
              backgroundImage: `linear-gradient(var(--gradient-direction), var(--base-color), transparent), radial-gradient(transparent 1px, var(--base-color) 1px)`,
              backgroundSize: `100% 100%, var(--static-space-${pattern.size}) var(--static-space-${pattern.size})`,
              backdropFilter: `blur(${blur === undefined ? "0.5rem" : typeof blur === "number" ? `${blur}px` : blur})`,
            }),
            ...style,
          } as React.CSSProperties
        }
        className={classNames(styles.mask, className)}
        {...rest}
      >
        {children}
      </Flex>
    );
  },
);

Fade.displayName = "Fade";

export { Fade };
