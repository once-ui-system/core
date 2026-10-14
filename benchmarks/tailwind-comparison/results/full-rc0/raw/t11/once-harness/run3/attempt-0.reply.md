`ToggleButton` has no declared `onClick` or `aria-pressed` in the slice. Its props likely extend button attributes, but I can't confirm that. To stay type-safe I'll use `SegmentedControl`, which has a typed `value` and `onChange`, for single-select filtering. It fits well with the "All" option plus a few tags.

I'll write the file now.

```tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  InlineCode,
  Row,
  SegmentedControl,
  Tag,
  Text,
  Timeline,
  useToast,
} from "@once-ui-system/core";
import type { ColorScheme, IconName } from "@once-ui-system/core";
import { CodeBlock } from "@once-ui-system/core/code";

type ChangeKind = "added" | "improved" | "fixed" | "breaking";

interface Change {
  kind: ChangeKind;
  text: string;
}

interface Snippet {
  label: string;
  language: string;
  code: string;
}

interface Release {
  version: string;
  date: string;
  dateTime: string;
  title: string;
  summary: string;
  tags: string[];
  state: "default" | "active" | "success" | "danger";
  changes: Change[];
  snippets?: Snippet[];
}

const KIND_META: Record<ChangeKind, { label: string; scheme: ColorScheme; icon: IconName }> = {
  added: { label: "Added", scheme: "success", icon: "plus" },
  improved: { label: "Improved", scheme: "info", icon: "trendUp" },
  fixed: { label: "Fixed", scheme: "warning", icon: "check" },
  breaking: { label: "Breaking", scheme: "danger", icon: "warning" },
};

const TAG_SCHEME: Record<string, ColorScheme> = {
  Feature: "brand",
  Performance: "info",
  Security: "danger",
  Fix: "warning",
  Breaking: "danger",
  DX: "accent",
  API: "success",
};

const RELEASES: Release[] = [
  {
    version: "3.2.0",
    date: "March 18, 2025",
    dateTime: "2025-03-18",
    title: "Streaming exports and scoped API tokens",
    summary:
      "Large exports no longer block the request thread, and tokens can now be limited to a single project and a set of actions.",
    tags: ["Feature", "API", "Security"],
    state: "active",
    changes: [
      { kind: "added", text: "Streaming CSV and NDJSON exports for datasets over one million rows." },
      { kind: "added", text: "Scoped API tokens with per-project access and read-only mode." },
      { kind: "improved", text: "Webhook retries now use exponential backoff with jitter, up to 8 attempts." },
      { kind: "fixed", text: "Pagination cursors no longer skip records when sorting by updated_at." },
    ],
    snippets: [
      {
        label: "Install",
        language: "bash",
        code: "npm install @northwind/sdk@3.2.0",
      },
      {
        label: "Streaming export",
        language: "typescript",
        code: `import { Northwind } from "@northwind/sdk";

const client = new Northwind({ token: process.env.NORTHWIND_TOKEN });

const stream = await client.exports.stream({
  dataset: "events",
  format: "ndjson",
  since: "2025-01-01",
});

for await (const row of stream) {
  console.log(row.id, row.type);
}`,
      },
    ],
  },
  {
    version: "3.1.2",
    date: "February 27, 2025",
    dateTime: "2025-02-27",
    title: "Patch: timezone and retry fixes",
    summary: "A small patch release that resolves two regressions reported after 3.1.0.",
    tags: ["Fix"],
    state: "success",
    changes: [
      { kind: "fixed", text: "Scheduled reports ran an hour late for workspaces in half-hour timezones." },
      { kind: "fixed", text: "The CLI exited with code 0 when an upload failed after the final retry." },
      { kind: "improved", text: "Clearer error message when a token has expired instead of a generic 401." },
    ],
  },
  {
    version: "3.1.0",
    date: "February 4, 2025",
    dateTime: "2025-02-04",
    title: "Faster queries and a new CLI",
    summary:
      "Query planning was rewritten, cutting median latency by 38%. The CLI gets a friendlier interface and a watch mode.",
    tags: ["Performance", "DX", "Feature"],
    state: "success",
    changes: [
      { kind: "improved", text: "Median query latency down 38% and p99 down 52% on indexed lookups." },
      { kind: "added", text: "northwind watch re-runs a pipeline whenever its source files change." },
      { kind: "added", text: "Typed event payloads generated from your schema." },
      { kind: "improved", text: "Cold start time of the SDK reduced from 340ms to 120ms." },
    ],
    snippets: [
      {
        label: "CLI",
        language: "bash",
        code: `npx northwind login
