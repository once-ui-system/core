import {
  Button,
  Column,
  Grid,
  Logo,
  Row,
  SmartLink,
  Text,
} from "@once-ui-system/core";
import { Cta } from "./Cta";
import { schema, social } from "@/resources";

export const Footer = () => {
  return (
    <Column fillWidth horizontal="center" paddingTop="xl" gap="xl">
      <Cta />
      <Row fillWidth paddingX="l" maxWidth="l" paddingY="xl" gap="xl" m={{direction: "column"}}>
        <Column fillWidth vertical="center" gap="40" paddingX="20">
          <Row gap="12" textVariant="label-default-m" maxWidth="l" vertical="center">
            <Row vertical="center" gap="8">
              <Logo href="/" icon={schema.logo} size="s" />
              <Text variant="heading-strong-s" onBackground="neutral-strong">
                {schema.name}
              </Text>
            </Row>
          </Row>
          <Row horizontal="between" gap="xl" paddingX="2" m={{direction: "column"}} vertical="center">
            <Grid columns={3} m={{columns: 2}} s={{columns: 1}} fillWidth gap="32">
              <Column fillWidth gap="12" textVariant="label-default-m">
                <Row paddingX="2" marginBottom="8">
                  Company
                </Row>
                <Row>
                  <SmartLink href="/blog">Blog</SmartLink>
                </Row>
              </Column>
              <Column fillWidth gap="12" textVariant="label-default-m">
                <Row paddingX="2" marginBottom="8">
                  Legal
                </Row>
                <Row>
                  <SmartLink href="/privacy">Privacy</SmartLink>
                </Row>
                <Row>
                  <SmartLink href="/terms">Terms</SmartLink>
                </Row>
              </Column>
              <Column fillWidth data-border="rounded" gap="8">
                <Row paddingX="2" marginBottom="12" textVariant="label-default-m">
                  Connect
                </Row>
                {social.map((item) => (
                  <Button
                    key={item.name}
                    href={item.link}
                    weight="default"
                    prefixIcon={item.icon}
                    label={item.name}
                    size="s"
                    variant="secondary"
                  />
                ))}
              </Column>
            </Grid>
          </Row>
        </Column>
      </Row>
      <Row fillWidth horizontal="center" borderTop="neutral-alpha-medium">
        <Row fillWidth paddingX="l" maxWidth="l" paddingY="24" textVariant="label-default-s" onBackground="neutral-medium">
          © {new Date().getFullYear()} {schema.name} <Text onBackground="neutral-weak" marginLeft="8">{schema.tagline}</Text>
        </Row>
      </Row>
    </Column>
  );
};
