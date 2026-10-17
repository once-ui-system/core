import type React from "react";
import { forwardRef, type ReactNode } from "react";
import { Flex } from "../components/Flex";
import { Text } from "../components/Text";

export interface KbdCapProps extends React.ComponentProps<typeof Flex> {
  children?: ReactNode;
}

/** One keycap: what `<Kbd>` draws without `keys`, and each cap of a `keys` combination. */
export const KbdCap = forwardRef<HTMLDivElement, KbdCapProps>(({ children, ...rest }, ref) => (
  <Flex
    as="kbd"
    ref={ref}
    // A <kbd> belongs in a sentence. Flex is display: flex, so without this
    // one every Kbd in prose broke the line and filled the column.
    inline
    fit
    horizontal="center"
    minWidth="32"
    background="neutral-strong"
    radius="s"
    paddingX="4"
    paddingY="2"
    onBackground="neutral-medium"
    border="neutral-strong"
    {...rest}
  >
    <Text as="span" textVariant="label-default-s">
      {children}
    </Text>
  </Flex>
));

KbdCap.displayName = "KbdCap";
