import type { FlexElementProps, FlexLayoutProps, PolymorphicComponent } from "../interfaces.js";
import { Flex } from "./Flex.js";

/** Column's props on its default `div`; with `as`, see `PolymorphicProps`. */
export type ColumnProps = FlexElementProps;

const ColumnImpl = ({ ref, children, ...rest }: FlexElementProps) => {
  return (
    <Flex direction="column" ref={ref as React.Ref<HTMLDivElement>} {...rest}>
      {children}
    </Flex>
  );
};

ColumnImpl.displayName = "Column";

/**
 * A column of children. `as` picks the element and types its attributes and
 * ref: `<Column as="ul">`.
 */
const Column = ColumnImpl as unknown as PolymorphicComponent<FlexLayoutProps, "div">;

export { Column };
