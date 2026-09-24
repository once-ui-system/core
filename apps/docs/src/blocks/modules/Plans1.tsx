import {
  Arrow,
  Background,
  Column,
  Heading,
  Icon,
  Row,
  SmartLink,
  Text,
  TiltFx,
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
    color: "accent" as "neutral" | "brand" | "accent",
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

interface PlanCardProps {
  id: string;
  plan: (typeof plans)[keyof typeof plans];
}

const PlanCard: React.FC<PlanCardProps> = ({ id, plan }) => {
  const borderColor = `${plan.color}-medium` as const;
  const textColor = `${plan.color}-strong` as const;
  const gradientColor = `${plan.color}-background-strong` as const;

  return (
    <SmartLink href={plan.href} unstyled fillWidth>
      <TiltFx id={plan.name} border={borderColor} fill background="page" radius="l">
        <Column fillWidth>
          <Column fill padding="40" gap="8">
            {plan.gradient && (
              <Background
                top="0"
                left="0"
                position="absolute"
                mask={{
                  x: 0,
                  y: 0,
                  radius: 75,
                }}
                gradient={{
                  x: 75,
                  y: 0,
                  opacity: 100,
                  display: true,
                  colorStart: gradientColor,
                  colorEnd: "static-transparent",
                }}
              />
            )}
            <Column fill gap="8">
              <Column fillWidth gap="8" marginBottom="24">
                <Heading as="h3" align="left" variant="heading-strong-l">
                  {plan.name}
                </Heading>
                <Text align="left" onBackground={textColor} variant="display-default-xs">
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
              <Column fillWidth gap="12" marginY="12">
                {plan.features.map((feature, index) => (
                  <Row key={index} vertical="center" gap="8">
                    <Icon name="check" size="s" onBackground="neutral-medium" />
                    <Text align="left" onBackground="neutral-medium" variant="body-default-m">
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
            paddingX="40"
            paddingY="24"
            textVariant="body-default-s"
            onBackground={textColor}
            horizontal="center"
            align="center"
          >
            <Row vertical="center">
              Create your account and get started
              <Arrow trigger={`#${id}`} />
            </Row>
          </Row>
        </Column>
      </TiltFx>
    </SmartLink>
  );
};

export const Plans1: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Row fillWidth gap="16" s={{ direction: "column" }} {...flex}>
      <PlanCard id="free" plan={plans.free} />
      <PlanCard id="pro" plan={plans.pro} />
      <PlanCard id="team" plan={plans.team} />
    </Row>
  );
};
