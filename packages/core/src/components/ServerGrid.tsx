import { CSSProperties, forwardRef } from "react";
import classNames from "classnames";

import {
  GridProps,
  SpacingProps,
  SizeProps,
  StyleProps,
  CommonProps,
  DisplayProps,
  GridBreakpointProps,
} from "../interfaces";
import { SpacingToken, ColorScheme, ColorWeight } from "../types";

interface ComponentProps
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
  isDefaultBreakpoints?: boolean;
}

const ServerGrid = forwardRef<HTMLDivElement, ComponentProps>(
  (
    {
      as: Component = "div",
      inline,
      columns,
      gap,
      position = "relative",
      xl,
      l,
      m,
      s,
      xs,
      isDefaultBreakpoints = true,
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
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    // Cascade breakpoints: larger breakpoint styles flow down to smaller ones
    // Order: xl > l > m > s > xs
    const cascadedL = l ? { ...l } : undefined;
    const cascadedM = m ? { ...cascadedL, ...m } : cascadedL;
    const cascadedS = s ? { ...cascadedM, ...s } : cascadedM;
    const cascadedXs = xs ? { ...cascadedS, ...xs } : cascadedS;

    const generateDynamicClass = (type: string, value: string | "-1" | undefined) => {
      if (!value) return undefined;

      if (value === "transparent") {
        return `transparent-border`;
      }

      if (value === "surface" || value === "page" || value === "transparent") {
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

    const parseDimension = (
      value: number | SpacingToken | string | undefined,
      type: "width" | "height",
    ): string | undefined => {
      if (value === undefined) return undefined;
      if (typeof value === "number") return `${value}rem`;
      if (typeof value === "string") {
        // Check for CSS unit values - pass through directly
        if (
          value.endsWith("%") ||
          value.endsWith("vh") ||
          value.endsWith("dvh") ||
          value.endsWith("vw") ||
          value.startsWith("calc(")
        ) {
          return value;
        }
        // Static spacing tokens
        if (
          [
            "0",
            "1",
            "2",
            "4",
            "8",
            "12",
            "16",
            "20",
            "24",
            "32",
            "40",
            "48",
            "56",
            "64",
            "80",
            "104",
            "128",
            "160",
          ].includes(value)
        ) {
          return `var(--static-space-${value})`;
        }
        // Responsive tokens
        if (["xs", "s", "m", "l", "xl"].includes(value)) {
          return `var(--responsive-${type}-${value})`;
        }
      }
      return undefined;
    };

    let classes = classNames(
      position && `position-${position}`,
      inline ? "display-inline-grid" : "display-grid",
      hide && "grid-hide",
      fit && "fit",
      fitWidth && "fit-width",
      fitHeight && "fit-height",
      fill && "fill",
      (fillWidth || maxWidth) && "fill-width",
      (fillHeight || maxHeight) && "fill-height",
      columns && `columns-${columns}`,
      overflow && `overflow-${overflow}`,
      overflowX && `overflow-x-${overflowX}`,
      overflowY && `overflow-y-${overflowY}`,
      ((overflow && overflow !== "hidden") ||
        (overflowX && overflowX !== "hidden") ||
        (overflowY && overflowY !== "hidden")) &&
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
      typeof top === "string" &&
        !top.endsWith("%") &&
        !top.endsWith("vh") &&
        !top.endsWith("dvh") &&
        !top.endsWith("vw") &&
        !top.startsWith("calc(") &&
        top &&
        `top-${top}`,
      typeof right === "string" &&
        !right.endsWith("%") &&
        !right.endsWith("vh") &&
        !right.endsWith("dvh") &&
        !right.endsWith("vw") &&
        !right.startsWith("calc(") &&
        right &&
        `right-${right}`,
      typeof bottom === "string" &&
        !bottom.endsWith("%") &&
        !bottom.endsWith("vh") &&
        !bottom.endsWith("dvh") &&
        !bottom.endsWith("vw") &&
        !bottom.startsWith("calc(") &&
        bottom &&
        `bottom-${bottom}`,
      typeof left === "string" &&
        !left.endsWith("%") &&
        !left.endsWith("vh") &&
        !left.endsWith("dvh") &&
        !left.endsWith("vw") &&
        !left.startsWith("calc(") &&
        left &&
        `left-${left}`,
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
      dark && "dark-grid",
      light && "light-grid",
      className,
    );

    if (isDefaultBreakpoints) {
      classes +=
        " " +
        classNames(
          cascadedL?.position && `l-position-${cascadedL.position}`,
          cascadedM?.position && `m-position-${cascadedM.position}`,
          cascadedS?.position && `s-position-${cascadedS.position}`,
          cascadedXs?.position && `xs-position-${cascadedXs.position}`,
          cascadedL?.hide === true && "l-grid-hide",
          cascadedL?.hide === false && "l-grid-show",
          cascadedM?.hide === true && "m-grid-hide",
          cascadedM?.hide === false && "m-grid-show",
          cascadedS?.hide === true && "s-grid-hide",
          cascadedS?.hide === false && "s-grid-show",
          cascadedXs?.hide === true && "xs-grid-hide",
          cascadedXs?.hide === false && "xs-grid-show",
          cascadedL?.columns && `l-columns-${cascadedL.columns}`,
          cascadedM?.columns && `m-columns-${cascadedM.columns}`,
          cascadedS?.columns && `s-columns-${cascadedS.columns}`,
          cascadedXs?.columns && `xs-columns-${cascadedXs.columns}`,
          cascadedL?.overflow && `l-overflow-${cascadedL.overflow}`,
          cascadedM?.overflow && `m-overflow-${cascadedM.overflow}`,
          cascadedS?.overflow && `s-overflow-${cascadedS.overflow}`,
          cascadedXs?.overflow && `xs-overflow-${cascadedXs.overflow}`,
          cascadedL?.overflowX && `l-overflow-x-${cascadedL.overflowX}`,
          cascadedM?.overflowX && `m-overflow-x-${cascadedM.overflowX}`,
          cascadedS?.overflowX && `s-overflow-x-${cascadedS.overflowX}`,
          cascadedXs?.overflowX && `xs-overflow-x-${cascadedXs.overflowX}`,
          cascadedL?.overflowY && `l-overflow-y-${cascadedL.overflowY}`,
          cascadedM?.overflowY && `m-overflow-y-${cascadedM.overflowY}`,
          cascadedS?.overflowY && `s-overflow-y-${cascadedS.overflowY}`,
          cascadedXs?.overflowY && `xs-overflow-y-${cascadedXs.overflowY}`,
          cascadedL?.top && `l-top-${cascadedL.top}`,
          cascadedM?.top && `m-top-${cascadedM.top}`,
          cascadedS?.top && `s-top-${cascadedS.top}`,
          cascadedXs?.top && `xs-top-${cascadedXs.top}`,
          cascadedL?.right && `l-right-${cascadedL.right}`,
          cascadedM?.right && `m-right-${cascadedM.right}`,
          cascadedS?.right && `s-right-${cascadedS.right}`,
          cascadedXs?.right && `xs-right-${cascadedXs.right}`,
          cascadedL?.bottom && `l-bottom-${cascadedL.bottom}`,
          cascadedM?.bottom && `m-bottom-${cascadedM.bottom}`,
          cascadedS?.bottom && `s-bottom-${cascadedS.bottom}`,
          cascadedXs?.bottom && `xs-bottom-${cascadedXs.bottom}`,
          cascadedL?.left && `l-left-${cascadedL.left}`,
          cascadedM?.left && `m-left-${cascadedM.left}`,
          cascadedS?.left && `s-left-${cascadedS.left}`,
          cascadedXs?.left && `xs-left-${cascadedXs.left}`,
        );
    }

    const parsePosition = (value: number | string | undefined): string | undefined => {
      if (value === undefined) return undefined;
      if (typeof value === "number") return `${value}rem`;
      if (typeof value === "string") {
        if (
          value.endsWith("%") ||
          value.endsWith("vh") ||
          value.endsWith("dvh") ||
          value.endsWith("vw") ||
          value.startsWith("calc(")
        ) {
          return value;
        }
      }
      return undefined;
    };

    const translateXValue = parsePosition(translateX);
    const translateYValue = parsePosition(translateY);
    const transform =
      translateXValue || translateYValue
        ? `translate(${translateXValue || "0"}, ${translateYValue || "0"})`
        : undefined;

    const combinedStyle: CSSProperties = {
      maxWidth: parseDimension(maxWidth, "width"),
      minWidth: parseDimension(minWidth, "width"),
      minHeight: parseDimension(minHeight, "height"),
      maxHeight: parseDimension(maxHeight, "height"),
      width: parseDimension(width, "width"),
      height: parseDimension(height, "height"),
      aspectRatio: aspectRatio,
      textAlign: align,
      // Hide default cursor when using custom cursor
      cursor: typeof cursor === "string" ? cursor : undefined,
      padding: typeof padding === "number" ? `${padding}rem` : undefined,
      paddingLeft:
        typeof paddingLeft === "number"
          ? `${paddingLeft}rem`
          : typeof paddingX === "number"
            ? `${paddingX}rem`
            : undefined,
      paddingRight:
        typeof paddingRight === "number"
          ? `${paddingRight}rem`
          : typeof paddingX === "number"
            ? `${paddingX}rem`
            : undefined,
      paddingTop:
        typeof paddingTop === "number"
          ? `${paddingTop}rem`
          : typeof paddingY === "number"
            ? `${paddingY}rem`
            : undefined,
      paddingBottom:
        typeof paddingBottom === "number"
          ? `${paddingBottom}rem`
          : typeof paddingY === "number"
            ? `${paddingY}rem`
            : undefined,
      margin: typeof margin === "number" ? `${margin}rem` : undefined,
      marginLeft:
        typeof marginLeft === "number"
          ? `${marginLeft}rem`
          : typeof marginX === "number"
            ? `${marginX}rem`
            : undefined,
      marginRight:
        typeof marginRight === "number"
          ? `${marginRight}rem`
          : typeof marginX === "number"
            ? `${marginX}rem`
            : undefined,
      marginTop:
        typeof marginTop === "number"
          ? `${marginTop}rem`
          : typeof marginY === "number"
            ? `${marginY}rem`
            : undefined,
      marginBottom:
        typeof marginBottom === "number"
          ? `${marginBottom}rem`
          : typeof marginY === "number"
            ? `${marginY}rem`
            : undefined,
      gap: typeof gap === "number" ? `${gap}rem` : undefined,
      top: parsePosition(top),
      right: parsePosition(right),
      bottom: parsePosition(bottom),
      left: parsePosition(left),
      transform,
      ...style,
    };

    return (
      <Component ref={ref} className={classes} style={combinedStyle} {...rest}>
        {children}
      </Component>
    );
  },
);

ServerGrid.displayName = "ServerGrid";

export { ServerGrid };
export type { GridProps };
