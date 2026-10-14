"use client";

import {
  Badge,
  Button,
  Chip,
  Column,
  Heading,
  Icon,
  InlineCode,
  List,
  ListItem,
  Row,
  Tag,
  Text,
  Timeline,
  VisuallyHidden,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { CodeBlock } from "@once-ui-system/core/code";
import { useMemo, useState } from "react";

type ReleaseKind = "feature" | "fix" | "breaking" | "security" | "performance";

type Scheme = "brand" | "success" | "danger" | "warning" | "info";

type Snippet = {
  label: string;
  language: string;
  code: string;
};

type Release = {
  version: string;
  date: string;
  isoDate: string;
  title: string;
  summary: string;
  tags: ReleaseKind[];
  state: "default" | "active" | "success" | "danger";
  notes: string[];
  snippets: Snippet[];
};

const kindMeta: Record<ReleaseKind, { label: string; scheme: Scheme; icon: IconName }> = {
  feature: { label: "Feature", scheme: "brand", icon: "sparkle" },
  fix: { label: "Fix", scheme: "success", icon: "check" },
  breaking: { label: "Breaking", scheme: "danger", icon: "warning" },
  security: { label: "Security", scheme: "warning", icon: "security" },
  performance: { label: "Performance", scheme: "info", icon: "bolt" },
};

const kinds = Object.keys(kindMeta) as ReleaseKind[];

const releases: Release[] = [
  {
    version: "3.2.0",
    date: "Oct 7, 2026",
    isoDate: "2026-10-07",
    title: "Streaming queries and typed webhooks",
    summary:
      "Large result sets now stream to the client as they are produced, and webhook payloads are fully typed.",
    tags: ["feature", "performance"],
    state: "active",
    notes: [
      "Added client.query().stream() which yields rows as an async iterator.",
      "Webhook handlers receive a discriminated union keyed by event type.",
      "Cold-start time for the edge runtime dropped from 410 ms to 190 ms.",
    ],
    snippets: [
      {
        label: "Install",
        language: "bash",
        code: "npm install @northwind/client@3.2.0",
      },
      {
        label: "Streaming",
        language: "typescript",
        code: `import { createClient } from "@northwind/client";

const client = createClient({ apiKey: process.env.NORTHWIND_KEY! });

for await (const row of client.query("orders").stream()) {
  console.log(row.id, row.total);
}`,
      },
    ],
  },
  {
    version: "3.1.2",
    date: "Sep 22, 2026",
    isoDate: "2026-09-22",
    title: "Security patch for signed URLs",
    summary:
      "Fixes an issue where expired signed URLs could be accepted within a five second clock skew window.",
    tags: ["security", "fix"],
    state: "success",
    notes: [
      "Signed URL expiry is now checked against a monotonic server clock.",
      "Fixed a retry loop that could resend a failed upload indefinitely.",
      "Rotate any signing secrets created before September 1.",
    ],
    snippets: [
      {
        label: "Rotate secret",
        language: "bash",
        code: "northwind secrets rotate --name signing --grace-period 24h",
      },
    ],
  },
  {
    version: "3.1.0",
    date: "Sep 3, 2026",
    isoDate: "2026-09-03",
    title: "Scoped API tokens",
    summary:
      "Tokens can now be limited to a single project and a set of permissions instead of full account access.",
    tags: ["feature"],
    state: "default",
    notes: [
      "New tokens.create() accepts project and scopes options.",
      "The dashboard shows last used time and origin for every token.",
      "Audit log entries now include the token that performed the action.",
    ],
    snippets: [
      {
        label: "Create token",
        language: "typescript",
        code: `const token = await client.tokens.create({
  name: "ci-deploy",
  project: "storefront",
  scopes: ["deployments:write", "logs:read"],
  expiresIn: "30d",
});`,
      },
    ],
  },
  {
    version: "3.0.0",
    date: "Aug 12, 2026",
    isoDate: "2026-08-12",
    title: "A new client core",
    summary:
      "The client was rewritten around fetch and ES modules. Smaller, faster, and no more runtime dependencies.",
    tags: ["breaking", "performance", "feature"],
    state: "danger",
    notes: [
      "Node 18 or newer is now required.",
      "createClient() replaces the default export and takes a single options object.",
      "Bundle size shrank from 48 kB to 11 kB gzipped.",
      "The legacy callback API was removed. Every method returns a promise.",
    ],
    snippets: [
      {
        label: "Before",
        language: "javascript",
        code: `const Northwind = require("@northwind/client");
const client = new Northwind("sk_live_123");

client.orders.list(function (err, orders) {
  if (err) throw err;
  console.log(orders.length);
});`,
      },
      {
        label: "After",
        language: "typescript",
        code: `import { createClient } from "@northwind/client";

const client = createClient({ apiKey: "sk_live_123" });
const orders = await client.orders.list();
console.log(orders.length);`,
      },
    ],
  },
  {
    version: "2.9.4",
    date: "Jul 18, 2026",
    isoDate: "2026-07-18",
    title: "Pagination and timezone fixes",
    summary: "Two long standing bugs that affected reports and cursor based pagination.",
    tags: ["fix"],
    state: "default",
    notes: [
      "Cursors no longer skip a row when two records share the same timestamp.",
      "Daily reports now respect the workspace timezone around DST changes.",
      "Corrected the TypeScript type of Order.refundedAt, which can be null.",
    ],
    snippets: [],
  },
  {
    version: "2.9.0",
    date: "Jun 30, 2026",
    isoDate: "2026-06-30",
    title: "Retries with exponential backoff",
    summary: "Transient network failures are now retried automatically and can be tuned per client.",
    tags: ["feature", "fix"],
    state: "default",
    notes: [
      "Idempotent requests are retried up to three times by default.",
      "Respects the Retry-After header on 429 and 503 responses.",
      "Set retries: 0 to opt out entirely.",
    ],
    snippets: [
      {
        label: "Configure",
        language: "typescript",
        code: `const client = createClient({
  apiKey: process.env.NORTHWIND_KEY!,
  retries: 5,
  backoff: { initialMs: 250, factor: 2, maxMs: 8000 },
});`,
      },
    ],
  },
];

const latest = releases[0];

export default function Page() {
  const [active, setActive] = useState<ReleaseKind[]>([]);

  const visible = useMemo(
    () =>
      active.length === 0
        ? releases
        : releases.filter((release) => release.tags.some((tag) => active.includes(tag))),
    [active],
  );

  const toggle = (kind: ReleaseKind) =>
    setActive((current) =>
      current.includes(kind) ? current.filter((k) => k !== kind) : [...current, kind],
    );

  const items = visible.map((release) => ({
    state: release.state,
    label: (
      <Row gap="8" vertical="center" wrap>
        <Heading as="h2" variant="heading-strong-l">
          v{release.version}
        </Heading>
        <Text as="time" variant="label-default-s" onBackground="neutral-weak" dateTime={release.isoDate}>
          {release.date}
        </Text>
      </Row>
    ),
    description: release.title,
    children: (
      <Column gap="16" fillWidth paddingBottom="40">
        <Text variant="body-default-m" onBackground="neutral-medium">
          {release.summary}
        </Text>

        <Row gap="8" wrap role="list" aria-label={`Tags for version ${release.version}`}>
          {release.tags.map((tag) => (
            <Row key={tag} role="listitem" fit>
              <Tag size="s" scheme={kindMeta[tag].scheme} prefixIcon={kindMeta[tag].icon}>
                {kindMeta[tag].label}
              </Tag>
            </Row>
          ))}
        </Row>

        <List gap="8">
          {release.notes.map((note) => (
            <ListItem key={note} variant="body-default-s">
              {note}
            </ListItem>
          ))}
        </List>

        {release.snippets.length > 0 && (
          <Column fillWidth gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak">
              Code snippets
            </Text>
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
          </Column>
        )}
      </Column>
    ),
  }));

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="24" paddingY="64" s={{ paddingY: "40" }}>
      <Column maxWidth="m" gap="40">
        <Column as="header" gap="16">
          <Text variant="label-default-s" onBackground="brand-medium">
            Changelog
          </Text>
          <Heading as="h1" variant="display-strong-s">
            What&apos;s new in Northwind
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Every release of the Northwind client, newest first. Filter by type, and copy the
            snippets straight into your project.
          </Text>
          <Row gap="12" vertical="center" wrap>
            <Badge icon="sparkle" title={`Latest: v${latest.version}`} effect={false} />
            <Row gap="8" vertical="center">
              <Icon name="calendar" size="xs" onBackground="neutral-weak" />
              <Text variant="body-default-s" onBackground="neutral-weak">
                Released {latest.date}
              </Text>
            </Row>
          </Row>
        </Column>

        <Column
          as="section"
          aria-labelledby="filter-heading"
          background="surface"
          border
          radius="l"
          padding="16"
          gap="12"
        >
          <Row horizontal="between" vertical="center" gap="12" wrap>
            <Text as="h2" id="filter-heading" variant="label-strong-s">
              Filter by type
            </Text>
            {active.length > 0 && (
              <Button size="s" variant="tertiary" prefixIcon="close" onClick={() => setActive([])}>
                Clear filters
              </Button>
            )}
          </Row>
          <Row gap="8" wrap role="group" aria-labelledby="filter-heading">
            {kinds.map((kind) => {
              const selected = active.includes(kind);
              return (
                <Chip
                  key={kind}
                  label={kindMeta[kind].label}
                  prefixIcon={kindMeta[kind].icon}
                  selected={selected}
                  onClick={() => toggle(kind)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggle(kind);
                    }
                  }}
                />
              );
            })}
          </Row>
          <Text variant="body-default-xs" onBackground="neutral-weak" role="status" aria-live="polite">
            Showing {visible.length} of {releases.length} releases
            {active.length > 0
              ? ` tagged ${active.map((kind) => kindMeta[kind].label.toLowerCase()).join(" or ")}`
              : ""}
            .
          </Text>
        </Column>

        {visible.length > 0 ? (
          <Column as="section" aria-label="Release timeline" fillWidth>
            <VisuallyHidden as="h2">Releases</VisuallyHidden>
            <Timeline items={items} />
          </Column>
        ) : (
          <Column center gap="12" padding="48" background="surface" border radius="l">
            <Icon name="filter" size="l" onBackground="neutral-weak" />
            <Text variant="heading-strong-m">No releases match</Text>
            <Text variant="body-default-s" onBackground="neutral-weak" align="center">
              Try a different combination of tags, or clear the filters to see everything.
            </Text>
            <Button variant="secondary" size="s" onClick={() => setActive([])}>
              Show all releases
            </Button>
          </Column>
        )}

        <Column as="footer" gap="8" borderTop paddingTop="24">
          <Text variant="body-default-s" onBackground="neutral-weak">
            Looking for older versions? Run{" "}
            <InlineCode>npm view @northwind/client versions</InlineCode> to list every published
            release.
          </Text>
        </Column>
      </Column>
    </Column>
  );
}
