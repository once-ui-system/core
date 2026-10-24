import type { plans } from "@/content";
import { BlobFx, Button, Column, Flex, Heading, Icon, Row, Text } from "@once-ui-system/core";

interface PlanProps extends React.ComponentProps<typeof Row> {
  plan: (typeof plans)[keyof typeof plans];
}

export const Plan: React.FC<PlanProps> = ({ plan, ...rest }) => {
  // plans comes from a .js content file, so plan.color is a plain string here.
  const getScheme = `${plan.color}-medium` as NonNullable<React.ComponentProps<typeof Icon>["onBackground"]>;

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
      {plan.color === "brand" && (
        <BlobFx data-solid="color" position="absolute" top="0" left="0" translateY="50%" fill />
      )}
      <Column pointerEvents="none" paddingX="32" paddingY="24" gap="4" fillWidth>
        <Heading as="h3" align="left" onBackground={getScheme} variant="heading-default-xl">
          {plan.name}
        </Heading>
        <Text align="left" variant="heading-default-s">
          {plan.price.original !== plan.price.discounted && (
            <Text onBackground="neutral-weak" style={{ textDecoration: "line-through" }}>
              ${plan.price.original}
            </Text>
          )}{" "}
          ${plan.price.discounted}{" "}
          <Text onBackground="neutral-strong" variant="body-default-s">
            / year
          </Text>
        </Text>
      </Column>
      <Column pointerEvents="none" padding="48" flex={1} gap="16">
        {plan.features.map((feature, index) => (
          <Row key={index} vertical="center" gap="12">
            <Icon name="check" size="s" onBackground={getScheme} />
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
          variant={plan.color === "brand" ? "primary" : "secondary"}
          fillWidth
          arrowIcon
        >
          Start free
        </Button>
      </Flex>
    </Column>
  );
};
