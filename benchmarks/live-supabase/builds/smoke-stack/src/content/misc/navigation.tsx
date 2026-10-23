import type { IconName, MenuGroup } from "@once-ui-system/core";
import { Card, MatrixFx, Background, Icon, Column, Grid, Text, Row, Tag, ToggleButton, Media, Button, BlobFx } from "@once-ui-system/core";

/*
 * One link row for both dropdowns. Each surface's link is one line (one object
 * in the mobile menu), so a
 * composition that leaves the surface out can strip it with an exact-match
 * edit — see the surface manifests' absentTransforms. The landing surface
 * owns this file, so its own link needs none.
 */
const linkStyle = {
  height: "auto",
  minHeight: "fit-content",
  paddingLeft: "var(--static-space-0)",
  paddingTop: "var(--static-space-4)",
  paddingBottom: "var(--static-space-4)",
  paddingRight: "var(--static-space-12)",
};

const NavLink = ({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: IconName;
  label: string;
  description: string;
}) => (
  <ToggleButton href={href} style={linkStyle} fillWidth horizontal="start">
    <Row gap="12" vertical="center">
      <Icon name={icon} size="s" padding="8" marginLeft="2" radius="s" border />
      <Column gap="2">
        <Text variant="label-strong-s">
          {label}
        </Text>
        <Text onBackground="neutral-weak" variant="label-default-xs" truncate>
          {description}
        </Text>
      </Column>
    </Row>
  </ToggleButton>
);

const megaMenu: MenuGroup[] = [
  {
    id: "surfaces",
    label: "Surfaces",
    suffixIcon: "chevronDown",
    content: (
      <Row gap="8" width={48} data-solid="inverse">
        <Column gap="2" fillWidth paddingX="4">
          <NavLink href="/" icon="trend" label="Landing page" description="Conversion-optimized" />
          <NavLink href="/app" icon="apps" label="Dashboard" description="Admin platform" />
        </Column>
      </Row>
    )
  },
  {
    id: "resources",
    label: "Resources",
    suffixIcon: "chevronDown",
      content: (
        <Row gap="8" fillWidth minHeight={12} maxWidth={56} data-solid="inverse">
          <Card direction="column" vertical="between" padding="20" href="/blog" fill minWidth={10} radius="m" border="neutral-alpha-medium" overflow="hidden">
            <Background data-solid="inverse" position="absolute" left="0" top="0" fill gradient={{display: true, colorStart: "neutral-background-weak", y: 100, width: 300, height: 100}} pointerEvents="none"/>
            <BlobFx position="absolute" left="0" top="0" data-solid="color" translateY="50%"/>
            <Icon name="book" solid="brand-strong" onSolid="brand-strong" size="xs" padding="4" radius="m"/>
            <Column fillWidth minWidth={16} gap="8">
              <Text variant="label-strong-m">Blog</Text>
              <Text variant="label-default-s" onBackground="neutral-weak" wrap="balance">
                Useful resources
              </Text>
            </Column>
          </Card>
          <Column fillWidth gap="2">
            <Text variant="label-default-s" onBackground="neutral-weak" marginLeft="8" marginTop="16" marginBottom="12">Company</Text>
            <NavLink href="/about" icon="people" label="About" description="Meet the team" />
            <NavLink href="#" icon="discord" label="Discord" description="Join our community" />
            <NavLink href="/contact" icon="email" label="Contact" description="Get in touch" />
          </Column>
        </Row>
      ),
  },
  {
    id: "pricing",
    label: "Pricing",
    href: "/pricing",
  },
]

const mobileMenu: MenuGroup[] = [
  {
    id: "surfaces",
    label: "Surfaces",
    suffixIcon: "chevronDown",
    sections: [
        {
          links: [
            {
              label: "Landing page",
              href: "/products/landing",
              icon: "trend",
              description: "Conversion-optimized",
            },
            {
              label: "Dashboard",
              href: "/app",
              icon: "apps",
              description: "Admin platform",
            },
          ],
        },
    ]
  },
  {
    id: "resources",
    label: "Resources",
    suffixIcon: "chevronDown",
    sections: [
      {
        links: [
          {
            label: "Blog",
            href: "/blog",
            icon: "pages",
            description: "Useful resources",
          },
          {
            label: "About",
            href: "/about",
            icon: "people",
            description: "Meet the team",
          },
          {
            label: "Brand",
            href: "/brand",
            icon: "swatch",
            description: "Download brand assets",
          },
          {
            label: "Contact",
            href: "/contact",
            icon: "email",
            description: "Get in touch",
          },
          {
            label: "Discord",
            href: "#",
            icon: "discord",
            description: "Join our community",
          },
        ],
      },
    ]
  },
  {
    id: "legal",
    label: "Legal",
    suffixIcon: "chevronDown",
    sections: [
      {
        links: [
          {
            label: "Terms of Use",
            href: "/terms-of-use",
            icon: "pages",
          },
          {
            label: "Privacy Policy",
            href: "/privacy-policy",
            icon: "pages",
          },
        ],
      },
    ]
  },
  {
    id: "pricing",
    label: "Pricing",
    href: "/pricing",
  },
]

const promo = (
  <Card href="https://once-ui.com/pricing?ref=magic-convert" fillWidth border="neutral-alpha-medium" background="transparent" radius="l" overflow="hidden">
    <MatrixFx position="absolute" flicker revealFrom="top" size={2} spacing={2} colors={["brand-solid-strong", "static-transparent"]}/>
    <Background position="absolute" fill gradient={{display: true, colorStart: "neutral-background-weak", y: 0, width: 300, height: 300}} pointerEvents="none"/>
    <Column fillWidth padding="20" gap="12">
      <Text variant="heading-strong-s">Get Once UI Pro</Text>
      <Text variant="label-default-s" onBackground="neutral-weak" marginBottom="8">Build a digital presence with deployment-ready apps</Text>
      <Button rounded size="s" id="get-pro-banner" arrowIcon>Get Pro</Button>
    </Column>
  </Card>
)

export { megaMenu, mobileMenu, promo }
