import { Column, Heading, Hover, Icon, Media, Row, Text } from "@once-ui-system/core";

type Tile = {
  title: string;
  description: string;
  image: string;
  alt: string;
};

const primaryRow: Tile[] = [
  {
    title: "Workspace",
    description: "Organize every project, task, and doc in one shared space.",
    image: "/images/products/studio-02.jpg",
    alt: "Workspace product screenshot",
  },
  {
    title: "Automations",
    description: "Ship agents that handle the busywork while you sleep.",
    image: "/images/products/agent-04.jpg",
    alt: "Automations product screenshot",
  },
];

const secondaryRow: Tile[] = [
  {
    title: "Analytics",
    description: "Track growth with live, shareable dashboards.",
    image: "/images/products/journal-03.jpg",
    alt: "Analytics product screenshot",
  },
  {
    title: "Storefront",
    description: "Launch a store that converts from day one.",
    image: "/images/products/store-03.jpg",
    alt: "Storefront product screenshot",
  },
];

function BentoTile({
  tile,
  flex,
  aspectRatio,
}: {
  tile: Tile;
  flex: "1" | "2";
  aspectRatio: string;
}) {
  return (
    <Hover
      flex={flex}
      fillWidth
      radius="xl"
      overflow="hidden"
      border
      interactive
      trigger={
        <Row fillWidth aspectRatio={aspectRatio}>
          <Media stretch sizes="(max-width: 768px) 100vw, 50vw" src={tile.image} alt={tile.alt} />
        </Row>
      }
      overlay={
        <Column fill vertical="end" padding="l" gap="4" background="overlay">
          <Row gap="8" vertical="center">
            <Text variant="heading-strong-m" onBackground="neutral-strong">
              {tile.title}
            </Text>
            <Icon name="arrowUpRight" size="xs" onBackground="neutral-strong" />
          </Row>
          <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
            {tile.description}
          </Text>
        </Column>
      }
    />
  );
}

export const Bento3 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column fillWidth horizontal="center" gap="40" {...flex}>
      <Column fillWidth paddingX="l" gap="8">
        <Heading as="h2" variant="display-strong-m">
          Every workflow, one system
        </Heading>
        <Text onBackground="neutral-weak" variant="body-default-l">
          Built to adapt to how your team actually works, from first sketch to shipped product.
        </Text>
      </Column>
      <Column fillWidth gap="16">
        <Row fillWidth gap="16" s={{ direction: "column" }}>
          <BentoTile tile={primaryRow[0]} flex="2" aspectRatio="16/10" />
          <BentoTile tile={primaryRow[1]} flex="1" aspectRatio="3/4" />
        </Row>
        <Row fillWidth gap="16" s={{ direction: "column" }}>
          <BentoTile tile={secondaryRow[0]} flex="1" aspectRatio="3/4" />
          <BentoTile tile={secondaryRow[1]} flex="2" aspectRatio="16/10" />
        </Row>
      </Column>
    </Column>
  );
};
