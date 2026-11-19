import React from "react";
import { Flex } from "./Flex.js";

interface LineProps extends React.ComponentProps<typeof Flex> {
  vert?: boolean;
  style?: React.CSSProperties;
}

const Line = ({ ref, vert, className, style, ...rest }: LineProps) => {
  return (
    <Flex
      ref={ref}
      minWidth={(vert && "1") || undefined}
      minHeight={(!vert && "1") || undefined}
      width={(vert && "1") || undefined}
      height={(!vert && "1") || undefined}
      fillWidth={!vert}
      fillHeight={vert}
      background="neutral-strong"
      direction={vert ? "column" : "row"}
      className={className}
      style={style}
      {...rest}
    />
  );
};

Line.displayName = "Line";

export { Line };