npx northwind watch ./pipelines --env staging`,
      },
    ],
  },
  {
    version: "3.0.0",
    date: "December 10, 2024",
    dateTime: "2024-12-10",
    title: "Version 3: a cleaner, typed API",
    summary:
      "The biggest release of the year. Every method is now fully typed, callbacks are replaced by promises, and Node 16 is no longer supported.",
    tags: ["Breaking", "API", "DX"],
    state: "danger",
    changes: [
      { kind: "breaking", text: "Dropped support for Node 16. The minimum supported version is Node 18." },
      { kind: "breaking", text: "Callback-style methods were removed. Use the promise-based equivalents." },
      { kind: "breaking", text: "client.query() now returns { data, error } instead of throwing." },
      { kind: "added", text: "Full TypeScript types for every request and response." },
    ],
    snippets: [
      {
        label: "Before",
        language: "javascript",
        code: `client.query("users", { limit: 10 }, (err, users) => {
  if (err) return handleError(err);
  render(users);
});`,
      },
      {
        label: "After",
        language: "typescript",
        code: `const { data: users, error } = await client.query("users", { limit: 10 });

if (error) {
  handleError(error);
} else {
  render(users);
}`,
      },
    ],
  },
  {
    version: "2.9.4",
    date: "October 22, 2024",
    dateTime: "2024-10-22",
    title: "Security hardening",
    summary: "Closes a signature-verification gap in webhook handlers. All users should upgrade.",
    tags: ["Security", "Fix"],
    state: "default",
    changes: [
      { kind: "fixed", text: "Webhook signatures are now compared in constant time." },
      { kind: "fixed", text: "Rejected replayed webhook deliveries older than five minutes." },
      { kind: "improved", text: "Dependency audit: removed two packages with known advisories." },
    ],
  },
];

const ALL_TAGS = Array.from(new Set(RELEASES.flatMap((release) => release.tags))).sort();

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

function ReleaseBody({ release }: { release: Release }) {
  const grouped = useMemo(() => {
    const order: ChangeKind[] = ["breaking", "added", "improved", "fixed"];
    return order
      .map((kind) => ({ kind, items: release.changes.filter((change) => change.kind === kind) }))
      .filter((group) => group.items.length > 0);
  }, [release.changes]);

  return (
    <Column
      as="article"
      aria-labelledby={`release-${release.version}`}
      gap="20"
      paddingBottom="40"
      fillWidth
    >
      <Column gap="8">
        <Row gap="12" vertical="center" wrap>
          <Heading as="h3" id={`release-${release.version}`} variant="heading-strong-l">
            {release.title}
          </Heading>
        </Row>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {release.summary}
        </Text>
      </Column>

      <Row gap="8" wrap role="list" aria-label={`Tags for version ${release.version}`}>
        {release.tags.map((tag) => (
          <Row key={tag} as="span" role="listitem" fit>
            <Tag scheme={TAG_SCHEME[tag] ?? "neutral"} size="m" label={tag} />
          </Row>
        ))}
      </Row>

      <Column gap="16" background="surface" border radius="l" padding="24">
        {grouped.map((group) => {
          const meta = KIND_META[group.kind];
          return (
            <Column key={group.kind} gap="8">
              <Row gap="8" vertical="center">
                <Icon name={meta.icon} size="xs" onBackground={`${meta.scheme}-medium`} />
                <Text variant="label-strong-s" onBackground={`${meta.scheme}-medium`}>
                  {meta.label}
                </Text>
              </Row>
              <Column as="ul" gap="8" margin="0" paddingLeft="20" style={{ listStyle: "disc" }}>
                {group.items.map((change) => (
                  <Text as="li" key={change.text} variant="body-default-s">
                    {change.text}
                  </Text>
                ))}
              </Column>
            </Column>
          );
        })}
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

export default function ChangelogPage() {
  const { addToast } = useToast();
  const [filter, setFilter] = useState<string>("all");

  const visible = useMemo(
    () => (filter === "all" ? RELEASES : RELEASES.filter((release) => release.tags.includes(filter))),
    [filter],
  );

  const items = useMemo(
    () =>
      visible.map((release) => ({
        state: release.state,
        label: (
          <Row gap="12" vertical="center" wrap>
            <Text as="span" variant="label-strong-l">
              v{release.version}
            </Text>
            <Text as="time" variant="label-default-s" onBackground="neutral-weak" dateTime={release.dateTime}>
              {release.date}
            </Text>
          </Row>
        ),
        children: <ReleaseBody release={release} />,
      })),
    [visible],
  );

  const handleCopyInstall = useCallback(async () => {
    const ok = await writeToClipboard("npm install @northwind/sdk@latest");
    addToast({
      variant: ok ? "success" : "danger",
      message: ok ? "Install command copied to clipboard" : "Couldn't copy. Select the command and copy it manually.",
    });
  }, [addToast]);

  const filterButtons = useMemo(
    () => [
      { value: "all", label: "All releases" },
      ...ALL_TAGS.map((tag) => ({ value: tag, label: tag })),
    ],
    [],
  );

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="24" paddingY="48" s={{ paddingY: "32" }}>
      <Column maxWidth="m" gap="40">
        <Column as="header" gap="16">
          <Text variant="label-default-s" onBackground="brand-medium">
            Changelog
          </Text>
          <Heading as="h1" variant="display-strong-s">
            What&apos;s new in Northwind
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Every release of the SDK and CLI, newest first. Subscribe to the{" "}
            <InlineCode>releases</InlineCode> feed or pin a version with the install command below.
          </Text>
        </Column>

        <Grid columns="2" s={{ columns: 1 }} gap="16">
          <Column background="surface" border radius="l" padding="24" gap="12">
            <Row gap="8" vertical="center">
              <Icon name="download" size="s" onBackground="brand-medium" />
              <Text variant="label-strong-m">Latest version</Text>
            </Row>
            <Row gap="12" vertical="center" wrap>
              <Text variant="heading-strong-xl">v{RELEASES[0].version}</Text>
              <Tag scheme="brand" size="s" label="Latest" />
            </Row>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Released {RELEASES[0].date}
            </Text>
          </Column>

          <Column background="surface" border radius="l" padding="24" gap="12">
            <Row gap="8" vertical="center">
              <Icon name="code" size="s" onBackground="brand-medium" />
              <Text variant="label-strong-m">Quick install</Text>
            </Row>
            <Row
              background="page"
              border
              radius="m"
              paddingX="16"
              paddingY="12"
              overflowX="auto"
              scrollbar="minimal"
            >
              <Text variant="code-default-s" style={{ whiteSpace: "nowrap" }}>
                npm install @northwind/sdk@latest
              </Text>
            </Row>
            <Row>
              <Button
                variant="secondary"
                size="s"
                prefixIcon="copy"
                label="Copy command"
                onClick={handleCopyInstall}
              />
            </Row>
          </Column>
        </Grid>

        <Column gap="16" as="section" aria-labelledby="filter-heading">
          <Heading as="h2" id="filter-heading" variant="heading-strong-m">
            Filter by tag
          </Heading>
          <SegmentedControl
            fillWidth={false}
            buttons={filterButtons}
            value={filter}
            onChange={(value) => setFilter(value)}
          />
          <Text variant="body-default-s" onBackground="neutral-weak" role="status" aria-live="polite">
            Showing {visible.length} of {RELEASES.length} releases
            {filter === "all" ? "" : ` tagged ${filter}`}.
          </Text>
        </Column>

        <Column as="section" aria-label="Release timeline">
          {items.length > 0 ? (
            <Timeline items={items} />
          ) : (
            <Column
              background="surface"
              border
              borderStyle="dashed"
              radius="l"
              padding="40"
              center
              gap="12"
            >
              <Icon name="search" size="l" onBackground="neutral-weak" />
              <Text variant="body-default-m" onBackground="neutral-weak">
                No releases match this tag.
              </Text>
              <Button
                variant="secondary"
                size="s"
                label="Show all releases"
                onClick={() => setFilter("all")}
              />
            </Column>
          )}
        </Column>
      </Column>
    </Column>
  );
}
```