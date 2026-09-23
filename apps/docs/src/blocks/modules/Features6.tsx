import {
  Animation,
  Background,
  Button,
  Column,
  Grid,
  Heading,
  Media,
  Row,
  Text,
} from "@once-ui-system/core";

const section = {
  title: "The best of Once UI",
  subtitle: "Design that reads your mind",
  description:
    "Once UI is a low-code abstraction layer for design. It provides smart defaults and simple APIs, so you'll never want to write utility-soup again.",
  image: "/images/og/home.jpg",
};

const features = [
  {
    title: "120+ components",
    description: "Access advanced components through simple APIs",
  },
  {
    title: "1-min styling",
    description: "Create your brand, no design skills required",
  },
  {
    title: "SEO optimized",
    description: "Enjoy out of the box meta and schema support",
  },
  {
    title: "Ready to use",
    description: "Everything you need for a successful webapp",
  },
];

export const Features6: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column fillWidth horizontal="center" {...flex}>
      <Column
        fill
        position="absolute"
        style={{
          transform: "skewY(-6deg)",
        }}
      >
        <Background
          fill
          data-solid="color"
          horizontal="center"
          paddingY="xl"
          mask={{
            cursor: true,
          }}
          gradient={{
            display: true,
            x: 50,
            y: -20,
            height: 75,
            colorStart: "brand-solid-strong",
          }}
        />
      </Column>
      <Column overflow="hidden" gap="40" {...flex}>
        <Row fillWidth s={{ direction: "column-reverse" }} gap="12" vertical="center">
          <Media radius="l" fillWidth src={section.image} alt="Once UI for Next.js" />
          <Column fillWidth>
            <Column fillWidth paddingY="24" paddingX="48" gap="12">
              <Text onBackground="brand-weak" variant="label-strong-m">
                {section.title}
              </Text>
              <Heading as="h2" variant="display-default-m">
                {section.subtitle}
              </Heading>
              <Text
                wrap="balance"
                variant="body-default-m"
                onBackground="neutral-weak"
                marginBottom="12"
              >
                {section.description}
              </Text>
              <Button href="#" data-border="rounded" size="s" suffixIcon="chevronRight">
                Visit docs
              </Button>
            </Column>
          </Column>
        </Row>
        <Grid fillWidth columns={4} m={{ columns: 2 }} gap="8" paddingBottom="24">
          {features.map((feature, index) => (
            <Animation
              key={index}
              zoomOut={1.05}
              fade={1}
              triggerType="hover"
              duration={300}
              easing="spring"
            >
              <Column fillWidth gap="12" padding="32" border="brand-alpha-weak" radius="s">
                <Row
                  position="absolute"
                  top="12"
                  left="12"
                  width="12"
                  height="12"
                  borderTop="brand-alpha-strong"
                  borderLeft="brand-alpha-strong"
                />
                <Text variant="label-default-m" onBackground="brand-weak">
                  {feature.title}
                </Text>
                <Text wrap="balance" variant="label-default-s">
                  {feature.description}
                </Text>
              </Column>
            </Animation>
          ))}
        </Grid>
      </Column>
    </Column>
  );
};
