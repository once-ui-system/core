I'll design the page now. The plan:

-   Header: breadcrumb-free hero with eyebrow, title, summary, latest-version tag, and a segmented filter (All / Features / Fixes / Breaking).
-   `Timeline` items: `label` is the version header (version + date + tags + copy-link button), `description` is the summary, and `children` holds the changes list and `CodeBlock` snippets.
-   Release data is typed inline. Icon names are typed as `IconName` and taken from the catalog.
-   The filter has an empty state, and the live result count is announced through an `aria-live` region.

I'm keeping the data shapes strict and avoiding casts.

```tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Background,
  Button,
  Column,
  Heading,
  IconButton,
  Line,
  List,
  ListItem,
  Row,
  SegmentedControl,
  Tag,
  Text,
  Timeline,
  VisuallyHidden,
  useToast,
  type IconName,
} from "@once-ui-system/core";
import { CodeBlock } from "@once-ui-system/core/code";

type TagKind = "feature" | "fix" | "breaking" | "perf" | "security";
type Scheme = "brand" | "success" | "danger" | "info" | "warning";

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
  tags: TagKind[];
  changes: string[];
  snippets: Snippet[];
}

const TAG_META: Record<TagKind, { label: string; scheme: Scheme; icon: IconName }> = {
  feature: { label: "Feature", scheme: "brand", icon: "sparkle" },
  fix: { label: "Fix", scheme: "success", icon: "check" },
  breaking: { label: "Breaking", scheme: "danger", icon: "warning" },
  perf: { label: "Performance", scheme: "info", icon: "bolt" },
  security: { label: "Security", scheme: "warning", icon: "lock" },
};

const RELEASES: Release[] = [
  {
    version: "3.2.0",
    date: "March 18, 2026",
    isoDate: "2026-03-18",
    title: "Streaming exports and scoped API keys",
    summary:
      "Large exports no longer block the dashboard, and API keys can now be limited to a single project and a fixed set of actions.",
    tags: ["feature", "perf"],
    changes: [
      "Exports stream to disk in 5 MB chunks, so a 2 GB report no longer holds a worker for minutes.",
      "Scoped API keys: restrict a key to one project and to read, write or admin actions.",
      "The audit log now records the key prefix used for each request.",
      "Dashboard cold start is 38% faster after lazy-loading the chart bundle.",
    ],
    snippets: [
      {
        label: "Create a scoped key",
        language: "bash",
        code: `curl -X POST https://api.relay.example/v3/keys \\
  -H "Authorization: Bearer $RELAY_ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "ci-readonly",
    "project": "prj_8f21c",
    "scopes": ["events:read", "reports:read"]
  }'`,
      },
      {
        label: "Stream an export",
        language: "typescript",
        code: `import { Relay } from "@relay/sdk";

const relay = new Relay({ apiKey: process.env.RELAY_API_KEY! });

const stream = await relay.exports.stream({
  report: "monthly-usage",
  format: "csv",
});

for await (const chunk of stream) {
  process.stdout.write(chunk);
}`,
      },
    ],
  },
  {
    version: "3.1.2",
    date: "February 27, 2026",
    isoDate: "2026-02-27",
    title: "Webhook retries and timezone fixes",
    summary: "A patch release focused on delivery reliability and a handful of date-handling bugs.",
    tags: ["fix", "security"],
    changes: [
      "Failed webhooks now retry with exponential backoff for up to 24 hours instead of 3 attempts.",
      "Fixed scheduled reports firing an hour late in zones that observe daylight saving time.",
      "Signature verification now uses a constant-time comparison.",
      "Fixed the date picker resetting to today after selecting a range across two months.",
    ],
    snippets: [
      {
        label: "Verify a signature",
        language: "typescript",
        code: `import { verifySignature } from "@relay/sdk/webhooks";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("relay-signature") ?? "";

  if (!verifySignature(body, signature, process.env.RELAY_WEBHOOK_SECRET!)) {
    return new Response("Invalid signature", { status: 401 });
  }

  return new Response("ok");
}`,
      },
    ],
  },
  {
    version: "3.1.0",
    date: "January 29, 2026",
    isoDate: "2026-01-29",
    title: "Saved views and keyboard shortcuts",
    summary:
      "Filters you build once can now be saved, shared with your team and reopened with a shortcut.",
    tags: ["feature"],
    changes: [
      "Saved views: pin any filter combination and share it with a link.",
      "Command palette opens with ⌘K and searches views, projects and settings.",
      "Bulk-archive up to 500 events from the table toolbar.",
      "New compact density option for the events table.",
    ],
    snippets: [
      {
        label: "Open a saved view",
        language: "typescript",
        code: `const view = await relay.views.get("view_weekly-errors");

console.log(view.filters);
// { level: "error", range: "7d", project: "prj_8f21c" }`,
      },
    ],
  },
  {
    version: "3.0.0",
    date: "December 4, 2025",
    isoDate: "2025-12-04",
    title: "Relay 3: new event model",
    summary:
      "A ground-up rewrite of the event pipeline. Ingestion is faster and queries are simpler, but the payload shape changed.",
    tags: ["breaking", "feature", "perf"],
    changes: [
      "Events are now flat: `properties` replaces the nested `data.attributes` object.",
      "The `track()` method is renamed to `capture()`. The old name is removed.",
      "Node 18 is no longer supported. Relay 3 requires Node 20 or newer.",
      "Ingestion p95 latency dropped from 410 ms to 96 ms.",
      "A migration codemod updates call sites automatically.",
    ],
    snippets: [
      {
        label: "Before (v2)",
        language: "typescript",
        code: `relay.track("checkout_completed", {
  data: { attributes: { plan: "pro", seats: 12 } },
});`,
      },
      {
        label: "After (v3)",
        language: "typescript",
        code: `relay.capture("checkout_completed", {
  properties: { plan: "pro", seats: 12 },
});`,
      },
      {
        label: "Run the codemod",
        language: "bash",
        code: `npx @relay/codemod@3 migrate-events ./src`,
      },
    ],
  },
  {
    version: "2.9.4",
    date: "October 21, 2025",
    isoDate: "2025-10-21",
    title: "Memory leak in long-lived workers",
    summary: "Resolves a slow memory climb reported by self-hosted users running workers for weeks.",
    tags: ["fix", "perf"],
    changes: [
      "Fixed an unreleased listener on the batch queue that retained every flushed batch.",
      "Worker memory now stays flat under sustained load of 20k events per second.",
      "Fixed CSV exports escaping quotes twice in the notes column.",
    ],
    snippets: [],
  },
];

