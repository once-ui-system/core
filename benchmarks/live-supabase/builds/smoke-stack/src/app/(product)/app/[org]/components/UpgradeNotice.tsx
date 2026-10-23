import { orgPath } from "@/lib/orgs/types";
import { Button, Column, Heading, Icon, Text } from "@once-ui-system/core";

/** Shown in place of a page whose feature the organization's plan does not include. */
export function UpgradeNotice({ org, feature }: { org: string; feature: string }) {
  return (
    <Column fillWidth horizontal="center" paddingX="16" paddingY="64" gap="16">
      <Icon name="rocket" size="l" onBackground="brand-medium" />
      <Heading as="h1" variant="heading-strong-l" align="center">
        {feature} is on a paid plan
      </Heading>
      <Text variant="body-default-m" onBackground="neutral-weak" align="center">
        Upgrade this organization to use it. Every member gets it.
      </Text>
      <Button href={orgPath(org, "/billing")} label="See plans" arrowIcon />
    </Column>
  );
}
