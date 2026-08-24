"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode, Ref } from "react";
import { cloneElement, forwardRef } from "react";
import { cn } from "../classes/utils";
import type { IconName } from "../icons";
import { Arrow } from "./Arrow";
import { Flex, type FlexComponentProps } from "./Flex";
import { Icon } from "./Icon";
import { SmartLink } from "./SmartLink";

export const badgeVariants = cva("relative inline-flex items-center", {
  variants: {
    effect: {
      true: "overflow-hidden before:content-[''] before:opacity-0 before:rounded-full before:absolute before:w-full before:h-full before:bg-[linear-gradient(120deg,transparent_20%,var(--brand-alpha-medium)_50%,transparent_80%)] before:-skew-x-[20deg] before:animate-shineDefault hover:before:animate-shineHover",
      false: "",
    },
  },
  defaultVariants: {
    effect: true,
  },
});

export interface BadgeProps extends FlexComponentProps {
  title?: string;
  icon?: IconName;
  arrow?: boolean;
  children?: ReactNode;
  href?: string;
  effect?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

const Badge = forwardRef<HTMLDivElement | HTMLAnchorElement, BadgeProps>(
  (
    {
      title,
      icon,
      href,
      arrow = Boolean(href),
      children,
      effect = true,
      className,
      style,
      id,
      ...rest
    },
    ref,
  ) => {
    const badgeId = id || "badge";

    const content = (
      <Flex
        id={badgeId}
        paddingX="20"
        paddingY="12"
        fitWidth
        className={cn(badgeVariants({ effect }), className)}
        style={style}
        vertical="center"
        radius="full"
        background="neutral-weak"
        onBackground="brand-strong"
        border="brand-alpha-medium"
        textVariant="label-strong-s"
        {...rest}
      >
        {icon && <Icon marginRight="8" size="s" name={icon} onBackground="brand-medium" />}
        {title}
        {children}
        {arrow && <Arrow trigger={`#${badgeId}`} />}
      </Flex>
    );

    if (href) {
      return (
        <SmartLink
          unstyled
          className={className}
          style={{
            borderRadius: "var(--radius-full)",
            ...style,
          }}
          href={href}
          ref={ref as Ref<HTMLAnchorElement>}
        >
          {content}
        </SmartLink>
      );
    }

    return cloneElement(content, {
      ref: ref as Ref<HTMLDivElement>,
    });
  },
);

Badge.displayName = "Badge";

export { Badge };
