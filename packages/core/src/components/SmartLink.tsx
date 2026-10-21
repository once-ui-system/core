"use client";

import classNames from "clsx";
import React, { ReactNode } from "react";
import { IconName } from "../icons.js";
import type { LeafProps } from "../interfaces.js";
import { TShirtSizes } from "../types.js";
import { leafLayout, takeLeafProps } from "../utils/leafLayout.js";
import { ElementType } from "./ElementType.js";
import { Icon } from "./Icon.js";

interface SmartLinkCommonProps extends LeafProps {
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  iconSize?: TShirtSizes;
  selected?: boolean;
  unstyled?: boolean;
  children: ReactNode;
  href?: string;
}

export type SmartLinkProps = SmartLinkCommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LeafProps>;

const SmartLink = ({
  ref,
  href,
  prefixIcon,
  suffixIcon,
  fillWidth,
  iconSize = "xs",
  style,
  className,
  selected,
  unstyled = false,
  children,
  ...rest
}: SmartLinkProps & { ref?: React.Ref<HTMLAnchorElement> }) => {
  const [leaf, props] = takeLeafProps(rest);
  const layout = leafLayout(leaf);
  // A margin of the caller's own replaces the link's 2px side margin.
  const ownMarginX = [leaf.margin, leaf.marginX, leaf.marginLeft, leaf.marginRight].every(
    (value) => value === undefined,
  );
  const content = (
    <>
      {prefixIcon && <Icon name={prefixIcon} size={iconSize} />}
      {children}
      {suffixIcon && <Icon name={suffixIcon} size={iconSize} />}
    </>
  );

  const commonProps = {
    ref,
    className: classNames(
      className,
      "reset-button-styles focus-ring align-center display-inline-flex g-8 radius-s",
      {
        "fill-width": fillWidth,
        "fit-width": !fillWidth,
        "min-width-0": fillWidth,
        "px-2": !unstyled,
        "mx-2": !unstyled && ownMarginX,
      },
      ...layout.classes,
    ),
    style: !unstyled
      ? {
          ...layout.style,
          ...(selected && {
            textDecoration: "underline",
            textUnderlineOffset: "0.3em",
            textUnderlineThickness: "var(--static-space-1)",
            color: "var(--neutral-on-background-strong)",
          }),
          ...style,
        }
      : {
          textDecoration: "none",
          ...layout.style,
          ...style,
        },
    ...props,
  };

  return (
    <ElementType href={href} {...commonProps}>
      {content}
    </ElementType>
  );
};

SmartLink.displayName = "SmartLink";

export { SmartLink };
