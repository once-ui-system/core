"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import classNames from "classnames";
import { SpacingToken } from "../types";
import { Flex } from ".";

const sizeMap: Record<string, SpacingToken> = {
  xs: "20",
  s: "24",
  m: "32",
  l: "40",
  xl: "48",
};

interface LogoProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
  size?: "xs" | "s" | "m" | "l" | "xl";
  style?: React.CSSProperties;
  icon?: string;
  wordmark?: string;
  href?: string;
  dark?: boolean;
  light?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  size = "m",
  href,
  icon,
  wordmark,
  className,
  style,
  dark,
  light,
  ...props
}) => {
  useEffect(() => {
    if (!icon && !wordmark) {
      console.warn(
        "Both 'icon' and 'wordmark' props are set to false. The logo will not render any content.",
      );
    }
  }, [icon, wordmark]);

  const content = (
    <>
      {icon && (
        // @ts-ignore
        <img
          style={{
            height: `var(--static-space-${sizeMap[size]})`,
            width: "auto",
          }}
          alt="Trademark"
          src={icon}
        />
      )}
      {wordmark && (
        // @ts-ignore
        <img
          style={{
            height: `var(--static-space-${sizeMap[size]})`,
            width: "auto",
          }}
          alt="Trademark"
          src={wordmark}
        />
      )}
    </>
  );

  return href ? (
    <Link
      className={classNames("radius-l", "display-flex", "fit-height", dark ? "dark-flex" : "", light ? "light-flex" : "", className)}
      style={style}
      href={href}
      aria-label="Trademark"
      {...props}
    >
      {content}
    </Link>
  ) : (
    <Flex
      className={classNames(className)}
      dark={dark}
      light={light}
      radius="l"
      fitHeight
      style={style}
      aria-label="Trademark"
    >
      {content}
    </Flex>
  );
};

Logo.displayName = "Logo";
export { Logo };
