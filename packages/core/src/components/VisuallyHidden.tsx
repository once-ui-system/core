import classNames from "clsx";
import type React from "react";
import type { ElementType, ReactNode } from "react";
import type { PolymorphicComponent, PolymorphicProps } from "../interfaces.js";
import styles from "./VisuallyHidden.module.scss";

/**
 * VisuallyHidden's own props. `as` picks the element (a `span` by default:
 * it sits inside a line of text; a `div` for a block such as a live region)
 * and types its attributes: `<VisuallyHidden as="a" href="#main" focusable>`
 * is a skip link.
 */
interface VisuallyHiddenOwnProps {
  /** What a screen reader should announce and a sighted user should not see. */
  children?: ReactNode;
  /**
   * Show the content while it, or anything inside it, has keyboard focus. This
   * is the skip-link pattern: put a link inside and it appears on the first
   * Tab, then hides again when focus moves on. Or render the link itself:
   * `<VisuallyHidden as="a" href="#main" focusable>`.
   */
  focusable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** VisuallyHidden's props on the element `T`. */
type VisuallyHiddenProps<T extends ElementType = "span"> = PolymorphicProps<
  T,
  VisuallyHiddenOwnProps
>;

/**
 * Content for assistive technology only: a label for an icon-only control, the
 * text of a status region, the words behind a symbol such as ⌘.
 *
 * It uses the clip pattern rather than `display: none`, which would hide the
 * content from screen readers too. With `focusable` it becomes a skip link that
 * appears when a keyboard user tabs to it.
 */
const VisuallyHiddenImpl = ({
  ref,
  as: Component = "span",
  focusable = false,
  className,
  children,
  ...rest
}: (VisuallyHiddenOwnProps & { as?: ElementType }) & { ref?: React.Ref<HTMLElement> }) => (
  <Component
    ref={ref}
    className={classNames(styles.hidden, focusable && styles.focusable, className)}
    {...rest}
  >
    {children}
  </Component>
);

VisuallyHiddenImpl.displayName = "VisuallyHidden";

const VisuallyHidden = VisuallyHiddenImpl as unknown as PolymorphicComponent<
  VisuallyHiddenOwnProps,
  "span"
>;

export type { VisuallyHiddenProps };
export { VisuallyHidden };
