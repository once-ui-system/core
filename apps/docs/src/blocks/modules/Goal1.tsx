import { Background, Column, Icon, Row, Text } from "@once-ui-system/core";
import { LinearGauge, RadialGauge } from "@once-ui-system/core/data";

interface Milestone {
  label: string;
  achieved: boolean;
}

const milestones: Milestone[] = [
  { label: "$10k", achieved: true },
  { label: "$20k", achieved: true },
  { label: "$30k", achieved: false },
  { label: "$40k", achieved: false },
];

export const Goal1 = (flex: React.ComponentProps<typeof Column>) => {
  const progress = 62;

  return (
    <Column maxWidth={24} fillWidth radius="l" border overflow="hidden" {...flex}>
      <Column
        fillWidth
        position="relative"
        horizontal="center"
        gap="4"
        paddingTop="32"
        paddingBottom="24"
        paddingX="24"
      >
        <Background
          position="absolute"
          top="0"
          left="0"
          gradient={{
            display: true,
            x: 50,
            y: -20,
            width: 80,
            height: 80,
            colorStart: "brand-solid-medium",
          }}
          mask={{ x: 50, y: 0, radius: 40 }}
        />
        <Row
          textVariant="label-default-s"
          onBackground="brand-medium"
          gap="8"
          vertical="center"
          marginBottom="8"
        >
          <Icon name="flag" size="xs" />
          Q3 revenue goal
        </Row>
        <RadialGauge
          width={200}
          height={200}
          value={progress}
          hue="success"
          unit="%"
          line={{ count: 40, width: 2, length: 18 }}
        />
        <Text variant="heading-strong-l" marginTop="12">
          $24,800
        </Text>
        <Text variant="label-default-s" onBackground="neutral-weak">
          of $40,000 target
        </Text>
      </Column>
      <Column fillWidth borderTop padding="24" gap="16">
        <LinearGauge
          fillWidth
          height={8}
          value={progress}
          hue="success"
          line={{ count: 60, width: 1.5, length: 8 }}
        />
        <Row fillWidth horizontal="between">
          {milestones.map((milestone) => (
            <Column key={milestone.label} gap="8" horizontal="center">
              <Text
                variant="code-default-xs"
                onBackground={milestone.achieved ? "brand-medium" : "neutral-weak"}
              >
                {milestone.label}
              </Text>
              {milestone.achieved ? (
                <Icon name="check" size="xs" onBackground="brand-medium" />
              ) : (
                <Row width="2" height="12" radius="full" background="neutral-alpha-medium" />
              )}
            </Column>
          ))}
        </Row>
      </Column>
    </Column>
  );
};
