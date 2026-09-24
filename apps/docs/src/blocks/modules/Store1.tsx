import { Card, Column, Grid, Heading, Media, Text } from "@once-ui-system/core";
import { Footer2, Header4, Hero5 } from ".";

const products = {
  featured: [
    {
      src: "/images/fashion/fashion-01.jpg",
      alt: "Fashion shot with female model",
      title: "Enjoy the summer",
      subtitle: "A light and refreshing look",
      href: "#",
    },
    {
      src: "/images/fashion/fashion-03.jpg",
      alt: "Fashion shot with male model",
      title: "Lean and comfy",
      subtitle: "Perfect holiday wear",
      href: "#",
    },
  ],
  trending: [
    {
      src: "/images/fashion/jacket-01.jpg",
      alt: "Jacket",
      title: "Fleece Jacket",
      brand: "Once UI",
      href: "#",
    },
    {
      src: "/images/fashion/hoodie-02.jpg",
      alt: "Top",
      title: "Splash Hoodie",
      brand: "Dopler",
      href: "#",
      badge: "Sale",
    },
    {
      src: "/images/fashion/shoe-03.jpg",
      alt: "Shoe",
      title: "Once Sneakers",
      brand: "Twice UI",
      href: "#",
    },
    {
      src: "/images/fashion/pants-02.jpg",
      alt: "Pants",
      title: "3/4 Pants",
      brand: "Once UI",
      href: "#",
      badge: "Sale",
    },
  ],
  categories: [
    {
      src: "/images/fashion/jacket-04.jpg",
      alt: "Jacket",
      title: "Jackets",
      href: "#",
      badge: "Sale",
    },
    {
      src: "/images/fashion/top-02.jpg",
      alt: "Top",
      title: "Tops",
      href: "#",
      badge: "Sale",
    },
    {
      src: "/images/fashion/shoe-04.jpg",
      alt: "Shoe",
      title: "Shoes",
      href: "#",
    },
    {
      src: "/images/fashion/pants-02.jpg",
      alt: "Pants",
      title: "Pants",
      href: "#",
      badge: "Sale",
    },
  ],
};

export const Store1 = () => {
  return (
    <Column fillWidth horizontal="center">
      <Header4 maxWidth="xl" />
      <Hero5 maxWidth="xl" marginBottom="l" marginTop="12" paddingX="8" />
      <Column maxWidth="m" paddingX="24">
        <Column fillWidth paddingTop="80" gap="40">
          <Heading as="h2" variant="display-strong-s" marginLeft="16">
            Shop our new collection
          </Heading>
          <Grid fillWidth gap="20" columns={2} s={{ columns: 1 }}>
            {products.featured.map(({ href, src, alt, title, subtitle }) => (
              <Card
                key={src}
                fillWidth
                href={href}
                direction="column"
                border="transparent"
                background="transparent"
                radius="s"
              >
                <Media
                  src={src}
                  aspectRatio="3/4"
                  alt={alt}
                  radius="s"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 560px"
                />
                <Column fillWidth gap="4" padding="16">
                  <Heading as="h2" variant="heading-strong-s">
                    {title}
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {subtitle}
                  </Text>
                </Column>
              </Card>
            ))}
          </Grid>
        </Column>
        <Column fillWidth paddingTop="80" gap="24">
          <Heading as="h2" variant="display-strong-xs" marginLeft="16">
            Trending now
          </Heading>
          <Grid fillWidth gap="20" columns={4} m={{ columns: 2 }} s={{ columns: 1 }}>
            {products.trending.map(({ href, src, alt, title, brand, badge }) => (
              <Card
                key={src}
                fillWidth
                href={href}
                direction="column"
                border="transparent"
                background="transparent"
                radius="s"
              >
                <Column fillWidth aspectRatio="3/4">
                  <Media
                    src={src}
                    alt={alt}
                    radius="s"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                  />
                  {badge && (
                    <Column
                      position="absolute"
                      bottom="16"
                      left="0"
                      rightRadius="s"
                      solid="brand-strong"
                      onSolid="brand-strong"
                      paddingX="8"
                      paddingY="4"
                      textVariant="body-strong-xs"
                    >
                      {badge}
                    </Column>
                  )}
                </Column>
                <Column fillWidth gap="4" paddingY="12" paddingX="16">
                  <Heading as="h2" variant="heading-strong-xs">
                    {title}
                  </Heading>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    {brand}
                  </Text>
                </Column>
              </Card>
            ))}
          </Grid>
        </Column>
        <Column fillWidth paddingTop="80" gap="24">
          <Heading as="h2" variant="display-strong-xs" marginLeft="16">
            Browse by category
          </Heading>
          <Grid fillWidth gap="20" columns={4} m={{ columns: 2 }} s={{ columns: 1 }}>
            {products.categories.map(({ href, src, alt, title, badge }) => (
              <Card
                key={`${title}-${src}`}
                fillWidth
                href={href}
                direction="column"
                border="transparent"
                background="transparent"
                radius="s"
              >
                <Column fillWidth aspectRatio="3/4">
                  <Media
                    src={src}
                    alt={alt}
                    radius="s"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                  />
                  {badge && (
                    <Column
                      position="absolute"
                      bottom="16"
                      left="0"
                      rightRadius="s"
                      solid="brand-strong"
                      onSolid="brand-strong"
                      paddingX="8"
                      paddingY="4"
                      textVariant="body-strong-xs"
                    >
                      {badge}
                    </Column>
                  )}
                </Column>
                <Column fillWidth gap="4" paddingY="12" paddingX="16">
                  <Heading as="h2" variant="heading-strong-xs">
                    {title}
                  </Heading>
                </Column>
              </Card>
            ))}
          </Grid>
        </Column>
      </Column>
      <Footer2 maxWidth="m" marginTop="104" />
    </Column>
  );
};
