"use client";

import React, { forwardRef, ReactNode, useState } from "react";
import { Accordion, Column, Icon, Line, Row } from ".";
import { IconName } from "../icons";

interface NavGroupProps extends Omit<React.ComponentProps<typeof Row>, "title" | "onToggle"> {
  /** The group's own text. */
  label: ReactNode;
  /** Leading icon, matching the NavItems beside it. */
  icon?: IconName;
  /** The rows inside. Usually NavItems with no icon of their own. */
  children: ReactNode;
  /** Open state, when the host owns it — to keep one group open at a time, say. */
  open?: boolean;
  /** Called on the header. Required only if `open` is passed. */
  onToggle?: () => void;
  /** Starting state when the group manages its own. */
  defaultOpen?: boolean;
  /** Mark the header itself as the current page, for a group that is also a link. */
  selected?: boolean;
}

/**
 * A collapsible set of NavItems, indented behind a rail.
 *
 * The rail is a vertical Line rather than padding, because indentation alone
 * stops reading as hierarchy once a label wraps. The open group takes a faint
 * background so the collapsed ones recede.
 *
 * Uncontrolled by default. Pass `open` and `onToggle` to drive it — which is
 * what a sidebar does when it opens the group containing the current route.
 */
const NavGroup = forwardRef<HTMLDivElement, NavGroupProps>(
  (
    { label, icon, children, open, onToggle, defaultOpen = false, selected = false, ...row },
    ref,
  ) => {
    const [uncontrolled, setUncontrolled] = useState(defaultOpen);
    const isOpen = open ?? uncontrolled;
    const toggle = () => {
      if (open === undefined) setUncontrolled((v) => !v);
      onToggle?.();
    };

    return (
      <Row
        ref={ref}
        fillWidth
        radius="m"
        transition="micro-medium"
        background={isOpen || selected ? "neutral-alpha-weak" : undefined}
        {...row}
      >
        <Accordion
          open={isOpen}
          onToggle={toggle}
          paddingX="16"
          style={{ height: "var(--static-space-40)" }}
          title={
            <Row fillWidth gap="12" vertical="center" textVariant="label-default-m">
              {icon && <Icon name={icon} onBackground="neutral-weak" size="xs" />}
              {label}
            </Row>
          }
        >
          <Row fillWidth gap="8" paddingX="12">
            <Line vert background="neutral-alpha-medium" />
            <Column fillWidth gap="4">
              {children}
            </Column>
          </Row>
        </Accordion>
      </Row>
    );
  },
);

NavGroup.displayName = "NavGroup";

export { NavGroup };
export type { NavGroupProps };
