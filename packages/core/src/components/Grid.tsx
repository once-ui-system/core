import { forwardRef } from "react";
import {
  CommonProps,
  DisplayProps,
  GridBreakpointProps,
  GridProps,
  SizeProps,
  SpacingProps,
  StyleProps,
} from "../interfaces";
import { isClassExpressible } from "../utils/layoutClasses";
import { ClientGrid } from "./ClientGrid";
import { ServerGrid } from "./ServerGrid";

interface SmartGridProps
  extends GridProps,
    StyleProps,
    SpacingProps,
    SizeProps,
    CommonProps,
    DisplayProps {
  xl?: GridBreakpointProps;
  l?: GridBreakpointProps;
  m?: GridBreakpointProps;
  s?: GridBreakpointProps;
  xs?: GridBreakpointProps;
}

const Grid = forwardRef<HTMLDivElement, SmartGridProps>(
  ({ cursor, xl, l, m, s, xs, style, hide, ...props }, ref) => {
    // Check if we need client-side functionality
    const needsClientSide = () => {
      // Custom cursor requires client-side
      if (typeof cursor === "object" && cursor) return true;

      // A breakpoint object stays on the server whenever every value in it is
      // a class — `m={{ columns: 2 }}` is `.m-columns-2`, `s={{ gap: "4" }}`
      // is `.s-g-4` — under the same rule Flex uses. Only a value a class
      // cannot express (a width, a px number, `style`) needs the runtime pass.
      if ([xl, l, m, s, xs].some((bp) => bp && !isClassExpressible(bp))) return true;

      // Dynamic styles require client-side
      if (
        style &&
        typeof style === "object" &&
        Object.keys(style as Record<string, any>).length > 0
      )
        return true;

      return false;
    };

    // Use client component if any client-side functionality is needed
    if (needsClientSide()) {
      return (
        <ClientGrid
          ref={ref}
          cursor={cursor}
          xl={xl}
          l={l}
          m={m}
          s={s}
          xs={xs}
          style={style}
          hide={hide}
          {...props}
        />
      );
    }

    // The breakpoint objects go through explicitly: they are destructured out
    // of `props` above, so a spread would not carry them.
    return (
      <ServerGrid
        ref={ref}
        cursor={cursor}
        hide={hide}
        xl={xl}
        l={l}
        m={m}
        s={s}
        xs={xs}
        {...props}
      />
    );
  },
);

Grid.displayName = "Grid";

export { Grid };
