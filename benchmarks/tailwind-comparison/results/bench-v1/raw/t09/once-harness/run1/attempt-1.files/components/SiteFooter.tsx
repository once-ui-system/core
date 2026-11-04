import { Column, Grid, Heading, Row, SmartLink, Text } from "@once-ui-system/core";
import { brand, footerLinks } from "../lib/data";

export function SiteFooter() {
  return (
    <Row
      as="footer"
      fillWidth
      horizontal="center"
      paddingX="16"
      paddingY="64"
      borderTop
      background="surface"
    >
      <Column maxWidth="l" gap="48">
        <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="32">
          <Column gap="12">
            <Text as="p" family="heading" textVariant="heading-strong-l">
              {brand.name}
            </Text>
            <Text as="p" textVariant="body-default-s" onBackground="neutral-weak">
              Product analytics and issue tracking for small software teams.
            </Text>
          </Column>
          {footerLinks.map((group) => (
            <Column key={group.title} as="nav" aria-label={group.title} gap="12">
              <Heading as="h2" textVariant="label-strong-s" onBackground="neutral-strong">
                {group.title}
              </Heading>
              <Column as="ul" gap="8">
                {group.links.map((link) => (
                  <Column as="li" key={link.label}>
                    <SmartLink href={link.href}>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        {link.label}
                      </Text>
                    </SmartLink>
                  </Column>
                ))}
              </Column>
            </Column>
          ))}
        </Grid>
        <Row
          borderTop
          paddingTop="24"
          gap="16"
          horizontal="between"
          wrap
          textVariant="body-default-xs"
          onBackground="neutral-weak"
        >
          <Text as="span">© 2025 Lumen Analytics GmbH. All rights reserved.</Text>
          <Text as="span">Data stored in the EU, encrypted at rest.</Text>
        </Row>
      </Column>
    </Row>
  );
}
