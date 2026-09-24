import type { IconName } from "@once-ui-system/core";
import { Column, Grid, Icon, Row, Text } from "@once-ui-system/core";
import { LinearGauge } from "@once-ui-system/core/data";

interface Achievement {
  label: string;
  icon: IconName;
  unlocked: boolean;
  detail: string;
}

const achievements: Achievement[] = [
  { label: "First project", icon: "check", unlocked: true, detail: "Created" },
  { label: "5 projects shipped", icon: "medal", unlocked: true, detail: "Delivered" },
  { label: "10-person team", icon: "starFill", unlocked: true, detail: "Growing" },
  { label: "First integration", icon: "bolt", unlocked: true, detail: "Connected" },
  { label: "100 automations", icon: "rocket", unlocked: false, detail: "72 / 100" },
  { label: "1-year streak", icon: "flag", unlocked: false, detail: "118 / 365 days" },
];

export const Achievements = (flex: React.ComponentProps<typeof Column>) => {
  const unlockedCount = achievements.filter((item) => item.unlocked).length;
  const completion = Math.round((unlockedCount / achievements.length) * 100);
  const nextAchievement = achievements.find((item) => !item.unlocked);

  return (
    <Column maxWidth={28} fillWidth radius="l" border padding="24" gap="20" {...flex}>
      <Row fillWidth horizontal="between" vertical="center">
        <Column gap="2">
          <Text variant="heading-strong-s">Achievements</Text>
          <Text variant="label-default-s" onBackground="neutral-weak">
            Milestones unlocked as you grow
          </Text>
        </Column>
        <Column horizontal="end" gap="2">
          <Text variant="code-default-s" onBackground="brand-medium">
            {unlockedCount}/{achievements.length}
          </Text>
          <Text variant="label-default-xs" onBackground="neutral-weak">
            {completion}% complete
          </Text>
        </Column>
      </Row>
      <Grid columns="3" s={{ columns: 2 }} gap="8" fillWidth>
        {achievements.map((item) => (
          <Column
            key={item.label}
            aspectRatio="1"
            radius="m"
            center
            gap="8"
            padding="12"
            border={item.unlocked ? "brand-alpha-medium" : "neutral-alpha-weak"}
            borderStyle={item.unlocked ? "solid" : "dashed"}
            background={item.unlocked ? "brand-alpha-weak" : "neutral-alpha-weak"}
          >
            <Icon
              name={item.unlocked ? item.icon : "lockClosed"}
              size="m"
              onBackground={item.unlocked ? "brand-medium" : "neutral-weak"}
            />
            <Text
              align="center"
              variant="label-default-xs"
              onBackground={item.unlocked ? "neutral-strong" : "neutral-weak"}
              wrap="balance"
            >
              {item.label}
            </Text>
            <Text
              align="center"
              variant="code-default-xs"
              onBackground={item.unlocked ? "brand-weak" : "neutral-weak"}
            >
              {item.detail}
            </Text>
          </Column>
        ))}
      </Grid>
      {nextAchievement && (
        <Column fillWidth padding="16" gap="12" radius="m" background="neutral-alpha-weak" border>
          <Row fillWidth horizontal="between" vertical="center" gap="12">
            <Row gap="8" vertical="center">
              <Icon name={nextAchievement.icon} size="s" onBackground="brand-medium" />
              <Text variant="label-strong-s">Next: {nextAchievement.label}</Text>
            </Row>
            <Text variant="code-default-xs" onBackground="neutral-weak">
              {nextAchievement.detail}
            </Text>
          </Row>
          <LinearGauge
            fillWidth
            value={72}
            height={8}
            hue="success"
            line={{ count: 40, width: 1.5, length: 8 }}
          />
        </Column>
      )}
    </Column>
  );
};
