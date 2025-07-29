import { forwardRef } from "react";
import { ClientGrid, ServerGrid } from ".";
import { GridProps, StyleProps, SpacingProps, SizeProps, CommonProps, DisplayProps } from "../interfaces";

interface SmartGridProps extends GridProps, StyleProps, SpacingProps, SizeProps, CommonProps, DisplayProps {}

const Grid = forwardRef<HTMLDivElement, SmartGridProps>(({ cursor, l, m, s, style, ...props }, ref) => {
  // Use client component if custom cursor (ReactNode) is provided
  if (typeof cursor === 'object' && cursor) {
    return <ClientGrid ref={ref} cursor={cursor} l={l} m={m} s={s} style={style} {...props} />;
  }
  
  // Use client component if responsive props are provided
  if (l || m || s) {
    return <ClientGrid ref={ref} cursor={cursor} l={l} m={m} s={s} style={style} {...props} />;
  }
  
  // Use client component if dynamic style is provided (requires client-side updates)
  if (style && typeof style === 'object' && Object.keys(style).length > 0) {
    return <ClientGrid ref={ref} cursor={cursor} l={l} m={m} s={s} style={style} {...props} />;
  }
  
  // Use server component for string cursors or no cursor, no responsive props, no dynamic styles
  return <ServerGrid ref={ref} cursor={cursor} {...props} />;
});

Grid.displayName = "Grid";
export { Grid }; 