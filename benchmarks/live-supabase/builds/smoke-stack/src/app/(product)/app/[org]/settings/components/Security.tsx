"use client";

import { formatDate } from "@/utils";
import { Button, Column, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { useMemo, useState } from "react";

export function Security() {
  type Provider = "email" | "google" | "github";

  type Identity = {
    id: string;
    provider: Provider;
    connected: boolean;
    connectedAt?: string;
    detail?: string;
  };

  const [identities, setIdentities] = useState<Identity[]>([
    {
      id: "email",
      provider: "email",
      connected: true,
      connectedAt: "2025-01-04",
    },
    {
      id: "github",
      provider: "github",
      connected: true,
      connectedAt: "2025-01-11",
    },
    {
      id: "google",
      provider: "google",
      connected: false,
    },
  ]);

  const providerMeta = useMemo(
    () =>
      ({
        email: { name: "Email", icon: "email" },
        google: { name: "Google", icon: "google" },
        github: { name: "GitHub", icon: "github" },
      }) as const,
    [],
  );

  const toggleIdentity = (id: string) => {
    setIdentities((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        if (i.connected) {
          return { ...i, connected: false, connectedAt: undefined };
        }
        return { ...i, connected: true, connectedAt: new Date().toISOString().slice(0, 10) };
      }),
    );
  };

  const authUser = {
    createdAt: "2025-01-04",
    lastSignIn: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    emailConfirmed: true,
  };

  return (
    <Column fillWidth gap="24">
      <Column
        border="neutral-alpha-medium"
        radius="l"
        fillWidth>
        <Row
          fillWidth paddingX="24" paddingY="16"
          vertical="center" horizontal="between"
          borderBottom="neutral-alpha-medium">
          <Text variant="heading-strong-s">Connected Accounts</Text>
        </Row>
        <Column fillWidth>
          {identities.map((identity, index) => {
            const meta = providerMeta[identity.provider];

            return (
              <Row
                key={identity.id}
                fillWidth
                paddingX="24"
                paddingY="16"
                vertical="center"
                horizontal="between"
                borderTop={index > 0 ? "neutral-alpha-weak" : undefined}
                gap="16"
              >
                <Row fillWidth gap="20" vertical="center">
                  <Icon name={meta.icon} size="s" />
                  <Column fillWidth gap="2">
                    <Text variant="label-default-m">{meta.name}</Text>
                    {identity.connected ? (
                      <Text variant="label-default-xs" onBackground="neutral-weak">
                        Connected{identity.connectedAt ? `: ${identity.connectedAt}` : ""}{identity.detail ? ` · ${identity.detail}` : ""}
                      </Text>
                    ) : (
                      <Text variant="label-default-xs" onBackground="neutral-weak">
                        {identity.detail ?? "Not connected"}
                      </Text>
                    )}
                  </Column>
                </Row>

                <Row gap="12" vertical="center" fitWidth>
                  <Button
                    size="s"
                    variant={identity.connected ? "secondary" : "primary"}
                    onClick={() => toggleIdentity(identity.id)}
                  >
                    {identity.connected ? "Disconnect" : "Connect"}
                  </Button>
                </Row>
              </Row>
            );
          })}
        </Column>
      </Column>
      <Column
        border="neutral-alpha-medium"
        radius="l"
        fillWidth>
        <Row
          fillWidth paddingX="24" paddingY="16"
          vertical="center" horizontal="between"
          borderBottom="neutral-alpha-medium">
          <Text variant="heading-strong-s">Account Information</Text>
        </Row>
        <Row
          fillWidth paddingX="24" paddingY="16"
          vertical="center" horizontal="between">
          <Text>Account created</Text>
          <Text onBackground="neutral-weak" variant="label-default-s">{formatDate(authUser.createdAt)}</Text>
        </Row>
        <Row
          fillWidth paddingX="24" paddingY="16"
          vertical="center" horizontal="between"
          borderTop="neutral-alpha-weak">
          <Text>Last sign in</Text>
          <Text onBackground="neutral-weak" variant="label-default-s">{formatDate(authUser.lastSignIn)}</Text>
        </Row>
        <Row
          fillWidth paddingX="24" paddingY="16"
          vertical="center" horizontal="between"
          borderTop="neutral-alpha-weak">
          <Text>Email verified</Text>
          <Row gap="8" vertical="center">
            {authUser.emailConfirmed ? (
              <Tag scheme="success">Verified</Tag>
            ) : (
              <Tag scheme="warning">Not verified</Tag>
            )}
          </Row>
        </Row>
      </Column>
    </Column>
  );
}