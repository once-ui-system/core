I'll write the page now.

```tsx
"use client";

import { useMemo, useState } from "react";
import {
  Background,
  Button,
  Chip,
  Column,
  Heading,
  Icon,
  InlineCode,
  Line,
  Row,
  Scroller,
  SegmentedControl,
  Tag,
  Text,
  Timeline,
  VisuallyHidden,
} from "@once-ui-system/core";
import type { ColorScheme, IconName } from "@once-ui-system/core";
import { CodeBlock } from "@once-ui-system/core/code";

type Channel = "stable" | "beta";
type TimelineState = "default" | "active" | "success" | "danger";

type ReleaseTag = "feature" | "improvement" | "fix" | "breaking" | "security" | "deprecation";

type Snippet = {
  label: string;
  language: string;
  code: string;
};

type Release = {
  version: string;
  date: string;
  isoDate: string;
  channel: Channel;
  title: string;
  summary: string;
  tags: ReleaseTag[];
  highlights: string[];
  snippets?: Snippet[];
};

const TAG_META: Record<ReleaseTag, { label: string; scheme: ColorScheme; icon: IconName }> = {
  feature: { label: "Feature", scheme: "brand", icon: "sparkle" },
  improvement: { label: "Improvement", scheme: "info", icon: "trendUp" },
  fix: { label: "Fix", scheme: "success", icon: "check" },
  breaking: { label: "Breaking", scheme: "danger", icon: "warning" },
  security: { label: "Security", scheme: "warning", icon: "security" },
  deprecation: { label: "Deprecation", scheme: "neutral", icon: "flag" },
};

const ALL_TAGS = Object.keys(TAG_META) as ReleaseTag[];

const RELEASES: Release[] = [
  {
    version: "3.2.0-beta.1",
    date: "Oct 8, 2026",
    isoDate: "2026-10-08",
    channel: "beta",
    title: "Streaming exports and a faster query planner",
    summary:
      "A preview of chunked CSV and Parquet exports, plus a rewritten planner that cuts p95 query latency on wide tables.",
    tags: ["feature", "improvement"],
    highlights: [
      "Exports now stream in 8 MB chunks, so a 40 GB table no longer needs to fit in memory.",
      "The planner reuses join order hints across cached queries, trimming p95 latency by 31% in our benchmarks.",
      "New `--dry-run` flag prints the execution plan without touching any data.",
    ],
    snippets: [
      {
        label: "CLI",
        language: "bash",
        code: "npx stratum export orders --format parquet --stream --chunk-size 8mb",
      },
      {
        label: "SDK",
        language: "typescript",
        code: `import { createClient } from "@stratum/sdk";

const client = createClient({ apiKey: process.env.STRATUM_KEY });

for await (const chunk of client.export("orders", { format: "parquet" })) {
  await upload(chunk);
}`,
      },
    ],
  },
  {
    version: "3.1.2",
    date: "Sep 24, 2026",
    isoDate: "2026-09-24",
    channel: "stable",
    title: "Security patch for signed webhook payloads",
    summary:
      "Fixes a timing difference in signature verification. We recommend every self-hosted deployment upgrades.",
    tags: ["security", "fix"],
    highlights: [
      "Webhook signatures are now compared in constant time.",
      "Rotated secrets take effect immediately instead of after the next cache refresh.",
      "Fixed a crash when a webhook endpoint returned an empty 204 body.",
    ],
    snippets: [
      {
        label: "Upgrade",
        language: "bash",
        code: "npm install @stratum/sdk@3.1.2 && npx stratum doctor",
      },
    ],
  },
  {
    version: "3.1.0",
    date: "Sep 9, 2026",
    isoDate: "2026-09-09",
    channel: "stable",
    title: "Workspaces, scoped API keys and audit exports",
    summary:
      "Teams can now split projects into workspaces, each with its own keys, quotas and audit trail.",
    tags: ["feature", "improvement", "deprecation"],
    highlights: [
      "Scoped API keys limit access to a single workspace and a chosen set of actions.",
      "Audit logs can be exported on a schedule to your own bucket.",
      "The legacy `projectId` option is deprecated and will be removed in 4.0.",
    ],
    snippets: [
      {
        label: "Scoped key",
        language: "typescript",
        code: `const key = await client.keys.create({
  workspace: "growth",
  scopes: ["read:tables", "write:events"],
  expiresIn: "30d",
});`,
      },
    ],
  },
  {
    version: "3.0.0",
    date: "Aug 12, 2026",
    isoDate: "2026-08-12",
    channel: "stable",
    title: "Stratum 3: a new SDK surface",
    summary:
      "Our biggest release this year. The SDK is now ESM-only, fully typed end to end, and ships a single client entry point.",
    tags: ["breaking", "feature", "improvement"],
    highlights: [
      "ESM-only builds. CommonJS consumers should use dynamic `import()`.",
      "`createClient()` replaces the `Stratum` class and the three legacy factories.",
      "Every response type is now generated from the public schema, so types never drift from the API.",
      "Node 18 is the minimum supported runtime.",
    ],
    snippets: [
      {
        label: "Before",
        language: "typescript",
        code: `const stratum = new Stratum({ key, projectId });
