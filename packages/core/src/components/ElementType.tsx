"use client";

import Link from "next/link";
import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from "react";
import { sanitizeHref } from "../utils/safe-html";
import { Flex } from "./Flex";

export type ElementTypeProps = {
  href?: string;
  // biome-ignore lint/suspicious/noExplicitAny: polymorphic onClick handler must accept mouse events from button, anchor, and div elements
  onClick?: (event: MouseEvent<any>) => void;
  onLinkClick?: () => void;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  type?: string;
} & (
  | Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "type" | "onClick">
  | Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onClick">
  | HTMLAttributes<HTMLDivElement>
);

const isExternalLink = (url: string) => /^https?:\/\//.test(url);

const ElementType = forwardRef<HTMLElement, ElementTypeProps>(
  ({ href, type, onClick, onLinkClick, children, className, style, ...props }, ref) => {
    const safeHref = sanitizeHref(href);

    if (safeHref) {
      const isExternal = isExternalLink(safeHref);
      if (isExternal) {
        return (
          <a
            href={safeHref}
            target="_blank"
            rel="noreferrer"
            ref={ref as Ref<HTMLAnchorElement>}
            className={className}
            style={style}
            onClick={(event) => {
              onClick?.(event);
              onLinkClick?.();
            }}
            {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
          >
            {children}
          </a>
        );
      }
      return (
        <Link
          href={safeHref}
          ref={ref as Ref<HTMLAnchorElement>}
          className={className}
          style={style}
          onClick={(event) => {
            onClick?.(event);
            onLinkClick?.();
          }}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </Link>
      );
    }

    if (onClick || type === "submit" || type === "button" || type === "reset") {
      return (
        <button
          ref={ref as Ref<HTMLButtonElement>}
          className={className}
          onClick={onClick}
          style={style}
          type={type as ButtonHTMLAttributes<HTMLButtonElement>["type"]}
          {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {children}
        </button>
      );
    }

    return (
      <Flex
        ref={ref as Ref<HTMLDivElement>}
        className={className}
        style={style}
        {...(props as HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </Flex>
    );
  },
);

ElementType.displayName = "ElementType";

export { ElementType };
