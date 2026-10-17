"use client";

import classNames from "clsx";
import React, { forwardRef, MouseEventHandler, ReactNode } from "react";
import { IconName } from "../icons";
import styles from "./Chip.module.scss";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { IconButton, IconButtonProps } from "./IconButton";
import { Text } from "./Text";

interface ChipProps extends React.ComponentProps<typeof Flex> {
  label: string;
  selected?: boolean;
  prefixIcon?: IconName;
  onRemove?: () => void;
  onClick?: MouseEventHandler<HTMLDivElement>;
  children?: ReactNode;
  iconButtonProps?: Partial<IconButtonProps>;
  style?: React.CSSProperties;
  className?: string;
}

type RestProps = Omit<
  ChipProps,
  | "label"
  | "selected"
  | "prefixIcon"
  | "onRemove"
  | "onClick"
  | "children"
  | "iconButtonProps"
  | "className"
>;

/**
 * With a remove button, the props that describe the chip's own control
 * (`aria-*`, `tabIndex`) go to that control, and the rest to the box around
 * it and the remove button.
 */
const splitControlProps = (props: RestProps) => {
  const control: Record<string, unknown> = {};
  const box: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith("aria-") || key === "tabIndex") control[key] = value;
    else box[key] = value;
  }
  return { control: control as Partial<RestProps>, box: box as Partial<RestProps> };
};

const Chip = forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      label,
      selected = false,
      prefixIcon,
      onRemove,
      onClick,
      children,
      iconButtonProps = {},
      className,
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

    const combinedIconButtonProps = {
      ...defaultIconButtonProps,
      ...iconButtonProps,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        defaultIconButtonProps.onClick?.(e);
        iconButtonProps.onClick?.(e);
      },
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (onClick) onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
      }
    };

    const chipClassName = classNames(
      styles.chip,
      {
        [styles.selected]: selected,
        [styles.unselected]: !selected,
      },
      className,
    );

    const content = (
      <>
        {prefixIcon && <Icon name={prefixIcon} size="s" />}
        <Flex paddingX="8" paddingY="2">
          <Text variant="body-default-s">{label || children}</Text>
        </Flex>
      </>
    );

    if (!onRemove) {
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
          className={chipClassName}
          {...rest}
        >
          {content}
        </Flex>
      );
    }

    // With a remove button the chip is two controls side by side: its own
    // toggle and the button that removes it. The remove button used to sit
    // inside the chip's role="button", and assistive tech flattens a control
    // nested in another one away (axe: "nested-interactive"); Enter on it also
    // reached the chip's key handler, which clicked the chip instead.
    //
    // The box keeps the chip's look, and a pointer click anywhere on it apart
    // from the remove button is still the chip's click. Keyboard focus lands
    // on the toggle inside, and the chip's styles draw it on the whole box.
    const { control, box } = splitControlProps(rest);

    return (
      <Flex
        ref={ref}
        fit
        vertical="center"
        radius="full"
        paddingX="8"
        paddingY="4"
        onClick={onClick}
        cursor="interactive"
        transition="micro-medium"
        className={chipClassName}
        {...box}
      >
        <Flex
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-pressed={selected}
          vertical="center"
          className={styles.action}
          {...control}
        >
          {content}
        </Flex>
        <IconButton
          style={{
            color: "inherit",
          }}
          {...combinedIconButtonProps}
        />
      </Flex>
    );
  },
);

Chip.displayName = "Chip";

export type { ChipProps };
export { Chip };
