import Link from "next/link";
import React, { ReactNode, forwardRef } from "react";
import { Flex } from ".";
import { sanitizeHref } from "../utils/safe-html";

type ElementTypeProps = {
  href?: string;
  onClick?: (event: any) => void;
  onLinkClick?: () => void;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  type?: string;
} & (Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "type" | "onClick">
  | Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onClick">
  | React.HTMLAttributes<HTMLDivElement>);

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
        {children}
      </Flex>
    );
  },
);

ElementType.displayName = "ElementType";
export { ElementType };
