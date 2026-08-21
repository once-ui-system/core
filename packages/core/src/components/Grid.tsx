import { type CSSProperties, forwardRef } from "react";
import { extractDomProps, generateClasses } from "../classes/generator";
import type {
  CommonProps,
  DisplayProps,
  GridBreakpointProps,
  GridProps,
  SizeProps,
  SpacingProps,
  StyleProps,
} from "../interfaces";
import { Cursor } from "./Cursor";

export interface GridComponentProps
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

export const Grid = forwardRef<HTMLDivElement, GridComponentProps>(
  ({ as: Component = "div", cursor, className, style, children, ...props }, ref) => {
    if (props.onBackground && props.onSolid) {
      console.warn(
        "You cannot use both 'onBackground' and 'onSolid' props simultaneously. Only one will be applied.",
      );
    }

    if (props.background && props.solid) {
      console.warn(
        "You cannot use both 'background' and 'solid' props simultaneously. Only one will be applied.",
      );
    }

    const hasCustomCursor = typeof cursor === "object" && cursor !== null;

    const classes = generateClasses({
      display: "grid",
      ...props,
      cursor: typeof cursor === "string" ? cursor : undefined,
      className,
    });

    const combinedStyle: CSSProperties | undefined =
      hasCustomCursor || style
        ? {
            ...(hasCustomCursor ? { cursor: "none" } : {}),
            ...style,
          }
        : undefined;

    const domProps = extractDomProps(props);

    return (
      <Component ref={ref} className={classes} style={combinedStyle} {...domProps}>
        {children}
        {hasCustomCursor && <Cursor cursor={cursor} />}
      </Component>
    );
  },
);

Grid.displayName = "Grid";

export const ServerGrid = Grid;
export const ClientGrid = Grid;
export type ServerGridProps = GridComponentProps;
export type ClientGridProps = GridComponentProps;
