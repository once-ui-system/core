import { social } from "./content/resources";
import { Column, Grid, IconButton, Logo, Row, SmartLink, Tag, Text } from "@once-ui-system/core";

const navigation = [
  {
    title: "Free",
    items: [
      { label: "All Products", href: "#" },
      { label: "Once UI Core", href: "#" },
      { label: "Magic Portfolio", href: "#" },
      { label: "Magic Docs", href: "#" },
      { label: "Magic Bio", href: "#" },
      { label: "Once UI Figma", href: "#" },
    ],
  },
  {
    title: "Pro",
    items: [
      { label: "Supa Social", href: "#", tag: "New" },
      { label: "Magic Studio", href: "#", tag: "New" },
      { label: "Supabase Starter", href: "#" },
      { label: "Magic Convert", href: "#" },
      { label: "Magic Spotlight", href: "#" },
      { label: "Magic Journal", href: "#", tag: "New" },
      { label: "Magic Store", href: "#" },
      { label: "Magic Agent", href: "#" },
      { label: "Once UI Blocks", href: "#" },
    ]
  },
  {
    title: "Learn",
    items: [
      { label: "Pricing", href: "#" },
      { label: "Services", href: "#", tag: "New" },
      { label: "Canvas", href: "#", tag: "New" },
      { label: "Documentation", href: "#" },
      { label: "Roadmap", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Handbook", href: "#", tag: "New" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Blog", href: "#" },
      { label: "About us", href: "#" },
      { label: "Contact us", href: "#" },
      { label: "Sponsor us", href: "#" },
      { label: "Merch store", href: "#" },
      { label: "Brand assets", href: "#" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Terms of Use", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "License Agreement", href: "#" },
    ]
  },
];

export const Footer3 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column fillWidth horizontal="center" paddingTop="80" paddingBottom="16" {...flex}>
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
            <SmartLink href="#" unstyled>
              Lorant One
            </SmartLink> and the{" "}
            <SmartLink href="#" unstyled>
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