import { type CSSProperties, forwardRef } from "react";
import { generateClasses } from "../classes/generator";
import type {
  CommonProps,
  DisplayProps,
  FlexBreakpointProps,
  FlexProps,
  SizeProps,
  SpacingProps,
  StyleProps,
} from "../interfaces";
import type { SpacingToken } from "../types";

export interface ServerFlexProps
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
  isDefaultBreakpoints?: boolean;
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

    // Cascade breakpoints when enabled: xl > l > m > s > xs
    const cascadedL = isDefaultBreakpoints ? (l ? { direction, ...l } : { direction }) : l;
    const cascadedM = isDefaultBreakpoints ? (m ? { ...cascadedL, ...m } : cascadedL) : m;
    const cascadedS = isDefaultBreakpoints ? (s ? { ...cascadedM, ...s } : cascadedM) : s;
    const cascadedXs = isDefaultBreakpoints ? (xs ? { ...cascadedS, ...xs } : cascadedS) : xs;

    const classes = generateClasses({
      inline,
      hide,
      dark,
      light,
      direction,
      xl,
      l: cascadedL,
      m: cascadedM,
      s: cascadedS,
      xs: cascadedXs,
      wrap,
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
      position,
      center,
      width,
      height,
      maxWidth,
      minWidth,
      minHeight,
      maxHeight,
      scrollbar,
      fit,
      fitWidth,
      fitHeight,
      fill,
      fillWidth,
      fillHeight,
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
      cursor: typeof cursor === "string" ? cursor : undefined,
      className,
    });

    const parsePosition = (
      value: number | SpacingToken | string | undefined,
    ): string | undefined => {
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
      ...(transform ? { transform } : {}),
      ...(typeof cursor === "string" ? { cursor } : {}),
      ...style,
    };

    return (
      <Component
        ref={ref}
        className={classes}
        style={Object.keys(combinedStyle).length > 0 ? combinedStyle : undefined}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);

ServerFlex.displayName = "ServerFlex";

export { ServerFlex };
