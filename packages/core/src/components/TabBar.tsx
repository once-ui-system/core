"use client";

import classNames from "clsx";
import type React from "react";
import type { ReactNode } from "react";
import type { IconName } from "../icons.js";
import { ElementType } from "./ElementType.js";
import { Icon } from "./Icon.js";
import { useSidebar } from "./Sidebar.js";
import styles from "./TabBar.module.scss";
import { VisuallyHidden } from "./VisuallyHidden.js";

type TabBarBreakpoint = "xs" | "s" | "m" | "l";

interface TabBarProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** What the bar navigates, for a screen reader: "Product", "Main". */
  "aria-label": string;
  /**
   * Shown at and below this breakpoint, hidden above it, where a Sidebar does
   * the job. Default `"s"`, the edge where Sidebar turns into a drawer. `false`
   * shows it at every width.
   */
  showBelow?: TabBarBreakpoint | false;
  /**
   * Leave room for the bar in the layout: an empty block as tall as the bar,
   * where the TabBar is rendered, so the end of a page is never under it.
   * Default true. Turn it off and pad the scrolling column with
   * `var(--tab-bar-height)` yourself when the TabBar sits outside it.
   */
  spacer?: boolean;
  /** Two to five TabBarItems; a TabBarSidebarTrigger as the last one. */
  children: ReactNode;
}

/**
 * The phone's navigation: a bar along the bottom edge with the few places
 * people go most, in thumb reach. Pairs with Sidebar: above `showBelow` the
 * Sidebar is the navigation and the bar is hidden; below it, the Sidebar is a
 * drawer that a TabBarSidebarTrigger ("More") opens, holding everything that
 * did not fit in the bar.
 *
 * It sits on the page background behind a hairline and keeps clear of the
 * home indicator (`env(safe-area-inset-bottom)`). The current item, `selected`,
 * is `aria-current="page"` and stands out on a soft pill.
 */
function TabBar({ showBelow = "s", spacer = true, className, children, ...nav }: TabBarProps) {
  const shown = showBelow ? styles[`below-${showBelow}`] : styles.always;
  return (
    <>
      {spacer && <div className={classNames(styles.spacer, shown)} aria-hidden="true" />}
      <nav className={classNames(styles.bar, shown, className)} {...nav}>
        {children}
      </nav>
    </>
  );
}

TabBar.displayName = "TabBar";

interface TabBarItemProps {
  /** Where it goes. Rendered through the app's Link adapter, like NavItem. */
  href?: string;
  /** Instead of `href`, for an item that opens something. */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  icon: IconName;
  /** Short: one word fits best, and a long one ends in an ellipsis. */
  label: ReactNode;
  /** The current page. */
  selected?: boolean;
  /**
   * A count on the icon: 0 hides it, more than 9 prints as 9+. `true` is a
   * dot, for unread with no number worth showing.
   */
  badge?: number | boolean;
  className?: string;
  style?: React.CSSProperties;
  /** For a TabBarSidebarTrigger and other items that open a dialog. */
  "aria-haspopup"?: "dialog" | "menu";
  "aria-expanded"?: boolean;
}

/** One place in a TabBar: an icon over a short label. */
function TabBarItem({
  href,
  onClick,
  icon,
  label,
  selected = false,
  badge,
  className,
  style,
  ...aria
}: TabBarItemProps) {
  const count = typeof badge === "number" ? badge : 0;
  const content = (
    <>
      <span className={styles.icon}>
        <Icon name={icon} size="s" />
        {badge === true && <span className={styles.dot} aria-hidden="true" />}
        {count > 0 && (
          <span className={styles.count} aria-hidden="true">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </span>
      <span className={styles.label}>{label}</span>
      {count > 0 && <VisuallyHidden>, {count} unread</VisuallyHidden>}
    </>
  );
  return (
    <ElementType
      href={href}
      onClick={onClick}
      type={href ? undefined : "button"}
      className={classNames(styles.item, className)}
      style={style}
      aria-current={selected && href ? "page" : undefined}
      data-selected={selected || undefined}
      {...aria}
    >
      {content}
    </ElementType>
  );
}

TabBarItem.displayName = "TabBarItem";

interface TabBarSidebarTriggerProps
  extends Omit<TabBarItemProps, "href" | "onClick" | "icon" | "label"> {
  /** The word under the icon; More by default. */
  label?: ReactNode;
  /** Default `moreHorizontal`. */
  icon?: IconName;
}

/**
 * The last item of a TabBar: opens the Sidebar's phone drawer, which holds
 * every other place. Selected while the drawer is open, and when the current
 * page is one of the places only the drawer lists (pass `selected`). Needs a
 * SidebarProvider around both, as SidebarTrigger does.
 */
function TabBarSidebarTrigger({ label, icon, selected, ...item }: TabBarSidebarTriggerProps) {
  const { mobileOpen, setMobileOpen } = useSidebar();
  return (
    <TabBarItem
      icon={icon ?? "moreHorizontal"}
      label={label ?? "More"}
      selected={selected || mobileOpen}
      aria-haspopup="dialog"
      aria-expanded={mobileOpen}
      onClick={() => setMobileOpen(!mobileOpen)}
      {...item}
    />
  );
}

TabBarSidebarTrigger.displayName = "TabBarSidebarTrigger";

export type { TabBarBreakpoint, TabBarItemProps, TabBarProps, TabBarSidebarTriggerProps };
export { TabBar, TabBarItem, TabBarSidebarTrigger };
