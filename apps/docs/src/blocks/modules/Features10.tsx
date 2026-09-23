import { Background, Column, Grid, Heading, Mask, Media, Row, Text } from "@once-ui-system/core";

const features = [
  {
    title: "Setup",
    description: "Just add your API keys.",
  },
  {
    title: "Customize",
    description: "Set up your branding.",
  },
  {
    title: "Launch",
    description: "Deploy in a few clicks.",
  },
  {
    title: "Relax",
    description: "Everything is handled for you.",
  },
];

export const Features10: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column fillWidth {...flex}>
      <Background
        data-solid="color"
        position="absolute"
        left="0"
        top="0"
        aspectRatio="16/9"
        gradient={{ display: true, width: 100, y: 80, colorStart: "brand-solid-strong" }}
        mask={{ x: 50, y: 60, radius: 40 }}
      />
      <Row fillWidth vertical="center" gap="l" m={{ direction: "column" }}>
        <Column fillWidth paddingLeft="xl">
          <Heading as="h2" variant="display-strong-s" marginBottom="48" paddingLeft="20">
            Ready-to-use ecommerce solution
          </Heading>
          <Grid fillWidth columns={2} m={{ columns: 2 }} gap="32">
            {features.map((feature, index) => (
              <Column
                fillWidth
                gap="12"
                paddingX="20"
                paddingBottom="20"
                paddingTop="20"
                key={index}
              >
                <Row
                  position="absolute"
                  top="20"
                  left="8"
                  style={{ transform: "translateX(-100%)" }}
                  onBackground="brand-weak"
                  textVariant="code-default-m"
                  opacity={70}
                >
                  0{index + 1}
                </Row>
                <Text variant="label-strong-m">{feature.title}</Text>
                <Text wrap="balance" variant="body-default-s" onBackground="neutral-medium">
                  {feature.description}
                </Text>
              </Column>
            ))}
          </Grid>
        </Column>
        <Mask marginRight="32" maxWidth={32} aspectRatio="1/1" x={30} y={40} radius={60}>
          <Media
            style={{ filter: "grayscale(40%)" }}
            src="/images/global/swag-promo-01.png"
            alt="Customer support"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </Mask>
      </Row>
    </Column>
  );
};
