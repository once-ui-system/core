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

type TypeProps<T extends ElementType> = TextProps<T> &
  CommonProps &
  LeafProps &
  Pick<DisplayProps, "opacity"> &
  ComponentPropsWithoutRef<T>;

/**
 * The ref of the element `Text` renders: an `HTMLSpanElement` by default, an
 * `HTMLLIElement` for `as="li"`, whatever `as` names.
 */
type TextRef<T extends ElementType> = ComponentPropsWithRef<T>["ref"];

/**
 * `Text`'s public signature: generic over `as`, as it was before it took a
 * ref, and with a ref typed to the element `as` names. The function below is
 * already generic; the interface adds the non-generic signature that
 * `React.ComponentProps<typeof Text>` reads.
 */
interface TextComponent {
  <T extends ElementType = "span">(props: TypeProps<T> & { ref?: TextRef<T> }): ReactNode;
  /** What `React.ComponentProps<typeof Text>` reads: the default element's props. */
  // No ref here: with `as` loosened to the text elements, a span ref would
  // also type-check on an `li`. A ref goes through the generic signature.
  (props: Omit<TypeProps<"span">, "as"> & { as?: TextElement; ref?: never }): ReactNode;
  displayName?: string;
}

const Text: TextComponent = function Text<T extends ElementType = "span">({
  ref,
  as,
  textVariant,
  weight,
  family,
  onBackground,
  onSolid,
  align,
  wrap,
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
  className,
  truncate,
  opacity,
  xl,
  l,
  m,
  s,
  xs,
  ...props
}: TypeProps<T> & { ref?: TextRef<T> }) {
  const Component = as || "span";

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

  // `weight` swaps the preset's weight, or alone sets only the weight.
  const classes = textVariant
    ? getVariantClasses(withWeight(textVariant, weight))
    : [weight && `font-${weight}`];

  let colorClass = "";
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
    opacity !== undefined && `opacity-${opacity}`,
    truncate && "truncate",
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

Text.displayName = "Text";

export { Text };
