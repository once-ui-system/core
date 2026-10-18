"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef } from "react";
import { Flex } from "../components/Flex.js";
import { Icon } from "../components/Icon.js";
import { IconButton, type IconButtonProps } from "../components/IconButton.js";
import type { TagProps } from "../components/Tag.js";
import styles from "../components/Tag.module.scss";
import { Text } from "../components/Text.js";

/** Padding, text and icons per size. m is 2.x's Chip. */
const PADDING_X = { xs: "2", s: "4", m: "8", l: "12", xl: "16" } as const;
const PADDING_Y = { xs: "0", s: "2", m: "4", l: "8", xl: "12" } as const;
const TEXT = {
  xs: "body-default-xs",
  s: "body-default-s",
  m: "body-default-s",
  l: "body-default-m",
  xl: "body-default-l",
} as const;
const ICON = { xs: "xs", s: "xs", m: "s", l: "s", xl: "m" } as const;

type InteractiveTagProps = Omit<TagProps, "variant" | "href" | "arrow" | "effect">;

type RestProps = Omit<
  InteractiveTagProps,
  | "tone"
  | "size"
  | "label"
  | "selected"
  | "prefixIcon"
  | "suffixIcon"
  | "onRemove"
  | "onClick"
  | "children"
  | "removeButtonProps"
  | "className"
  | "textVariant"
>;

/**
 * With a remove button, the props that describe the tag's own control
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

/**
 * The toggle half of Tag (2.x's Chip): `role="button"` with `aria-pressed`,
 * pressed by a pointer click, Enter or Space, and an optional remove button
 * beside it. Tag renders it when it is given `selected`, `onClick` or
 * `onRemove`, so a static Tag stays a server component.
 */
export const InteractiveTag = forwardRef<HTMLDivElement, InteractiveTagProps>(
  (
    {
      tone,
      size = "m",
      label,
      selected: selectedProp,
      prefixIcon,
      suffixIcon,
      onRemove,
      onClick,
      children,
      removeButtonProps = {},
      className,
      textVariant,
      ...rest
    },
    ref,
  ) => {
    // A tag with only a remove button is a label, not a toggle.
    const toggles = selectedProp !== undefined || onClick !== undefined;
    const selected = selectedProp ?? false;

    const defaultRemoveProps: IconButtonProps = {
      icon: "close",
      variant: "ghost",
      size: ICON[size],
      tooltip: "Remove",
      onClick: (e) => {
        e.stopPropagation();
        onRemove?.();
      },
    };

    const combinedIconButtonProps = {
      ...defaultRemoveProps,
      ...removeButtonProps,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        defaultRemoveProps.onClick?.(e);
        removeButtonProps.onClick?.(e);
      },
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
      }
    };

    const control = toggles
      ? { role: "button", tabIndex: 0, onKeyDown: handleKeyDown, "aria-pressed": selected }
      : {};

    const tagClassName = classNames(
      styles.tag,
      styles.toggle,
      styles[`tone-${tone ?? "brand"}`],
      {
        [styles.selected]: selected,
        [styles.unselected]: !selected,
      },
      className,
    );

    const content = (
      <>
        {prefixIcon && <Icon name={prefixIcon} size={ICON[size]} />}
        <Flex paddingX="8" paddingY="2">
          <Text textVariant={textVariant ?? TEXT[size]}>{label || children}</Text>
        </Flex>
        {suffixIcon && <Icon name={suffixIcon} size={ICON[size]} />}
      </>
    );

    if (!onRemove) {
      return (
        <Flex
          ref={ref}
          fit
          vertical="center"
          radius="full"
          paddingX={PADDING_X[size]}
          paddingY={PADDING_Y[size]}
          onClick={onClick}
          cursor={toggles ? "interactive" : undefined}
          transition="micro-medium"
          className={tagClassName}
          {...control}
          {...rest}
        >
          {content}
        </Flex>
      );
    }

    // With a remove button the tag is two controls side by side: its own
    // toggle and the button that removes it. A remove button inside the
    // toggle's role="button" would be flattened away by assistive tech
    // (axe: "nested-interactive"), and Enter on it would reach the toggle's
    // key handler.
    //
    // The box keeps the tag's look, and a pointer click anywhere on it apart
    // from the remove button is still the tag's click. Keyboard focus lands
    // on the toggle inside, and the styles draw it on the whole box.
    const { control: controlProps, box } = splitControlProps(rest);

    return (
      <Flex
        ref={ref}
        fit
        vertical="center"
        radius="full"
        paddingX={PADDING_X[size]}
        paddingY={PADDING_Y[size]}
        onClick={onClick}
        cursor={toggles ? "interactive" : undefined}
        transition="micro-medium"
        className={tagClassName}
        {...box}
      >
        <Flex vertical="center" className={styles.action} {...control} {...controlProps}>
          {content}
        </Flex>
        <IconButton style={{ color: "inherit" }} {...combinedIconButtonProps} />
      </Flex>
    );
  },
);

InteractiveTag.displayName = "InteractiveTag";
