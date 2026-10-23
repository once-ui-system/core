import { AutoScroll, Background, CelebrationFx, Column, Heading, Icon, Line, Logo, Media, Pulse, Row, Text } from "@once-ui-system/core";

const section = {
  title: "Advanced design made simple",
  description: "Once UI is a low-code abstraction layer for design",
};

const tiles = {
  1: [
    {
      title: "Templates",
      description: "Quick start with pre-built templates",
      media: 
      <AutoScroll>
        <Logo
          wordmark={"/trademarks/wordmark-light.svg"}
        />
        <Line vert/>
        <Logo
          wordmark={"/trademarks/wordmark-light.svg"}
        />
        <Line vert/>
        <Logo
          wordmark={"/trademarks/wordmark-light.svg"}
        />
        <Line vert/>
      </AutoScroll>,
    },
    {
      title: "Components",
      description: "Access advanced components through simple APIs",
      media: 
        <CelebrationFx
          type="confetti"
          trigger="click"
          center
        >
          <Column gap="16" textVariant="heading-strong-l" onBackground="neutral-strong" pointerEvents="none">
            <Pulse size="l"/>
            Click for a surprise!
          </Column>
        </CelebrationFx>,
    },
  ],
  2: [
    {
      title: "Styles",
      description: "Customize your design with Once UI's styling system",
      media: <Media fillWidth src="/images/convert.jpg"/>,
    },
    {
      title: "Community",
      description: "Join our community to get help and share knowledge",
      media: <Row padding="56" radius="full" border="neutral-strong">
        <Row padding="48" radius="full" border="neutral-strong" onBackground="neutral-strong" horizontal="center">
          <Icon padding="24" radius="full" border="neutral-strong" onBackground="neutral-strong" name="discord" size="xl" />
        </Row>
      </Row>,
    },
    {
      title: "Mission",
      description: "Once UI's mission is to make design accessible to everyone",
      media: <Column align="center" gap="12">
        <Heading as="p" variant="display-strong-m">5,540+</Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">Commits this year</Text>
      </Column>,
    },
  ]
};

export const Bento: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column fillWidth horizontal="center" gap="56" {...flex}>
      <Column fillWidth horizontal="center" paddingX="l" gap="4">
        <Heading as="h2" variant="display-strong-xs">
          {section.title}
        </Heading>
        <Text onBackground="neutral-weak" variant="body-default-m">
          {section.description}
        </Text>
      </Column>
      <Column fillWidth gap="16" padding="24" radius="xl-4" overflow="hidden">
      <Background position="absolute" top="0" left="0" mask={{cursor: true}} gradient={{display: true, x: 25, y: 25, colorStart: "brand-solid-medium", colorEnd: "accent-solid-medium",}}/>
      {Object.entries(tiles).map(([key, value]) => (
        <Row key={key} fillWidth gap="16" m={key === "2" ? {direction: "column"} : {}} s={{direction: "column"}}>
          {value.map((tile, index) => (
            <Column
              key={index}
              border="neutral-alpha-medium"
              vertical="between"
              overflow="hidden"
              background="page"
              flex={1}
              radius="xl">
              <Column fillWidth gap="8" padding="l">
                <Heading as="h3" variant="heading-strong-l">
                  {tile.title}
                </Heading>
                <Text onBackground="neutral-weak" wrap="balance">
                  {tile.description}
                </Text>
              </Column>
              <Row fillWidth height={20} paddingLeft="m">
                <Row
                  data-theme="light"
                  data-solid="contrast"
                  background="page"
                  fill center
                  topLeftRadius="xl"
                  bottomRightRadius="xl"
                  border
                  overflow="hidden">
                  {tile.media}
                </Row>
              </Row>
            </Column>
          ))}
        </Row>
      ))}
      </Column>
    </Column>
  );
};