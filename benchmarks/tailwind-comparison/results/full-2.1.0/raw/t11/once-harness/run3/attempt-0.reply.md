```tsx
"use client";

import { useMemo, useState } from "react";
import {
  Column,
  Row,
  Heading,
  Text,
  Tag,
  Timeline,
  Chip,
  Line,
  InlineCode,
  Icon,
  Button,
  type IconName,
} from "@once-ui-system/core";
import { CodeBlock } from "@once-ui-system/core/code";

type TagKind = "Feature" | "Fix" | "Breaking" | "Performance" | "Security" | "Docs";
type Scheme = "brand" | "danger" | "success" | "info" | "warning" | "accent" | "neutral";

interface Snippet {
  label: string;
  language: string;
  code: string;
}

interface Release {
  version: string;
  date: string;
  title: string;
  summary: string;
  tags: TagKind[];
  state: "default" | "active" | "success" | "danger";
  highlights: string[];
  snippet?: Snippet;
}

const TAG_META: Record<TagKind, { scheme: Scheme; icon: IconName }> = {
  Feature: { scheme: "brand", icon: "sparkle" },
  Fix: { scheme: "success", icon: "check" },
  Breaking: { scheme: "danger", icon: "warning" },
  Performance: { scheme: "info", icon: "bolt" },
  Security: { scheme: "warning", icon: "security" },
  Docs: { scheme: "neutral", icon: "book" },
};

const ALL_TAGS = Object.keys(TAG_META) as TagKind[];

const RELEASES: Release[] = [
  {
    version: "v3.2.0",
    date: "2026-10-06",
    title: "Streaming queries and typed webhooks",
    summary:
      "Large result sets can now be consumed as an async iterator, and webhook payloads are fully typed end to end.",
    tags: ["Feature", "Performance"],
    state: "active",
    highlights: [
      "New client.query().stream() returns an async iterator with backpressure support.",
      "Webhook events ship with generated TypeScript types and a verifySignature helper.",
      "Cold-start time of the edge runtime reduced by 38% through lazy schema loading.",
    ],
    snippet: {
      label: "Streaming",
      language: "typescript",
      code: `import { createClient } from "@lumen/sdk";

const client = createClient({ apiKey: process.env.LUMEN_API_KEY! });

for await (const row of client.query("events").where({ type: "signup" }).stream()) {
  console.log(row.id, row.createdAt);
}`,
    },
  },
  {
    version: "v3.1.2",
    date: "2026-09-18",
    title: "Retry and pagination fixes",
    summary: "Two long-standing edge cases in the request pipeline are resolved.",
    tags: ["Fix"],
    state: "success",
    highlights: [
      "Fixed duplicate requests when a retry overlapped with an aborted signal.",
      "Cursor pagination no longer skips the final page when limit equals total count.",
      "Error messages now include the request id for faster support triage.",
    ],
  },
  {
    version: "v3.1.0",
    date: "2026-09-02",
    title: "Scoped API keys",
    summary:
      "Create keys limited to specific projects and permissions, with automatic expiry for short-lived workflows.",
    tags: ["Feature", "Security"],
    state: "default",
    highlights: [
      "Scoped keys accept read, write and admin permissions per project.",
      "Keys can expire after a fixed duration and are revoked automatically.",
      "Audit log entries now record which key performed each action.",
    ],
    snippet: {
      label: "CLI",
      language: "bash",
      code: `lumen keys create \\
  --project web-app \\
  --scope read,write \\
  --expires-in 7d`,
    },
  },
  {
    version: "v3.0.0",
    date: "2026-08-12",
    title: "A new configuration format",
    summary:
      "Version 3 replaces the legacy YAML config with a typed lumen.config.ts and drops support for Node 18.",
    tags: ["Breaking", "Feature", "Docs"],
    state: "danger",
    highlights: [
      "Breaking: lumen.yml is no longer read. Run the migration command to convert it.",
      "Breaking: the minimum supported Node.js version is now 20.",
      "Rewritten documentation with a migration guide and runnable examples.",
    ],
    snippet: {
      label: "Config",
      language: "typescript",
      code: `import { defineConfig } from "@lumen/sdk/config";

