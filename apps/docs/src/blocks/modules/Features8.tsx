import { Column, Grid, Heading, Media, Row, Text } from "@once-ui-system/core";

const section = {
  title: "Advanced design made simple",
  description:
    "Once UI is a low-code abstraction layer for design. It provides smart defaults and simple APIs, so you'll never want to write utility-soup again.",
};

const tiles = [
  {
    title: "120+ components",
    description: "Access advanced components through simple APIs",
    image: "/images/blocks/vibe-coding-dark.jpg",
  },
  {
    title: "1-min styling",
    description: "Create your brand, no design skills required",
    image: "/images/blocks/vibe-coding-light.jpg",
  },
];

export const Features8: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column fillWidth horizontal="center" gap="40" {...flex}>
      <Row maxWidth="l" paddingX="24">
        <Heading as="h2" variant="display-strong-m">
          {section.title}
        </Heading>
      </Row>
      <Grid columns="2" gap="20" maxWidth="l" s={{ columns: 1 }}>
        {tiles.map((tile, index) => (
          <Column fillWidth border="neutral-alpha-medium" radius="l-4" padding="4" key={index}>
            <Media
              radius="l"
              fillWidth
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 720px"
              aspectRatio="1/1"
              alt={tile.image}
              src={tile.image}
              border
            />
            <Column fillWidth gap="8" paddingX="32" paddingY="20">
              <Heading as="h3" variant="heading-strong-l">
                {tile.title}
              </Heading>
              <Text variant="label-default-m" onBackground="neutral-weak" wrap="balance">
                {tile.description}
              </Text>
            </Column>
          </Column>
        ))}
      </Grid>
    </Column>
  );
};
