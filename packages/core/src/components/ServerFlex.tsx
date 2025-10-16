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
      padding && `p-${padding}`,
      paddingLeft && `pl-${paddingLeft}`,
      paddingRight && `pr-${paddingRight}`,
      paddingTop && `pt-${paddingTop}`,
      paddingBottom && `pb-${paddingBottom}`,
      paddingX && `px-${paddingX}`,
      paddingY && `py-${paddingY}`,
      margin && `m-${margin}`,
      marginLeft && `ml-${marginLeft}`,
      marginRight && `mr-${marginRight}`,
      marginTop && `mt-${marginTop}`,
      marginBottom && `mb-${marginBottom}`,
      marginX && `mx-${marginX}`,
      marginY && `my-${marginY}`,
      gap === "-1"
        ? direction === "column" || direction === "column-reverse"
          ? "g-vertical--1"
          : "g-horizontal--1"
        : gap && `g-${gap}`,
      top ? `top-${top}` : position === "sticky" ? "top-0" : undefined,
      right && `right-${right}`,
      bottom && `bottom-${bottom}`,
      left && `left-${left}`,
      generateDynamicClass("background", background),
      generateDynamicClass("solid", solid),
      generateDynamicClass(
        "border",
        border || borderTop || borderRight || borderBottom || borderLeft || borderX || borderY,
      ),
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
          l?.position && `l-position-${l.position}`,
          m?.position && `m-position-${m.position}`,
          s?.position && `s-position-${s.position}`,
          xs?.position && `xs-position-${xs.position}`,
          l?.hide === true && "l-flex-hide",
          l?.hide === false && "l-flex-show",
          m?.hide === true && "m-flex-hide",
          m?.hide === false && "m-flex-show",
          s?.hide === true && "s-flex-hide",
          s?.hide === false && "s-flex-show",
          xs?.hide === true && "xs-flex-hide",
          xs?.hide === false && "xs-flex-show",
          l?.direction && `l-flex-${l.direction}`,
          m?.direction && `m-flex-${m.direction}`,
          s?.direction && `s-flex-${s.direction}`,
          xs?.direction && `xs-flex-${xs.direction}`,
          l?.horizontal &&
            (l?.direction === "row" || l?.direction === "row-reverse" || l?.direction === undefined
              ? `l-justify-${l.horizontal}`
              : `l-align-${l.horizontal}`),
          l?.vertical &&
            (l?.direction === "row" || l?.direction === "row-reverse" || l?.direction === undefined
              ? `l-align-${l.vertical}`
              : `l-justify-${l.vertical}`),
          m?.horizontal &&
            (m?.direction === "row" || m?.direction === "row-reverse" || m?.direction === undefined
              ? `m-justify-${m.horizontal}`
              : `m-align-${m.horizontal}`),
          m?.vertical &&
            (m?.direction === "row" || m?.direction === "row-reverse" || m?.direction === undefined
              ? `m-align-${m.vertical}`
              : `m-justify-${m.vertical}`),
          s?.horizontal &&
            (s?.direction === "row" || s?.direction === "row-reverse" || s?.direction === undefined
              ? `s-justify-${s.horizontal}`
              : `s-align-${s.horizontal}`),
          s?.vertical &&
            (s?.direction === "row" || s?.direction === "row-reverse" || s?.direction === undefined
              ? `s-align-${s.vertical}`
              : `s-justify-${s.vertical}`),
          xs?.horizontal &&
            (xs?.direction === "row" ||
            xs?.direction === "row-reverse" ||
            xs?.direction === undefined
              ? `xs-justify-${xs.horizontal}`
              : `xs-align-${xs.horizontal}`),
          xs?.vertical &&
            (xs?.direction === "row" ||
            xs?.direction === "row-reverse" ||
            xs?.direction === undefined
              ? `xs-align-${xs.vertical}`
              : `xs-justify-${xs.vertical}`),
        );
    }

    const parseDimension = (
      value: number | SpacingToken | undefined,
      type: "width" | "height",
    ): string | undefined => {
      if (value === undefined) return undefined;
      if (typeof value === "number") return `${value}rem`;
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
      if (["xs", "s", "m", "l", "xl"].includes(value)) {
        return `var(--responsive-${type}-${value})`;
      }
      return undefined;
    };

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