export default defineConfig({
  project: "web-app",
  region: "eu-west-1",
  retries: { attempts: 3, backoff: "exponential" },
});`,
    },
  },
  {
    version: "v2.9.4",
    date: "2026-07-21",
    title: "Faster bundling",
    summary: "Smaller installs and quicker builds for projects that import only a few modules.",
    tags: ["Performance"],
    state: "default",
    highlights: [
      "Package is now fully tree-shakeable with per-module entry points.",
      "Install size dropped from 4.1 MB to 1.6 MB.",
    ],
    snippet: {
      label: "Import",
      language: "typescript",
      code: `import { retry } from "@lumen/sdk/retry";`,
    },
  },
  {
    version: "v2.9.0",
    date: "2026-06-30",
    title: "Dependency and security hardening",
    summary: "Patches for two advisories and a refreshed dependency tree.",
    tags: ["Security", "Fix"],
    state: "default",
    highlights: [
      "Upgraded the HTTP layer to address a header-injection advisory.",
      "Removed an unmaintained transitive dependency.",
      "Signature comparison now uses a constant-time check.",
    ],
  },
];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function ChangelogPage() {
  const [active, setActive] = useState<TagKind | null>(null);

  const visible = useMemo(
    () => (active ? RELEASES.filter((r) => r.tags.includes(active)) : RELEASES),
    [active],
  );

  const items = visible.map((release) => ({
    state: release.state,
    label: (
      <Row gap="12" vertical="center" wrap>
        <Heading as="h2" variant="heading-strong-l" id={`release-${release.version}`}>
          {release.version}
        </Heading>
        <Row gap="8" wrap>
          {release.tags.map((tag) => (
            <Tag key={tag} scheme={TAG_META[tag].scheme} prefixIcon={TAG_META[tag].icon} size="s">
              {tag}
            </Tag>
          ))}
        </Row>
      </Row>
    ),
    description: (
      <Row gap="8" vertical="center">
        <Icon name="calendar" size="xs" onBackground="neutral-weak" />
        <Text as="time" variant="label-default-s" onBackground="neutral-weak">
          {formatDate(release.date)}
        </Text>
      </Row>
    ),
    children: (
      <Column gap="16" paddingBottom="40" fillWidth>
        <Column gap="8">
          <Text as="h3" variant="heading-strong-m">
            {release.title}
          </Text>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {release.summary}
          </Text>
        </Column>
        <Column as="ul" gap="8" margin="0" paddingLeft="16" style={{ listStyle: "disc" }}>
          {release.highlights.map((h) => (
            <Text as="li" key={h} variant="body-default-s">
              {h}
            </Text>
          ))}
        </Column>
        {release.snippet && (
          <Column fillWidth>
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
        <Column gap="16">
          <Text variant="label-default-s" onBackground="brand-medium">
            Changelog
          </Text>
          <Heading as="h1" variant="display-strong-s">
            What&apos;s new in Lumen SDK
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Every release, newest first. Filter by tag, and copy the snippets straight into your project. Upgrading from v2?
            Start with the <InlineCode>v3.0.0</InlineCode> notes.
          </Text>
        </Column>

        <Column gap="12" as="section" aria-label="Filter releases by tag">
          <Row gap="8" vertical="center">
            <Icon name="filter" size="xs" onBackground="neutral-weak" />
            <Text variant="label-default-s" onBackground="neutral-weak" id="filter-label">
              Filter by tag
            </Text>
          </Row>
          <Row gap="8" wrap role="group" aria-labelledby="filter-label">
            <Chip
              label="All"
              selected={active === null}
              onClick={() => setActive(null)}
              role="button"
              tabIndex={0}
              aria-pressed={active === null}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive(null);
                }
              }}
            />
            {ALL_TAGS.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                prefixIcon={TAG_META[tag].icon}
                selected={active === tag}
                onClick={() => setActive(active === tag ? null : tag)}
                role="button"
                tabIndex={0}
                aria-pressed={active === tag}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive(active === tag ? null : tag);
                  }
                }}
              />
            ))}
          </Row>
          <Text variant="body-default-xs" onBackground="neutral-weak" aria-live="polite">
            Showing {visible.length} of {RELEASES.length} releases
          </Text>
        </Column>

        <Line />

        {items.length > 0 ? (
          <Timeline items={items} />
        ) : (
          <Column
            background="surface"
            border
            radius="l"
            padding="32"
            gap="16"
            horizontal="center"
            align="center"
          >
            <Text variant="body-default-m" onBackground="neutral-weak">
              No releases match this tag yet.
            </Text>
            <Button variant="secondary" size="s" label="Clear filter" onClick={() => setActive(null)} />
          </Column>
        )}
      </Column>
    </Column>
  );
}
```