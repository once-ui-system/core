import { Icon, Row, SmartLink, Text } from "@once-ui-system/core";
import { brand } from "@/resources";

/** The product mark: an icon and the name, linking home. */
export function BrandMark({ href = "/" }: { href?: string }) {
  return (
    <SmartLink href={href} unstyled>
      <Row gap="8" vertical="center">
        <Row center radius="m" padding="4" background="brand-strong">
          <Icon name="book" size="s" />
        </Row>
        <Text variant="heading-strong-s">{brand.name}</Text>
      </Row>
    </SmartLink>
  );
}
