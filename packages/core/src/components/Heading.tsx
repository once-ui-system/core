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
  wrap = "balance",
  className,
  style,
  children,
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

  const classes = cn(
    generateClasses({
      variant,
      size: !variant && !size ? "m" : size,
      weight: !variant && !weight ? "strong" : weight,
      family,
      onBackground: !onBackground && !onSolid ? "neutral-strong" : onBackground,
      onSolid,
      textWrap: wrap,
      ...props,
    }),
    className,
  );

  return (
    <Component className={classes} style={style} {...props}>
      {children}
    </Component>
  );
};

Heading.displayName = "Heading";

export { Heading };
