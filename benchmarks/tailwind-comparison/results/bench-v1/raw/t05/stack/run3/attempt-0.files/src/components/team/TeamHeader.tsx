import { Row, SmartLink, Text, Icon } from "@once-ui-system/core";
import { product } from "@/lib/data";

export function TeamHeader() {
  return (
    <Row
      as="header"
      fillWidth
      minHeight="56"
      paddingX="24"
      vertical="center"
      horizontal="between"
      borderBottom
      background="page"
    >
      <SmartLink href="/" unstyled aria-label={`${product.name}, team home`}>
        <Row gap="8" vertical="center">
          <Icon name="sparkle" size="s" onBackground="brand-strong" />
          <Text variant="heading-strong-m">{product.name}</Text>
        </Row>
      </SmartLink>
      <Text variant="label-default-s" onBackground="neutral-weak" s={{ hide: true }}>
        {product.workspace}
      </Text>
    </Row>
  );
}
