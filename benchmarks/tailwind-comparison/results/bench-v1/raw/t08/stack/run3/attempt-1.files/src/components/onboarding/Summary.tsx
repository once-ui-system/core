import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import {
  type OnboardingData,
  teamSizeOptions,
  themeOptions,
} from "@/lib/onboarding-data";

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <Column gap="4">
      <Text as="dt" variant="label-default-xs" onBackground="neutral-weak">
        {label}
      </Text>
      <Text
        as="dd"
        variant="body-default-m"
        onBackground={value ? "neutral-strong" : "neutral-weak"}
        style={{ margin: 0, overflowWrap: "anywhere" }}
      >
        {value || "Not provided yet"}
      </Text>
    </Column>
  );
}

export function Summary({
  data,
  skipped,
}: {
  data: OnboardingData;
  skipped: boolean;
}) {
  const teamLabel = teamSizeOptions.find((o) => o.value === data.teamSize)?.label;
  const themeLabel = themeOptions.find((o) => o.value === data.theme)?.label;
  const invites = data.invites.map((v) => v.trim()).filter(Boolean);

  return (
    <Column
      as="aside"
      aria-label="Your setup so far"
      background="surface"
      border
      radius="l"
      padding="24"
      gap="24"
      style={{ alignSelf: "start" }}
    >
      <Column gap="4">
        <Heading as="h2" variant="heading-strong-m">
          Your setup so far
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          This updates as you fill in each step.
        </Text>
      </Column>

      <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
        <SummaryRow label="Name" value={data.name.trim()} />
        <SummaryRow label="Work email" value={data.email.trim()} />
        <SummaryRow label="Workspace" value={data.workspace.trim()} />
        <SummaryRow label="Team size" value={teamLabel} />
        <Column gap="4">
          <Text as="dt" variant="label-default-xs" onBackground="neutral-weak">
            Invitations
          </Text>
          <dd style={{ margin: 0 }}>
            {invites.length > 0 ? (
              <Row gap="8" wrap>
                {invites.map((e) => (
                  <Tag key={e} size="m" label={e} />
                ))}
              </Row>
            ) : (
              <Text variant="body-default-m" onBackground="neutral-weak">
                {skipped ? "Skipped for now" : "No one invited yet"}
              </Text>
            )}
          </dd>
        </Column>
        <SummaryRow label="Theme" value={themeLabel} />
        <SummaryRow label="Weekly digest" value={data.digest ? "On" : "Off"} />
      </dl>
    </Column>
  );
}
