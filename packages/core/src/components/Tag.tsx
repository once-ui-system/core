import classNames from "clsx";
import React, { forwardRef, ReactNode } from "react";
import { IconName } from "../icons";
import { ColorScheme, CondensedTShirtSizes } from "../types";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { Row } from "./Row";
import styles from "./Tag.module.scss";
import { Text } from "./Text";

interface TagProps extends React.ComponentProps<typeof Flex> {
  scheme?: ColorScheme | "gradient";
  size?: CondensedTShirtSizes;
  label?: string;
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  children?: ReactNode;
}

const Tag = forwardRef<HTMLDivElement, TagProps>(
  (
    {
      scheme = "neutral",
      size = "m",
      label = "",
      prefixIcon,
      suffixIcon,
      className,
      children,
      as,
      inline,
      ...rest
    },
    ref,
  ) => {
    // `as="span"` makes the whole tag phrasing content, so it can sit inside a
    // sentence (`<p>Status: <Tag as="span">Beta</Tag></p>`): every element is a
    // span and the tag flows inline. Without it, the div renders as before.
    const phrasing = as === "span";
    const paddingX = size === "s" ? "8" : size === "m" ? "8" : "12";
    const paddingY = size === "s" ? "1" : size === "m" ? "2" : "4";

    return (
      <Row
        fitWidth
        background={scheme !== "gradient" ? (`${scheme}-weak` as const) : undefined}
        border={scheme !== "gradient" ? (`${scheme}-alpha-medium` as const) : "brand-medium"}
        onBackground={scheme !== "gradient" ? (`${scheme}-medium` as const) : undefined}
        paddingX={paddingX}
        paddingY={paddingY}
        vertical="center"
        radius="s"
        gap="4"
        ref={ref}
        as={as}
        inline={inline ?? (phrasing || undefined)}
        className={classNames(
          styles.tag,
          scheme === "gradient" ? styles.gradient : undefined,
          className,
        )}
        {...rest}
      >
        {prefixIcon && <Icon name={prefixIcon} size="xs" />}
        <Row as={phrasing ? "span" : undefined} style={{ userSelect: "none" }} vertical="center">
          <Text variant="label-default-s">{label || children}</Text>
        </Row>
        {suffixIcon && <Icon name={suffixIcon} size="xs" />}
      </Row>
    );
  },
);

Tag.displayName = "Tag";

export type { TagProps };
export { Tag };
