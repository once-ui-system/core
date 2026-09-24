import { ElementType, ComponentPropsWithoutRef } from "react";
import classNames from "clsx";

import { TextProps, CommonProps, SpacingProps, DisplayProps } from "../interfaces";
import { ColorScheme, ColorWeight, TextVariant, SpacingToken } from "../types";
import { numericSpacingStyle } from "../utils/spacingStyle";

type TypeProps<T extends ElementType> = TextProps<T> &
  CommonProps &
  SpacingProps &
  Omit<DisplayProps, "as"> &
  ComponentPropsWithoutRef<T>;

const Text = <T extends ElementType = "span">({
  as,
  variant,
  size,
  weight,
  family,
  onBackground,
  onSolid,
  align,
  wrap,
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
  className,
  truncate,
  opacity,
  ...props
}: TypeProps<T>) => {
  const Component = as || "span";

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

  const sizeClass = size ? `font-${size}` : "";
  const weightClass = weight ? `font-${weight}` : "";

  const classes = variant ? getVariantClasses(variant) : [sizeClass, weightClass];

  let colorClass = "";
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
    opacity && `opacity-${opacity}`,
    truncate && "truncate",
    family && `font-family-${family}`,
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
    ...style,
  };

  return (
    <Component
      className={combinedClasses}
      style={combinedStyle}
      {...props}
    >
      {children}
    </Component>
  );
};

Text.displayName = "Text";

export { Text };
