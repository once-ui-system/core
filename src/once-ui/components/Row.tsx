"use client";

import { forwardRef } from "react";
import { Flex } from ".";

export interface RowProps extends React.ComponentProps<typeof Flex> {
  children?: React.ReactNode;
}

const Row = forwardRef<HTMLDivElement, RowProps>(({ children, ...rest }, ref) => {
  return (
    <Flex ref={ref} {...rest}>
      {children}
    </Flex>
  );
});

Row.displayName = "Row";
export { Row };
