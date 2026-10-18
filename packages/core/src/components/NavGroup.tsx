"use client";

import type React from "react";
import { forwardRef, type ReactNode, useState } from "react";
import type { IconName } from "../icons";
import { Accordion } from "./Accordion";
import { Column } from "./Column";
import { Icon } from "./Icon";
import { Line } from "./Line";
import { useNavStyle } from "./Nav";
import { Row } from "./Row";

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
 * Inside a Nav, the header takes the nav's row height, the rail follows its
 * `rail`, and a `minimal` nav drops the tint.
 *
 * Uncontrolled by default. Pass `open` and `onToggle` to drive it — which is
 * what a sidebar does when it opens the group containing the current route.
 */
const NavGroup = forwardRef<HTMLDivElement, NavGroupProps>(
  (
    { label, icon, children, open, onToggle, defaultOpen = false, selected = false, ...row },
    ref,
  ) => {
    const { variant, rail, sizes } = useNavStyle();
    const emphasis = variant !== "solid";
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
        background={
          (isOpen || selected) && variant !== "minimal" ? "neutral-alpha-weak" : undefined
        }
        {...row}
      >
        <Accordion
          open={isOpen}
          onToggle={toggle}
          size={sizes.group.size}
          headerProps={{ paddingLeft: sizes.group.inset }}
          contentProps={{ paddingTop: sizes.group.top, paddingBottom: sizes.group.bottom }}
          style={{ height: `var(--static-space-${sizes.height})` }}
          title={
            <Row
              fillWidth
              gap={sizes.iconGap}
              vertical="center"
              textVariant={`label-${emphasis && selected ? "strong" : "default"}-${sizes.text}`}
              onBackground={emphasis ? (selected ? "neutral-strong" : "neutral-weak") : undefined}
            >
              {icon && <Icon name={icon} onBackground="neutral-weak" size="xs" />}
              {label}
            </Row>
          }
        >
          <Row fillWidth gap="8" paddingX="12">
            {/* Without the rail the children keep the indent, so switching it
                off never shifts a label. */}
            {rail ? (
              <Line vert background="neutral-alpha-medium" />
            ) : (
              <Row minWidth="1" aria-hidden="true" />
            )}
            <Column fillWidth gap={sizes.gap}>
              {children}
            </Column>
          </Row>
        </Accordion>
      </Row>
    );
  },
);

NavGroup.displayName = "NavGroup";

export type { NavGroupProps };
export { NavGroup };
