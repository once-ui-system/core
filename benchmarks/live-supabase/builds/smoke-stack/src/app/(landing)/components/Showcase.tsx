import { Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import { Shot } from "./Shot";
import { SectionHeader } from "./SectionHeader";

interface Surface {
  title: string;
  description: string;
  image: string;
  alt: string;
}

const surfaces: Surface[] = [
  {
    title: "Docs",
    description: "Guides, search and a changelog for your product.",
    image: "docs",
    alt: "The Stack docs",
  },
  {
    title: "Store",
    description: "Products, collections and a cart, ready for your catalog.",
    image: "store",
    alt: "The Stack storefront",
  },
];

const SurfaceCard: React.FC<Surface> = ({ title, description, image, alt }) => (
  <Column
    fillWidth
    gap="20"
    padding="8"
    paddingBottom="24"
    radius="xl"
    border="neutral-alpha-weak"
    background="surface"
  >
    <Shot
      name={image}
      alt={alt}
      fillWidth
      radius="l"
      border="neutral-alpha-weak"
      aspectRatio="16 / 10"
      sizes="(max-width: 768px) 100vw, 600px"
    />
    <Column gap="4" paddingX="16">
      <Heading as="h3" variant="heading-strong-m">
        {title}
      </Heading>
      <Text variant="body-default-s" onBackground="neutral-weak">
        {description}
      </Text>
    </Column>
  </Column>
);

/** The surfaces a project is composed from, shown as the real pages. */
export const Showcase = ({ ...flex }: React.ComponentProps<typeof Column>) => (
  <Column fillWidth horizontal="center" gap="48" {...flex}>
    <SectionHeader
      label="Surfaces"
      title="Pick the pages your product needs"
      description="Stack is composed from surfaces. Take the ones you need and leave the rest out of your codebase entirely."
    />
    <Row fillWidth gap="12" m={{ direction: "column" }}>
      <Column
        fillWidth
        gap="20"
        padding="8"
        paddingBottom="24"
        radius="xl"
        border="neutral-alpha-weak"
        background="surface"
        flex={2}
      >
        <Shot
          name="dashboard"
          alt="The Stack dashboard"
          fillWidth
          radius="l"
          border="neutral-alpha-weak"
          aspectRatio="16 / 10"
          sizes="(max-width: 768px) 100vw, 800px"
        />
        <Column gap="4" paddingX="16">
          <Heading as="h3" variant="heading-strong-m">
            Dashboard
          </Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            The signed-in app: analytics, users, roles, billing and settings.
          </Text>
        </Column>
      </Column>
      <Column
        fillWidth
        gap="20"
        padding="8"
        paddingBottom="24"
        radius="xl"
        border="neutral-alpha-weak"
        background="surface"
        flex={1}
        horizontal="center"
      >
        <Column fillWidth flex={1} radius="l" overflow="hidden" border="neutral-alpha-weak" horizontal="center" vertical="end" background="page" paddingX="40" paddingTop="32" style={{ minHeight: "20rem" }}>
          <Shot
            name="dashboard-mobile"
            alt="The Stack dashboard on a phone"
            fillWidth
            maxWidth={14}
            topRadius="l"
            borderTop="neutral-alpha-medium"
            borderX="neutral-alpha-medium"
            aspectRatio="390 / 600"
            objectFit="cover"
            style={{ objectPosition: "top" }}
            sizes="280px"
          />
        </Column>
        <Column gap="4" paddingX="16" fillWidth>
          <Heading as="h3" variant="heading-strong-m">
            Mobile
          </Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            The same app on iOS and Android.
          </Text>
        </Column>
      </Column>
    </Row>
    <Grid fillWidth columns={2} s={{ columns: 1 }} gap="12">
      {surfaces.map((surface) => (
        <SurfaceCard key={surface.title} {...surface} />
      ))}
    </Grid>
  </Column>
);
