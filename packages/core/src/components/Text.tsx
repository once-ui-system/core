import type { ComponentPropsWithRef, ElementType } from "react";
import { generateClasses } from "../classes/generator";
import { cn } from "../classes/utils";
import type {
  CommonProps,
  DisplayProps,
  SpacingProps,
  TextBreakpointProps,
  TextProps,
} from "../interfaces";

export type TextComponentProps<T extends ElementType = "span"> = TextProps<T> &
  CommonProps &
  SpacingProps &
  Omit<DisplayProps, "as"> &
  ComponentPropsWithRef<T> & {
    xl?: TextBreakpointProps;
    l?: TextBreakpointProps;
    m?: TextBreakpointProps;
    s?: TextBreakpointProps;
    xs?: TextBreakpointProps;
  };

export type TypeProps<T extends ElementType = "span"> = TextComponentProps<T>;

const Text = <T extends ElementType = "span">({
  as,
  variant,
  size,
  weight,
  family,
  onBackground,
  onSolid,
  wrap,
  className,
  style,
  children,
  ...props
}: TextComponentProps<T>) => {
  const Component = (as || "span") as ElementType;

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
      size,
      weight,
      family,
      onBackground,
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

Text.displayName = "Text";

export { Text };
