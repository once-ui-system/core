import classNames from "classnames";
import { CSSProperties, forwardRef } from "react";

import {
  CommonProps,
  DisplayProps,
  FlexProps,
  SizeProps,
  SpacingProps,
  StyleProps,
} from "../interfaces";
import { ColorScheme, ColorWeight, SpacingToken, TextVariant } from "../types";

interface ComponentProps
  extends FlexProps,
    SpacingProps,
    SizeProps,
    StyleProps,
    CommonProps,
    DisplayProps {
  xl?: any;
  l?: any;
  m?: any;
  s?: any;
  xs?: any;
  isDefaultBreakpoints?: boolean;
}

const ServerFlex = forwardRef<HTMLDivElement, ComponentProps>(
  (
    {
      as: Component = "div",
      inline,
      hide,
      dark,
      light,
      direction,
      xl,
      l,
      m,
      s,
      xs,
      isDefaultBreakpoints = true,
      wrap = false,
      horizontal,
      vertical,
      flex,
      textVariant,
      textSize,
      textWeight,
      textType,
      onBackground,
      onSolid,
      align,
      top,
      right,
      bottom,
      left,
      translateX,
      translateY,
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
      gap,
      position = "relative",
      center,
      width,
      height,
      maxWidth,
      minWidth,
      minHeight,
      maxHeight,
      scrollbar = "minimal",
      fit = false,
      fitWidth = false,
      fitHeight = false,
      fill = false,
      fillWidth = false,
      fillHeight = false,
      aspectRatio,
      transition,
      background,
      solid,
      opacity,
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
      zIndex,
      shadow,
      cursor,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    if (onBackground && onSolid) {
      console.warn(
        "You cannot use both 'onBackground' and 'onSolid' props simultaneously. Only one will be applied.",
      );
    }

    if (background && solid) {
      console.warn(
        "You cannot use both 'background' and 'solid' props simultaneously. Only one will be applied.",
      );
    }

    // Cascade breakpoints: larger breakpoint styles flow down to smaller ones
    // Order: xl > l > m > s > xs
    const cascadedL = l ? { ...l } : undefined;
    const cascadedM = m ? { ...cascadedL, ...m } : cascadedL;
    const cascadedS = s ? { ...cascadedM, ...s } : cascadedM;
    const cascadedXs = xs ? { ...cascadedS, ...xs } : cascadedS;

    const getVariantClasses = (variant: TextVariant) => {
      const [fontType, weight, size] = variant.split("-");
      return [`font-${fontType}`, `font-${weight}`, `font-${size}`];
    };

    const sizeClass = textSize ? `font-${textSize}` : "";
    const weightClass = textWeight ? `font-${textWeight}` : "";

    const variantClasses = textVariant ? getVariantClasses(textVariant) : [sizeClass, weightClass];

    let colorClass = "";
    if (onBackground) {
      const [scheme, weight] = onBackground.split("-") as [ColorScheme, ColorWeight];
      colorClass = `${scheme}-on-background-${weight}`;
    } else if (onSolid) {
      const [scheme, weight] = onSolid.split("-") as [ColorScheme, ColorWeight];
      colorClass = `${scheme}-on-solid-${weight}`;
    }

    const generateDynamicClass = (type: string, value: string | undefined) => {
      if (!value) return undefined;

      if (value === "transparent") {
        return `transparent-border`;
      }

      if (["surface", "page", "overlay"].includes(value)) {
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

    let classes = classNames(
      inline ? "display-inline-flex" : "display-flex",
      position && `position-${position}`,
      hide && "flex-hide",
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
      gap === "-1"
        ? direction === "column" || direction === "column-reverse"
          ? "g-vertical--1"
          : "g-horizontal--1"
        : typeof gap !== "number" && gap && `g-${gap}`,
      typeof top === "string" && !top.endsWith("%") && !top.endsWith("vh") && !top.endsWith("dvh") && !top.endsWith("vw") && !top.startsWith("calc(") && top ? `top-${top}` : position === "sticky" && top === undefined ? "top-0" : undefined,
      typeof right === "string" && !right.endsWith("%") && !right.endsWith("vh") && !right.endsWith("dvh") && !right.endsWith("vw") && !right.startsWith("calc(") && right && `right-${right}`,
      typeof bottom === "string" && !bottom.endsWith("%") && !bottom.endsWith("vh") && !bottom.endsWith("dvh") && !bottom.endsWith("vw") && !bottom.startsWith("calc(") && bottom && `bottom-${bottom}`,
      typeof left === "string" && !left.endsWith("%") && !left.endsWith("vh") && !left.endsWith("dvh") && !left.endsWith("vw") && !left.startsWith("calc(") && left && `left-${left}`,
      generateDynamicClass("background", background),
      generateDynamicClass("solid", solid),
      // Handle border color: boolean uses default-border, string uses dynamic class
      (border === true || borderTop === true || borderRight === true || borderBottom === true || borderLeft === true || borderX === true || borderY === true) && "default-border",
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
      border && !borderWidth && "border-1",
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
      direction && `flex-${direction}`,
      pointerEvents && `pointer-events-${pointerEvents}`,
      transition && `transition-${transition}`,
      opacity && `opacity-${opacity}`,
      wrap && "flex-wrap",
      overflow && `overflow-${overflow}`,
      overflowX && `overflow-x-${overflowX}`,
      overflowY && `overflow-y-${overflowY}`,
      (overflow && overflow !== "hidden" || overflowX && overflowX !== "hidden" || overflowY && overflowY !== "hidden") && `scrollbar-${scrollbar}`,
      flex && `flex-${flex}`,
      horizontal &&
        (direction === "row" || direction === "row-reverse" || direction === undefined
          ? `justify-${horizontal}`
          : `align-${horizontal}`),
      vertical &&
        (direction === "row" || direction === "row-reverse" || direction === undefined
          ? `align-${vertical}`
          : `justify-${vertical}`),
      center && "center",
      fit && "fit",
      fitWidth && "fit-width",
      fitHeight && "fit-height",
      fill && "fill",
      fillWidth && !minWidth && "min-width-0",
      fillHeight && !minHeight && "min-height-0",
      fill && "min-height-0",
      fill && "min-width-0",
      (fillWidth || maxWidth) && "fill-width",
      (fillHeight || maxHeight) && "fill-height",
      shadow && `shadow-${shadow}`,
      zIndex && `z-index-${zIndex}`,
      textType && `font-${textType}`,
      typeof cursor === "string" && `cursor-${cursor}`,
      dark && "dark-flex",
      light && "light-flex",
      colorClass,
      className,
      ...variantClasses,
    );

    if (isDefaultBreakpoints) {
      classes +=
        " " +
        classNames(
          cascadedL?.position && `l-position-${cascadedL.position}`,
          cascadedM?.position && `m-position-${cascadedM.position}`,
          cascadedS?.position && `s-position-${cascadedS.position}`,
          cascadedXs?.position && `xs-position-${cascadedXs.position}`,
          cascadedL?.hide === true && "l-flex-hide",
          cascadedL?.hide === false && "l-flex-show",
          cascadedM?.hide === true && "m-flex-hide",
          cascadedM?.hide === false && "m-flex-show",
          cascadedS?.hide === true && "s-flex-hide",
          cascadedS?.hide === false && "s-flex-show",
          cascadedXs?.hide === true && "xs-flex-hide",
          cascadedXs?.hide === false && "xs-flex-show",
          cascadedL?.direction && `l-flex-${cascadedL.direction}`,
          cascadedM?.direction && `m-flex-${cascadedM.direction}`,
          cascadedS?.direction && `s-flex-${cascadedS.direction}`,
          cascadedXs?.direction && `xs-flex-${cascadedXs.direction}`,
          cascadedL?.horizontal &&
            (cascadedL?.direction === "row" || cascadedL?.direction === "row-reverse" || cascadedL?.direction === undefined
              ? `l-justify-${cascadedL.horizontal}`
              : `l-align-${cascadedL.horizontal}`),
          cascadedL?.vertical &&
            (cascadedL?.direction === "row" || cascadedL?.direction === "row-reverse" || cascadedL?.direction === undefined
              ? `l-align-${cascadedL.vertical}`
              : `l-justify-${cascadedL.vertical}`),
          cascadedM?.horizontal &&
            (cascadedM?.direction === "row" || cascadedM?.direction === "row-reverse" || cascadedM?.direction === undefined
              ? `m-justify-${cascadedM.horizontal}`
              : `m-align-${cascadedM.horizontal}`),
          cascadedM?.vertical &&
            (cascadedM?.direction === "row" || cascadedM?.direction === "row-reverse" || cascadedM?.direction === undefined
              ? `m-align-${cascadedM.vertical}`
              : `m-justify-${cascadedM.vertical}`),
          cascadedS?.horizontal &&
            (cascadedS?.direction === "row" || cascadedS?.direction === "row-reverse" || cascadedS?.direction === undefined
              ? `s-justify-${cascadedS.horizontal}`
              : `s-align-${cascadedS.horizontal}`),
          cascadedS?.vertical &&
            (cascadedS?.direction === "row" || cascadedS?.direction === "row-reverse" || cascadedS?.direction === undefined
              ? `s-align-${cascadedS.vertical}`
              : `s-justify-${cascadedS.vertical}`),
          cascadedXs?.horizontal &&
            (cascadedXs?.direction === "row" ||
            cascadedXs?.direction === "row-reverse" ||
            cascadedXs?.direction === undefined
              ? `xs-justify-${cascadedXs.horizontal}`
              : `xs-align-${cascadedXs.horizontal}`),
          cascadedXs?.vertical &&
            (cascadedXs?.direction === "row" ||
            cascadedXs?.direction === "row-reverse" ||
            cascadedXs?.direction === undefined
              ? `xs-align-${cascadedXs.vertical}`
              : `xs-justify-${cascadedXs.vertical}`),
        );
    }

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

    const parsePosition = (
      value: number | SpacingToken | string | undefined,
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
      }
      return undefined;
    };

    const translateXValue = parsePosition(translateX);
    const translateYValue = parsePosition(translateY);
    const transform = translateXValue || translateYValue
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
      cursor: typeof cursor === "string" ? cursor : undefined,
      padding: typeof padding === "number" ? `${padding}rem` : undefined,
      paddingLeft: typeof paddingLeft === "number" ? `${paddingLeft}rem` : typeof paddingX === "number" ? `${paddingX}rem` : undefined,
      paddingRight: typeof paddingRight === "number" ? `${paddingRight}rem` : typeof paddingX === "number" ? `${paddingX}rem` : undefined,
      paddingTop: typeof paddingTop === "number" ? `${paddingTop}rem` : typeof paddingY === "number" ? `${paddingY}rem` : undefined,
      paddingBottom: typeof paddingBottom === "number" ? `${paddingBottom}rem` : typeof paddingY === "number" ? `${paddingY}rem` : undefined,
      margin: typeof margin === "number" ? `${margin}rem` : undefined,
      marginLeft: typeof marginLeft === "number" ? `${marginLeft}rem` : typeof marginX === "number" ? `${marginX}rem` : undefined,
      marginRight: typeof marginRight === "number" ? `${marginRight}rem` : typeof marginX === "number" ? `${marginX}rem` : undefined,
      marginTop: typeof marginTop === "number" ? `${marginTop}rem` : typeof marginY === "number" ? `${marginY}rem` : undefined,
      marginBottom: typeof marginBottom === "number" ? `${marginBottom}rem` : typeof marginY === "number" ? `${marginY}rem` : undefined,
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

ServerFlex.displayName = "ServerFlex";
export { ServerFlex };