type Filter = "all" | TagKind;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "feature", label: "Features" },
  { value: "fix", label: "Fixes" },
  { value: "breaking", label: "Breaking" },
];

function isFilter(value: string): value is Filter {
  return FILTERS.some((filter) => filter.value === value);
}

function ReleaseHeader({ release, onCopyLink }: { release: Release; onCopyLink: (version: string) => void }) {
  return (
    <Row fillWidth gap="12" vertical="center" wrap>
      <Heading as="h2" variant="display-strong-xs" id={`v${release.version}`}>
        v{release.version}
      </Heading>
      <Row gap="8" wrap>
        {release.tags.map((tag) => (
          <Tag key={tag} size="s" scheme={TAG_META[tag].scheme} prefixIcon={TAG_META[tag].icon}>
            {TAG_META[tag].label}
          </Tag>
        ))}
      </Row>
      <IconButton
        icon="link"
        variant="tertiary"
        size="s"
        tooltip="Copy link to this release"
        ariaLabel={`Copy link to version ${release.version}`}
        onClick={() => onCopyLink(release.version)}
      />
    </Row>
  );
}

function ReleaseBody({ release }: { release: Release }) {
  return (
    <Column fillWidth gap="20" paddingTop="8" paddingBottom="40">
      <Column gap="8">
        <Text as="time" dateTime={release.isoDate} variant="label-default-s" onBackground="neutral-weak">
          {release.date}
        </Text>
        <Text as="p" variant="heading-strong-m">
          {release.title}
        </Text>
        <Text as="p" variant="body-default-m" onBackground="neutral-weak">
          {release.summary}
        </Text>
      </Column>

      <List as="ul">
        {release.changes.map((change) => (
          <ListItem key={change} variant="body-default-m" marginBottom="4">
            {change}
          </ListItem>
        ))}
      </List>

      {release.snippets.length > 0 && (
        <Column fillWidth gap="8">
          <Text as="p" variant="label-strong-s" onBackground="neutral-weak">
            Snippets
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
  );
}

export default function Page() {
  const [filter, setFilter] = useState<Filter>("all");
  const { addToast } = useToast();

  const visible = useMemo(
    () => (filter === "all" ? RELEASES : RELEASES.filter((release) => release.tags.includes(filter))),
    [filter],
  );

  const handleCopyLink = useCallback(
    (version: string) => {
      const url = `${window.location.origin}${window.location.pathname}#v${version}`;
      navigator.clipboard.writeText(url).then(
        () => addToast({ variant: "success", message: `Link to v${version} copied` }),
        () => addToast({ variant: "danger", message: "Couldn't copy the link" }),
      );
    },
    [addToast],
  );

  const items = useMemo(
    () =>
      visible.map((release, index) => ({
        label: <ReleaseHeader release={release} onCopyLink={handleCopyLink} />,
        state: index === 0 && filter === "all" ? ("active" as const) : ("default" as const),
        children: <ReleaseBody release={release} />,
      })),
    [visible, filter, handleCopyLink],
  );

  const latest = RELEASES[0];

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingBottom="80">
      <Column fillWidth horizontal="center" paddingTop="80" paddingBottom="40">
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
            height: 80,
            opacity: 60,
          }}
          dots={{ display: true, color: "neutral-alpha-weak", size: "2", opacity: 40 }}
        />
        <Column zIndex={1} maxWidth="m" gap="16">
          <Text variant="label-default-s" onBackground="brand-medium">
            Changelog
          </Text>
          <Heading as="h1" variant="display-strong-l">
            What's new in Relay
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Every release, newest first. Breaking changes are flagged, and each one ships with a snippet you
            can copy straight into your project.
          </Text>
          <Row gap="12" vertical="center" wrap paddingTop="8">
            <Tag scheme="brand" size="m" prefixIcon="star">
              Latest: v{latest.version}
            </Tag>
            <Button
              href={`#v${latest.version}`}
              variant="secondary"
              size="s"
              suffixIcon="arrowRight"
              label="Jump to latest"
            />
          </Row>
        </Column>
      </Column>

      <Column maxWidth="m" fillWidth gap="32">
        <Column gap="12">
          <SegmentedControl
            buttons={FILTERS.map((entry) => ({ value: entry.value, label: entry.label }))}
            value={filter}
            onChange={(value) => {
              if (isFilter(value)) setFilter(value);
            }}
            fillWidth
          />
          <VisuallyHidden>
            <span role="status" aria-live="polite">
              Showing {visible.length} of {RELEASES.length} releases
            </span>
          </VisuallyHidden>
        </Column>

        {visible.length > 0 ? (
          <Timeline items={items} size="m" />
        ) : (
          <Column
            background="surface"
            border
            radius="l"
            padding="32"
            gap="8"
            horizontal="center"
            align="center"
          >
            <Text variant="heading-strong-m">No releases match this filter</Text>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Try another tag to see more of the history.
            </Text>
            <Button label="Show all releases" variant="secondary" size="s" onClick={() => setFilter("all")} />
          </Column>
        )}

        <Line />
        <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Looking for older versions? Releases before 2.9 are archived in the migration guide.
          </Text>
          <Button
            href="#v3.2.0"
            variant="tertiary"
            size="s"
            prefixIcon="arrowUpRight"
            label="Back to top"
          />
        </Row>
      </Column>
    </Column>
  );
}
```