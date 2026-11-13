"use client";

import { Button, StatusIndicator, Row, Text } from "@once-ui-system/core";
import { CountFx } from "@once-ui-system/fx";
import { LinearGauge } from "@once-ui-system/core/data";

export const StatusBar = (flex: React.ComponentProps<typeof Row>) => {
  const value = 128400;
  const target = 200000;
  const progress = Math.round((value / target) * 100);

  return (
    <Row
      maxWidth="56rem"
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
        <StatusIndicator pulse size="s" />
        <Text textVariant="label-default-s" onBackground="brand-medium">
          Live
        </Text>
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          ·
        </Text>
        <Text textVariant="label-default-s">
          $<CountFx value={value} separator="," />
          /mo
        </Text>
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          ·
        </Text>
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          {progress}% to next tier
        </Text>
      </Row>
      <Row minWidth="24rem" flex={1} s={{ hide: true }}>
        <LinearGauge
          fillWidth
          value={progress}
          tone="success"
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
