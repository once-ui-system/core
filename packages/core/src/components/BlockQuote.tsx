import { forwardRef } from "react";
import { Flex } from ".";

interface BlockQuoteProps extends React.ComponentProps<typeof Flex> {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const BlockQuote = forwardRef<HTMLDivElement, BlockQuoteProps>(
  ({ children, className, style, ...rest }, ref) => {
    return (
      <Flex
        ref={ref}
        as="blockquote"
        radius="m"
        margin="0"
        border="brand-alpha-medium"
        background="brand-alpha-weak"
        borderStyle="dashed"
        overflow="hidden"
        paddingY="20"
        paddingX="24"
        onBackground="brand-medium"
        fillWidth
        style={style}
        className={className}
        {...rest}
      >
        {children}
      </Flex>
    );
  }
);

BlockQuote.displayName = "BlockQuote";
export { BlockQuote };