const rows = await stratum.tables.get("orders");`,
      },
      {
        label: "After",
        language: "typescript",
        code: `const client = createClient({ apiKey: key });
const rows = await client.tables.get("orders");`,
      },
    ],
  },
  {
    version: "2.9.4",
    date: "Jul 28, 2026",
    isoDate: "2026-07-28",
    channel: "stable",
    title: "Reliability fixes for long-running syncs",
    summary: "Three fixes that resolve stalled syncs on connections that idle for more than ten minutes.",
    tags: ["fix"],
    highlights: [
      "Keep-alive pings now fire during large batch uploads.",
      "Retries use jittered backoff, preventing thundering-herd reconnects.",
      "Fixed an off-by-one in cursor pagination that skipped the last row of a page.",
    ],
  },
  {
    version: "2.9.0",
    date: "Jun 30, 2026",
    isoDate: "2026-06-30",
    channel: "stable",
    title: "Saved views and keyboard shortcuts",
    summary: "Pin the filters you use every day and jump around the dashboard without touching the mouse.",
    tags: ["feature", "improvement"],
    highlights: [
      "Saved views remember filters, sort order and visible columns per teammate.",
      "Press `g` then `t` to jump to tables, or `?` to see every shortcut.",
      "Dark mode contrast now meets WCAG AA across all chart palettes.",
    ],
    snippets: [
      {
        label: "Config",
        language: "json",
        code: `{
  "views": [
    { "name": "Open invoices", "table": "invoices", "filter": "status = 'open'" }
  ]
}`,
      },
    ],
  },
];

const STATE_BY_CHANNEL: Record<Channel, TimelineState> = {
  beta: "active",
  stable: "success",
};

function ReleaseTags({ tags }: { tags: ReleaseTag[] }) {
  return (
    <Row as="ul" gap="8" wrap margin="0" padding="0" aria-label="Release tags">
      {tags.map((tag) => (
        <Row as="li" key={tag} fit>
          <Tag scheme={TAG_META[tag].scheme} prefixIcon={TAG_META[tag].icon} size="s">
            {TAG_META[tag].label}
          </Tag>
        </Row>
      ))}
    </Row>
  );
}

function ReleaseBody({ release }: { release: Release }) {
  return (
    <Column
      as="article"
      aria-labelledby={`release-${release.version}`}
      background="surface"
      border
      radius="l"
      padding="24"
      gap="20"
      fillWidth
      marginBottom="24"
    >
      <Column gap="12">
        <Row gap="12" vertical="center" wrap>
          <Heading as="h2" variant="heading-strong-l" id={`release-${release.version}`}>
            {release.title}
          </Heading>
          {release.channel === "beta" && (
            <Tag scheme="accent" size="s">
              Beta
            </Tag>
          )}
        </Row>
        <Row gap="8" vertical="center" onBackground="neutral-weak">
          <Icon name="calendar" size="xs" />
          <Text as="time" dateTime={release.isoDate} variant="label-default-s" onBackground="neutral-weak">
            {release.date}
          </Text>
        </Row>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {release.summary}
        </Text>
        <ReleaseTags tags={release.tags} />
      </Column>

      <Line />

      <Column as="ul" gap="8" margin="0" paddingLeft="20" style={{ listStyle: "disc" }}>
        {release.highlights.map((item) => (
          <Text as="li" key={item} variant="body-default-m">
            {renderInlineCode(item)}
          </Text>
        ))}
      </Column>

      {release.snippets && release.snippets.length > 0 && (
        <CodeBlock
          fillWidth
          compact
          copyButton
          codes={release.snippets.map((snippet) => ({
            label: snippet.label,
            language: snippet.language,
            code: snippet.code,
          }))}
        />
      )}
    </Column>
  );
}

/** Turns `backticked` fragments into InlineCode, leaving the rest as text. */
function renderInlineCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, index) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <InlineCode key={index}>{part.slice(1, -1)}</InlineCode>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

export default function ChangelogPage() {
  const [channel, setChannel] = useState<"all" | Channel>("all");
  const [activeTags, setActiveTags] = useState<ReleaseTag[]>([]);

  const toggleTag = (tag: ReleaseTag) => {
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    );
  };

  const filtered = useMemo(
    () =>
      RELEASES.filter((release) => {
        const channelMatch = channel === "all" || release.channel === channel;
        const tagMatch = activeTags.length === 0 || activeTags.some((tag) => release.tags.includes(tag));
        return channelMatch && tagMatch;
      }),
    [channel, activeTags],
  );

  const items = filtered.map((release) => ({
    label: (
      <Text as="span" variant="label-strong-m" id={`version-${release.version}`}>
        v{release.version}
      </Text>
    ),
    description: release.date,
    state: STATE_BY_CHANNEL[release.channel],
    children: <ReleaseBody release={release} />,
  }));

  const hasFilters = channel !== "all" || activeTags.length > 0;

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="24" paddingY="64" s={{ paddingY: "40" }}>
      <Background
        position="absolute"
        top="0"
        left="0"
        fill
        pointerEvents="none"
        gradient={{
          display: true,
          colorStart: "brand-alpha-medium",
          colorEnd: "static-transparent",
          x: 50,
          y: 0,
          width: 150,
          height: 60,
          opacity: 50,
        }}
      />
      <Column maxWidth="m" gap="40" zIndex={1}>
        <Column gap="16">
          <Text variant="label-default-s" onBackground="brand-medium">
            Changelog
          </Text>
          <Heading as="h1" variant="display-strong-s">
            What&apos;s new in Stratum
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Every release, newest first. Filter by channel or tag, and copy the snippets straight into
            your terminal or editor.
          </Text>
        </Column>

        <Column gap="16" as="section" aria-label="Filter releases">
          <SegmentedControl
            buttons={[
              { value: "all", label: "All releases" },
              { value: "stable", label: "Stable" },
              { value: "beta", label: "Beta" },
            ]}
            value={channel}
            onChange={(value) => setChannel(value as "all" | Channel)}
          />
          <Scroller>
            <Row as="ul" gap="8" margin="0" padding="0" aria-label="Filter by tag">
              {ALL_TAGS.map((tag) => (
                <Row as="li" key={tag} fit>
                  <Chip
                    label={TAG_META[tag].label}
                    prefixIcon={TAG_META[tag].icon}
                    selected={activeTags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={activeTags.includes(tag)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleTag(tag);
                      }
                    }}
                  />
                </Row>
              ))}
            </Row>
          </Scroller>
          <Row gap="12" vertical="center" horizontal="between" wrap>
            <Text variant="label-default-s" onBackground="neutral-weak" role="status" aria-live="polite">
              Showing {filtered.length} of {RELEASES.length} releases
            </Text>
            {hasFilters && (
              <Button
                variant="tertiary"
                size="s"
                prefixIcon="refresh"
                label="Reset filters"
                onClick={() => {
                  setChannel("all");
                  setActiveTags([]);
                }}
              />
            )}
          </Row>
        </Column>

        {items.length > 0 ? (
          <Timeline items={items} />
        ) : (
          <Column
            background="surface"
            border
            radius="l"
            padding="40"
            gap="12"
            center
            align="center"
          >
            <Icon name="search" size="l" onBackground="neutral-weak" />
            <Heading as="h2" variant="heading-strong-m">
              No releases match
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Try removing a tag or switching back to all channels.
            </Text>
            <VisuallyHidden>Filters returned zero results.</VisuallyHidden>
          </Column>
        )}
      </Column>
    </Column>
  );
}
```