import classNames from "clsx";
import { CSSProperties, forwardRef } from "react";

import {
  CommonProps,
  DisplayProps,
  FlexBreakpointProps,
  FlexProps,
  SizeProps,
  SpacingProps,
  StyleProps,
} from "../interfaces";
import { ColorScheme, ColorWeight, SpacingToken, TextVariant } from "../types";
import {
  BELOW_HEADER,
  isCSSUnit,
  offsetClasses,
  scrollsOn,
  sizeValue,
  spacingClasses,
  themeAttributes,
  translateTransform,
} from "../utils/layoutClasses";
import { numericSpacingStyle } from "../utils/spacingStyle";

interface ServerFlexProps
  extends FlexProps,
    SpacingProps,
    SizeProps,
    StyleProps,
    CommonProps,
    DisplayProps {
  xl?: FlexBreakpointProps;
  l?: FlexBreakpointProps;
  m?: FlexBreakpointProps;
  s?: FlexBreakpointProps;
  xs?: FlexBreakpointProps;
}

const ServerFlex = forwardRef<HTMLDivElement, ServerFlexProps>(
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
    // `xl` leads the cascade, as the comment above always claimed it did — the
    // code used to start at `l` and drop it on the floor, so an `xl` object
    // only ever reached the client component.
    const cascadedXl = xl ? { direction, ...xl } : { direction };
    const cascadedL = l ? { ...cascadedXl, ...l } : cascadedXl;
    const cascadedM = m ? { ...cascadedL, ...m } : cascadedL;
    const cascadedS = s ? { ...cascadedM, ...s } : cascadedM;
    const cascadedXs = xs ? { ...cascadedS, ...xs } : cascadedS;

    const getVariantClasses = (variant: TextVariant) => {
      const parts = variant.split("-");
      const size = parts.pop()!;
      const weight = parts.pop()!;
      const fontType = parts.join("-");
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

      // Not hardcoded to `border`: this helper is called for background and
      // solid too, and returning the border class for them applied nothing to
      // the background while clearing the border the author asked for.
      if (value === "transparent") {
        return `transparent-${type}`;
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
      typeof top === "string" && !isCSSUnit(top) && top
        ? `top-${top}`
        : position === "sticky" && top === undefined
          ? "top-0"
          : undefined,
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
      opacity !== undefined && `opacity-${opacity}`,
      wrap && "flex-wrap",
      overflow && `overflow-${overflow}`,
      overflowX && `overflow-x-${overflowX}`,
      overflowY && `overflow-y-${overflowY}`,
      (scrollsOn(overflow) || scrollsOn(overflowX) || scrollsOn(overflowY)) &&
        `scrollbar-${scrollbar}`,
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
      maxWidth &&
        ["xs", "s", "m", "l", "xl"].includes(maxWidth as string) &&
        `max-width-${maxWidth}`,
      (fillHeight || maxHeight) && "fill-height",
      height === BELOW_HEADER && "height-below-header",
      minHeight === BELOW_HEADER && "min-height-below-header",
      maxHeight === BELOW_HEADER && "max-height-below-header",
      shadow && `shadow-${shadow}`,
      zIndex !== undefined && `z-index-${zIndex}`,
      textType && `font-${textType}`,
      typeof cursor === "string" && `cursor-${cursor}`,
      userSelect && `user-select-${userSelect}`,
      blendMode && `blend-mode-${blendMode}`,
      typeof blur === "string" && `blur-${blur}`,
      typeof backdropBlur === "string" && `backdrop-blur-${backdropBlur}`,
      dark && "dark-flex",
      light && "light-flex",
      colorClass,
      className,
      ...variantClasses,
    );

    classes +=
      " " +
      classNames(
        ...spacingClasses("xl", cascadedXl),
        ...spacingClasses("l", cascadedL),
        ...spacingClasses("m", cascadedM),
        ...spacingClasses("s", cascadedS),
        ...spacingClasses("xs", cascadedXs),
        // Offsets cascade with the rest. Only a static step is a class
        // (`.m-top-16`); a rem number or a CSS unit is inline, on ClientFlex.
        ...offsetClasses("xl", cascadedXl),
        ...offsetClasses("l", cascadedL),
        ...offsetClasses("m", cascadedM),
        ...offsetClasses("s", cascadedS),
        ...offsetClasses("xs", cascadedXs),
        cascadedXl?.position && `xl-position-${cascadedXl.position}`,
        cascadedL?.position && `l-position-${cascadedL.position}`,
        cascadedM?.position && `m-position-${cascadedM.position}`,
        cascadedS?.position && `s-position-${cascadedS.position}`,
        cascadedXs?.position && `xs-position-${cascadedXs.position}`,
        cascadedXl?.hide === true && "xl-flex-hide",
        cascadedXl?.hide === false && "xl-flex-show",
        cascadedL?.hide === true && "l-flex-hide",
        cascadedL?.hide === false && "l-flex-show",
        cascadedM?.hide === true && "m-flex-hide",
        cascadedM?.hide === false && "m-flex-show",
        cascadedS?.hide === true && "s-flex-hide",
        cascadedS?.hide === false && "s-flex-show",
        cascadedXs?.hide === true && "xs-flex-hide",
        cascadedXs?.hide === false && "xs-flex-show",
        xl?.direction && `xl-flex-${xl.direction}`,
        l?.direction && `l-flex-${l.direction}`,
        m?.direction && `m-flex-${m.direction}`,
        s?.direction && `s-flex-${s.direction}`,
        xs?.direction && `xs-flex-${xs.direction}`,
        cascadedL?.horizontal &&
          (cascadedL?.direction === "row" ||
          cascadedL?.direction === "row-reverse" ||
          cascadedL?.direction === undefined
            ? `l-justify-${cascadedL.horizontal}`
            : `l-align-${cascadedL.horizontal}`),
        cascadedL?.vertical &&
          (cascadedL?.direction === "row" ||
          cascadedL?.direction === "row-reverse" ||
          cascadedL?.direction === undefined
            ? `l-align-${cascadedL.vertical}`
            : `l-justify-${cascadedL.vertical}`),
        cascadedM?.horizontal &&
          (cascadedM?.direction === "row" ||
          cascadedM?.direction === "row-reverse" ||
          cascadedM?.direction === undefined
            ? `m-justify-${cascadedM.horizontal}`
            : `m-align-${cascadedM.horizontal}`),
        cascadedM?.vertical &&
          (cascadedM?.direction === "row" ||
          cascadedM?.direction === "row-reverse" ||
          cascadedM?.direction === undefined
            ? `m-align-${cascadedM.vertical}`
            : `m-justify-${cascadedM.vertical}`),
        cascadedS?.horizontal &&
          (cascadedS?.direction === "row" ||
          cascadedS?.direction === "row-reverse" ||
          cascadedS?.direction === undefined
            ? `s-justify-${cascadedS.horizontal}`
            : `s-align-${cascadedS.horizontal}`),
        cascadedS?.vertical &&
          (cascadedS?.direction === "row" ||
          cascadedS?.direction === "row-reverse" ||
          cascadedS?.direction === undefined
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
        // Additional class-based properties. `xl` leads, as it does for spacing:
        // without it an `xl={{ overflow }}` reached every narrower step and
        // missed its own.
        cascadedXl?.overflow && `xl-overflow-${cascadedXl.overflow}`,
        cascadedL?.overflow && `l-overflow-${cascadedL.overflow}`,
        cascadedM?.overflow && `m-overflow-${cascadedM.overflow}`,
        cascadedS?.overflow && `s-overflow-${cascadedS.overflow}`,
        cascadedXs?.overflow && `xs-overflow-${cascadedXs.overflow}`,
        cascadedXl?.overflowX && `xl-overflow-x-${cascadedXl.overflowX}`,
        cascadedL?.overflowX && `l-overflow-x-${cascadedL.overflowX}`,
        cascadedM?.overflowX && `m-overflow-x-${cascadedM.overflowX}`,
        cascadedS?.overflowX && `s-overflow-x-${cascadedS.overflowX}`,
        cascadedXs?.overflowX && `xs-overflow-x-${cascadedXs.overflowX}`,
        cascadedXl?.overflowY && `xl-overflow-y-${cascadedXl.overflowY}`,
        cascadedL?.overflowY && `l-overflow-y-${cascadedL.overflowY}`,
        cascadedM?.overflowY && `m-overflow-y-${cascadedM.overflowY}`,
        cascadedS?.overflowY && `s-overflow-y-${cascadedS.overflowY}`,
        cascadedXs?.overflowY && `xs-overflow-y-${cascadedXs.overflowY}`,
        cascadedL?.wrap && `l-flex-${cascadedL.wrap}`,
        cascadedM?.wrap && `m-flex-${cascadedM.wrap}`,
        cascadedS?.wrap && `s-flex-${cascadedS.wrap}`,
        cascadedXs?.wrap && `xs-flex-${cascadedXs.wrap}`,
        cascadedL?.flex && `l-flex-${cascadedL.flex}`,
        cascadedM?.flex && `m-flex-${cascadedM.flex}`,
        cascadedS?.flex && `s-flex-${cascadedS.flex}`,
        cascadedXs?.flex && `xs-flex-${cascadedXs.flex}`,
        cascadedL?.align && `l-align-${cascadedL.align}`,
        cascadedM?.align && `m-align-${cascadedM.align}`,
        cascadedS?.align && `s-align-${cascadedS.align}`,
        cascadedXs?.align && `xs-align-${cascadedXs.align}`,
        cascadedL?.scrollbar && `l-scrollbar-${cascadedL.scrollbar}`,
        cascadedM?.scrollbar && `m-scrollbar-${cascadedM.scrollbar}`,
        cascadedS?.scrollbar && `s-scrollbar-${cascadedS.scrollbar}`,
        cascadedXs?.scrollbar && `xs-scrollbar-${cascadedXs.scrollbar}`,
        cascadedL?.pointerEvents && `l-pointer-events-${cascadedL.pointerEvents}`,
        cascadedM?.pointerEvents && `m-pointer-events-${cascadedM.pointerEvents}`,
        cascadedS?.pointerEvents && `s-pointer-events-${cascadedS.pointerEvents}`,
        cascadedXs?.pointerEvents && `xs-pointer-events-${cascadedXs.pointerEvents}`,
        cascadedL?.opacity !== undefined && `l-opacity-${cascadedL.opacity}`,
        cascadedM?.opacity !== undefined && `m-opacity-${cascadedM.opacity}`,
        cascadedS?.opacity !== undefined && `s-opacity-${cascadedS.opacity}`,
        cascadedXs?.opacity !== undefined && `xs-opacity-${cascadedXs.opacity}`,
        cascadedL?.zIndex !== undefined && `l-z-index-${cascadedL.zIndex}`,
        cascadedM?.zIndex !== undefined && `m-z-index-${cascadedM.zIndex}`,
        cascadedS?.zIndex !== undefined && `s-z-index-${cascadedS.zIndex}`,
        cascadedXs?.zIndex !== undefined && `xs-z-index-${cascadedXs.zIndex}`,
        cascadedL?.transition && `l-transition-${cascadedL.transition}`,
        cascadedM?.transition && `m-transition-${cascadedM.transition}`,
        cascadedS?.transition && `s-transition-${cascadedS.transition}`,
        cascadedXs?.transition && `xs-transition-${cascadedXs.transition}`,
      );

    const parsePosition = (
      value: number | SpacingToken | string | undefined,
    ): string | undefined => {
      if (value === undefined) return undefined;
      if (typeof value === "number") return `${value}rem`;
      if (typeof value === "string") {
        // Check for CSS unit values - pass through directly
        if (isCSSUnit(value)) {
          return value;
        }
      }
      return undefined;
    };

    // A spacing token as well as a number or a CSS unit: `translateY="16"`
    // used to write no transform at all.
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

ServerFlex.displayName = "ServerFlex";

export { ServerFlex };
