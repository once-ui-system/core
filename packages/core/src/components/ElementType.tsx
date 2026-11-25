"use client";

import type React from "react";
import { type ReactNode, useCallback, useContext, useEffect, useRef } from "react";
import { useAdapters } from "../contexts/AdapterProvider.js";
import { InsideControlContext } from "../internal/InsideControlContext.js";
import { dev } from "../utils/devLogger.js";
import { sanitizeHref } from "../utils/safe-html.js";
import { DropdownTriggerContext } from "./DropdownTriggerContext.js";
import { Flex } from "./Flex.js";

type ElementTypeProps = {
  href?: string;
  onClick?: (event: React.MouseEvent<any>) => void;
  onLinkClick?: () => void;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  type?: string;
  /**
   * Set by Button and IconButton to their name. With neither `href`,
   * `onClick` nor a button `type` they are still a real
   * `<button type="button">`, so the accessibility tree (screen readers,
   * agents operating the page) sees a button and not text. Only inside a link
   * or button core drew (a clickable Card's "Read more") do they stay a plain
   * div: decoration inside the control around them, not a control nested in
   * one. In development this warns when the button lands inside some other
   * clickable element, or in a form it will not submit.
   */
  decorationOf?: string;
} & (
  | Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "type" | "onClick">
  | Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onClick">
  | React.HTMLAttributes<HTMLDivElement>
);

const isExternalLink = (url: string) => /^https?:\/\//.test(url);

/** What can be the control around a Button rendered as decoration. */
const INTERACTIVE =
  'a[href], button, label, summary, [tabindex], [role="button"], [role="link"], [role="menuitem"], [role="option"], [role="tab"], [role="checkbox"], [role="radio"], [role="switch"]';

const ElementType = ({
  ref,
  href,
  type,
  onClick,
  onLinkClick,
  children: content,
  className,
  style,
  decorationOf,
  ...props
}: ElementTypeProps & { ref?: React.Ref<HTMLElement> }) => {
  const { Link } = useAdapters();
  const safeHref = sanitizeHref(href);
  // Any button `type` (submit, reset, button) or a `form` it belongs to
  // makes it a real <button>; 2.x and beta.1 left `type="reset"` a dead div.
  const insideControl = useContext(InsideControlContext);
  const explicitControl = Boolean(
    safeHref ||
      onClick ||
      type === "submit" ||
      type === "button" ||
      type === "reset" ||
      "form" in props,
  );
  // A Button or IconButton outside any control core drew is a button even
  // with nothing wired yet (a "Delete workspace" an app hooks up elsewhere):
  // a div there reads as plain text to assistive tech and to agents.
  const implicitButton = Boolean(decorationOf) && !explicitControl && !insideControl;
  const isControl = explicitControl || implicitButton;

  const decoration = useRef<HTMLElement | null>(null);
  const decorationRef = useCallback(
    (node: HTMLElement | null) => {
      decoration.current = node;
      if (typeof ref === "function") return ref(node);
      if (ref) (ref as React.RefObject<HTMLElement | null>).current = node;
    },
    [ref],
  );
  useEffect(() => {
    if (!implicitButton || process.env.NODE_ENV !== "development") return;
    const node = decoration.current;
    if (!node) return;
    if (node.parentElement?.closest(INTERACTIVE)) {
      dev.warn(
        `${decorationOf} has no onClick, href or type and sits inside another clickable element, so it renders a <button> nested in that control. Make the outer element a core Card, SmartLink or Button (it then renders a plain div inside), or give this one its own onClick or href.`,
        node,
      );
    } else if (node.closest("form")) {
      // A native <button> with no type submits its form; this one does not.
      dev.warn(
        `${decorationOf} inside a <form> renders <button type="button">: unlike a native <button>, it does not submit the form without type="submit". Pass type="submit" (or an onClick).`,
        node,
      );
    }
  }, [decorationOf, implicitButton]);

  // A real link or button is itself the interactive element, so a Button
  // inside it must not answer to a dropdown trigger above: it stays the
  // plain div it has always been there (see Button), instead of nesting
  // one interactive control inside another.
  const trigger = useContext(DropdownTriggerContext);
  const cleared = trigger ? (
    <DropdownTriggerContext.Provider value={null}>{content}</DropdownTriggerContext.Provider>
  ) : (
    content
  );
  const children = <InsideControlContext.Provider value>{cleared}</InsideControlContext.Provider>;

  if (safeHref) {
    // A link runs the `onClick` it is given, then `onLinkClick`. It used to
    // run `onClick` only on a button, so a Button, IconButton or SmartLink
    // with an `href` silently dropped its handler.
    const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      onLinkClick?.();
    };
    const isExternal = isExternalLink(safeHref);
    if (isExternal) {
      return (
        <a
          href={safeHref}
          target="_blank"
          rel="noreferrer"
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={className}
          style={style}
          onClick={handleLinkClick}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={safeHref}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={className}
        style={style}
        onClick={handleLinkClick}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  if (isControl) {
    return (
      <button
        ref={
          implicitButton
            ? (decorationRef as React.Ref<HTMLButtonElement>)
            : (ref as React.Ref<HTMLButtonElement>)
        }
        className={className}
        onClick={onClick}
        style={style}
        // never a submit by accident: a native <button> with no type submits its form
        type={
          (implicitButton
            ? "button"
            : type) as React.ButtonHTMLAttributes<HTMLButtonElement>["type"]
        }
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }

  return (
    <Flex
      ref={decorationOf ? decorationRef : (ref as React.Ref<HTMLDivElement>)}
      className={className}
      style={style}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    >
      {content}
    </Flex>
  );
};

ElementType.displayName = "ElementType";

export { ElementType };
