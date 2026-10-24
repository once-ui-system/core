import type { plans } from "@/content";
import { BlobFx, Button, Column, Flex, Heading, Icon, Row, Text } from "@once-ui-system/core";

interface PlanProps extends React.ComponentProps<typeof Row> {
  plan: (typeof plans)[keyof typeof plans];
}

export const Plan: React.FC<PlanProps> = ({ plan, ...rest }) => {
  const tone = plan.highlight ? "brand-medium" : "neutral-medium";

  return (
    <Column
      id={plan.name}
      border="neutral-alpha-medium"
      background="page"
      radius="xl"
      overflow="hidden"
      fillWidth
      {...rest}
    >
      {plan.highlight && (
        <BlobFx data-solid="color" position="absolute" top="0" left="0" translateY="50%" fill />
      )}
      <Column pointerEvents="none" paddingX="32" paddingY="24" gap="4" fillWidth>
        <Heading as="h3" align="left" onBackground={tone} variant="heading-default-xl">
          {plan.name}
        </Heading>
        <Text align="left" variant="heading-default-s">
          {plan.price}{" "}
          {plan.unit && (
            <Text onBackground="neutral-strong" variant="body-default-s">
              {plan.unit}
            </Text>
          )}
        </Text>
      </Column>
      <Column pointerEvents="none" padding="48" flex={1} gap="16">
        {plan.features.map((feature) => (
          <Row key={feature} vertical="center" gap="12">
            <Icon name="check" size="s" onBackground={tone} />
            <Text align="left" onBackground="neutral-medium" variant="body-default-s">
              {feature}
            </Text>
          </Row>
        ))}
      </Column>
      <Flex fillWidth paddingX="24" padding="12">
        <Button
          id={`${plan.name}-button`}
          href={plan.href}
          variant={plan.highlight ? "primary" : "secondary"}
          fillWidth
          arrowIcon
        >
          Get started
        </Button>
      </Flex>
    </Column>
  );
};
