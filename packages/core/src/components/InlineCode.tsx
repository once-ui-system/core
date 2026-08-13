import type { CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import { Flex, type FlexComponentProps } from "./Flex";

export interface InlineCodeProps extends FlexComponentProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const InlineCode = forwardRef<HTMLDivElement, InlineCodeProps>(
  ({ children, className, style, ...flex }, ref) => {
    return (
      <Flex
        as="span"
        inline
        fit
        ref={ref}
        radius="s"
        vertical="center"
        paddingX="4"
        paddingY="1"
        textType="code"
        background="neutral-alpha-weak"
        border="neutral-alpha-medium"
        className={cn("text-[80%] leading-[125%] align-middle", className)}
        style={style}
        {...flex}
      >
        {children}
      </Flex>
    );
  },
);

InlineCode.displayName = "InlineCode";

export { InlineCode };
