import type { FlexElementProps, FlexLayoutProps, PolymorphicComponent } from "../interfaces.js";
import { Flex } from "./Flex.js";

/** Row's props on its default `div`; with `as`, see `PolymorphicProps`. */
export type RowProps = FlexElementProps;

const RowImpl = ({ ref, children, ...rest }: FlexElementProps) => {
  return (
    <Flex ref={ref as React.Ref<HTMLDivElement>} {...rest}>
      {children}
    </Flex>
  );
};

RowImpl.displayName = "Row";

/**
 * A row of children. `as` picks the element and types its attributes and
 * ref: `<Row as="a" href="/x">`.
 */
const Row = RowImpl as unknown as PolymorphicComponent<FlexLayoutProps, "div">;

export { Row };
