import { ElementType, ComponentPropsWithoutRef } from "react";
import classNames from "classnames";

import { TextProps, CommonProps, SpacingProps } from "../interfaces";
import { ColorScheme, ColorWeight, TextVariant, SpacingToken } from "../types";

type HeadingProps<T extends ElementType> = TextProps<T> &
  CommonProps &
  SpacingProps &
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
  className,
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
    const [fontType, weight, size] = variant.split("-");
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
    family && `font-family-${family}`,
  );

  const combinedStyle = {
    textAlign: align,
    textWrap: wrap,
    padding: typeof padding === "number" ? `${padding}rem` : undefined,
    paddingLeft: typeof paddingLeft === "number" ? `${paddingLeft}rem` : typeof paddingX === "number" ? `${paddingX}rem` : undefined,
    paddingRight: typeof paddingRight === "number" ? `${paddingRight}rem` : typeof paddingX === "number" ? `${paddingX}rem` : undefined,
    paddingTop: typeof paddingTop === "number" ? `${paddingTop}rem` : typeof paddingY === "number" ? `${paddingY}rem` : undefined,
    paddingBottom: typeof paddingBottom === "number" ? `${paddingBottom}rem` : typeof paddingY === "number" ? `${paddingY}rem` : undefined,
    margin: typeof margin === "number" ? `${margin}rem` : undefined,
    marginLeft: typeof marginLeft === "number" ? `${marginLeft}rem` : typeof marginX === "number" ? `${marginX}rem` : undefined,
    marginRight: typeof marginRight === "number" ? `${marginRight}rem` : typeof marginX === "number" ? `${marginX}rem` : undefined,
    marginTop: typeof marginTop === "number" ? `${marginTop}rem` : typeof marginY === "number" ? `${marginY}rem` : undefined,
    marginBottom: typeof marginBottom === "number" ? `${marginBottom}rem` : typeof marginY === "number" ? `${marginY}rem` : undefined,
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

Heading.displayName = "Heading";

export { Heading };
