import {
  Button,
  Column,
  Heading,
  Icon,
  Row,
  Text,
} from "@once-ui-system/core";
import { checklist, demoUser, product } from "@/lib/onboarding";

export const metadata = {
  title: "Welcome to Lumen",
  description: "Your workspace is ready. Here is what to do next.",
};

export default function Page() {
  const firstName = demoUser.name.split(" ")[0];

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="40">
      <Column fillWidth maxWidth="s" gap="32">
        <Column gap="16" horizontal="start">
          <Row
            center
            width="48"
            height="48"
            radius="full"
            background="success-alpha-weak"
            onBackground="success-strong"
          >
            <Icon name="check" size="m" />
          </Row>
          <Text variant="label-default-s" onBackground="brand-medium">
            Setup complete
          </Text>
          <Heading as="h1" variant="display-strong-s">
            You're all set, {firstName}
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Your {product.name} workspace is ready. Here are four things worth
            doing in your first session.
          </Text>
        </Column>

        <Column
          as="section"
          aria-labelledby="checklist-heading"
          background="surface"
          border
          radius="l"
          padding="24"
          gap="24"
        >
          <Heading as="h2" id="checklist-heading" variant="heading-strong-l">
            Next steps
          </Heading>
          <ol
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {checklist.map((item, i) => (
              <li key={item.title}>
                <Row gap="16" vertical="start">
                  <Row
                    center
                    width="40"
                    height="40"
                    radius="m"
                    background="brand-alpha-weak"
                    onBackground="brand-strong"
                    style={{ flexShrink: 0 }}
                  >
                    <Icon name={item.icon} size="s" />
                  </Row>
                  <Column gap="4" flex={1}>
                    <Text variant="heading-strong-s">
                      {i + 1}. {item.title}
                    </Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {item.description}
                    </Text>
                  </Column>
                </Row>
              </li>
            ))}
          </ol>
        </Column>

        <Row gap="12" wrap>
          <Button href="/app" label="Open my workspace" suffixIcon="arrowRight" />
          <Button
            href="/"
            variant="secondary"
            label="Back to setup"
            prefixIcon="arrowLeft"
          />
        </Row>
      </Column>
    </Column>
  );
}
