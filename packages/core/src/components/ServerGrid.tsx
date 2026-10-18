import classNames from "clsx";
import type { CSSProperties, ElementType, HTMLAttributes, Ref } from "react";

import type { GridBreakpointProps, GridLayoutProps, GridProps } from "../interfaces.js";
import { ColorScheme, ColorWeight } from "../types.js";
import {
  BELOW_HEADER,
  elementReset,
  isCSSUnit,
  offsetClasses,
  offsetValue,
  scrollsOn,
  sizeValue,
  spacingClass,
  spacingClasses,
  spacingValue,
  themeAttributes,
  translateTransform,
  withTokenLengths,
} from "../utils/layoutClasses.js";
import { numericSpacingStyle } from "../utils/spacingStyle.js";

/** What the two halves of Grid take; `Grid` is the typed face. */
export type ServerGridProps = GridLayoutProps &
  Omit<HTMLAttributes<HTMLElement>, keyof GridLayoutProps> & { as?: ElementType };

/**
 * Every class one breakpoint object resolves to.
 *
 * `Grid` used to send any breakpoint prop to the client component, which needs
 * a `LayoutProvider` and lays the grid out only after an effect. The classes
 * were already there — `.m-columns-2` and its siblings are generated for every
 * breakpoint, and `ClientGrid` relied on them itself — so a breakpoint object
 * whose values all have one renders here now, under the same rule `Flex` uses.
 * This writes the same families `ServerFlex` does for its breakpoints, `xl`
 * included, plus the grid's own `columns` and `rows`.
 */
function breakpointClasses(
  breakpoint: string,
  props: GridBreakpointProps | undefined,
): (string | false | undefined)[] {
  if (!props) return [];
  return [
    ...spacingClasses(breakpoint, props),
    props.position && `${breakpoint}-position-${props.position}`,
    props.hide === true && `${breakpoint}-grid-hide`,
    props.hide === false && `${breakpoint}-grid-show`,
    props.columns && `${breakpoint}-columns-${props.columns}`,
    props.rows && `${breakpoint}-rows-${props.rows}`,
    props.overflow && `${breakpoint}-overflow-${props.overflow}`,
    props.overflowX && `${breakpoint}-overflow-x-${props.overflowX}`,
    props.overflowY && `${breakpoint}-overflow-y-${props.overflowY}`,
    props.scrollbar && `${breakpoint}-scrollbar-${props.scrollbar}`,
    ...offsetClasses(breakpoint, props),
    props.pointerEvents && `${breakpoint}-pointer-events-${props.pointerEvents}`,
    props.opacity !== undefined && `${breakpoint}-opacity-${props.opacity}`,
    props.zIndex !== undefined && `${breakpoint}-z-index-${props.zIndex}`,
    props.transition && `${breakpoint}-transition-${props.transition}`,
  ];
}

/** `${family}-${weight}-${size}` as its three font classes. */
function variantClasses(variant: string): string[] {
  const parts = variant.split("-");
  const size = parts.pop();
  const weight = parts.pop();
  return [`font-${parts.join("-")}`, `font-${weight}`, `font-${size}`];
}

