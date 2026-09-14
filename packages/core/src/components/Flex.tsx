import { forwardRef } from "react";
import {
  FlexProps,
  StyleProps,
  SpacingProps,
  SizeProps,
  CommonProps,
  DisplayProps,
  FlexBreakpointProps,
} from "../interfaces";
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

/**
 * Props whose breakpoint value cannot become a utility class.
 *
 * `width`, `height` and their min/max siblings accept arbitrary rems and CSS
 * units, `aspectRatio` is a free-form ratio, and `style` is the escape hatch.
 * A class matrix cannot enumerate any of them.
 */
const INLINE_ONLY = new Set([
  "width",
  "height",
  "maxWidth",
  "minWidth",
  "maxHeight",
  "minHeight",
  "aspectRatio",
  "style",
]);

/** Props that take a real number and still resolve to a class. */
const NUMERIC_CLASS_PROPS = new Set(["opacity", "zIndex", "flex", "columns", "rows"]);

/**
 * True when every value in a breakpoint object maps to a generated class.
 *
 * Numbers are the subtle case: `padding: 16` means 16rem and has no class,
 * while `padding: "16"` is the token and does. The two look alike in JSX and
 * behave differently, so this reads the value's type rather than trusting the
 * prop name.
 */
function isClassExpressible(breakpointProps: Record<string, unknown>): boolean {
  return Object.entries(breakpointProps).every(([prop, value]) => {
    if (value === undefined) return true;
    if (INLINE_ONLY.has(prop)) return false;
    return typeof value !== "number" || NUMERIC_CLASS_PROPS.has(prop);
  });
}

const Flex = forwardRef<HTMLDivElement, SmartFlexProps>(
  ({ cursor, xl, l, m, s, xs, style, hide, ...props }, ref) => {
    // Check if we need client-side functionality
    const needsClientSide = () => {
      // Custom cursor requires client-side
      if (typeof cursor === "object" && cursor) return true;

      // `xl` is `Infinity` — the base state, not a media query — and
      // ServerFlex's cascade starts at `l`, so an `xl` object is dropped
      // there. It stays on the client component, which does read it.
      if (xl) return true;

      // Every other breakpoint value is a class if it has one. A token gap is
      // `.s-g-4`; a numeric gap is a rem value with no class behind it, and
      // `width`/`aspectRatio`/`style` are inline by nature. Only those need
      // the runtime pass, so only those pay for it — the rest of the tree
      // stays a server component and is laid out correctly in the first paint
      // rather than after an effect.
      if ([l, m, s, xs].some((bp) => bp && !isClassExpressible(bp))) return true;

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
      <ServerFlex ref={ref} cursor={cursor} hide={hide} l={l} m={m} s={s} xs={xs} {...props} />
    );
  },
);

Flex.displayName = "Flex";
export { Flex };
