import { Column, Heading, Icon, MatrixFx, Media, Row, Text } from "@once-ui-system/core";

const features = [
  {
    title: "AI-Powered Development",
    description:
      "Harness the power of artificial intelligence to accelerate your development workflow",
    icon: "chip" as const,
    image: "/images/og/home.jpg",
  },
  {
    title: "Real-time Collaboration",
    description: "Work together seamlessly with your team through real-time editing and commenting",
    icon: "collaboration" as const,
    accent: "success",
    image: "/images/og/home.jpg",
  },
  {
    title: "Advanced Analytics",
    description:
      "Gain deep insights into your application's performance with comprehensive monitoring",
    icon: "analytics" as const,
    accent: "warning",
    image: "/images/og/home.jpg",
  },
  {
    title: "Security First",
    description:
      "Built-in security features including encryption, authentication, and vulnerability scanning",
    icon: "security" as const,
    accent: "error",
    image: "/images/og/home.jpg",
  },
];

export const Features3: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Column fillWidth horizontal="center" gap="xl" {...flex}>
      <Column fillWidth>
        <Row maxWidth="s">
          <Heading variant="display-default-s">
            Empowering developers with cutting-edge tools and capabilities
          </Heading>
        </Row>
      </Column>

      <Column gap="128" maxWidth="l">
        {features.map((feature, index) => (
          <Row
            key={index}
            gap="24"
            direction={index % 2 === 0 ? "row-reverse" : "row"}
            vertical="end"
            m={{ direction: "column" }}
          >
            <Row fillWidth>
              <Column
                maxWidth={32}
                paddingX="48"
                gap="12"
                horizontal={index % 2 === 0 ? "start" : "end"}
                align={index % 2 === 0 ? "start" : "end"}
              >
                <Row
                  radius="l"
                  overflow="hidden"
                  paddingY="12"
                  paddingX="24"
                  border="brand-alpha-weak"
                >
                  <MatrixFx
                    position="absolute"
                    left="0"
                    top="0"
                    spacing={2}
                    size={1.5}
                    colors={["brand-background-strong"]}
                    flicker
                  />
                  <Icon name={feature.icon} onBackground="brand-weak" size="s" />
                </Row>
                <Heading variant="label-strong-s" onBackground="brand-weak" marginTop="32">
                  {feature.title}
                </Heading>
                <Text variant="heading-default-xl" wrap="balance">
                  {feature.description}
                </Text>
              </Column>
            </Row>
            <Media
              src={feature.image}
              alt={`Image for ${feature.title}`}
              sizes={640}
              radius="l"
              aspectRatio="16 / 9"
            />
          </Row>
        ))}
      </Column>
    </Column>
  );
};
