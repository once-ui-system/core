"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Chip,
  Column,
  Feedback,
  Heading,
  InlineCode,
  Line,
  Row,
  Tag,
  Text,
  Timeline,
} from "@once-ui-system/core";
import { CodeBlock } from "@once-ui-system/core/code";

type ReleaseTag = "Feature" | "Fix" | "Performance" | "Breaking" | "Security" | "Docs";
type TagScheme = "brand" | "success" | "info" | "danger" | "warning" | "neutral";
type FilterValue = ReleaseTag | "All";

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
  state: "default" | "active" | "success" | "danger";
  tags: ReleaseTag[];
  changes: string[];
  snippet?: Snippet;
}

const TAG_SCHEME: Record<ReleaseTag, TagScheme> = {
  Feature: "brand",
  Fix: "success",
  Performance: "info",
  Breaking: "danger",
  Security: "warning",
  Docs: "neutral",
};

const FILTERS: FilterValue[] = ["All", "Feature", "Fix", "Performance", "Breaking", "Security", "Docs"];

const RELEASES: Release[] = [
  {
    version: "v3.2.0",
    date: "May 14, 2025",
    dateTime: "2025-05-14",
    title: "Streaming exports and scoped API keys",
    summary:
      "Large exports no longer block the dashboard, and API keys can now be limited to a single project and a set of actions.",
    state: "active",
    tags: ["Feature", "Security", "Performance"],
    changes: [
      "Exports stream to disk in 5 MB chunks, so a 2 GB report finishes without hitting the memory limit.",
      "Scoped API keys: restrict a key to one project and to read, write or admin actions.",
      "Audit log entries now record the key prefix that made each request.",
      "Cold start for the ingest worker dropped from 1.9 s to 640 ms.",
    ],
    snippet: {
      label: "Create a scoped key",
      language: "typescript",
      code: `import { Client } from "@northwind/sdk";

const client = new Client({ token: process.env.NORTHWIND_TOKEN });

const key = await client.keys.create({
  name: "ci-readonly",
  project: "prj_4f9a21",
  scopes: ["reports:read"],
  expiresIn: "30d",
});

console.log(key.prefix); // nw_live_8c1f`,
    },
  },
  {
    version: "v3.1.2",
    date: "Apr 29, 2025",
    dateTime: "2025-04-29",
    title: "Timezone and pagination fixes",
    summary: "A patch release that resolves two reporting bugs raised by several customers last week.",
    state: "success",
    tags: ["Fix"],
    changes: [
      "Daily rollups now respect the workspace timezone across daylight saving changes.",
      "Cursor pagination no longer returns duplicate rows when two events share a timestamp.",
      "The CSV export header row keeps the column order from the saved view.",
    ],
  },
  {
    version: "v3.1.0",
    date: "Apr 8, 2025",
    dateTime: "2025-04-08",
    title: "Webhook retries and a faster query engine",
    summary:
      "Webhooks are now delivered at least once with exponential backoff, and common dashboard queries run roughly twice as fast.",
    state: "default",
    tags: ["Feature", "Performance"],
    changes: [
      "Failed webhook deliveries retry up to 8 times over 24 hours, with a delivery log per attempt.",
      "The query planner caches the result of repeated filters; p95 dashboard load time fell from 1.4 s to 690 ms.",
      "New `webhooks.replay()` helper to resend a single event from the SDK.",
    ],
    snippet: {
      label: "Verify a webhook signature",
      language: "typescript",
      code: `import { verifySignature } from "@northwind/sdk/webhooks";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-northwind-signature") ?? "";

  if (!verifySignature(body, signature, process.env.WEBHOOK_SECRET!)) {
    return new Response("Invalid signature", { status: 401 });
  }

  return new Response(null, { status: 204 });
}`,
    },
  },
  {
    version: "v3.0.0",
    date: "Mar 3, 2025",
    dateTime: "2025-03-03",
    title: "The 3.0 platform release",
    summary:
      "A new data model, a rewritten SDK and a cleaner authentication flow. This release contains breaking changes, so read the migration notes before upgrading.",
    state: "danger",
    tags: ["Breaking", "Feature", "Docs"],
    changes: [
      "Breaking: `client.getReports()` is now `client.reports.list()` and returns an async iterator.",
      "Breaking: Node.js 18 is no longer supported. The minimum is Node.js 20.",
      "OAuth tokens are rotated automatically; refresh tokens last 30 days.",
      "A full migration guide and a codemod were added to the documentation.",
    ],
    snippet: {
      label: "Migrate to 3.0",
      language: "bash",
      code: `npm install @northwind/sdk@3
npx @northwind/codemod v3 ./src`,
    },
  },
  {
    version: "v2.9.4",
    date: "Jan 21, 2025",
    dateTime: "2025-01-21",
    title: "Security hardening",
    summary:
      "Closes a session fixation issue reported through our disclosure program. Upgrading is recommended for all users.",
    state: "default",
    tags: ["Security", "Fix"],
    changes: [
      "Session identifiers are regenerated after sign-in and after a password change.",
      "SSO callback URLs are validated against the allow-list before redirecting.",
      "Dependency updates for three transitive packages with published advisories.",
    ],
  },
  {
    version: "v2.9.0",
    date: "Dec 10, 2024",
    dateTime: "2024-12-10",
    title: "Dark mode and keyboard shortcuts",
    summary: "The dashboard follows your system theme, and the most common actions are one keystroke away.",
    state: "default",
    tags: ["Feature", "Docs"],
    changes: [
      "Dark theme with automatic switching, plus a manual override in the profile menu.",
      "Press `?` anywhere in the app to see the full list of keyboard shortcuts.",
      "Documentation now includes a searchable changelog and a link to the status page.",
    ],
  },
];

