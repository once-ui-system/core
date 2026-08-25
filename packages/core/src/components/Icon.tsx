"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import type { IconType } from "react-icons";
import { cn } from "../classes/utils";
import { useIcons } from "../contexts/IconProvider";
import type { IconName } from "../icons";
import type { ColorScheme, ColorWeight, TShirtSizes } from "../types";
import { Flex, type FlexComponentProps } from "./Flex";
import { HoverCard } from "./HoverCard";
import { Tooltip } from "./Tooltip";

export const iconVariants = cva("inline-flex items-center justify-center", {
  variants: {
    size: {
      xs: "text-[length:var(--static-space-16)]",
      s: "text-[length:var(--static-space-20)]",
      m: "text-[length:var(--static-space-24)]",
      l: "text-[length:var(--static-space-32)]",
      xl: "text-[length:var(--static-space-40)]",
    },
  },
  defaultVariants: {
    size: "m",
  },
});

export interface IconProps extends FlexComponentProps {
  name: IconName;
  onBackground?: `${ColorScheme}-${ColorWeight}`;
  onSolid?: `${ColorScheme}-${ColorWeight}`;
  size?: TShirtSizes;
  decorative?: boolean;
  tooltip?: ReactNode;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  className?: string;
  style?: CSSProperties;
}

const Icon = forwardRef<HTMLDivElement, IconProps>(
  (
    {
      name,
      onBackground,
      onSolid,
      size = "m",
      decorative = true,
      tooltip,
      tooltipPosition = "top",
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const { icons } = useIcons();
    const IconComponent: IconType | undefined = icons[name];

    if (!IconComponent) {
      console.warn(`Icon "${name}" does not exist in the library.`);
      return null;
    }

    if (onBackground && onSolid) {
      console.warn(
        "You cannot use both 'onBackground' and 'onSolid' props simultaneously. Only one will be applied.",
      );
    }

    const icon = (
      <Flex
        inline
        fit
        as="span"
        ref={ref}
        onBackground={onBackground}
        onSolid={onSolid}
        className={cn(iconVariants({ size }), className)}
        aria-hidden={decorative ? "true" : undefined}
        aria-label={decorative ? undefined : name}
        style={style}
        {...rest}
      >
        <IconComponent />
      </Flex>
    );

    if (tooltip) {
      return (
        <HoverCard trigger={icon} placement={tooltipPosition} offsetDistance="4">
          <Tooltip label={tooltip} />
        </HoverCard>
      );
    }

    return icon;
  },
);

Icon.displayName = "Icon";

export { Icon };
