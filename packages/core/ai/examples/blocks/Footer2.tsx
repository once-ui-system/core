import {
  Button,
  Column,
  Icon,
  Logo,
  Row,
  SmartLink,
  Text,
} from "@once-ui-system/core";

export const Footer2: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Column gap="40" fillWidth paddingY="l" paddingX="24" {...flex}>
      <Row fillWidth gap="12" textVariant="label-default-m" vertical="center">
        <Logo href="#" dark icon="/trademarks/icon-dark.svg" size="m" />
        <Logo href="#" light icon="/trademarks/icon-light.svg" size="m" />
        <Button
          data-border="rounded"
          size="s"
          weight="default"
          variant="tertiary"
          href="https://once-ui.com/products"
        >
          <Row gap="12" vertical="center">
            Launch your app now
            <Icon size="xs" name="arrowUpRight" onBackground="brand-medium" />
          </Row>
        </Button>
      </Row>
      <Row fillWidth horizontal="between" gap="40" wrap paddingX="2">
        <Column gap="12" textVariant="label-default-m">
          <Row paddingX="4" marginBottom="8">
            Product
          </Row>
          <Row>
            <SmartLink href="#">Solutions</SmartLink>
          </Row>
          <Row>
            <SmartLink href="#">Components</SmartLink>
          </Row>
          <Row>
            <SmartLink href="#">Templates</SmartLink>
          </Row>
          <Row>
            <SmartLink href="#">Studio</SmartLink>
          </Row>
        </Column>
        <Column gap="12" textVariant="label-default-m">
          <Row paddingX="4" marginBottom="8">
            Company
          </Row>
          <Row>
            <SmartLink href="#">About</SmartLink>
          </Row>
          <Row>
            <SmartLink href="#">Contact</SmartLink>
          </Row>
          <Row vertical="center" gap="8">
            <SmartLink href="#">Join</SmartLink>
            <Row textVariant="body-default-xs" onBackground="brand-weak" background="brand-alpha-weak" border="brand-alpha-medium" radius="s" padding="1" paddingX="8" center>
              Hiring!
            </Row>
          </Row>
        </Column>
        <Column gap="12" textVariant="label-default-m">
          <Row paddingX="4" marginBottom="8">
            Resources
          </Row>
          <Row>
            <SmartLink href="#">Terms of Use</SmartLink>
          </Row>
          <Row>
            <SmartLink href="#">Privacy Policy</SmartLink>
          </Row>
          <Row>
            <SmartLink href="#">Code of Conduct</SmartLink>
          </Row>
          <Row>
            <SmartLink href="#">Contribution Guide</SmartLink>
          </Row>
        </Column>
        <Column data-border="rounded" gap="12" textVariant="label-default-m">
          <Row paddingX="4" marginBottom="8">
            Social
          </Row>
          <Button href="#" size="s" variant="secondary" weight="default" prefixIcon="github" label="GitHub" />
          <Button href="#" size="s" variant="secondary" weight="default" prefixIcon="linkedin" label="LinkedIn" />
          <Button href="#" size="s" variant="secondary" weight="default" prefixIcon="threads" label="Threads" />
        </Column>
      </Row>
      <Row fillWidth textVariant="label-default-s" gap="12">
        {new Date().getFullYear()} <Text>•</Text> Once UI <Text onBackground="neutral-weak">// All rights reserved</Text>
      </Row>
    </Column>
  );
};
