"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef } from "react";
import type { Placement } from "../types";
import { Column } from "./Column";
import { useDropdownTrigger } from "./DropdownTriggerContext";
import { DropdownWrapper, type DropdownWrapperProps } from "./DropdownWrapper";
import { User, type UserProps } from "./User";
import styles from "./UserMenu.module.scss";

interface UserMenuProps
  extends UserProps,
    Pick<DropdownWrapperProps, "minHeight" | "minWidth" | "maxWidth"> {
  /**
   * Called with an Option's `value` when it is picked from `dropdown`, as on
   * DropdownWrapper, which this forwards it to.
   */
  onSelect?: (value: string) => void;
  selected?: boolean;
  placement?: Placement;
  dropdown?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * The focusable pill. It is the element Tab lands on, so it is the button:
 * it carries the role and the open state itself, and registers as the
 * dropdown's trigger so the wrappers around it stop claiming `role="button"`.
 * Before, focus landed on a plain div and the expanded state sat on an
 * unfocusable ancestor, so nothing said it opened a menu.
 */
const UserMenuTrigger = (props: React.ComponentProps<typeof Column> & { loading?: boolean }) => {
  const { loading, ...rest } = props;
  const trigger = useDropdownTrigger();
  return (
    <Column
      role="button"
      aria-haspopup={trigger?.haspopup}
      aria-expanded={trigger?.expanded}
      aria-disabled={loading || undefined}
      {...rest}
    />
  );
};

const UserMenu = forwardRef<HTMLDivElement, UserMenuProps>(
  (
    {
      selected = false,
      dropdown,
      minWidth,
      maxWidth,
      minHeight,
      placement,
      onSelect,
      className,
      style,
      loading,
      ...userProps
    },
    ref,
  ) => {
    return (
      <DropdownWrapper
        // The forwarded ref was accepted and never attached.
        ref={ref}
        minWidth={minWidth}
        maxWidth={maxWidth}
        minHeight={minHeight}
        placement={placement}
        onSelect={onSelect}
        disableTriggerClick={loading}
        style={{
          borderRadius: "var(--radius-full)",
        }}
        trigger={
          <UserMenuTrigger
            loading={loading}
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
          </UserMenuTrigger>
        }
        dropdown={dropdown}
      />
    );
  },
);

UserMenu.displayName = "UserMenu";

export { UserMenu };
