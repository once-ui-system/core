import classNames from "clsx";
import type React from "react";
import { forwardRef, type ReactNode } from "react";
import styles from "./VisuallyHidden.module.scss";

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLElement> {
  /** What a screen reader should announce and a sighted user should not see. */
  children?: ReactNode;
  /**
   * The element to render. A `span` sits inside a line of text; use `div` when
   * the content is a block, such as a live region with several lines.
   */
  as?: React.ElementType;
  /**
   * Show the content while it, or anything inside it, has keyboard focus. This
   * is the skip-link pattern: put a link inside and it appears on the first
   * Tab, then hides again when focus moves on.
   */
  focusable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Content for assistive technology only: a label for an icon-only control, the
 * text of a status region, the words behind a symbol such as ⌘.
 *
 * It uses the clip pattern rather than `display: none`, which would hide the
 * content from screen readers too. With `focusable` it becomes a skip link that
 * appears when a keyboard user tabs to it.
 */
const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(
  ({ as: Component = "span", focusable = false, className, children, ...rest }, ref) => (
    <Component
      ref={ref}
      className={classNames(styles.hidden, focusable && styles.focusable, className)}
      {...rest}
    >
      {children}
    </Component>
  ),
);

VisuallyHidden.displayName = "VisuallyHidden";

export type { VisuallyHiddenProps };
export { VisuallyHidden };
