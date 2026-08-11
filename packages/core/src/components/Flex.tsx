import { type CSSProperties, forwardRef } from "react";
import { generateClasses } from "../classes/generator";
import { cn } from "../classes/utils";
import type {
  CommonProps,
  DisplayProps,
  FlexBreakpointProps,
  FlexProps,
  SizeProps,
  SpacingProps,
  StyleProps,
} from "../interfaces";
import { Cursor } from "./Cursor";

export interface FlexComponentProps
  extends FlexProps,
    SpacingProps,
    SizeProps,
    StyleProps,
    CommonProps,
    DisplayProps {
  className?: string;
  xl?: FlexBreakpointProps;
  l?: FlexBreakpointProps;
  m?: FlexBreakpointProps;
  s?: FlexBreakpointProps;
  xs?: FlexBreakpointProps;
  isDefaultBreakpoints?: boolean;
}

const Flex = forwardRef<HTMLDivElement, FlexComponentProps>(
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

    const classes = cn(
      generateClasses({
        ...props,
        cursor: typeof cursor === "string" ? cursor : undefined,
      }),
      className,
    );

    const combinedStyle: CSSProperties | undefined =
      hasCustomCursor || style
        ? {
            ...(hasCustomCursor ? { cursor: "none" } : {}),
            ...style,
          }
        : undefined;

    return (
      <Component ref={ref} className={classes} style={combinedStyle} {...props}>
        {children}
        {hasCustomCursor && <Cursor cursor={cursor} />}
      </Component>
    );
  },
);

Flex.displayName = "Flex";

export { Flex };
export const ServerFlex = Flex;
export const ClientFlex = Flex;
export type ServerFlexProps = FlexComponentProps;
export type ClientFlexProps = FlexComponentProps;
