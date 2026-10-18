import { forwardRef } from "react";
import type { GridBreakpointProps, GridLayoutProps, PolymorphicComponent } from "../interfaces.js";
import { Masonry, type MasonryProps } from "../internal/Masonry.js";
import { isClassExpressible } from "../utils/layoutClasses.js";
import { ClientGrid } from "./ClientGrid.js";
import { ServerGrid, type ServerGridProps } from "./ServerGrid.js";

interface GridMasonryProps {
  /**
   * Lay the children out as a masonry wall (2.x's MasonryGrid): they flow down
   * `columns` CSS columns (default 3), each child kept whole, `gap` apart
   * (default "8"). `columns` at l, m, s and xs reflows it, as on a grid.
   */
  masonry?: boolean;
}

const GridImpl = forwardRef<HTMLElement, ServerGridProps & GridMasonryProps>(
  ({ cursor, xl, l, m, s, xs, style, hide, masonry, ...props }, ref) => {
    if (masonry) {
      const { columns, gap, children, ...flex } = props;
      const bp = (b?: GridBreakpointProps) =>
        b && { columns: b.columns === undefined ? undefined : Number(b.columns), hide: b.hide };
      return (
        <Masonry
          ref={ref as React.Ref<HTMLDivElement>}
          {...(flex as Omit<MasonryProps, "children">)}
          columns={columns === undefined ? undefined : Number(columns)}
          gap={gap as MasonryProps["gap"]}
          l={bp(l)}
          m={bp(m)}
          s={bp(s)}
          xs={bp(xs)}
          style={style}
          hide={hide}
        >
          {children}
        </Masonry>
      );
    }
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

GridImpl.displayName = "Grid";

/**
 * A CSS grid. `as` picks the element and types its attributes and ref:
 * `<Grid as="ul" columns={3}>` is a list with no bullets.
 */
const Grid = GridImpl as unknown as PolymorphicComponent<GridLayoutProps & GridMasonryProps, "div">;

export { Grid };
