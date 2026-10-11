import classNames from "clsx";
import { ComponentPropsWithoutRef, ElementType } from "react";

import { CommonProps, DisplayProps, SpacingProps, TextProps } from "../interfaces";
import { ColorScheme, ColorWeight, SpacingToken, TextVariant } from "../types";
import { textLayout } from "../utils/layoutClasses";
import { numericSpacingStyle } from "../utils/spacingStyle";

type HeadingProps<T extends ElementType> = TextProps<T> &
  CommonProps &
  SpacingProps &
  Omit<DisplayProps, "as"> &
  ComponentPropsWithoutRef<T>;

const Heading = <T extends ElementType = "h1">({
  as,
  variant,
  size,
  weight,
  family,
  onBackground,
  onSolid,
  align,
  wrap = "balance",
  padding,
  paddingLeft,
  paddingRight,
  paddingTop,
  paddingBottom,
  paddingX,
  paddingY,
  margin,
  marginLeft,
  marginRight,
  marginTop,
  marginBottom,
  marginX,
  marginY,
  children,
  style,
  truncate,
  opacity,
  className,
  userSelect,
  gap,
  top,
  right,
  bottom,
  left,
  translateX,
  translateY,
  position,
  overflow,
  overflowX,
  overflowY,
  scrollbar,
  pointerEvents,
  transition,
  zIndex,
  // Typed through `DisplayProps`, with no class that fits text: `inline`,
  // `hide`, `dark` and `light` are display modes of Flex and Grid. Taken out
  // so they stop reaching the DOM as attributes.
  inline: _inline,
  hide: _hide,
  dark: _dark,
  light: _light,
  ...props
}: HeadingProps<T>) => {
  const Component = as || "h1";

  if (variant && (size || weight)) {
    console.warn("When 'variant' is set, 'size' and 'weight' are ignored.");
  }

  if (onBackground && onSolid) {
    console.warn(
      "You cannot use both 'onBackground' and 'onSolid' props simultaneously. Only one will be applied.",
    );
  }

  const getVariantClasses = (variant: TextVariant) => {
    const parts = variant.split("-");
    const size = parts.pop()!;
    const weight = parts.pop()!;
    const fontType = parts.join("-");
    return [`font-${fontType}`, `font-${weight}`, `font-${size}`];
  };

  const sizeClass = size ? `font-${size}` : "font-m";
  const weightClass = weight ? `font-${weight}` : "font-strong";

  const classes = variant ? getVariantClasses(variant) : [sizeClass, weightClass];

  let colorClass = "neutral-on-background-strong";
  if (onBackground) {
    const [scheme, weight] = onBackground.split("-") as [ColorScheme, ColorWeight];
    colorClass = `${scheme}-on-background-${weight}`;
  } else if (onSolid) {
    const [scheme, weight] = onSolid.split("-") as [ColorScheme, ColorWeight];
    colorClass = `${scheme}-on-solid-${weight}`;
  }

  const generateClassName = (prefix: string, value: SpacingToken | number | undefined) => {
    return typeof value === "string" ? `${prefix}-${value}` : undefined;
  };

  const layout = textLayout({
    gap,
    top,
    right,
    bottom,
    left,
    translateX,
    translateY,
    position,
    overflow,
    overflowX,
    overflowY,
    scrollbar,
    pointerEvents,
    transition,
    zIndex,
  });

  const combinedClasses = classNames(
    ...classes,
    colorClass,
    className,
    generateClassName("p", padding),
    generateClassName("pl", paddingLeft),
    generateClassName("pr", paddingRight),
    generateClassName("pt", paddingTop),
    generateClassName("pb", paddingBottom),
    generateClassName("px", paddingX),
    generateClassName("py", paddingY),
    generateClassName("m", margin),
    generateClassName("ml", marginLeft),
    generateClassName("mr", marginRight),
    generateClassName("mt", marginTop),
    generateClassName("mb", marginBottom),
    generateClassName("mx", marginX),
    generateClassName("my", marginY),
    truncate && "truncate",
    opacity !== undefined && `opacity-${opacity}`,
    userSelect && `user-select-${userSelect}`,
    family && `font-family-${family}`,
    ...layout.classes,
  );

  const combinedStyle = {
    textAlign: align,
    textWrap: wrap,
    ...numericSpacingStyle({
      padding,
      paddingX,
      paddingY,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      margin,
      marginX,
      marginY,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
    }),
    ...layout.style,
    ...style,
  };

  return (
    <Component className={combinedClasses} style={combinedStyle} {...props}>
      {children}
    </Component>
  );
};

Heading.displayName = "Heading";

export { Heading };
