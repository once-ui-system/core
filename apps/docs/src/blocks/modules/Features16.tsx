import {
  Background,
  Button,
  type Colors,
  Column,
  Heading,
  Media,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";

interface PromoCard {
  tag?: string;
  variant: "brand" | "accent" | "neutral";
  title: string;
  description: string;
  image: string;
  alt: string;
  href: string;
  cta: string;
}

const cards: PromoCard[] = [
  {
    tag: "New",
    variant: "brand",
    title: "Automation studio",
    description: "Build multi-step workflows visually and let them run in the background.",
    image: "/images/products/studio-03.jpg",
    alt: "Automation studio product preview",
    href: "#",
    cta: "Explore automations",
  },
  {
    variant: "accent",
    title: "Analytics suite",
    description: "Track every metric that matters with live, shareable dashboards.",
    image: "/images/products/journal-04.jpg",
    alt: "Analytics suite product preview",
    href: "#",
    cta: "See analytics",
  },
];

export const Features16 = (flex: React.ComponentProps<typeof Row>) => {
  return (
    <Row fillWidth horizontal="center" gap="24" s={{ direction: "column" }} {...flex}>
      {cards.map((card) => (
        <Column
          key={card.title}
          fillWidth
          horizontal="center"
          padding="4"
          radius="xl"
          overflow="hidden"
          border={card.variant === "brand" ? "brand-alpha-weak" : "accent-alpha-weak"}
        >
          <Background
            position="absolute"
            top="0"
            left="0"
            gradient={{
              display: true,
              x: 0,
              y: 0,
              colorStart:
                card.variant === "brand" ? "brand-background-medium" : "accent-background-medium",
            }}
          />
          <Column fillWidth vertical="center" padding="32" gap="12">
            {card.tag && (
              <Tag position="absolute" top="24" left="24" scheme={card.variant} size="l">
                {card.tag}
              </Tag>
            )}
            <Heading
              variant="label-strong-s"
              onBackground={`${card.variant}-weak` as Colors}
              marginTop="56"
            >
              {card.title}
            </Heading>
            <Text wrap="balance" variant="heading-default-xl">
              {card.description}
            </Text>
          </Column>
          <Media
            fillWidth
            aspectRatio="16 / 10"
            radius="l"
            sizes={640}
            border
            src={card.image}
            alt={card.alt}
          />
          <Row maxWidth={24} horizontal="center" padding="32">
            <Button fillWidth data-border="rounded" href={card.href} arrowIcon>
              {card.cta}
            </Button>
          </Row>
        </Column>
      ))}
    </Row>
  );
};
