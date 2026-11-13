import { brand, footerColumns } from "@/lib/data";
import { Column, Grid, Line, Row, SmartLink, Text } from "@once-ui-system/core";

export function SiteFooter() {
  return (
    <Column as="footer" fillWidth horizontal="center" paddingX="24" paddingY="64" borderTop>
      <Column maxWidth="l" gap="48">
        <Grid columns="3" gap="32" s={{ columns: 1 }}>
          <Column gap="12">
            <Text variant="heading-strong-l" onBackground="neutral-strong">
              {brand.name}
            </Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Product analytics and issue tracking for small software teams.
            </Text>
          </Column>
          {footerColumns.map((column) => (
            <Column as="nav" key={column.title} gap="12" aria-label={column.title}>
              <Text variant="label-strong-s" onBackground="neutral-strong">
                {column.title}
              </Text>
              {column.links.map((link) => (
                <SmartLink key={link.label} href={link.href}>
                  <Text variant="body-default-s">{link.label}</Text>
                </SmartLink>
              ))}
            </Column>
          ))}
        </Grid>
        <Line />
        <Row horizontal="between" gap="16" wrap>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </Text>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            Data stored in the EU, encrypted at rest.
          </Text>
        </Row>
      </Column>
    </Column>
  );
}
