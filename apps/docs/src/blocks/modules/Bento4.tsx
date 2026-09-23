import {
  Button,
  Column,
  Heading,
  Hover,
  MasonryGrid,
  Media,
  Row,
  SmartLink,
  Text,
} from "@once-ui-system/core";

interface ShowcaseItem {
  title: string;
  description: string;
  url: string;
  image: string;
}

const showcaseItems: ShowcaseItem[] = [
  {
    title: "IQON",
    description: "Desktop app and landing page for a digital wellness platform.",
    url: "#",
    image: "/images/showcase/iqon.jpg",
  },
  {
    title: "OsmyReal",
    description: "Community platform for mobile gamers with 100k+ audience.",
    url: "#",
    image: "/images/showcase/osmyreal.jpg",
  },
  {
    title: "Aveiro",
    description: "Documentation and learning hub for the Once UI ecosystem.",
    url: "#",
    image: "/images/showcase/aveiro.jpg",
  },
  {
    title: "Dopler Store",
    description: "Brand storefront with product pages and checkout flow.",
    url: "#",
    image: "/images/showcase/dopler-store.jpg",
  },
  {
    title: "Vivid",
    description: "Portfolio site with bold typography and motion.",
    url: "#",
    image: "/images/showcase/vivid.jpg",
  },
  {
    title: "JExcellence",
    description: "Agency site showcasing enterprise-grade frontend work.",
    url: "#",
    image: "/images/showcase/jexcellence.jpg",
  },
  {
    title: "Spojt",
    description: "Product landing with conversion-focused layout.",
    url: "#",
    image: "/images/showcase/spojt.jpg",
  },
  {
    title: "DEC",
    description: "Creative studio portfolio with immersive media.",
    url: "#",
    image: "/images/showcase/dec.jpg",
  },
];

const COLUMN_LAYOUT = [
  { aspectRatios: ["4/3", "3/4", "16/9"] as const, flex: [9, 12, 6] },
  { aspectRatios: ["3/4", "16/9", "4/3"] as const, flex: [12, 6, 9] },
  { aspectRatios: ["16/9", "4/3", "3/4"] as const, flex: [6, 9, 12] },
  { aspectRatios: ["3/4", "4/3", "16/9"] as const, flex: [12, 9, 6] },
] as const;

function chunkItems(items: ShowcaseItem[], columns: number, perColumn: number) {
  const slice = items.slice(0, columns * perColumn);
  return Array.from({ length: columns }, (_, columnIndex) =>
    slice.slice(columnIndex * perColumn, (columnIndex + 1) * perColumn),
  );
}

function formatUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export const Bento4 = (flex: React.ComponentProps<typeof Column>) => {
  const columns = chunkItems(showcaseItems, 4, 2);

  return (
    <Column fillWidth horizontal="center" gap="48" {...flex}>
      <Row fillWidth horizontal="between" vertical="end" wrap gap="24" paddingX="l">
        <Column gap="12" maxWidth={56}>
          <Heading as="h2" variant="display-strong-m" wrap="balance">
            Sites built with Once UI
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            Products, portfolios, and community platforms from builders shipping with our design
            system.
          </Text>
        </Column>
        <Button data-border="rounded" href="#" variant="secondary" arrowIcon>
          View showcase
        </Button>
      </Row>

      <MasonryGrid fillWidth columns={4} gap="8" paddingX="l" l={{ columns: 2 }} s={{ columns: 1 }}>
        {columns.map((columnItems, columnIndex) => {
          const { aspectRatios, flex: flexValues } = COLUMN_LAYOUT[columnIndex];
          return (
            <Column key={columnIndex} fillWidth gap="8">
              {columnItems.map((item, rowIndex) => (
                <Hover
                  key={item.title}
                  interactive
                  fillWidth
                  radius="l"
                  overflow="hidden"
                  trigger={
                    <SmartLink href={item.url} unstyled fillWidth>
                      <Row
                        fillWidth
                        flex={flexValues[rowIndex]}
                        aspectRatio={aspectRatios[rowIndex]}
                        radius="l"
                        overflow="hidden"
                        border="neutral-alpha-medium"
                        background="neutral-alpha-weak"
                      >
                        <Media
                          src={item.image}
                          alt={`${item.title}: ${item.description}`}
                          stretch
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      </Row>
                    </SmartLink>
                  }
                  overlay={
                    <Column fill vertical="end" padding="l" gap="8" background="overlay">
                      <Text variant="heading-strong-m">{item.title}</Text>
                      <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
                        {item.description}
                      </Text>
                      <Row>
                        <Button rounded size="s" href={item.url}>
                          {item.url.startsWith("http") ? formatUrl(item.url) : "Visit site"}
                        </Button>
                      </Row>
                    </Column>
                  }
                />
              ))}
            </Column>
          );
        })}
      </MasonryGrid>

      <Row as="nav" aria-label="Featured showcase sites" wrap gap="8" paddingX="l">
        {showcaseItems.slice(0, 8).map((item) => (
          <SmartLink key={item.title} href={item.url}>
            <Text variant="label-default-s" onBackground="neutral-weak">
              {item.title}
            </Text>
          </SmartLink>
        ))}
      </Row>
    </Column>
  );
};
