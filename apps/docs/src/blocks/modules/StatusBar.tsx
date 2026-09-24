"use client";

import { Button, CountFx, Pulse, Row, Text } from "@once-ui-system/core";
import { LinearGauge } from "@once-ui-system/core/data";

export const StatusBar = (flex: React.ComponentProps<typeof Row>) => {
  const value = 128400;
  const target = 200000;
  const progress = Math.round((value / target) * 100);

  return (
    <Row
      maxWidth={56}
      fillWidth
      border="brand-alpha-weak"
      radius="l"
      paddingX="16"
      paddingY="8"
      gap="16"
      vertical="center"
      horizontal="between"
      wrap
      background="overlay"
      {...flex}
    >
      <Row gap="12" vertical="center" wrap>
        <Pulse size="s" scheme="brand" />
        <Text variant="label-default-s" onBackground="brand-medium">
          Live
        </Text>
        <Text variant="label-default-s" onBackground="neutral-weak">
          ·
        </Text>
        <Text variant="label-default-s">
          $<CountFx value={value} separator="," />
          /mo
        </Text>
        <Text variant="label-default-s" onBackground="neutral-weak">
          ·
        </Text>
        <Text variant="label-default-s" onBackground="neutral-weak">
          {progress}% to next tier
        </Text>
      </Row>
      <Row minWidth={24} flex={1} s={{ hide: true }}>
        <LinearGauge
          fillWidth
          value={progress}
          hue="success"
          height={20}
          line={{ count: 60, width: 1.5, length: 8 }}
        />
      </Row>
      <Button href="#" size="s" variant="secondary" weight="default" rounded>
        View dashboard
      </Button>
    </Row>
  );
};
