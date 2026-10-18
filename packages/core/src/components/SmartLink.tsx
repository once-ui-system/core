"use client";

import classNames from "clsx";
import React, { ReactNode } from "react";
import { IconName } from "../icons.js";
import { TShirtSizes } from "../types.js";
import { ElementType } from "./ElementType.js";
import { Icon } from "./Icon.js";

interface SmartLinkCommonProps {
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  fillWidth?: boolean;
  iconSize?: TShirtSizes;
  selected?: boolean;
  unstyled?: boolean;
  children: ReactNode;
  href?: string;
  style?: React.CSSProperties;
  className?: string;
}

export type SmartLinkProps = SmartLinkCommonProps & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const SmartLink = ({
  ref,
  href,
  prefixIcon,
  suffixIcon,
  fillWidth = false,
  iconSize = "xs",
  style,
  className,
  selected,
  unstyled = false,
  children,
  ...props
}: SmartLinkProps & { ref?: React.Ref<HTMLAnchorElement> }) => {
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
        "px-2 mx-2": !unstyled,
      },
    ),
    style: !unstyled
      ? {
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
