"use client";

import type { Placement } from "@floating-ui/react-dom";
import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import { Column } from "./Column";
import { DropdownWrapper, type DropdownWrapperProps } from "./DropdownWrapper";
import { User, type UserProps } from "./User";

export const userMenuVariants = cva("border border-solid transition-colors duration-micro-medium", {
  variants: {
    selected: {
      true: "border-neutral-border-medium bg-neutral-background-strong hover:border-neutral-border-strong hover:bg-neutral-background-strong",
      false:
        "border-transparent bg-transparent hover:border-neutral-alpha-medium hover:bg-neutral-alpha-weak",
    },
  },
  defaultVariants: {
    selected: false,
  },
});

export interface UserMenuProps
  extends UserProps,
    Pick<DropdownWrapperProps, "minHeight" | "minWidth" | "maxWidth"> {
  selected?: boolean;
  placement?: Placement;
  dropdown?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const UserMenu = forwardRef<HTMLDivElement, UserMenuProps>(
  (
    {
      selected = false,
      dropdown,
      minWidth,
      maxWidth,
      minHeight,
      placement,
      className,
      style,
      loading,
      ...userProps
    },
    ref,
  ) => {
    return (
      <DropdownWrapper
        ref={ref}
        minWidth={minWidth}
        maxWidth={maxWidth}
        minHeight={minHeight}
        placement={placement}
        disableTriggerClick={loading}
        style={{
          borderRadius: "var(--radius-full)",
        }}
        trigger={
          <Column
            tabIndex={loading ? -1 : 0}
            padding="4"
            radius="full"
            cursor={loading ? "default" : "interactive"}
            pointerEvents={loading ? "none" : "auto"}
            className={cn(
              userMenuVariants({ selected: Boolean(selected) }),
              selected && "selected",
              className,
            )}
            style={style}
          >
            <User loading={loading} {...userProps} />
          </Column>
        }
        dropdown={dropdown}
      />
    );
  },
);

UserMenu.displayName = "UserMenu";

export { UserMenu };
