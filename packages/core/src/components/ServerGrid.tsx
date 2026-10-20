import classNames from "clsx";
import { type CSSProperties, forwardRef } from "react";

import type {
  CommonProps,
  DisplayProps,
  GridBreakpointProps,
  GridProps,
  SizeProps,
  SpacingProps,
  StyleProps,
} from "../interfaces";
import type { ColorScheme, ColorWeight } from "../types";
import {
  BELOW_HEADER,
  hiddenAboveBreakpoints,
  isCSSUnit,
  offsetClasses,
  scrollsOn,
  sizeValue,
  spacingClasses,
  themeAttributes,
  translateTransform,
} from "../utils/layoutClasses";
import { numericSpacingStyle } from "../utils/spacingStyle";

interface ServerGridProps
  extends GridProps,
    SpacingProps,
    SizeProps,
    StyleProps,
    CommonProps,
    DisplayProps {
  xl?: GridBreakpointProps;
  l?: GridBreakpointProps;
  m?: GridBreakpointProps;
  s?: GridBreakpointProps;
  xs?: GridBreakpointProps;
}

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
  hiddenAbove = false,
): (string | false | undefined)[] {
  if (!props) return [];
  return [
    ...spacingClasses(breakpoint, props),
    props.position && `${breakpoint}-position-${props.position}`,
    props.hide === true && `${breakpoint}-grid-hide`,
    // A show class only undoes a wider hide, so it is emitted only under one.
    props.hide === false && hiddenAbove && `${breakpoint}-grid-show`,
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

const ServerGrid = forwardRef<HTMLDivElement, ServerGridProps>(
  (
    {
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
      textSize,
      textWeight,
      textType,
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
      dark,
      light,
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
    },
    ref,
  ) => {
    // Cascade breakpoints: larger breakpoint styles flow down to smaller ones
    // Order: xl > l > m > s > xs
    // `xl` leads the cascade; the code used to start at `l` and drop it.
    const cascadedXl = xl ? { ...xl } : undefined;
    const cascadedL = l || cascadedXl ? { ...cascadedXl, ...l } : undefined;
    const cascadedM = m ? { ...cascadedL, ...m } : cascadedL;
    const cascadedS = s ? { ...cascadedM, ...s } : cascadedM;
    const cascadedXs = xs ? { ...cascadedS, ...xs } : cascadedS;
    const hiddenAbove = hiddenAboveBreakpoints(hide, [cascadedXl, cascadedL, cascadedM, cascadedS]);

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
    // any rem or CSS length works without a class per size and the grid stays
    // a server component.
    const minColumnWidthValue = sizeValue(minColumnWidth, "width");

    let classes = classNames(
      position && `position-${position}`,
      inline ? "display-inline-grid" : "display-grid",
      hide && "grid-hide",
      fit && "fit",
      fitWidth && "fit-width",
      fitHeight && "fit-height",
      fill && "fill",
      (fillWidth || maxWidth) && "fill-width",
      maxWidth &&
        ["xs", "s", "m", "l", "xl"].includes(maxWidth as string) &&
        `max-width-${maxWidth}`,
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
      typeof padding !== "number" && padding && `p-${padding}`,
      typeof paddingLeft !== "number" && paddingLeft && `pl-${paddingLeft}`,
      typeof paddingRight !== "number" && paddingRight && `pr-${paddingRight}`,
      typeof paddingTop !== "number" && paddingTop && `pt-${paddingTop}`,
      typeof paddingBottom !== "number" && paddingBottom && `pb-${paddingBottom}`,
      typeof paddingX !== "number" && paddingX && `px-${paddingX}`,
      typeof paddingY !== "number" && paddingY && `py-${paddingY}`,
      typeof margin !== "number" && margin && `m-${margin}`,
      typeof marginLeft !== "number" && marginLeft && `ml-${marginLeft}`,
      typeof marginRight !== "number" && marginRight && `mr-${marginRight}`,
      typeof marginTop !== "number" && marginTop && `mt-${marginTop}`,
      typeof marginBottom !== "number" && marginBottom && `mb-${marginBottom}`,
      typeof marginX !== "number" && marginX && `mx-${marginX}`,
      typeof marginY !== "number" && marginY && `my-${marginY}`,
      typeof gap !== "number" && gap && `g-${gap}`,
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
      textType && `font-${textType}`,
      typeof cursor === "string" && `cursor-${cursor}`,
      userSelect && `user-select-${userSelect}`,
      blendMode && `blend-mode-${blendMode}`,
      typeof blur === "string" && `blur-${blur}`,
      typeof backdropBlur === "string" && `backdrop-blur-${backdropBlur}`,
      dark && "dark-grid",
      light && "light-grid",
      className,
    );

    classes +=
      " " +
      classNames(
        ...breakpointClasses("xl", cascadedXl, hiddenAbove.xl),
        ...breakpointClasses("l", cascadedL, hiddenAbove.l),
        ...breakpointClasses("m", cascadedM, hiddenAbove.m),
        ...breakpointClasses("s", cascadedS, hiddenAbove.s),
        ...breakpointClasses("xs", cascadedXs, hiddenAbove.xs),
      );

    const parsePosition = (value: number | string | undefined): string | undefined => {
      if (value === undefined) return undefined;
      if (typeof value === "number") return `${value}rem`;
      if (typeof value === "string") {
        if (isCSSUnit(value)) {
          return value;
        }
      }
      return undefined;
    };

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
      gap: typeof gap === "number" ? `${gap}rem` : undefined,
      top: parsePosition(top),
      right: parsePosition(right),
      bottom: parsePosition(bottom),
      left: parsePosition(left),
      transform,
      // A size is a class; a number is rem, and has no class to reach for.
      filter: typeof blur === "number" ? `blur(${blur}rem)` : undefined,
      ...(typeof backdropBlur === "number" && {
        WebkitBackdropFilter: `blur(${backdropBlur}rem)`,
        backdropFilter: `blur(${backdropBlur}rem)`,
      }),
      ...(minColumnWidthValue && { "--grid-min-column-width": minColumnWidthValue }),
      ...style,
    };

    return (
      <Component
        ref={ref}
        className={classes}
        style={combinedStyle}
        {...rest}
        {...themeAttributes({ theme, themeBorder, themeSolid, themeSurface })}
      >
        {children}
      </Component>
    );
  },
);

ServerGrid.displayName = "ServerGrid";

export type { GridProps };
export { ServerGrid };