/** Renders backtick segments as inline code so notes can mention identifiers. */
function renderNote(text: string) {
  return text.split("`").map((part, i) =>
    i % 2 === 1 ? <InlineCode key={i}>{part}</InlineCode> : <span key={i}>{part}</span>,
  );
}

function ReleaseEntry({ release }: { release: Release }) {
  const headingId = `release-${release.version.replace(/\./g, "-")}`;

  return (
    <Column as="article" aria-labelledby={headingId} fillWidth gap="16" paddingBottom="32">
      <Column gap="8">
        <Row gap="12" vertical="center" wrap>
          <Heading as="h2" id={headingId} variant="heading-strong-l">
            {release.version}
          </Heading>
          <Text as="time" dateTime={release.dateTime} variant="label-default-s" onBackground="neutral-weak">
            {release.date}
          </Text>
        </Row>
        <Text variant="heading-default-m">{release.title}</Text>
      </Column>

      <Row
        as="ul"
        gap="8"
        wrap
        margin="0"
        padding="0"
        aria-label={`Tags for ${release.version}`}
        style={{ listStyle: "none" }}
      >
        {release.tags.map((tag) => (
          <li key={tag}>
            <Tag scheme={TAG_SCHEME[tag]} label={tag} />
          </li>
        ))}
      </Row>

      <Text variant="body-default-m" onBackground="neutral-weak">
        {release.summary}
      </Text>

      <Column as="ul" gap="8" margin="0" paddingLeft="20" style={{ listStyle: "disc" }}>
        {release.changes.map((change) => (
          <Text as="li" key={change} variant="body-default-m">
            {renderNote(change)}
          </Text>
        ))}
      </Column>

      {release.snippet ? (
        <Column fillWidth gap="8" paddingTop="8">
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
      ) : null}
    </Column>
  );
}

export default function Page() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("All");

  const visible = useMemo(
    () => (activeFilter === "All" ? RELEASES : RELEASES.filter((r) => r.tags.includes(activeFilter))),
    [activeFilter],
  );

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="24" paddingY="64" s={{ paddingY: "40" }}>
      <Column maxWidth="m" gap="40">
        <Column as="header" gap="16">
          <Badge title="Latest: v3.2.0" icon="sparkle" />
          <Heading as="h1" variant="display-strong-s">
            Northwind changelog
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Every release of the Northwind platform and SDK, newest first. Filter by tag to find what
            changed, and copy the snippets straight into your project.
          </Text>
        </Column>

        <Line />

        <Column as="section" aria-labelledby="filter-label" gap="12">
          <Text as="h2" id="filter-label" variant="label-default-s" onBackground="neutral-weak">
            Filter by tag
          </Text>
          <Row gap="8" wrap role="group" aria-labelledby="filter-label">
            {FILTERS.map((filter) => {
              const selected = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveFilter(filter)}
                  style={{
                    background: "none",
                    border: 0,
                    padding: 0,
                    margin: 0,
                    cursor: "pointer",
                    font: "inherit",
                    color: "inherit",
                  }}
                >
                  <Chip label={filter} selected={selected} />
                </button>
              );
            })}
          </Row>
          <Text variant="body-default-s" onBackground="neutral-weak" role="status" aria-live="polite">
            Showing {visible.length} of {RELEASES.length} releases
            {activeFilter === "All" ? "" : `, tagged ${activeFilter}`}
          </Text>
        </Column>

        {visible.length === 0 ? (
          <Feedback
            variant="info"
            title="No releases match this tag"
            description="Try another filter or show all releases."
          />
        ) : (
          <Timeline
            items={visible.map((release) => ({
              label: release.version,
              description: release.date,
              state: release.state,
              children: <ReleaseEntry release={release} />,
            }))}
          />
        )}
      </Column>
    </Column>
  );
}
