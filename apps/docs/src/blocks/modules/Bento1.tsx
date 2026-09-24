import { AutoScroll, Column, Heading, Icon, Line, Logo, Row, Text } from "@once-ui-system/core";
import { Sidebar1 } from "./Sidebar1";

const section = {
  title: "Advanced design made simple",
  description: "Once UI is a low-code abstraction layer for design",
};

const tiles = {
  1: [
    {
      title: "Templates",
      description: "Quick start with pre-built templates",
      media: (
        <AutoScroll>
          <Logo wordmark={"/trademarks/wordmark-light.svg"} />
          <Line vert />
          <Logo wordmark={"/trademarks/agent-light.svg"} />
          <Line vert />
          <Logo wordmark={"/trademarks/convert-light.svg"} />
          <Line vert />
        </AutoScroll>
      ),
    },
    {
      title: "Components",
      description: "Access advanced components through simple APIs",
      media: (
        <Row fill paddingLeft="48">
          <Sidebar1
            minWidth={16}
            marginTop="48"
            border="neutral-strong"
            tabIndex={-1}
            aria-hidden="true"
          />
        </Row>
      ),
    },
  ],
  2: [
    {
      title: "Styles",
      description: "Customize your design with Once UI's styling system",
      media: (
        <Column align="center" gap="12">
          <Heading variant="display-strong-m">5,540+</Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Commits this year
          </Text>
        </Column>
      ),
    },
    {
      title: "Community",
      description: "Join our community to get help and share knowledge",
      media: (
        <Row padding="56" radius="full" border="neutral-strong">
          <Row
            padding="40"
            radius="full"
            border="neutral-strong"
            onBackground="neutral-strong"
            horizontal="center"
          >
            <Icon
              padding="24"
              radius="full"
              border="neutral-strong"
              onBackground="neutral-strong"
              name="discord"
              size="xl"
            />
          </Row>
        </Row>
      ),
    },
  ],
};

export const Bento1: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column fillWidth horizontal="center" gap="40" {...flex}>
      <Column fillWidth paddingX="l" gap="8">
        <Heading as="h2" variant="display-strong-m">
          {section.title}
        </Heading>
        <Text onBackground="neutral-weak" variant="body-default-l">
          {section.description}
        </Text>
      </Column>
      <Column fillWidth gap="16">
        {Object.entries(tiles).map(([key, value]) => (
          <Row key={key} fillWidth gap="16" s={{ direction: "column" }}>
            {value.map((tile, index) => (
              <Column
                key={index}
                border="neutral-alpha-medium"
                vertical="between"
                overflow="hidden"
                flex={key === "1" ? (index % 2 === 0 ? "2" : "2") : index % 2 === 0 ? "4" : "3"}
                radius="xl"
              >
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
                    fill
                    center
                    topLeftRadius="xl"
                    bottomRightRadius="xl"
                    border
                    overflow="hidden"
                  >
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
