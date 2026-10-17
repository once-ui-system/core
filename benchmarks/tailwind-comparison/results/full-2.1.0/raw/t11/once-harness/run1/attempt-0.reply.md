That confirmed the `Timeline` shape. Here is the page.

```tsx
"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Chip,
  Column,
  Heading,
  InlineCode,
  Row,
  Tag,
  Text,
  Timeline,
} from "@once-ui-system/core";
import { CodeBlock } from "@once-ui-system/core/code";

type TagKind = "feature" | "improvement" | "fix" | "breaking" | "security";

type ReleaseSnippet = {
  label: string;
  language: string;
  code: string;
};

type Release = {
  version: string;
  date: string;
  dateTime: string;
  title: string;
  summary: string;
  tags: TagKind[];
  changes: string[];
  snippet?: ReleaseSnippet;
};

const TAG_META: Record<
  TagKind,
  { label: string; scheme: "brand" | "success" | "warning" | "danger" | "info" }
> = {
  feature: { label: "Feature", scheme: "brand" },
  improvement: { label: "Improvement", scheme: "info" },
  fix: { label: "Fix", scheme: "success" },
  breaking: { label: "Breaking", scheme: "danger" },
  security: { label: "Security", scheme: "warning" },
};

const TAG_ORDER: TagKind[] = ["feature", "improvement", "fix", "breaking", "security"];

const RELEASES: Release[] = [
  {
    version: "v3.2.0",
    date: "Oct 7, 2026",
    dateTime: "2026-10-07",
    title: "Scheduled exports and streaming webhooks",
    summary:
      "Reports can now run on a schedule, and webhook deliveries stream as they happen instead of arriving in batches.",
    tags: ["feature", "improvement"],
    changes: [
      "Schedule CSV and Parquet exports hourly, daily or weekly, with delivery to S3-compatible storage.",
      "Webhook events are delivered within about 400 ms of the triggering action, down from a 30 s batch window.",
      "The delivery log now shows response bodies up to 8 KB and lets you replay a single event.",
    ],
    snippet: {
      label: "Create a schedule",
      language: "typescript",
      code: `import { Relay } from "@relay/sdk";

const relay = new Relay({ apiKey: process.env.RELAY_API_KEY! });

const schedule = await relay.exports.schedule({
  report: "weekly-active-accounts",
  format: "parquet",
  cron: "0 6 * * MON",
  destination: { type: "s3", bucket: "acme-analytics" },
});

