"use client";

import {
  AvatarGroup,
  Background,
  BlobFx,
  Button,
  Column,
  CountFx,
  Heading,
  Icon,
  Input,
  Pulse,
  Row,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

export const Newsletter6 = (flex: React.ComponentProps<typeof Column>) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <Column
      fillWidth
      horizontal="center"
      overflow="hidden"
      radius="xl"
      border="brand-alpha-weak"
      paddingX="l"
      paddingY="xl"
      {...flex}
    >
      <BlobFx position="absolute" top="0" translateY="50%" data-solid="inverse" />
      <Background
        position="absolute"
        top="0"
        left="0"
        gradient={{
          display: true,
          x: 50,
          y: 100,
          width: 100,
          height: 60,
          colorStart: "brand-background-strong",
        }}
      />

      <Column maxWidth={36} gap="24" horizontal="center" zIndex={1}>
        <Row vertical="center" gap="8">
          <Pulse size="s" scheme="brand" />
          <Text variant="code-default-s" onBackground="brand-medium">
            Community updates
          </Text>
        </Row>

        <Column gap="12" horizontal="center">
          <Heading variant="display-strong-s" align="center" wrap="balance">
            Follow the build in public
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" align="center" wrap="balance">
            Milestone unlocks, open-source releases, and product drops — one email when it matters,
            never spam.
          </Text>
        </Column>

        <Row gap="16" vertical="center" wrap horizontal="center">
          <AvatarGroup
            size="s"
            reverse
            avatars={[
              { src: "/images/creators/lorant.jpg" },
              { src: "/images/creators/justin.jpg" },
              { src: "/images/creators/suhaib.jpg" },
              { src: "/images/creators/kevin.jpg" },
              { src: "/images/creators/aryan.jpg" },
            ]}
          />
          <Text variant="label-default-s" onBackground="neutral-weak">
            Join{" "}
            <Text as="span" onBackground="brand-medium">
              <CountFx value={5200} separator="," />+
            </Text>{" "}
            builders
          </Text>
        </Row>

        {subscribed ? (
          <Row
            gap="8"
            vertical="center"
            paddingY="12"
            paddingX="16"
            radius="l"
            background="brand-alpha-weak"
            border="brand-alpha-weak"
            textVariant="label-default-m"
            onBackground="brand-medium"
          >
            <Icon name="check" size="s" />
            You're on the list — welcome aboard
          </Row>
        ) : (
          <Row maxWidth={24} fillWidth>
            <Input
              id="community-email"
              placeholder="Email address"
              type="email"
              size="s"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              suffix={
                <Button
                  size="s"
                  style={{ marginRight: "-0.325rem" }}
                  onClick={() => email && setSubscribed(true)}
                >
                  Subscribe
                </Button>
              }
            />
          </Row>
        )}

        <Text variant="body-default-xs" onBackground="neutral-weak" align="center">
          Unsubscribe anytime. We respect your inbox.
        </Text>
      </Column>
    </Column>
  );
};
