"use client";

import type React from "react";
import { Column } from "../components/Column.js";
import { useDropdownTrigger } from "../components/DropdownTriggerContext.js";

/**
 * The focusable pill. It is the element Tab lands on, so it is the button:
 * it carries the role and the open state itself, and registers as the
 * dropdown's trigger so the wrappers around it stop claiming `role="button"`.
 * Before, focus landed on a plain div and the expanded state sat on an
 * unfocusable ancestor, so nothing said it opened a menu.
 */
export const UserTrigger = (props: React.ComponentProps<typeof Column> & { loading?: boolean }) => {
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
