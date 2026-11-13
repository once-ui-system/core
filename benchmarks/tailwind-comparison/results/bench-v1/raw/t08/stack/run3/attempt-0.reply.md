Now I'll write the final Summary and the welcome page.

```tsx src/components/onboarding/Summary.tsx
import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import {
  type OnboardingData,
  teamSizeOptions,
  themeOptions,
} from "@/lib/onboarding";

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
```

```tsx src/app/welcome/page.tsx
import {
  Button,
  Column,
  Heading,
  Icon,
  Row,
  Text,
} from "@once-ui-system/core";
import { checklist, demoUser, product } from "@/lib/onboarding";

export const metadata = {
  title: "Welcome to Lumen",
  description: "Your workspace is ready. Here is what to do next.",
};

export default function Page() {
  const firstName = demoUser.name.split(" ")[0];

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="40">
      <Column fillWidth maxWidth="s" gap="32">
        <Column gap="16" horizontal="start">
          <Row
            center
            width="48"
            height="48"
            radius="full"
            background="success-alpha-weak"
            onBackground="success-strong"
          >
            <Icon name="check" size="m" />
          </Row>
          <Text variant="label-default-s" onBackground="brand-medium">
            Setup complete
          </Text>
          <Heading as="h1" variant="display-strong-s">
            You're all set, {firstName}
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Your {product.name} workspace is ready. Here are four things worth
            doing in your first session.
          </Text>
        </Column>

        <Column
          as="section"
          aria-labelledby="checklist-heading"
          background="surface"
          border
          radius="l"
          padding="24"
          gap="24"
        >
          <Heading as="h2" id="checklist-heading" variant="heading-strong-l">
            Next steps
          </Heading>
          <ol
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {checklist.map((item, i) => (
              <li key={item.title}>
                <Row gap="16" vertical="start">
                  <Row
                    center
                    width="40"
                    height="40"
                    radius="m"
                    background="brand-alpha-weak"
                    onBackground="brand-strong"
                    style={{ flexShrink: 0 }}
                  >
                    <Icon name={item.icon} size="s" />
                  </Row>
                  <Column gap="4" flex={1}>
                    <Text variant="heading-strong-s">
                      {i + 1}. {item.title}
                    </Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {item.description}
                    </Text>
                  </Column>
                </Row>
              </li>
            ))}
          </ol>
        </Column>

        <Row gap="12" wrap>
          <Button href="/app" label="Open my workspace" suffixIcon="arrowRight" />
          <Button
            href="/"
            variant="secondary"
            label="Back to setup"
            prefixIcon="arrowLeft"
          />
        </Row>
      </Column>
    </Column>
  );
}
```