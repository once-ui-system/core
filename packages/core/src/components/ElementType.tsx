"use client";

import type React from "react";
import { forwardRef, type ReactNode, useContext } from "react";
import { useAdapters } from "../contexts/AdapterProvider.js";
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
} & (
  | Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "type" | "onClick">
  | Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onClick">
  | React.HTMLAttributes<HTMLDivElement>
);

const isExternalLink = (url: string) => /^https?:\/\//.test(url);

const ElementType = forwardRef<HTMLElement, ElementTypeProps>(
  ({ href, type, onClick, onLinkClick, children: content, className, style, ...props }, ref) => {
    const { Link } = useAdapters();
    const safeHref = sanitizeHref(href);

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

    if (onClick || type === "submit" || type === "button") {
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
        ref={ref as React.Ref<HTMLDivElement>}
        className={className}
        style={style}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {content}
      </Flex>
    );
  },
);

ElementType.displayName = "ElementType";

export { ElementType };
