"use client";

import { Button, Line, Row, SmartLink, Switch, Tag, Text } from "@once-ui-system/core";
import { useState } from "react";

export const Cookie3: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [functional, setFunctional] = useState(true);

  return (
    <Row
      fillWidth
      paddingX="24"
      paddingY="16"
      gap="24"
      vertical="center"
      horizontal="between"
      background="overlay"
      borderTop="neutral-medium"
      wrap
      {...flex}
    >
      <Row gap="12" vertical="center" minWidth={20} fillWidth>
        <Tag scheme="neutral" size="s" label="Privacy" />
        <Text variant="body-default-s" onBackground="neutral-medium" wrap="balance">
          We use cookies to improve your experience. Read our{" "}
          <SmartLink href="#">Privacy Policy</SmartLink>.
        </Text>
      </Row>

      <Row gap="16" vertical="center" wrap fillWidth>
        <Switch checked={analytics} onToggle={() => setAnalytics(!analytics)} label="Analytics" />
        <Line vert background="neutral-alpha-weak" height="20" s={{ hide: true }} />
        <Switch checked={marketing} onToggle={() => setMarketing(!marketing)} label="Marketing" />
        <Line vert background="neutral-alpha-weak" height="20" s={{ hide: true }} />
        <Switch
          checked={functional}
          onToggle={() => setFunctional(!functional)}
          label="Functional"
        />
      </Row>

      <Row gap="8" fillWidth m={{ direction: "column" }}>
        <Button size="s" variant="secondary">
          Deny
        </Button>
        <Button size="s" variant="secondary">
          Accept all
        </Button>
        <Button size="s">Save preferences</Button>
      </Row>
    </Row>
  );
};
