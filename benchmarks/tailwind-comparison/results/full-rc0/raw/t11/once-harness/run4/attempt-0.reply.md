A `Chip` is a div with `onClick`, which isn't keyboard-accessible by itself. For the filter I'll use `ToggleButton` inside a `Row wrap` with `aria-pressed` semantics, and a `role="group"` label. I'll also write a small custom copy button for the install commands, since `CodeBlock` already provides its own copy button for the snippets.

Writing the file now.

```tsx
"use client";

import {
  Button,
  Column,
  Heading,
  Icon,
  Line,
  Row,
  Tag,
  Text,
  Timeline,
  ToggleButton,
  VisuallyHidden,
  useToast,
} from "@once-ui-system/core";
import { CodeBlock } from "@once-ui-system/core/code";
import type { ColorScheme, IconName } from "@once-ui-system/core";
import { useCallback, useMemo, useState } from "react";

type TagKey = "feature" | "improvement" | "fix" | "breaking" | "security" | "deprecation";

interface TagMeta {
  label: string;
  scheme: ColorScheme;
  icon: IconName;
}

const TAGS: Record<TagKey, TagMeta> = {
  feature: { label: "Feature", scheme: "brand", icon: "sparkle" },
  improvement: { label: "Improvement", scheme: "info", icon: "trendUp" },
  fix: { label: "Fix", scheme: "success", icon: "check" },
  breaking: { label: "Breaking", scheme: "danger", icon: "warning" },
  security: { label: "Security", scheme: "warning", icon: "security" },
  deprecation: { label: "Deprecation", scheme: "neutral", icon: "flag" },
};

interface Snippet {
  label: string;
  language: string;
  code: string;
}

interface Release {
  version: string;
  date: string;
  isoDate: string;
  title: string;
  summary: string;
  tags: TagKey[];
  changes: string[];
  snippet?: Snippet;
}

const RELEASES: Release[] = [
  {
    version: "3.4.0",
    date: "March 18, 2025",
    isoDate: "2025-03-18",
    title: "Streaming exports and scoped API keys",
    summary:
      "Large exports no longer need to fit in memory, and API keys can finally be limited to a single project.",
    tags: ["feature", "security"],
    changes: [
      "Added client.exports.stream() which yields rows as NDJSON chunks, so a 40M-row export uses a constant ~60 MB of memory.",
      "API keys can now be scoped to one project and a list of permissions. Existing keys keep full access.",
      "Webhook deliveries include a signed timestamp header to protect against replay attacks.",
    ],
    snippet: {
      label: "Stream an export",
      language: "typescript",
      code: `import { createClient } from "@northwind/sdk";

const client = createClient({ apiKey: process.env.NORTHWIND_KEY! });

for await (const chunk of client.exports.stream({ table: "events" })) {
  await sink.write(chunk.rows);
}`,
    },
  },
  {
    version: "3.3.2",
    date: "March 4, 2025",
    isoDate: "2025-03-04",
    title: "Pagination and timezone fixes",
    summary: "A small patch that resolves two long-standing reports from the community.",
    tags: ["fix"],
    changes: [
      "Fixed cursor pagination skipping a row when two records shared the same created_at timestamp.",
      "Scheduled jobs now respect daylight saving transitions in the project timezone.",
      "The CLI no longer prints a stack trace when the network is offline; it shows a short hint instead.",
    ],
  },
  {
    version: "3.3.0",
    date: "February 11, 2025",
    isoDate: "2025-02-11",
    title: "Faster queries and a new retry policy",
    summary:
      "Query planning was rewritten, cutting p95 latency on dashboards by roughly a third.",
    tags: ["improvement", "feature"],
    changes: [
      "Query planner now caches compiled plans per workspace, reducing p95 latency from 410 ms to 270 ms.",
      "New retry option with exponential backoff and jitter, enabled by default for idempotent requests.",
      "Dashboard filters remember their last value per user.",
    ],
    snippet: {
      label: "Configure retries",
      language: "typescript",
      code: `const client = createClient({
  apiKey: process.env.NORTHWIND_KEY!,
  retry: {
    attempts: 4,
    backoff: "exponential",
    jitter: true,
  },
});`,
    },
  },
  {
    version: "3.2.1",
    date: "January 22, 2025",
    isoDate: "2025-01-22",
    title: "Patch for session token rotation",
    summary: "Fixes a rare race that could sign users out when two tabs refreshed at once.",
    tags: ["fix", "security"],
    changes: [
      "Refresh tokens are now rotated atomically, preventing concurrent refreshes from invalidating each other.",
      "Updated transitive dependencies to address two moderate advisories.",
    ],
  },
  {
    version: "3.2.0",
    date: "December 9, 2024",
    isoDate: "2024-12-09",
    title: "Workspaces and a leaner config format",
    summary:
      "Teams can group projects into workspaces. Configuration moved to a single typed file.",
    tags: ["feature", "breaking"],
    changes: [
      "Introduced workspaces with shared members, billing and audit logs.",
      "Breaking: northwind.json is replaced by northwind.config.ts. Run the codemod to migrate automatically.",
      "Audit log entries now include the originating IP and user agent.",
    ],
    snippet: {
      label: "Migrate your config",
      language: "bash",
      code: `npx @northwind/codemod migrate-config ./northwind.json
