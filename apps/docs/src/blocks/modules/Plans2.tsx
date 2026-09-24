import { Background, Button, Column, Flex, Heading, Icon, Row, Text } from "@once-ui-system/core";

const plans = {
  free: {
    name: "Free",
    href: "#",
    color: "neutral" as "neutral" | "brand" | "accent",
    gradient: false,
    price: {
      original: "0",
      discounted: "0",
    },
    features: ["Comprehensive variables", "Fluid component system"],
  },
  pro: {
    name: "Pro",
    href: "#",
    color: "brand" as "neutral" | "brand" | "accent",
    gradient: true,
    price: {
      original: "120",
      discounted: "80",
    },
    features: [
      "Comprehensive variables",
      "Fluid component system",
      "Landing page examples",
      "Marketing resources",
      "Data viz module",
      "Social module",
      "Regular updates",
    ],
  },
};

interface PlanCardProps extends React.ComponentProps<typeof Row> {
  id: string;
  plan: (typeof plans)[keyof typeof plans];
}

const PlanCard: React.FC<PlanCardProps> = ({ id, plan, ...rest }) => {
  const borderColor = `${plan.color}-alpha-medium` as const;
  const textColor = `${plan.color}-weak` as const;
  const gradientColor = `${plan.color}-background-strong` as const;

  return (
    <Column
      fillWidth
      id={plan.name}
      border={borderColor}
      fill
      background="page"
      radius="l"
      overflow="hidden"
      {...rest}
    >
      <Column fill padding="40" gap="8">
        {plan.gradient && (
          <>
            <Background
              top="0"
              left="0"
              position="absolute"
              mask={{
                cursor: true,
                radius: 75,
              }}
              gradient={{
                x: 50,
                y: 100,
                opacity: 70,
                display: true,
                colorStart: "accent-background-strong",
                colorEnd: "static-transparent",
              }}
            />

            <Background
              top="0"
              left="0"
              position="absolute"
              mask={{
                x: 50,
                y: 100,
                radius: 75,
              }}
              gradient={{
                x: 50,
                y: 100,
                opacity: 50,
                display: true,
                colorStart: gradientColor,
                colorEnd: "static-transparent",
              }}
            />
          </>
        )}
        <Column fill gap="4">
          <Column fillWidth gap="8" marginBottom="12">
            <Heading as="h3" align="left" onBackground={textColor} variant="heading-default-l">
              {plan.name}
            </Heading>
            <Text align="left" variant="heading-default-xl">
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
          <Column fillWidth gap="8" marginY="12">
            {plan.features.map((feature, index) => (
              <Row key={index} vertical="center" gap="12">
                <Icon name="check" size="s" onBackground={textColor} />
                <Text align="left" onBackground="neutral-medium" variant="body-default-s">
                  {feature}
                </Text>
              </Row>
            ))}
          </Column>
        </Column>
      </Column>
      <Row
        borderTop={borderColor}
        fillWidth
        padding="4"
        textVariant="body-default-s"
        onBackground={textColor}
        horizontal="center"
        align="center"
      >
        <Button
          id={`${id}-button-2`}
          href={plan.href}
          variant="tertiary"
          fillWidth
          weight="default"
          arrowIcon
        >
          Get started
        </Button>
      </Row>
    </Column>
  );
};

export const Plans2: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Row fillWidth gap="-1" overflowX="auto" {...flex}>
      <Flex fillWidth paddingY="24" minWidth={20}>
        <PlanCard id="free" plan={plans.free} radius={undefined} leftRadius="l" />
      </Flex>
      <PlanCard id="pro" plan={plans.pro} zIndex={1} minWidth={20} />
    </Row>
  );
};