console.log(schedule.nextRunAt);`,
    },
  },
  {
    version: "v3.1.2",
    date: "Sep 19, 2026",
    dateTime: "2026-09-19",
    title: "Token rotation hardening",
    summary:
      "A security patch that closes a window in which a revoked API key could still authenticate for a few seconds.",
    tags: ["security", "fix"],
    changes: [
      "Revoked API keys are now rejected at the edge immediately, with no cache delay.",
      "Fixed a race where two simultaneous key rotations could leave both keys valid.",
      "Audit log entries now include the originating IP and user agent for key events.",
    ],
  },
  {
    version: "v3.1.0",
    date: "Aug 26, 2026",
    dateTime: "2026-08-26",
    title: "Typed client and cursor pagination",
    summary:
      "The SDK ships generated types for every endpoint, and list endpoints move to cursor-based pagination.",
    tags: ["feature", "improvement"],
    changes: [
      "Every response and request body is now fully typed in the TypeScript SDK.",
      "List endpoints accept a cursor and limit; offset pagination is deprecated and will be removed in v4.",
      "Added an async iterator helper so you can loop over every page without managing cursors.",
    ],
    snippet: {
      label: "Iterate every page",
      language: "typescript",
      code: `for await (const account of relay.accounts.list({ limit: 100 })) {
  console.log(account.id, account.plan);
}`,
    },
  },
  {
    version: "v3.0.0",
    date: "Jul 8, 2026",
    dateTime: "2026-07-08",
    title: "Relay 3: a new core",
    summary:
      "A ground-up rewrite of the request pipeline with a smaller footprint, plus a few breaking changes to configuration.",
    tags: ["breaking", "feature", "improvement"],
    changes: [
      "Request pipeline rewritten; median latency drops from 142 ms to 61 ms.",
      "The `region` option is replaced by `regions`, which accepts an ordered list for failover.",
      "Node 18 is no longer supported. The minimum is Node 20.",
      "The default timeout is now 10 s instead of 30 s.",
    ],
    snippet: {
      label: "Migrate your config",
      language: "diff",
      code: `  const relay = new Relay({
    apiKey: process.env.RELAY_API_KEY!,
-   region: "eu-west",
+   regions: ["eu-west", "us-east"],
+   timeoutMs: 30_000,
  });`,
    },
  },
  {
    version: "v2.9.4",
    date: "May 30, 2026",
    dateTime: "2026-05-30",
    title: "Reliability fixes",
    summary: "A round of small fixes for retries, idempotency and the dashboard.",
    tags: ["fix"],
    changes: [
      "Idempotency keys are now honoured on retried POST requests after a network timeout.",
      "Fixed the usage chart showing the previous month's total on the first day of a billing cycle.",
      "Resolved an issue where CSV exports containing emoji were truncated.",
    ],
  },
  {
    version: "v2.9.0",
    date: "Apr 14, 2026",
    dateTime: "2026-04-14",
    title: "Team roles and audit trail",
    summary: "Finer-grained access for larger teams, with a searchable record of who changed what.",
    tags: ["feature", "security"],
    changes: [
      "New Viewer, Developer and Admin roles with per-project scoping.",
      "Searchable audit trail with 12 months of retention on paid plans.",
      "SSO enforcement can now be set per domain instead of per workspace.",
    ],
    snippet: {
      label: "Install the previous release",
      language: "bash",
      code: `npm install @relay/sdk@2.9.0`,
    },
  },
];

const INSTALL_SNIPPET = `npm install @relay/sdk@latest`;

export default function ChangelogPage() {
  const [selected, setSelected] = useState<TagKind | "all">("all");

  const visible = useMemo(
    () =>
      selected === "all" ? RELEASES : RELEASES.filter((release) => release.tags.includes(selected)),
    [selected],
  );

  const items = visible.map((release, index) => ({
    label: (
      <Row gap="12" vertical="center" wrap>
        <Text as="span" variant="label-strong-l" onBackground="neutral-strong">
          {release.version}
        </Text>
        <Text
          as="time"
          variant="label-default-s"
          onBackground="neutral-weak"
          dateTime={release.dateTime}
        >
          {release.date}
        </Text>
        {index === 0 && selected === "all" && (
          <Tag scheme="success" size="s" label="Latest" />
        )}
      </Row>
    ),
    state: index === 0 && selected === "all" ? ("active" as const) : ("default" as const),
    children: (
      <Column
        as="article"
        aria-label={`Release ${release.version}`}
        background="surface"
        border
        radius="l"
        padding="24"
        gap="16"
        fillWidth
        marginBottom="24"
      >
        <Column gap="8">
          <Heading as="h2" variant="heading-strong-l">
            {release.title}
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {release.summary}
          </Text>
        </Column>

        <Row gap="8" wrap role="list" aria-label="Release tags">
          {release.tags.map((tag) => (
            <Row key={tag} role="listitem" fitWidth>
              <Tag scheme={TAG_META[tag].scheme} size="m" label={TAG_META[tag].label} />
            </Row>
          ))}
        </Row>

        <Column as="ul" gap="8" margin="0" paddingLeft="20" style={{ listStyle: "disc" }}>
          {release.changes.map((change) => (
            <Text as="li" key={change} variant="body-default-m" onBackground="neutral-medium">
              {change}
            </Text>
          ))}
        </Column>

        {release.snippet && (
          <Column gap="8" fillWidth>
            <Text variant="label-default-s" onBackground="neutral-weak">
              {release.snippet.label}
            </Text>
            <CodeBlock
              fillWidth
              copyButton
              codes={[
                {
                  code: release.snippet.code,
                  language: release.snippet.language,
                  label: release.snippet.label,
                },
              ]}
            />
          </Column>
        )}
      </Column>
    ),
  }));

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="24" paddingY="64" s={{ paddingY: "40" }}>
      <Column maxWidth="m" fillWidth gap="40">
        <Column as="header" gap="16">
          <Text variant="label-default-s" onBackground="brand-medium">
            Changelog
          </Text>
          <Heading as="h1" variant="display-strong-s">
            What&apos;s new in Relay
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Every release of the Relay API and SDK, newest first. Breaking changes are always
            flagged, and most releases include a snippet you can copy straight into your project.
          </Text>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="12">
          <Text variant="label-default-s" onBackground="neutral-weak">
            Get the latest version
          </Text>
          <CodeBlock
            fillWidth
            copyButton
            codes={[{ code: INSTALL_SNIPPET, language: "bash", label: "npm" }]}
          />
          <Text variant="body-default-s" onBackground="neutral-weak">
            Requires Node 20 or newer. Upgrading from v2? Check the releases tagged{" "}
            <InlineCode>Breaking</InlineCode> first.
          </Text>
        </Column>

        <Column gap="12" as="section" aria-labelledby="filter-heading">
          <Text as="h2" id="filter-heading" variant="label-default-s" onBackground="neutral-weak">
            Filter by tag
          </Text>
          <Row gap="8" wrap role="group" aria-label="Filter releases by tag">
            <Chip
              label="All"
              selected={selected === "all"}
              onClick={() => setSelected("all")}
              role="button"
              tabIndex={0}
              aria-pressed={selected === "all"}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelected("all");
                }
              }}
            />
            {TAG_ORDER.map((tag) => (
              <Chip
                key={tag}
                label={TAG_META[tag].label}
                selected={selected === tag}
                onClick={() => setSelected(tag)}
                role="button"
                tabIndex={0}
                aria-pressed={selected === tag}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelected(tag);
                  }
                }}
              />
            ))}
          </Row>
          <Text variant="body-default-s" onBackground="neutral-weak" role="status" aria-live="polite">
            Showing {visible.length} of {RELEASES.length} releases
          </Text>
        </Column>

        {visible.length > 0 ? (
          <Timeline items={items} size="m" fillWidth />
        ) : (
          <Column
            background="surface"
            border
            radius="l"
            padding="40"
            gap="16"
            horizontal="center"
            align="center"
          >
            <Heading as="h2" variant="heading-strong-m">
              No releases match this tag
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Try a different tag or clear the filter to see every release.
            </Text>
            <Button variant="secondary" size="s" onClick={() => setSelected("all")}>
              Show all releases
            </Button>
          </Column>
        )}
      </Column>
    </Column>
  );
}
```