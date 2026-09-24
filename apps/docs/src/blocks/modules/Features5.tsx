import { Column, Grid, Heading, Icon, Mask, Media, Row, Text } from "@once-ui-system/core";

const features = [
  {
    icon: "collaboration" as const,
    title: "Teams",
    description: "Collaborate with a minimalistic stack",
  },
  {
    icon: "code" as const,
    title: "Developers",
    description: "Ship functional apps with beautiful UI",
  },
  {
    icon: "edit" as const,
    title: "Writers",
    description: "Add content to living prototypes with ease",
  },
  {
    icon: "designTokens" as const,
    title: "Designers",
    description: "Assemble high-fidelity prototypes in minutes",
  },
];

const images = {
  background: "/images/og/home.jpg",
  product: "/images/og/home.jpg",
};

export const Features5: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Row fillWidth horizontal="center" aspectRatio="16/9" {...flex}>
      <Mask position="absolute" fill top="0" x={50} y={0} radius={100}>
        <Media alt="Background image" sizes={1024} radius="xl" src={images.background} />
      </Mask>

      <Column fill padding="16" vertical="end">
        <Grid fillWidth gap="8" columns="4" m={{ columns: 2 }} s={{ columns: 1 }}>
          {features.map((item, index) => (
            <Column
              style={{
                backdropFilter: "blur(1rem)",
              }}
              key={index}
              background="overlay"
              radius="l"
              shadow="xl"
              padding="32"
              border
              fillWidth
              gap="8"
            >
              <Icon name={item.icon} marginBottom="12" size="s" onBackground="brand-weak" />
              <Heading as="h3" variant="label-default-l">
                {item.title}
              </Heading>
              <Text wrap="balance" variant="body-default-s" onBackground="neutral-weak">
                {item.description}
              </Text>
            </Column>
          ))}
        </Grid>
      </Column>
    </Row>
  );
};
