import {
  Background,
  Button,
  Column,
  Flex,
  Heading,
  Icon,
  Row,
  Scroller,
  Text,
} from "@once-ui-system/core";

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
  team: {
    name: "Team",
    href: "#",
    color: "neutral" as "neutral" | "brand" | "accent",
    gradient: false,
    price: {
      original: "240",
      discounted: "160",
    },
    features: [
      "Comprehensive variables",
      "Fluid component system",
      "Landing page examples",
      "Marketing resources",
    ],
  },
};

interface PlanCardProps extends React.ComponentProps<typeof Row> {
  id: string;
  plan: (typeof plans)[keyof typeof plans];
}

const PlanCard: React.FC<PlanCardProps> = ({ id, plan, ...flex }) => {
  const borderColor = `${plan.color}-alpha-medium` as const;
  const textColor = `${plan.color}-medium` as const;
  const gradientColor = `${plan.color}-background-strong` as const;

  return (
    <Column id={plan.name} border={borderColor} fill overflow="hidden" {...flex}>
      <Column fill padding="12" gap="8">
        {plan.gradient && (
          <Background
            top="0"
            left="0"
            position="absolute"
            gradient={{
              x: 50,
              y: 30,
              width: 60,
              height: 100,
              tilt: 45,
              opacity: 100,
              display: true,
              colorStart: gradientColor,
              colorEnd: "static-transparent",
            }}
          />
        )}
        <Column fill gap="4" padding="24">
          <Column fillWidth gap="8" marginBottom="12">
            <Heading as="h3" align="left" onBackground={textColor} variant="heading-strong-xs">
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
          <Column fillWidth gap="16" paddingTop="20" paddingBottom="12">
            {plan.features.map((feature, index) => (
              <Row key={index} vertical="center" gap="12">
                <Icon name="check" size="xs" onBackground={textColor} />
                <Text align="left" onBackground="neutral-medium" variant="label-default-m">
                  {feature}
                </Text>
              </Row>
            ))}
          </Column>
        </Column>
        <Button
          id={`${id}-button-3`}
          href={plan.href}
          variant={plan.color === "neutral" ? "secondary" : "primary"}
          fillWidth
          arrowIcon
        >
          Get started
        </Button>
      </Column>
    </Column>
  );
};

export const Plans3: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Scroller maxWidth="m">
      <Row gap="-1" {...flex}>
        <Flex fillWidth paddingTop="40" minWidth={20}>
          <PlanCard id="free" plan={plans.free} leftRadius="l" />
        </Flex>
        <Column fillWidth minWidth={20}>
          <Flex
            paddingX="16"
            minHeight="40"
            gap="8"
            center
            topRadius="m"
            onBackground="brand-strong"
            borderTop="brand-alpha-medium"
            borderLeft="brand-alpha-medium"
            borderRight="brand-alpha-medium"
            textVariant="label-default-m"
          >
            🔥 Most popular 🔥
          </Flex>
          <PlanCard id="pro" plan={plans.pro} zIndex={1} />
        </Column>
        <Flex fillWidth paddingTop="40" minWidth={20}>
          <PlanCard id="team" plan={plans.team} rightRadius="l" />
        </Flex>
      </Row>
    </Scroller>
  );
};
