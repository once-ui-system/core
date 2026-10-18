import classNames from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type ElementType,
  type ForwardedRef,
  forwardRef,
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

type HeadingProps<T extends ElementType> = TextProps<T> &
  CommonProps &
  SpacingProps &
  DisplayProps &
  ComponentPropsWithoutRef<T>;

/**
 * The ref of the element `Heading` renders: an `HTMLHeadingElement` by
 * default, whatever `as` names otherwise.
 */
type HeadingRef<T extends ElementType> = ComponentPropsWithRef<T>["ref"];

/**
 * `Heading`'s public signature: generic over `as`, as it was before it took a
 * ref, and with a ref typed to the element `as` names. `forwardRef`'s own
 * return type is not generic, so it would pin `as` to one element.
 */
interface HeadingComponent {
  <T extends ElementType = "h1">(props: HeadingProps<T> & { ref?: HeadingRef<T> }): ReactNode;
  /** What `React.ComponentProps<typeof Heading>` reads: the default element's props. */
  // No ref here: with `as` loosened to the text elements, a span ref would
  // also type-check on an `li`. A ref goes through the generic signature.
  (props: Omit<HeadingProps<"h1">, "as"> & { as?: TextElement; ref?: never }): ReactNode;
  displayName?: string;
}

const Heading: HeadingComponent = forwardRef(function Heading<T extends ElementType = "h1">(
  {
    as,
    textVariant,
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
    // `hide` and `showIn` are display modes of Flex and Grid. Taken out
    // so they stop reaching the DOM as attributes.
    inline: _inline,
    hide: _hide,
    showIn: _showIn,
    ...props
  }: HeadingProps<T>,
  ref: ForwardedRef<HTMLHeadingElement>,
) {
  const Component = as || "h1";

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

  // With no preset a heading is medium and strong in the family around it.
  // `weight` swaps the weight in either case.
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
    <Component ref={ref} className={combinedClasses} style={combinedStyle} {...props}>
      {children}
    </Component>
  );
});

Heading.displayName = "Heading";

export { Heading };
