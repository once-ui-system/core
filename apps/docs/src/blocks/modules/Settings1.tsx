"use client";

import {
  Button,
  Column,
  Fade,
  Heading,
  Input,
  Row,
  SegmentedControl,
  StylePanel,
  Text,
} from "@once-ui-system/core";
import { MediaUpload } from "@once-ui-system/core/media";
import { useState } from "react";

export const Settings1 = () => {
  const [selectedOption, setSelectedOption] = useState("profile");

  return (
    <Row fill radius="l" overflow="hidden" gap="8">
      <Column
        fill
        background="surface"
        border="surface"
        paddingX="32"
        paddingBottom="32"
        overflowY="auto"
        horizontal="center"
      >
        <Column maxWidth="s">
          <Column position="sticky" marginTop="16" top="0" zIndex={1} marginBottom="16">
            <Fade fillWidth position="absolute" to="bottom" top="104" height={3} base="surface" />
            <Column fillWidth background="surface" paddingTop="16">
              <Column fillWidth paddingLeft="16">
                <Heading variant="heading-strong-xl">Settings</Heading>
                <Text onBackground="neutral-medium" variant="body-default-s" marginBottom="24">
                  Manage your preferences and data
                </Text>
              </Column>
              <SegmentedControl
                buttons={[
                  {
                    label: "Profile",
                    value: "profile",
                  },
                  {
                    label: "Appearance",
                    value: "appearance",
                  },
                  {
                    label: "Security",
                    value: "security",
                  },
                ]}
                onChange={setSelectedOption}
              />
            </Column>
          </Column>
          {selectedOption === "profile" && (
            <>
              <Column fillWidth paddingTop="12" paddingLeft="16" gap="4" marginBottom="16">
                <Text variant="heading-strong-s">Avatar</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Your avatar is visible to everyone
                </Text>
              </Column>
              <MediaUpload
                maxWidth={8}
                radius="full"
                aspectRatio="1 / 1"
                marginBottom="16"
                initialPreviewImage="/images/creators/lorant.jpg"
              />
              <Column fillWidth paddingTop="12" paddingLeft="16" gap="4" marginBottom="16">
                <Text variant="heading-strong-s">Cover</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Your cover is visible to everyone
                </Text>
              </Column>
              <MediaUpload
                maxWidth={16}
                aspectRatio="16 / 9"
                initialPreviewImage="/images/blocks/vibe-coding-dark.jpg"
              />
            </>
          )}
          {selectedOption === "appearance" && <StylePanel />}
          {selectedOption === "security" && (
            <>
              <Column fillWidth paddingTop="12" paddingLeft="16" gap="4" marginBottom="16">
                <Text variant="heading-strong-s">Access</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Manage your credentials
                </Text>
              </Column>
              <Row fillWidth gap="16" s={{ direction: "column" }}>
                <Input
                  disabled
                  id="email"
                  label="Email"
                  suffix={
                    <Row position="absolute" right="0" top="0">
                      <Fade
                        position="absolute"
                        right="0"
                        top="0"
                        to="left"
                        height={3}
                        width={16}
                        base="surface"
                        rightRadius="l"
                      />
                      <Row padding="8">
                        <Button variant="secondary" label="Update" size="s" />
                      </Row>
                    </Row>
                  }
                  value="support@once-ui.com"
                  size="s"
                />
                <Input
                  disabled
                  autoComplete="new-password"
                  id="password"
                  label="Password"
                  suffix={
                    <Row position="absolute" right="0" top="0">
                      <Fade
                        position="absolute"
                        right="0"
                        top="0"
                        to="left"
                        height={3}
                        width={16}
                        base="surface"
                        rightRadius="l"
                      />
                      <Row padding="8">
                        <Button variant="secondary" label="Update" size="s" />
                      </Row>
                    </Row>
                  }
                  value="•••••••••••••••••••"
                  size="s"
                />
              </Row>
            </>
          )}
        </Column>
      </Column>
    </Row>
  );
};
