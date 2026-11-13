import type { Metadata } from "next";
import { Button } from "@once-ui-system/core/components/Button";
import { Column } from "@once-ui-system/core/components/Column";
import { Heading } from "@once-ui-system/core/components/Heading";
import { Icon } from "@once-ui-system/core/components/Icon";
import { Row } from "@once-ui-system/core/components/Row";
import { Tag } from "@once-ui-system/core/components/Tag";
import { Text } from "@once-ui-system/core/components/Text";
import { nextSteps, product, user } from "@/lib/data";

export const metadata: Metadata = {
  title: "Welcome · Lumen",
  description: "Your Lumen workspace is ready. Here is what to do next.",
};

export default function WelcomePage() {
  const firstName = user.name.split(" ")[0];
  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="64" s={{ paddingY: "32" }}>
      <Column maxWidth="m" fillWidth gap="32">
        <Column gap="16" horizontal="start">
          <Row
            fit
            center
            radius="full"
            background="success-medium"
            border="success-alpha-medium"
            style={{ width: 56, height: 56 }}
          >
            <Icon name="check" size="l" onBackground="success-strong" decorative />
          </Row>
          <Tag tone="success" size="m" label="Setup complete" prefixIcon="check" />
          <Heading as="h1" variant="display-strong-s">
            You're all set, {firstName}
          </Heading>
          <Text textVariant="body-default-l" onBackground="neutral-weak">
            Your {product.name} workspace is ready. Four quick steps will get
            your team seeing real data today.
          </Text>
        </Column>

        <Column
          as="section"
          aria-labelledby="next-steps"
          background="surface"
          border
          radius="l"
          padding="32"
          s={{ padding: "20" }}
          gap="24"
        >
          <Heading as="h2" id="next-steps" variant="heading-strong-l">
            Next steps
          </Heading>
          <Column as="ol" gap="20" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {nextSteps.map((item, i) => (
              <Row as="li" key={item.title} gap="16" vertical="start">
                <Row
                  fit
                  center
                  radius="m"
                  background="neutral-medium"
                  border="neutral-alpha-weak"
                  style={{ width: 40, height: 40, flexShrink: 0 }}
                >
                  <Icon name={item.icon} size="s" onBackground="neutral-strong" />
                </Row>
                <Column gap="4" flex={1}>
                  <Text textVariant="heading-strong-s">
                    {i + 1}. {item.title}
                  </Text>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    {item.description}
                  </Text>
                </Column>
              </Row>
            ))}
          </Column>
        </Column>

        <Row gap="12" wrap vertical="center">
          <Button href="/" suffixIcon="arrowRight">
            Open dashboard
          </Button>
          <Button href="/" variant="tertiary">
            Restart onboarding
          </Button>
        </Row>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          Signed in as {user.email} ({user.role})
        </Text>
      </Column>
    </Column>
  );
}
