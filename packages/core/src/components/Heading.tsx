import classNames from "clsx";
import type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementType,
  ReactNode,
} from "react";

import type {
  CommonProps,
  DisplayProps,
  LeafProps,
  TextElement,
  TextProps,
} from "../interfaces.js";
import type { ColorScheme, ColorWeight, TextVariant } from "../types.js";
import { withWeight } from "../utils/layoutClasses.js";
import { leafLayout } from "../utils/leafLayout.js";

type HeadingProps<T extends ElementType = "h1"> = TextProps<T> &
  CommonProps &
  LeafProps &
  Pick<DisplayProps, "opacity"> &
  ComponentPropsWithoutRef<T>;

/**
 * The ref of the element `Heading` renders: an `HTMLHeadingElement` by
 * default, whatever `as` names otherwise.
 */
type HeadingRef<T extends ElementType> = ComponentPropsWithRef<T>["ref"];

/**
 * `Heading`'s public signature: generic over `as`, as it was before it took a
 * ref, and with a ref typed to the element `as` names. The function below is
 * already generic; the interface adds the non-generic signature that
 * `React.ComponentProps<typeof Heading>` reads.
 */
interface HeadingComponent {
  <T extends ElementType = "h1">(props: HeadingProps<T> & { ref?: HeadingRef<T> }): ReactNode;
  /** What `React.ComponentProps<typeof Heading>` reads: the default element's props. */
  // No ref here: with `as` loosened to the text elements, a span ref would
  // also type-check on an `li`. A ref goes through the generic signature.
  (props: Omit<HeadingProps<"h1">, "as"> & { as?: TextElement; ref?: never }): ReactNode;
  displayName?: string;
}

const Heading: HeadingComponent = function Heading<T extends ElementType = "h1">({
  ref,
  as,
  textVariant: preset,
  variant,
  weight,
  family,
  onBackground,
  onSolid,
  align,
  wrap = "balance",
  margin,
  marginLeft,
  marginRight,
  marginTop,
  marginBottom,
  marginX,
  marginY,
  flex,
  fillWidth,
  position,
  top,
  right,
  bottom,
  left,
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
}: HeadingProps<T> & { ref?: HeadingRef<T> }) {
  const Component = as || "h1";

  // Prop-misuse hints are for development; production logged them on every render.
  if (process.env.NODE_ENV !== "production" && onBackground && onSolid) {
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

  // With no preset a heading is medium and strong in the family around it.
  // `weight` swaps the weight in either case.
  const textVariant = preset ?? variant;
  const classes = textVariant
    ? getVariantClasses(withWeight(textVariant, weight))
    : ["font-m", `font-${weight ?? "strong"}`];

  let colorClass = "neutral-on-background-strong";
  if (onBackground) {
    const [scheme, weight] = onBackground.split("-") as [ColorScheme, ColorWeight];
    colorClass = `${scheme}-on-background-${weight}`;
  } else if (onSolid) {
    const [scheme, weight] = onSolid.split("-") as [ColorScheme, ColorWeight];
    colorClass = `${scheme}-on-solid-${weight}`;
  }

  const layout = leafLayout({
    margin,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    marginX,
    marginY,
    flex,
    position,
    top,
    right,
    bottom,
    left,
  });

  const combinedClasses = classNames(
    ...classes,
    colorClass,
    className,
    truncate && "truncate",
    opacity !== undefined && `opacity-${opacity}`,
    family && `font-family-${family}`,
    fillWidth && "fill-width",
    ...layout.classes,
    xl?.hide && "xl-flex-hide",
    l?.hide && "l-flex-hide",
    m?.hide && "m-flex-hide",
    s?.hide && "s-flex-hide",
    xs?.hide && "xs-flex-hide",
  );

  const combinedStyle = {
    textAlign: align,
    textWrap: wrap,
    ...layout.style,
    ...style,
  };

  return (
    <Component ref={ref} className={combinedClasses} style={combinedStyle} {...props}>
      {children}
    </Component>
  );
};

Heading.displayName = "Heading";

export type { HeadingProps };
export { Heading };
