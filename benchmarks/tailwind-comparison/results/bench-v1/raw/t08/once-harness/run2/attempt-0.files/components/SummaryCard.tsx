import { Column, Row, Text, Heading, Icon, Avatar, Tag } from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { type OnboardingData, product } from "@/lib/data";

function Item({
  icon,
  label,
  value,
  placeholder,
}: {
  icon: IconName;
  label: string;
  value: string;
  placeholder: string;
}) {
  const filled = value.trim().length > 0;
  return (
    <Row gap="12" vertical="start">
      <Row fit paddingTop="2">
        <Icon name={icon} size="s" onBackground="neutral-weak" />
      </Row>
      <Column gap="2" flex={1}>
        <Text textVariant="label-default-xs" onBackground="neutral-weak">
          {label}
        </Text>
        <Text
          textVariant="body-default-s"
          onBackground={filled ? "neutral-strong" : "neutral-weak"}
          style={{ overflowWrap: "anywhere" }}
        >
          {filled ? value : placeholder}
        </Text>
      </Column>
    </Row>
  );
}

export function SummaryCard({ data }: { data: OnboardingData }) {
  const invites = data.invites.map((i) => i.trim()).filter(Boolean);
  const themeLabel = data.theme.charAt(0).toUpperCase() + data.theme.slice(1);

  return (
    <Column
      as="aside"
      aria-label="Setup summary"
      background="surface"
      border
      radius="l"
      padding="24"
      gap="20"
      fillWidth
    >
      <Row gap="12" vertical="center">
        <Avatar value={data.name.trim() || undefined} size="m" empty={!data.name.trim()} />
        <Column gap="2" flex={1}>
          <Heading as="h2" textVariant="heading-strong-m" style={{ overflowWrap: "anywhere" }}>
            {data.workspace.trim() || "Your workspace"}
          </Heading>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {product.name} setup summary
          </Text>
        </Column>
        <Tag label="Draft" size="s" tone="neutral" />
      </Row>

      <Column gap="16" borderTop paddingTop="20">
        <Item icon="person" label="Name" value={data.name} placeholder="Not entered yet" />
        <Item icon="mail" label="Work email" value={data.email} placeholder="Not entered yet" />
        <Item
          icon="organization"
          label="Workspace"
          value={data.workspace}
          placeholder="Not named yet"
        />
        <Item
          icon="people"
          label="Team size"
          value={data.teamSize ? `${data.teamSize} people` : ""}
          placeholder="Not chosen yet"
        />
        <Item
          icon="send"
          label="Invites"
          value={invites.join(", ")}
          placeholder="No teammates invited"
        />
        <Item
          icon="settings"
          label="Preferences"
          value={`${themeLabel} theme · Weekly digest ${data.digest ? "on" : "off"}`}
          placeholder=""
        />
      </Column>
    </Column>
  );
}