# creates northwind.config.ts and keeps a backup at northwind.json.bak`,
    },
  },
  {
    version: "3.1.0",
    date: "October 28, 2024",
    isoDate: "2024-10-28",
    title: "Deprecating the v1 REST endpoints",
    summary: "The legacy /v1 API enters its sunset window. Plan to move to /v2 before July.",
    tags: ["deprecation", "improvement"],
    changes: [
      "All /v1 endpoints now return a Sunset header with the removal date of July 1, 2025.",
      "The /v2 list endpoints accept a fields parameter to return only the properties you need.",
      "Reduced average response size by 28% for list endpoints through field selection.",
    ],
    snippet: {
      label: "Select only the fields you need",
      language: "bash",
      code: `curl "https://api.northwind.dev/v2/projects?fields=id,name,updated_at" \\
  -H "Authorization: Bearer $NORTHWIND_KEY"`,
    },
  },
  {
    version: "3.0.0",
    date: "September 3, 2024",
    isoDate: "2024-09-03",
    title: "Northwind 3: a new SDK foundation",
    summary:
      "A ground-up rewrite of the SDK with first-class TypeScript types, ESM-only builds and a smaller footprint.",
    tags: ["feature", "breaking"],
    changes: [
      "Breaking: the SDK is now ESM-only and requires Node 18 or newer.",
      "Breaking: createClient replaces the default export. Method names are unchanged.",
      "Bundle size dropped from 48 kB to 17 kB gzipped thanks to tree-shakable modules.",
    ],
    snippet: {
      label: "Install v3",
      language: "bash",
      code: "npm install @northwind/sdk@3",
    },
  },
];

const ALL = "all" as const;
type Filter = typeof ALL | TagKey;

function formatCount(n: number): string {
  return n === 1 ? "1 release" : `${n} releases`;
}

