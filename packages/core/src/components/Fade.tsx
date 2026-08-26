import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import type { ColorScheme, ColorWeight, SpacingToken } from "../types";
import { Flex, type FlexComponentProps } from "./Flex";

export const fadeVariants = cva(
  "[mask-size:100%_100%] [-webkit-mask-size:100%_100%] [mask-image:linear-gradient(var(--gradient-direction),black_20%,transparent_100%)] [-webkit-mask-image:linear-gradient(var(--gradient-direction),black_20%,transparent_100%)] [background:linear-gradient(var(--gradient-direction),var(--base-color),transparent)] [backdrop-filter:blur(var(--fade-blur))] [-webkit-backdrop-filter:blur(var(--fade-blur))]",
);
const FADE_BASE = fadeVariants();

export type BaseColor =
  | `${ColorScheme}-${ColorWeight}`
  | `${ColorScheme}-alpha-${ColorWeight}`
  | "surface"
  | "overlay"
  | "page"
  | "transparent";

export interface FadePatternProps {
  display?: boolean;
  size?: SpacingToken;
}

export interface FadeProps extends FlexComponentProps {
  className?: string;
  to?: "bottom" | "top" | "left" | "right";
  base?: BaseColor;
  blur?: number;
  pattern?: FadePatternProps;
  style?: CSSProperties;
  children?: ReactNode;
}

const GRADIENT_DIRECTIONS = {
  top: "0deg",
  right: "90deg",
  bottom: "180deg",
  left: "270deg",
} as const;

const getBaseVar = (base: BaseColor): string => {
  if (base === "page") return "var(--page-background)";
  if (base === "surface") return "var(--surface-background)";
  if (base === "overlay") return "var(--backdrop)";
  if (base === "transparent") return "var(--static-transparent)";

  const [scheme, weight] = base.includes("alpha") ? base.split("-alpha-") : base.split("-");

  return base.includes("alpha")
    ? `var(--${scheme}-alpha-${weight})`
    : `var(--${scheme}-background-${weight})`;
};

const Fade = forwardRef<HTMLDivElement, FadeProps>(
  (
    {
      to = "bottom",
      base = "page",
      pattern = {
        display: false,
        size: "4",
      },
      blur = 0.5,
      children,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    return (
      <Flex
        ref={ref}
        fillWidth
        style={
          {
            "--base-color": getBaseVar(base),
            "--gradient-direction": GRADIENT_DIRECTIONS[to] ?? "180deg",
            "--fade-blur": `${blur}rem`,
            ...(pattern.display && {
              backgroundImage:
                "linear-gradient(var(--gradient-direction), var(--base-color), transparent), radial-gradient(transparent 1px, var(--base-color) 1px)",
              backgroundSize: `100% 100%, var(--static-space-${pattern.size ?? "4"}) var(--static-space-${pattern.size ?? "4"})`,
            }),
            ...style,
          } as CSSProperties
        }
        className={cn(FADE_BASE, className)}
        {...rest}
      >
        {children}
      </Flex>
    );
  },
);

Fade.displayName = "Fade";

export { Fade };
