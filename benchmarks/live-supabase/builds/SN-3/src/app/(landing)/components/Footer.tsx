import {
  Column,
  Logo,
  Row,
  SmartLink,
  Text,
} from "@once-ui-system/core";
import { schema } from "@/resources";

export const Footer = () => {
  return (
    <Column fillWidth horizontal="center" paddingTop="xl" gap="xl">
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
          <Row gap="24" vertical="center" wrap textVariant="label-default-m">
            <SmartLink href="/blog">Blog</SmartLink>
            <SmartLink href="/privacy">Privacy</SmartLink>
            <SmartLink href="/terms">Terms</SmartLink>
          </Row>
        </Column>
      </Row>
      <Row fillWidth horizontal="center" borderTop="neutral-alpha-medium">
        <Row fillWidth paddingX="l" maxWidth="l" paddingY="24" textVariant="label-default-s" onBackground="neutral-medium">
          © {new Date().getFullYear()} {schema.name} <Text onBackground="neutral-weak" marginLeft="8">All rights reserved</Text>
        </Row>
      </Row>
    </Column>
  );
};
