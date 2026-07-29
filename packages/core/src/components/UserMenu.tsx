"use client";

import React, { forwardRef } from "react";
import classNames from "clsx";
import { DropdownWrapper, User, UserProps, DropdownWrapperProps, Column } from ".";
import styles from "./UserMenu.module.scss";
import { Placement } from "@floating-ui/react-dom";

interface UserMenuProps
  extends UserProps,
    Pick<DropdownWrapperProps, "minHeight" | "minWidth" | "maxWidth"> {
  selected?: boolean;
  placement?: Placement;
  dropdown?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const UserMenu = forwardRef<HTMLDivElement, UserMenuProps>(({
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
}, ref) => {
  return (
    <DropdownWrapper
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
          border={selected ? "neutral-medium" : "transparent"}
          background={selected ? "neutral-strong" : "transparent"}
          pointerEvents={loading ? "none" : "auto"}
          className={classNames(className || "", selected ? styles.selected : "", styles.wrapper)}
          style={style}
        >
          <User loading={loading} {...userProps} />
        </Column>
      }
      dropdown={dropdown}
    />
);
});

UserMenu.displayName = "UserMenu";
export { UserMenu };
