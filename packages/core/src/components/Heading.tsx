import type { ComponentPropsWithoutRef, ElementType } from "react";
import { generateClasses } from "../classes/generator";
import { cn } from "../classes/utils";
import type {
  CommonProps,
  DisplayProps,
  SpacingProps,
  TextBreakpointProps,
  TextProps,
} from "../interfaces";
import type { ColorScheme, ColorWeight, TextVariant } from "../types";

export type HeadingProps<T extends ElementType = "h1"> = TextProps<T> &
  CommonProps &
  SpacingProps &
  Omit<DisplayProps, "as"> &
  ComponentPropsWithoutRef<T> & {
    xl?: TextBreakpointProps;
    l?: TextBreakpointProps;
    m?: TextBreakpointProps;
    s?: TextBreakpointProps;
    xs?: TextBreakpointProps;
  };

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
  xl,
  l,
  m,
  s,
  xs,
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
    const size = parts.pop() ?? "";
    const weight = parts.pop() ?? "";
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

  const generatedClasses = generateClasses({
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
    align,
    textWrap: wrap,
    truncate,
    opacity,
    xl,
    l,
    m,
    s,
    xs,
  });

  const combinedClasses = cn(
    ...classes,
    colorClass,
    family && `font-family-${family}`,
    generatedClasses,
    className,
  );

  return (
    <Component className={combinedClasses} style={style} {...props}>
      {children}
    </Component>
  );
};

Heading.displayName = "Heading";

export { Heading };
