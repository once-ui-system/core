import classNames from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type ElementType,
  type ReactNode,
} from "react";

import {
  CommonProps,
  DisplayProps,
  SpacingProps,
  type TextElement,
  TextProps,
} from "../interfaces.js";
import { ColorScheme, ColorWeight, TextVariant } from "../types.js";
import { spacingClass, textLayout, withWeight } from "../utils/layoutClasses.js";
import { numericSpacingStyle } from "../utils/spacingStyle.js";

type TypeProps<T extends ElementType> = TextProps<T> &
  CommonProps &
  SpacingProps &
  DisplayProps &
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
  // `hide` and `showIn` are display modes of Flex and Grid. Taken out
  // so they stop reaching the DOM as attributes.
  inline: _inline,
  hide: _hide,
  showIn: _showIn,
  ...props
}: TypeProps<T> & { ref?: TextRef<T> }) {
  const Component = as || "span";

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

  const generateClassName = (prefix: string, value: unknown) => spacingClass(prefix, value);

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
    opacity !== undefined && `opacity-${opacity}`,
    truncate && "truncate",
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
    <Component ref={ref} className={combinedClasses} style={combinedStyle} {...props}>
      {children}
    </Component>
  );
};

Text.displayName = "Text";

export { Text };
