import { Column, Heading, Icon, Row, Text } from "@once-ui-system/core";
import type { Feature } from "../lib/data";

export function FeatureSection({ feature, reverse }: { feature: Feature; reverse?: boolean }) {
  return (
    <Row
      as="section"
      aria-labelledby={`feature-${feature.id}`}
      fillWidth
      gap="64"
      vertical="center"
      direction={reverse ? "row-reverse" : "row"}
      m={{ gap: "40" }}
      s={{ direction: "column", gap: "32" }}
    >
      <Column flex={1} gap="20">
        <Text textVariant="label-default-s" onBackground="brand-medium">
          {feature.eyebrow}
        </Text>
        <Heading as="h3" id={`feature-${feature.id}`} textVariant="display-strong-xs">
          {feature.title}
        </Heading>
        <Text as="p" textVariant="body-default-l" onBackground="neutral-weak">
          {feature.body}
        </Text>
      </Column>
      <Column flex={1} fillWidth background="surface" border radius="l" padding="32" gap="20">
        <Row width="48" height="48" center radius="m" background="brand-alpha-weak" aria-hidden="true">
          <Icon name={feature.icon} size="m" onBackground="brand-strong" />
        </Row>
        <Column as="ul" gap="12">
          {feature.points.map((point) => (
            <Row as="li" key={point} gap="12" vertical="start">
              <Row paddingTop="2">
                <Icon name="check" size="xs" onBackground="brand-medium" />
              </Row>
              <Text textVariant="body-default-m">{point}</Text>
            </Row>
          ))}
        </Column>
      </Column>
    </Row>
  );
}
