import classNames from "clsx";
import React, { forwardRef, useId } from "react";
import type { IconName } from "../icons";
import { Arrow } from "./Arrow";
import styles from "./Badge.module.scss";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { SmartLink } from "./SmartLink";

export interface BadgeProps extends React.ComponentProps<typeof Flex> {
  title?: string;
  icon?: IconName;
  arrow?: boolean;
  children?: React.ReactNode;
  href?: string;
  effect?: boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

const Badge = forwardRef<HTMLDivElement | HTMLAnchorElement, BadgeProps>(
  (
    {
      title,
      icon,
      href,
      arrow = href ? true : false,
      children,
      effect = true,
      className,
      style,
      id,
      as,
      inline,
      ...rest
    },
    ref,
  ) => {
    // `as="span"` makes the badge phrasing content, so it can sit inside a
    // sentence: the badge and its arrow render spans and flow inline.
    const phrasing = as === "span";
    // Every Badge used to fall back to `id="badge"`, so a page with several
    // had duplicate ids and each arrow followed the first badge's hover.
    const generatedId = useId();
    const badgeId = id || generatedId;

    const content = (
      <Flex
        id={badgeId}
        as={as}
        inline={inline ?? (phrasing || undefined)}
        paddingLeft={icon ? "8" : "12"}
        paddingRight={arrow ? "8" : "12"}
        paddingY="4"
        gap="8"
        fitWidth
        className={classNames(styles.badge, effect && styles.beam, className)}
        style={style}
        vertical="center"
        radius="full"
        background="surface"
        onBackground="neutral-strong"
        border="neutral-alpha-medium"
        textVariant="label-default-s"
        {...rest}
      >
        {icon && <Icon size="xs" name={icon} onBackground="brand-medium" />}
        {title}
        {children}
        {arrow && <Arrow trigger={`[id="${badgeId}"]`} as={phrasing ? "span" : undefined} />}
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
          ref={ref as React.Ref<HTMLAnchorElement>}
        >
          {content}
        </SmartLink>
      );
    }

    return React.cloneElement(content, {
      ref: ref as React.Ref<HTMLDivElement>,
    });
  },
);

Badge.displayName = "Badge";

export { Badge };