const ServerGrid = ({
  ref,
  as: Component = "div",
  inline,
  columns,
  rows,
  minColumnWidth,
  gap,
  position = "relative",
  xl,
  l,
  m,
  s,
  xs,
  hide,
  aspectRatio,
  align,
  textVariant,
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
  showIn,
  width,
  height,
  maxWidth,
  minWidth,
  minHeight,
  maxHeight,
  top,
  right,
  bottom,
  left,
  translateX,
  translateY,
  fit,
  fill,
  fillWidth = false,
  fillHeight = false,
  fitWidth,
  fitHeight,
  background,
  solid,
  opacity,
  transition,
  pointerEvents,
  border,
  borderTop,
  borderRight,
  borderBottom,
  borderLeft,
  borderX,
  borderY,
  borderStyle,
  borderWidth,
  radius,
  topRadius,
  rightRadius,
  bottomRadius,
  leftRadius,
  topLeftRadius,
  topRightRadius,
  bottomLeftRadius,
  bottomRightRadius,
  overflow,
  overflowX,
  overflowY,
  scrollbar = "minimal",
  cursor,
  zIndex,
  shadow,
  userSelect,
  blendMode,
  blur,
  backdropBlur,
  theme,
  themeBorder,
  themeSolid,
  themeSurface,
  className,
  style,
  children,
  ...rest
}: ServerGridProps & { ref?: Ref<HTMLElement> }) => {
  // Cascade breakpoints: larger breakpoint styles flow down to smaller ones
  // Order: xl > l > m > s > xs
  // `xl` leads the cascade; the code used to start at `l` and drop it.
  const cascadedXl = xl ? { ...xl } : undefined;
  const cascadedL = l || cascadedXl ? { ...cascadedXl, ...l } : undefined;
  const cascadedM = m ? { ...cascadedL, ...m } : cascadedL;
  const cascadedS = s ? { ...cascadedM, ...s } : cascadedM;
  const cascadedXs = xs ? { ...cascadedS, ...xs } : cascadedS;

  const generateDynamicClass = (type: string, value: string | "-1" | undefined) => {
    if (!value) return undefined;

    // See ServerFlex: `transparent` is a value of background and solid as
    // well as border, so the class has to follow the type.
    if (value === "transparent") {
      return `transparent-${type}`;
    }

    if (value === "surface" || value === "page") {
      return `${value}-${type}`;
    }

    const parts = value.split("-");
    if (parts.includes("alpha")) {
      const [scheme, , weight] = parts;
      return `${scheme}-${type}-alpha-${weight}`;
    }

    const [scheme, weight] = value.split("-") as [ColorScheme, ColorWeight];
    return `${scheme}-${type}-${weight}`;
  };

  // Auto-fit: one class, with the width as a custom property beside it, so
  // any px number or CSS length works without a class per size and the grid stays
  // a server component.
  const minColumnWidthValue = sizeValue(minColumnWidth, "width");

  let classes = classNames(
    position && `position-${position}`,
    inline ? "display-inline-grid" : "display-grid",
    elementReset(Component),
    hide && "grid-hide",
    fit && "fit",
    fitWidth && "fit-width",
    fitHeight && "fit-height",
    fill && "fill",
    (fillWidth || maxWidth) && "fill-width",
    maxWidth && ["xs", "s", "m", "l", "xl"].includes(maxWidth as string) && `max-width-${maxWidth}`,
    (fillHeight || maxHeight) && "fill-height",
    height === BELOW_HEADER && "height-below-header",
    minHeight === BELOW_HEADER && "min-height-below-header",
    maxHeight === BELOW_HEADER && "max-height-below-header",
    minColumnWidthValue ? "columns-auto-fit" : columns && `columns-${columns}`,
    // Taken out of the props here, so it never reaches the DOM as a `rows`
    // attribute, which is where it used to end up.
    rows && `rows-${rows}`,
    overflow && `overflow-${overflow}`,
    overflowX && `overflow-x-${overflowX}`,
    overflowY && `overflow-y-${overflowY}`,
    (scrollsOn(overflow) || scrollsOn(overflowX) || scrollsOn(overflowY)) &&
      `scrollbar-${scrollbar}`,
    spacingClass("p", padding),
    spacingClass("pl", paddingLeft),
    spacingClass("pr", paddingRight),
    spacingClass("pt", paddingTop),
    spacingClass("pb", paddingBottom),
    spacingClass("px", paddingX),
    spacingClass("py", paddingY),
    spacingClass("m", margin),
    spacingClass("ml", marginLeft),
    spacingClass("mr", marginRight),
    spacingClass("mt", marginTop),
    spacingClass("mb", marginBottom),
    spacingClass("mx", marginX),
    spacingClass("my", marginY),
    spacingClass("g", gap),
    typeof top === "string" && !isCSSUnit(top) && top && `top-${top}`,
    typeof right === "string" && !isCSSUnit(right) && right && `right-${right}`,
    typeof bottom === "string" && !isCSSUnit(bottom) && bottom && `bottom-${bottom}`,
    typeof left === "string" && !isCSSUnit(left) && left && `left-${left}`,
    generateDynamicClass("background", background),
    generateDynamicClass("solid", solid),
    // Handle border color: boolean uses default-border, string uses dynamic class
    (border === true ||
      borderTop === true ||
      borderRight === true ||
      borderBottom === true ||
      borderLeft === true ||
      borderX === true ||
      borderY === true) &&
      "default-border",
    typeof border === "string" && generateDynamicClass("border", border),
    typeof borderTop === "string" && generateDynamicClass("border", borderTop),
    typeof borderRight === "string" && generateDynamicClass("border", borderRight),
    typeof borderBottom === "string" && generateDynamicClass("border", borderBottom),
    typeof borderLeft === "string" && generateDynamicClass("border", borderLeft),
    typeof borderX === "string" && generateDynamicClass("border", borderX),
    typeof borderY === "string" && generateDynamicClass("border", borderY),
    (border || borderTop || borderRight || borderBottom || borderLeft || borderX || borderY) &&
      !borderStyle &&
      "border-solid",
    border && !borderWidth && `border-1`,
    (borderTop || borderRight || borderBottom || borderLeft || borderX || borderY) &&
      "border-reset",
    borderTop && "border-top-1",
    borderRight && "border-right-1",
    borderBottom && "border-bottom-1",
    borderLeft && "border-left-1",
    borderX && "border-x-1",
    borderY && "border-y-1",
    borderWidth && `border-${borderWidth}`,
    borderStyle && `border-${borderStyle}`,
    radius === "full" ? "radius-full" : radius && `radius-${radius}`,
    topRadius && `radius-${topRadius}-top`,
    rightRadius && `radius-${rightRadius}-right`,
    bottomRadius && `radius-${bottomRadius}-bottom`,
    leftRadius && `radius-${leftRadius}-left`,
    topLeftRadius && `radius-${topLeftRadius}-top-left`,
    topRightRadius && `radius-${topRightRadius}-top-right`,
    bottomLeftRadius && `radius-${bottomLeftRadius}-bottom-left`,
    bottomRightRadius && `radius-${bottomRightRadius}-bottom-right`,
    pointerEvents && `pointer-events-${pointerEvents}`,
    transition && `transition-${transition}`,
    shadow && `shadow-${shadow}`,
    zIndex && `z-index-${zIndex}`,
    // The preset's three classes, as Flex writes them. 2.x typed
    // `textVariant` here and never applied it.
    ...(textVariant ? variantClasses(textVariant) : []),
    typeof cursor === "string" && `cursor-${cursor}`,
    userSelect && `user-select-${userSelect}`,
    blendMode && `blend-mode-${blendMode}`,
    typeof blur === "string" && !isCSSUnit(blur) && `blur-${blur}`,
    typeof backdropBlur === "string" && !isCSSUnit(backdropBlur) && `backdrop-blur-${backdropBlur}`,
    showIn === "dark" && "dark-grid",
    showIn === "light" && "light-grid",
    className,
  );

  classes +=
    " " +
    classNames(
      ...breakpointClasses("xl", cascadedXl),
      ...breakpointClasses("l", cascadedL),
      ...breakpointClasses("m", cascadedM),
      ...breakpointClasses("s", cascadedS),
      ...breakpointClasses("xs", cascadedXs),
    );

  // A spacing token as well as a number or a CSS unit, as on ServerFlex.
  const transform = translateTransform(translateX, translateY);

  const combinedStyle: CSSProperties = {
    maxWidth: ["xs", "s", "m", "l", "xl"].includes(maxWidth as string)
      ? undefined
      : sizeValue(maxWidth, "width"),
    minWidth: sizeValue(minWidth, "width"),
    minHeight: sizeValue(minHeight, "height"),
    maxHeight: sizeValue(maxHeight, "height"),
    width: sizeValue(width, "width"),
    height: sizeValue(height, "height"),
    aspectRatio: aspectRatio,
    textAlign: align,
    // Hide default cursor when using custom cursor
    cursor: typeof cursor === "string" ? cursor : undefined,
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
    gap: spacingValue(gap),
    top: offsetValue(top),
    right: offsetValue(right),
    bottom: offsetValue(bottom),
    left: offsetValue(left),
    transform,
    // A size is a class; a number is inline, and has no class to reach for.
    filter: spacingValue(blur) ? `blur(${spacingValue(blur)})` : undefined,
    ...(spacingValue(backdropBlur) && {
      WebkitBackdropFilter: `blur(${spacingValue(backdropBlur)})`,
      backdropFilter: `blur(${spacingValue(backdropBlur)})`,
    }),
    ...(minColumnWidthValue && { "--grid-min-column-width": minColumnWidthValue }),
    ...style,
  };

  return (
    <Component
      ref={ref}
      {...(Component === "button" && { type: "button" })}
      className={classes}
      style={withTokenLengths(combinedStyle)}
      {...rest}
      {...themeAttributes({ theme, themeBorder, themeSolid, themeSurface })}
    >
      {children}
    </Component>
  );
};

ServerGrid.displayName = "ServerGrid";

export type { GridProps };
export { ServerGrid };
