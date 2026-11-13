import type { ReactNode } from "react";
import { Box, type BoxProps, Flex, Heading } from "@chakra-ui/react";

export function Panel(props: BoxProps) {
  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border.muted"
      rounded="xl"
      shadow="xs"
      {...props}
    />
  );
}

export function PanelHeader({
  title,
  children,
  id,
}: {
  title: ReactNode;
  children?: ReactNode;
  id?: string;
}) {
  return (
    <Flex align="center" justify="space-between" gap="3" px="4" py="3" borderBottomWidth="1px" borderColor="border.muted" wrap="wrap">
      <Heading as="h2" id={id} size="sm">
        {title}
      </Heading>
      {children}
    </Flex>
  );
}
