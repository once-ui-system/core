"use client";

import { type CSSProperties, forwardRef, type ReactNode, type Ref } from "react";
import { cn } from "../classes/utils";
import { ElementType } from "./ElementType";
import { Flex, type FlexComponentProps } from "./Flex";

export interface CardProps extends FlexComponentProps {
  children?: ReactNode;
  href?: string;
  onClick?: () => void;
  fillHeight?: boolean;
  style?: CSSProperties;
  className?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      href,
      onClick,
      style,
      className,
      fillHeight,
      background = "surface",
      onBackground = "neutral-strong",
      transition = "macro-medium",
      border = "neutral-medium",
      radius = "l",
      cursor = "interactive",
      align = "left",
      ...flex
    },
    ref,
  ) => {
    const isInteractive = Boolean(onClick || href);

    return (
      <ElementType
        tabIndex={isInteractive ? 0 : undefined}
        className={cn(
          "reset-button-styles flex w-full min-w-0 text-left",
          fillHeight && "h-full min-h-0",
          isInteractive && "focus-ring",
          isInteractive && (radius ? `rounded-${radius}` : "rounded-l"),
        )}
        href={href}
        onClick={onClick}
        role={onClick ? "button" : href ? "link" : "none"}
        ref={ref as Ref<HTMLElement>}
      >
        <Flex
          fillWidth
          fillHeight={fillHeight}
          background={background}
          onBackground={onBackground}
          transition={transition}
          border={border}
          radius={radius}
          cursor={cursor}
          align={align}
          onClick={onClick}
          className={cn(isInteractive && "hover:bg-neutral-alpha-weak", className)}
          style={style}
          {...flex}
        >
          {children}
        </Flex>
      </ElementType>
    );
  },
);

Card.displayName = "Card";

export { Card };
