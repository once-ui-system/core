import { Column, SmartLink, Text } from "@once-ui-system/core";
import { schema } from "@/resources";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Column fillWidth minHeight="100vh" background="page" horizontal="center" paddingX="16" paddingY="40" gap="32">
      <SmartLink href="/" unstyled>
        <Text variant="heading-strong-m" onBackground="neutral-strong">
          {schema.name}
        </Text>
      </SmartLink>
      <Column fillWidth maxWidth="xs" gap="24">
        {children}
      </Column>
    </Column>
  );
}
