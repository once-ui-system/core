import { ScrollView } from "react-native";
import {
  Breadcrumbs,
  CodeBlock,
  Column,
  Heading,
  InlineCode,
  Kbd,
  OTPInput,
  PasswordInput,
  Row,
  Text,
  Tooltip,
  useTheme,
} from "../src";

const SNIPPET = `import { Button } from "@once-ui-system/native";

// Same props as the web package.
export function Order() {
  return <Button label="Place order" prefixIcon="check" />;
}`;

/** A sign-in and developer screen: CodeBlock, InlineCode, Kbd, OTPInput, PasswordInput, Breadcrumbs, Tooltip. */
export function Code() {
  const theme = useTheme();
  return (
    <ScrollView style={{ backgroundColor: theme.color("page-background") }}>
      <Column padding="20" gap="20">
        <Breadcrumbs
          items={[
            { label: "Settings", href: "/settings" },
            { label: "Developers", href: "/dev" },
            { label: "API" },
          ]}
        />
        <Heading variant="heading-strong-l">Connect your till</Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Install <InlineCode>@once-ui-system/native</InlineCode> and paste the key below.
        </Text>
        <CodeBlock
          lineNumbers
          codes={[
            { code: SNIPPET, language: "tsx", label: "Order.tsx" },
            { code: "pnpm add @once-ui-system/native@next", language: "bash", label: "Terminal" },
          ]}
        />
        <PasswordInput label="API key" defaultValue="sk_test_51Morning" />
        <Column gap="8">
          <Text variant="label-default-s">Code from your phone</Text>
          <OTPInput length={6} />
        </Column>
        <Row gap="8" vertical="center">
          <Text variant="body-default-s" onBackground="neutral-weak">
            Search with
          </Text>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
          <Tooltip label="iPad keyboards" />
        </Row>
      </Column>
    </ScrollView>
  );
}
