import { forwardRef } from "react";
import {
  CommonProps,
  DisplayProps,
  FlexBreakpointProps,
  FlexProps,
  SizeProps,
  SpacingProps,
  StyleProps,
} from "../interfaces";
import { isClassExpressible } from "../utils/layoutClasses";
import { ClientFlex } from "./ClientFlex";
import { ServerFlex } from "./ServerFlex";

interface SmartFlexProps
  extends FlexProps,
    StyleProps,
    SpacingProps,
    SizeProps,
    CommonProps,
    DisplayProps {
  xl?: FlexBreakpointProps;
  l?: FlexBreakpointProps;
  m?: FlexBreakpointProps;
  s?: FlexBreakpointProps;
  xs?: FlexBreakpointProps;
}

const Flex = forwardRef<HTMLDivElement, SmartFlexProps>(
  ({ cursor, xl, l, m, s, xs, style, hide, ...props }, ref) => {
    // Check if we need client-side functionality
    const needsClientSide = () => {
      // Custom cursor requires client-side
      if (typeof cursor === "object" && cursor) return true;

      // Every other breakpoint value is a class if it has one. A token gap is
      // `.s-g-4`; a px number or CSS-length gap is a value with no class behind it, and
      // `width`/`aspectRatio`/`style` are inline by nature. Only those need
      // the runtime pass, so only those pay for it — the rest of the tree
      // stays a server component and is laid out correctly in the first paint
      // rather than after an effect.
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
        <ClientFlex
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
      <ServerFlex
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

Flex.displayName = "Flex";

export { Flex };
