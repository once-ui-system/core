import classNames from "clsx";
import React, { ReactNode } from "react";
import { ColorScheme, ColorWeight, CSSUnit, SpacingToken } from "../types.js";
import { cssLength } from "../utils/layoutClasses.js";
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
  /** Backdrop blur: a number is on the token scale (`8` is 0.5rem), a string a CSS length. Default 0.5rem. */
  blur?: number | CSSUnit;
  pattern?: {
    display?: boolean;
    size?: SpacingToken;
  };
  style?: React.CSSProperties;
  children?: ReactNode;
}

const Fade = ({
  ref,
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
}: FadeProps) => {
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

  const backdropBlur = `blur(${blur === undefined ? "0.5rem" : cssLength(blur)})`;

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
          // The `.mask` class blurs at a fixed 0.5rem; only pattern mode
          // used to write `blur`, so outside it the prop did nothing.
          backdropFilter: backdropBlur,
          WebkitBackdropFilter: backdropBlur,
          ...(pattern.display && {
            backgroundImage: `linear-gradient(var(--gradient-direction), var(--base-color), transparent), radial-gradient(transparent 1px, var(--base-color) 1px)`,
            backgroundSize: `100% 100%, var(--static-space-${pattern.size}) var(--static-space-${pattern.size})`,
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
};

Fade.displayName = "Fade";

export { Fade };
