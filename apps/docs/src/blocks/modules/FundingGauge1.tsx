"use client";

import { Background, Column, CountFx, Icon, Row, Text } from "@once-ui-system/core";
import { LinearGauge } from "@once-ui-system/core/data";

const MAX_FUNDING = 15000;

const milestones = [
  { label: "$3k", target: 3000, achieved: true },
  { label: "$6k", target: 6000, achieved: true },
  { label: "$9k", target: 9000, achieved: true },
  { label: "$12k", target: 12000, achieved: false },
  { label: "$15k", target: 15000, achieved: false, isVision: true },
];

export const FundingGauge1 = (flex: React.ComponentProps<typeof Column>) => {
  const monthlyTotal = 8740;
  const progress = Math.min(100, Math.round((monthlyTotal / MAX_FUNDING) * 100));
  const nextMilestone = milestones.find((m) => !m.achieved);

  return (
    <Column
      fillWidth
      maxWidth={48}
      horizontal="center"
      padding="l"
      border="brand-alpha-strong"
      background="brand-alpha-strong"
      radius="l"
      overflow="hidden"
      {...flex}
    >
      <Row
        data-scaling="90"
        position="absolute"
        left="0"
        top="0"
        border="brand-alpha-strong"
        background="brand-alpha-weak"
        height="8"
        width="8"
        translateX="-100%"
        translateY="-100%"
      />
      <Row
        data-scaling="90"
        position="absolute"
        right="0"
        bottom="0"
        border="brand-alpha-strong"
        background="brand-alpha-weak"
        height="8"
        width="8"
        translateX="100%"
        translateY="100%"
      />
      <Background
        position="absolute"
        left="0"
        top="0"
        radius="l"
        gradient={{
          display: true,
          colorStart: "page-background",
          width: 200,
          height: 150,
          y: 100,
        }}
      />

      <Column fillWidth gap="16">
        <Column fillWidth gap="16">
          <Row fillWidth minHeight="32" position="relative">
            {milestones.map((milestone) => {
              const position = (milestone.target / MAX_FUNDING) * 100;

              return (
                <Column
                  key={milestone.label}
                  position="absolute"
                  style={{
                    left: `${position}%`,
                    transform: "translateX(-50%)",
                    top: 0,
                  }}
                  gap="4"
                  horizontal="center"
                >
                  <Text
                    variant="code-default-xs"
                    onBackground={milestone.achieved ? "brand-medium" : "neutral-weak"}
                    wrap="nowrap"
                  >
                    {milestone.label}
                  </Text>
                  {milestone.isVision && !milestone.achieved ? (
                    <Text variant="code-default-xs" onBackground="neutral-weak" marginY="1">
                      ?
                    </Text>
                  ) : milestone.achieved ? (
                    <Icon name="check" size="xs" onBackground="brand-medium" />
                  ) : (
                    <Row width="2" height="16" radius="full" background="neutral-alpha-medium" />
                  )}
                </Column>
              );
            })}
          </Row>

          <LinearGauge
            fillWidth
            height={24}
            value={progress}
            hue={[160, 360]}
            line={{ count: 120, width: 1.5, length: 10 }}
          />
        </Column>

        <Row fillWidth horizontal="between" vertical="center" wrap gap="12" paddingX="4">
          <Text variant="label-default-s" onBackground="brand-medium">
            $<CountFx value={monthlyTotal} separator="," />
            /mo ecosystem funding
          </Text>
          {nextMilestone && (
            <Text variant="label-default-s" onBackground="neutral-weak">
              {progress}% to {nextMilestone.label}
            </Text>
          )}
        </Row>
      </Column>
    </Column>
  );
};
