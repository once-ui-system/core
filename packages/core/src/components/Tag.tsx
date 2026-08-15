import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import type { IconName } from "../icons";
import type { ColorScheme, CondensedTShirtSizes } from "../types";
import { Flex, type FlexComponentProps } from "./Flex";
import { Icon } from "./Icon";
import { Text } from "./Text";

export const tagVariants = cva(
  "inline-flex items-center select-none whitespace-nowrap border border-solid rounded-s gap-4",
  {
    variants: {
      variant: {
        neutral:
          "bg-neutral-background-weak border-neutral-alpha-medium text-neutral-on-background-medium",
        brand: "bg-brand-background-weak border-brand-alpha-medium text-brand-on-background-medium",
        accent:
          "bg-accent-background-weak border-accent-alpha-medium text-accent-on-background-medium",
        info: "bg-info-background-weak border-info-alpha-medium text-info-on-background-medium",
        danger:
          "bg-danger-background-weak border-danger-alpha-medium text-danger-on-background-medium",
        warning:
          "bg-warning-background-weak border-warning-alpha-medium text-warning-on-background-medium",
        success:
          "bg-success-background-weak border-success-alpha-medium text-success-on-background-medium",
        gradient:
          "bg-[linear-gradient(45deg,var(--brand-background-strong),var(--accent-background-strong))] text-brand-on-background-medium border-brand-border-medium [background-clip:padding-box]",
      },
      size: {
        s: "px-8 py-1",
        m: "px-8 py-2",
        l: "px-12 py-4",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "m",
    },
  },
);

export interface TagProps extends FlexComponentProps {
  variant?: ColorScheme | "gradient";
  size?: CondensedTShirtSizes;
  label?: string;
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const Tag = forwardRef<HTMLDivElement, TagProps>(
  (
    {
      variant = "neutral",
      size = "m",
      label = "",
      prefixIcon,
      suffixIcon,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    return (
      <Flex
        ref={ref}
        fitWidth
        vertical="center"
        className={cn(tagVariants({ variant, size }), className)}
        style={style}
        {...rest}
      >
        {prefixIcon && <Icon name={prefixIcon} size="xs" />}
        {(label || children) && (
          <Flex vertical="center">
            <Text variant="label-default-s">{label || children}</Text>
          </Flex>
        )}
        {suffixIcon && <Icon name={suffixIcon} size="xs" />}
      </Flex>
    );
  },
);

Tag.displayName = "Tag";

export { Tag };
