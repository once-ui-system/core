import React, { forwardRef } from "react";
import { ClientFlex, ServerFlex } from ".";
import { FlexProps, StyleProps, SpacingProps, SizeProps, CommonProps, DisplayProps } from "../interfaces";

interface SmartFlexProps extends FlexProps, StyleProps, SpacingProps, SizeProps, CommonProps, DisplayProps {}

const Flex = forwardRef<HTMLDivElement, SmartFlexProps>(({ cursor, l, m, s, style, ...props }, ref) => {
  // Use client component if custom cursor (ReactNode) is provided
  if (typeof cursor === 'object' && cursor) {
    return <ClientFlex ref={ref} cursor={cursor} l={l} m={m} s={s} style={style} {...props} />;
  }
  
  // Use client component if responsive props are provided
  if (l || m || s) {
    return <ClientFlex ref={ref} cursor={cursor} l={l} m={m} s={s} style={style} {...props} />;
  }
  
  // Use client component if dynamic style is provided (requires client-side updates)
  if (style && typeof style === 'object' && Object.keys(style).length > 0) {
    return <ClientFlex ref={ref} cursor={cursor} l={l} m={m} s={s} style={style} {...props} />;
  }
  
  // Use server component for string cursors or no cursor, no responsive props, no dynamic styles
  return <ServerFlex ref={ref} cursor={cursor} {...props} />;
});

Flex.displayName = "Flex";
export { Flex };
