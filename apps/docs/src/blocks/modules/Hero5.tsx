import { Button, Carousel, Column, Fade, Heading, Media, Row, Text } from "@once-ui-system/core";

const slides = [
  {
    src: "/images/fashion/cover-01.jpg",
    title: "Simple and cozy",
    subtitle: "For the pure minimalists",
    cta: "Buy now",
    href: "#",
  },
  {
    src: "/images/fashion/cover-02.jpg",
    title: "Stylish on the street",
    subtitle: "Colorful and trendy streetwear",
    cta: "Buy now",
    href: "#",
  },
  {
    src: "/images/fashion/cover-03.jpg",
    title: "Get ready for fall",
    subtitle: "Elegance combined with comfort",
    cta: "Buy now",
    href: "#",
  },
  {
    src: "/images/fashion/cover-04.jpg",
    title: "Stay comfy outdoors",
    subtitle: "Jackets with water repellent technology",
    cta: "Buy now",
    href: "#",
  },
];

export const Hero5: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Column fillWidth {...flex}>
      <Carousel
        aspectRatio="2/1"
        controls={false}
        indicator={false}
        play={{ auto: true, interval: 5000, controls: false, progress: true }}
        items={slides.map(({ src, title, subtitle, cta, href }) => ({
          slide: (
            <Row fill>
              <Media sizes="100vw" src={src} alt={title} />
              <Row position="absolute" fill padding="xl" horizontal="center" vertical="end">
                <Fade position="absolute" bottom="0" to="top" fillWidth height={12} />
                <Row data-border="rounded" position="absolute" top="20" right="20" zIndex={1} fit>
                  <Button size="s" href={href} prefixIcon="cart" weight="default">
                    {cta}
                  </Button>
                </Row>
                <Column align="center" gap="16">
                  <Heading variant="display-strong-l">{title}</Heading>
                  <Text onBackground="neutral-weak" variant="heading-default-l">
                    {subtitle}
                  </Text>
                </Column>
              </Row>
            </Row>
          ),
        }))}
      />
    </Column>
  );
};
