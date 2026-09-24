import { Column, Heading, Icon, Media, Row, Text } from "@once-ui-system/core";

const features = [
  {
    title: "Frame the opportunity",
    description: "Turn customer signals into a focused brief with clear outcomes and constraints.",
    icon: "lightbulb" as const,
    image: "/images/og/home.jpg",
  },
  {
    title: "Build the system",
    description: "Establish reusable patterns before polishing individual screens and flows.",
    icon: "designTokens" as const,
    accent: "success",
    image: "/images/og/home.jpg",
  },
  {
    title: "Ship with confidence",
    description:
      "Move from approved design to production with shared language and fewer handoff gaps.",
    icon: "code" as const,
    accent: "warning",
    image: "/images/og/home.jpg",
  },
  {
    title: "Learn and improve",
    description:
      "Measure the result, preserve what worked, and feed evidence into the next release.",
    icon: "analytics" as const,
    accent: "error",
    image: "/images/og/home.jpg",
  },
];

export const Features4: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Column fillWidth horizontal="center" {...flex}>
      <Column maxWidth="l" borderTop="neutral-medium" borderX="neutral-medium">
        <Column
          horizontal="center"
          paddingX="l"
          paddingY="xl"
          borderBottom="neutral-medium"
          overflow="hidden"
        >
          <Heading variant="display-strong-s" align="center">
            A product workflow that compounds
          </Heading>
          <Text
            variant="body-default-xl"
            align="center"
            onBackground="neutral-medium"
            wrap="balance"
          >
            Four deliberate stages from early signal to a stronger shipped product
          </Text>
        </Column>
        {features.map((feature, index) => (
          <Row
            borderBottom="neutral-medium"
            key={index}
            direction={index % 2 === 0 ? "row" : "row-reverse"}
            vertical="center"
            m={{ direction: "column" }}
          >
            <Row fillWidth>
              <Column
                fillWidth
                paddingX="48"
                paddingY="24"
                gap="12"
                horizontal={index % 2 === 0 ? "end" : "start"}
                align={index % 2 === 0 ? "end" : "start"}
              >
                <Icon
                  padding="12"
                  name={feature.icon}
                  onBackground="brand-weak"
                  size="s"
                  radius="m"
                  border="brand-alpha-medium"
                  background="brand-alpha-weak"
                />
                <Heading variant="heading-strong-l" marginTop="12">
                  {feature.title}
                </Heading>
                <Text onBackground="neutral-weak" variant="body-default-s" wrap="balance">
                  {feature.description}
                </Text>
              </Column>
            </Row>
            <Media
              src={feature.image}
              alt={`Image for ${feature.title}`}
              sizes={640}
              aspectRatio="16 / 9"
              borderRight={index % 2 === 0 ? undefined : "neutral-medium"}
              borderLeft={index % 2 !== 0 ? undefined : "neutral-medium"}
            />
          </Row>
        ))}
      </Column>
    </Column>
  );
};
