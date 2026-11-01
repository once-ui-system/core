"use client";

import type React from "react";
import { type ReactNode, useCallback, useContext, useEffect, useRef } from "react";
import { useAdapters } from "../contexts/AdapterProvider.js";
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
   * `onClick` nor a button `type` they render a div, which is right as
   * decoration inside another control and a dead control anywhere else: in
   * development this warns when no interactive element is around it.
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
  const isControl = Boolean(safeHref || onClick || type === "submit" || type === "button");

  const decoration = useRef<HTMLElement | null>(null);
  const decorationRef = useCallback(
    (node: HTMLDivElement | null) => {
      decoration.current = node;
      if (typeof ref === "function") return ref(node);
      if (ref) (ref as React.RefObject<HTMLElement | null>).current = node;
    },
    [ref],
  );
  useEffect(() => {
    if (!decorationOf || isControl || process.env.NODE_ENV !== "development") return;
    const control = decoration.current?.parentElement?.closest(INTERACTIVE);
    if (decoration.current && !control) {
      dev.warn(
        `${decorationOf} renders a div: it has no onClick, href or type, and no clickable element is around it, so nothing can focus or press it. Pass onClick, href or type="submit".`,
        decoration.current,
      );
    }
  }, [decorationOf, isControl]);

  // A real link or button is itself the interactive element, so a Button
  // inside it must not answer to a dropdown trigger above: it stays the
  // plain div it has always been there (see Button), instead of nesting
  // one interactive control inside another.
  const trigger = useContext(DropdownTriggerContext);
  const children = trigger ? (
    <DropdownTriggerContext.Provider value={null}>{content}</DropdownTriggerContext.Provider>
  ) : (
    content
  );

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
        ref={ref as React.Ref<HTMLButtonElement>}
        className={className}
        onClick={onClick}
        style={style}
        type={type as React.ButtonHTMLAttributes<HTMLButtonElement>["type"]}
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
