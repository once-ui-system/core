"use client";

import type React from "react";
import { forwardRef, type ReactNode, useContext } from "react";
import { useAdapters } from "../contexts/AdapterProvider";
import { sanitizeHref } from "../utils/safe-html";
import { DropdownTriggerContext } from "./DropdownTriggerContext";
import { Flex } from "./Flex";

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
            onClick={() => onLinkClick?.()}
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
          onClick={() => onLinkClick?.()}
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
