import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Home" };

// A page inside the shell: the shell draws the panel, so a page is just its content.
export default function HomePage() {
  return (
    <Column fillWidth gap="24">
      <Column gap="8">
        <Heading as="h1" variant="heading-strong-l">
          Home
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          What this page is for, in one line.
        </Text>
      </Column>
    </Column>
  );
}
