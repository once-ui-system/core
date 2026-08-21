"use client";

import type { CSSProperties } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import { Flex, type FlexComponentProps } from "./Flex";

export interface NavIconProps extends FlexComponentProps {
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  isActive?: boolean;
}

const NavIcon = forwardRef<HTMLDivElement, NavIconProps>(
  ({ className, isActive = false, style, onClick, ...rest }, ref) => {
    return (
      <Flex
        ref={ref}
        tabIndex={0}
        radius="m"
        cursor="interactive"
        width="40"
        height="40"
        minHeight="40"
        minWidth="40"
        position="relative"
        className={className}
        style={style}
        onClick={onClick}
        {...rest}
      >
        <div
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 h-px w-24 bg-neutral-on-background-strong transition-transform duration-300",
            isActive ? "translate-y-0 rotate-45" : "-translate-y-4",
          )}
        />
        <div
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 h-px w-24 bg-neutral-on-background-strong transition-transform duration-300",
            isActive ? "translate-y-0 -rotate-45" : "translate-y-4",
          )}
        />
      </Flex>
    );
  },
);

NavIcon.displayName = "NavIcon";

export { NavIcon };