function ReleaseCard({ release, latest }: { release: Release; latest: boolean }) {
  const headingId = `release-${release.version.replace(/\./g, "-")}`;

  return (
    <Column
      as="article"
      aria-labelledby={headingId}
      fillWidth
      gap="20"
      paddingBottom="40"
    >
      <Column gap="8">
        <Row gap="12" vertical="center" wrap>
          <Heading as="h2" id={headingId} variant="heading-strong-xl">
            v{release.version}
          </Heading>
          {latest && (
            <Tag scheme="brand" size="s">
              Latest
            </Tag>
          )}
          <Text
            as="time"
            dateTime={release.isoDate}
            variant="label-default-s"
            onBackground="neutral-weak"
          >
            {release.date}
          </Text>
        </Row>
        <Text variant="heading-default-m" onBackground="neutral-strong">
          {release.title}
        </Text>
        <Text variant="body-default-m" onBackground="neutral-weak" wrap="pretty">
          {release.summary}
        </Text>
      </Column>

      <Row gap="8" wrap role="list" aria-label={`Tags for version ${release.version}`}>
        {release.tags.map((key) => (
          <Row key={key} role="listitem">
            <Tag scheme={TAGS[key].scheme} size="m" prefixIcon={TAGS[key].icon}>
              {TAGS[key].label}
            </Tag>
          </Row>
        ))}
      </Row>

      <Column as="ul" gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
        {release.changes.map((change) => (
          <Row as="li" key={change} gap="12" vertical="start">
            <Row paddingTop="4">
              <Icon name="check" size="xs" onBackground="brand-medium" />
            </Row>
            <Text variant="body-default-m" wrap="pretty">
              {change}
            </Text>
          </Row>
        ))}
      </Column>

      {release.snippet && (
        <Column gap="8" fillWidth>
          <Text variant="label-default-s" onBackground="neutral-weak">
            {release.snippet.label}
          </Text>
          <CodeBlock
            fillWidth
            compact
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
  );
}

export default function ChangelogPage() {
  const [filter, setFilter] = useState<Filter>(ALL);
  const { addToast } = useToast();

  const counts = useMemo(() => {
    const map = new Map<TagKey, number>();
    for (const r of RELEASES) {
      for (const t of r.tags) map.set(t, (map.get(t) ?? 0) + 1);
    }
    return map;
  }, []);

  const visible = useMemo(
    () => (filter === ALL ? RELEASES : RELEASES.filter((r) => r.tags.includes(filter))),
    [filter],
  );

  const items = useMemo(
    () =>
      visible.map((release) => ({
        state: release.version === RELEASES[0].version ? ("active" as const) : ("default" as const),
        label: undefined,
        children: (
          <ReleaseCard release={release} latest={release.version === RELEASES[0].version} />
        ),
      })),
    [visible],
  );

  const copyInstall = useCallback(async () => {
    try {
      await navigator.clipboard.writeText("npm install @northwind/sdk@latest");
      addToast({ variant: "success", message: "Install command copied" });
    } catch {
      addToast({ variant: "danger", message: "Could not access the clipboard" });
    }
  }, [addToast]);

  const filterLabel = filter === ALL ? "all releases" : `${TAGS[filter].label} releases`;

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="24" paddingY="64" s={{ paddingY: "40" }}>
      <Column maxWidth="m" gap="40">
        <Column gap="16" as="header">
          <Text variant="label-default-s" onBackground="brand-medium">
            Northwind SDK
          </Text>
          <Heading as="h1" variant="display-strong-s">
            Changelog
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            Every release of the Northwind SDK, newest first. Subscribe to the feed or pin a
            version, and read the migration notes before upgrading across a major release.
          </Text>
          <Row gap="12" vertical="center" wrap>
            <Button
              variant="secondary"
              size="m"
              prefixIcon="copy"
              label="Copy install command"
              onClick={copyInstall}
            />
            <Button
              variant="tertiary"
              size="m"
              suffixIcon="arrowUpRight"
              label="Upgrade guide"
              href="#release-3-0-0"
            />
          </Row>
        </Column>

        <Line />

        <Column gap="16" as="section" aria-labelledby="filter-heading">
          <Row horizontal="between" vertical="center" gap="16" wrap>
            <Heading as="h2" id="filter-heading" variant="heading-strong-s">
              Filter by tag
            </Heading>
            <Text variant="label-default-s" onBackground="neutral-weak" aria-live="polite">
              Showing {formatCount(visible.length)}
            </Text>
          </Row>
          <Row gap="8" wrap role="group" aria-labelledby="filter-heading">
            <ToggleButton
              label={`All (${RELEASES.length})`}
              selected={filter === ALL}
              variant="outline"
              size="s"
              aria-pressed={filter === ALL}
              onClick={() => setFilter(ALL)}
            />
            {(Object.keys(TAGS) as TagKey[]).map((key) => (
              <ToggleButton
                key={key}
                label={`${TAGS[key].label} (${counts.get(key) ?? 0})`}
                selected={filter === key}
                variant="outline"
                size="s"
                prefixIcon={TAGS[key].icon}
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
              />
            ))}
          </Row>
          <VisuallyHidden>
            <span role="status">Filter applied: {filterLabel}</span>
          </VisuallyHidden>
        </Column>

        {items.length > 0 ? (
          <Timeline items={items} size="m" />
        ) : (
          <Column
            background="surface"
            border
            radius="l"
            padding="24"
            gap="12"
            horizontal="center"
            align="center"
          >
            <Text variant="heading-strong-m">No releases match this tag</Text>
            <Button
              variant="secondary"
              size="s"
              label="Show all releases"
              onClick={() => setFilter(ALL)}
            />
          </Column>
        )}
      </Column>
    </Column>
  );
}
```