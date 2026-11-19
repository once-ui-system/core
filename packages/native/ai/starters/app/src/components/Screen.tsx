import { Avatar, Column, Heading, IconButton, Row, Text } from "@once-ui-system/native";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { ScrollView } from "react-native";
import { initials, user } from "../resources/app";

/**
 * A screen inside the shell: a header with the title and the user's avatar, and
 * content that scrolls between it and the tab bar. A screen passes its content as
 * children; `back` adds a back button for screens a tab opens on top of its own.
 */
export function Screen({
  title,
  description,
  back,
  children,
}: {
  title: string;
  description?: string;
  back?: boolean;
  children?: ReactNode;
}) {
  return (
    <Column fill background="page" safeArea={["top"]}>
      <Row paddingX="20" paddingTop="12" paddingBottom="8" gap="8" vertical="center">
        {back && (
          <IconButton
            icon="chevronLeft"
            variant="tertiary"
            aria-label="Back"
            onPress={() => router.back()}
          />
        )}
        <Column flex={1}>
          <Heading textVariant="heading-strong-xl" numberOfLines={1}>
            {title}
          </Heading>
        </Column>
        <Avatar size="m" value={initials(user.name)} src={user.avatar || undefined} />
      </Row>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <Column paddingX="20" paddingTop="8" paddingBottom="32" gap="24">
          {description && (
            <Text textVariant="body-default-m" onBackground="neutral-weak">
              {description}
            </Text>
          )}
          {children}
        </Column>
      </ScrollView>
    </Column>
  );
}
