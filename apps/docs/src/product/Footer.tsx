import { social } from "@/resources";
import { Column, Grid, IconButton, Logo, Row, SmartLink, Tag, Text } from "@once-ui-system/core";

const navigation = [
  {
    title: "Free",
    items: [
      { label: "All Products", href: "https://once-ui.com/products" },
      { label: "Once UI Core", href: "https://once-ui.com/products/once-ui-core" },
      { label: "Magic Portfolio", href: "https://once-ui.com/products/magic-portfolio" },
      { label: "Magic Docs", href: "https://once-ui.com/products/magic-docs" },
      { label: "Magic Bio", href: "https://once-ui.com/products/magic-bio" },
      { label: "Once UI Figma", href: "/figma" },
    ],
  },
  {
    title: "Pro",
    items: [
      { label: "Supa Social", href: "https://once-ui.com/products/supa-social", tag: "New" },
      { label: "Magic Spotlight", href: "https://once-ui.com/products/magic-spotlight" },
      { label: "Supabase Starter", href: "https://once-ui.com/products/supabase-starter" },
      { label: "Magic Agent", href: "https://once-ui.com/products/magic-agent" },
      { label: "Magic Convert", href: "https://once-ui.com/products/magic-convert" },
      { label: "Magic Store", href: "https://once-ui.com/products/magic-store" },
      { label: "Once UI Blocks", href: "https://once-ui.com/blocks/quickStart" },
    ]
  },
  {
    title: "Learn",
    items: [
      { label: "Pricing", href: "https://once-ui.com/pricing" },
      { label: "Canvas", href: "https://once-ui.com/canvas", tag: "New" },
      { label: "Documentation", href: "/" },
      { label: "Changelog", href: "/changelog" },
      { label: "Roadmap", href: "/roadmap" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Blog", href: "https://once-ui.com/blog" },
      { label: "About us", href: "https://once-ui.com/about" },
      { label: "Contact us", href: "https://once-ui.com/contact" },
      { label: "Sponsor us", href: "https://once-ui.com/blog/open-source" },
      { label: "Merch store", href: "https://store.dopler.app" },
      { label: "Brand assets", href: "https://once-ui.com/brand" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Terms of Use", href: "https://once-ui.com/terms-of-use" },
      { label: "Privacy Policy", href: "https://once-ui.com/privacy-policy" },
      { label: "License Agreement", href: "https://once-ui.com/license-agreement" },
    ]
  },
];

const Footer = () => {
  return (
    <Column fillWidth horizontal="center" paddingTop="80" paddingBottom="16" borderTop="neutral-alpha-medium">
      <Column maxWidth="xl" paddingX="l" horizontal="center" gap="48">
        <Grid
          fillWidth
          columns={5}
          m={{columns: 3}}
          s={{columns: 2}}
          gap="32">
          {navigation.map((section) => (
            <Column key={section.title} gap="24" paddingY="8">
              <Text variant="label-default-s">
                {section.title}
              </Text>
              <Row fillWidth s={{direction: "column"}} gap="24">
                <Column fillWidth key={`${section.title}-${section.title}`} gap="16">
                  {section.items.map((item: any) => (
                    <SmartLink key={`${item.label}-${item.href}`} href={item.href} unstyled>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {item.label}
                      </Text>
                      {item.tag && (
                        <Tag style={{ transform: "scale(0.9)" }} variant="brand" size="s">
                          {item.tag}
                        </Tag>
                      )}
                    </SmartLink>
                  ))}
                </Column>
              </Row>
            </Column>
          ))}
        </Grid>
        <Row fillWidth inline gap="8" vertical="center" textVariant="label-default-s" onBackground="neutral-weak" s={{direction: "column", horizontal: "start"}}>
          <Row paddingRight="8">
            <Logo size="s" href="/" dark icon="/trademarks/icon-dark.svg" />
            <Logo size="s" href="/" light icon="/trademarks/icon-light.svg" />
          </Row>
          <Row wrap fillWidth gap="4">
            Built with curiosity by{" "}
            <SmartLink href="https://lorant.one" unstyled>
              Lorant One
            </SmartLink> and the{" "}
            <SmartLink href="https://designengineers.club" unstyled>
              Design Engineers Club
            </SmartLink>
          </Row>
          <Row gap="8">
            {social.map((item, index) => (
              <IconButton
                data-border="rounded"
                icon={item.icon}
                variant="tertiary"
                size="l"
                key={index}
                href={item.href}
              />
            ))}
          </Row>
        </Row>
      </Column>
    </Column>
  );
};

export { Footer };