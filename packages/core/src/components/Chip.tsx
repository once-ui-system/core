"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, MouseEvent, MouseEventHandler, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import type { IconName } from "../icons";
import { Flex, type FlexComponentProps } from "./Flex";
import { Icon } from "./Icon";
import { IconButton, type IconButtonProps } from "./IconButton";
import { Text } from "./Text";

export const chipVariants = cva(
  "inline-flex items-center select-none whitespace-nowrap transition-colors duration-micro-medium focus-visible:outline-none",
  {
    variants: {
      selected: {
        true: "bg-brand-alpha-medium text-brand-on-background-medium hover:bg-brand-alpha-medium focus:bg-brand-alpha-medium active:bg-brand-alpha-weak active:text-brand-on-background-weak",
        false:
          "bg-neutral-alpha-weak text-neutral-on-background-medium hover:bg-neutral-alpha-medium focus:bg-neutral-alpha-medium active:bg-neutral-alpha-weak active:text-neutral-on-background-weak",
      },
    },
    defaultVariants: {
      selected: true,
    },
  },
);

export interface ChipProps extends FlexComponentProps {
  label?: string;
  selected?: boolean;
  prefixIcon?: IconName;
  onRemove?: () => void;
  onClick?: MouseEventHandler<HTMLDivElement>;
  children?: ReactNode;
  iconButtonProps?: Partial<IconButtonProps>;
  style?: CSSProperties;
  className?: string;
}

const Chip = forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      label,
      selected = true,
      prefixIcon,
      onRemove,
      onClick,
      children,
      iconButtonProps = {},
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const defaultIconButtonProps: IconButtonProps = {
      icon: "close",
      variant: "ghost",
      size: "s",
      tooltip: "Remove",
      onClick: (e) => {
        e.stopPropagation();
        if (onRemove) onRemove();
      },
    };

    const combinedIconButtonProps: IconButtonProps = {
      ...defaultIconButtonProps,
      ...iconButtonProps,
      onClick: (e: MouseEvent<HTMLButtonElement>) => {
        defaultIconButtonProps.onClick?.(e);
        iconButtonProps.onClick?.(e);
      },
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (onClick) onClick(e as unknown as MouseEvent<HTMLDivElement>);
      }
    };

    return (
      <Flex
        ref={ref}
        fit
        vertical="center"
        radius="full"
        paddingX="8"
        paddingY="4"
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-pressed={selected}
        cursor="interactive"
        transition="micro-medium"
        className={cn(
          chipVariants({
            selected: Boolean(selected),
          }),
          className,
        )}
        style={style}
        {...rest}
      >
        {prefixIcon && <Icon name={prefixIcon} size="s" />}
        <Flex paddingX="8" paddingY="2">
          <Text variant="body-default-s">{label || children}</Text>
        </Flex>
        {onRemove && (
          <IconButton
            style={{
              color: "inherit",
            }}
            {...combinedIconButtonProps}
          />
        )}
      </Flex>
    );
  },
);

Chip.displayName = "Chip";

export { Chip };
