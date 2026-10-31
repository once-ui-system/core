"use client";

import classNames from "clsx";
import type React from "react";
import { Heading } from "../../components/Heading";
import { Row } from "../../components/Row";
import { textOf } from "../mdx/text";
import { HeadingAnchor, useCopySectionLink } from "./HeadingAnchor";
import styles from "./HeadingLink.module.scss";

export interface HeadingLinkProps extends React.ComponentProps<typeof Row> {
  id: string;
  as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  children: React.ReactNode;
  /**
   * The heading's text, for the copy link's name ("Copy link to …"). Read
   * from `children` when not given, which only sees strings and plain
   * elements; pass it when a child renders text of its own.
   */
  label?: string;
  style?: React.CSSProperties;
}

const variantMap = {
  h1: "display-strong-xs",
  h2: "heading-strong-xl",
  h3: "heading-strong-l",
  h4: "heading-strong-m",
  h5: "heading-strong-s",
  h6: "heading-strong-xs",
} as const;

/**
 * A heading with a link to itself. Clicking the heading copies the section's
 * URL; the link beside it does the same, and is the way there by keyboard.
 *
 * The link used to be a focusable `div` carrying a prohibited `aria-label`,
 * made `inert` until the heading was hovered, so a keyboard never reached
 * it; and the component threw without a ToastProvider. It is now the anchor
 * the `/mdx` headings use: a real link to `#id`, faded in on hover or focus
 * but always reachable, that copies with a toast when there is a provider
 * and without one when there is not.
 */
export const HeadingLink: React.FC<HeadingLinkProps> = ({
  id,
  as,
  children,
  label,
  style,
  className,
  ...flex
}) => {
  const copy = useCopySectionLink(id);

  return (
    <Row
      style={style}
      className={classNames(styles.control, className)}
      vertical="center"
      // 12 between heading and link, as before, when the reveal animation
      // around them set the gap.
      gap="12"
      {...flex}
    >
      <Heading
        className={classNames(styles.text, "cursor-interactive")}
        id={id}
        variant={variantMap[as]}
        as={as}
        onClick={copy}
      >
        {children}
      </Heading>
      <HeadingAnchor id={id} label={label ?? textOf(children)} className={styles.anchor} />
    </Row>
  );
};
