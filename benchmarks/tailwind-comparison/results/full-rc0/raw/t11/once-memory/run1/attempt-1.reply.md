I can't inspect the typings, so I'll avoid relying on Tag's color prop. I'll build a local `Badge` component from `Row` and `Text`, which gives me full control over the color tokens and removes the unknown API surface.

```tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Column,
  Flex,
  Heading,
  Row,
  Text,
  useToast,
} from "@once-ui-system/core";

type TagKind = "feature" | "fix" | "breaking" | "perf" | "security" | "docs";
type BadgeTone = "brand" | "success" | "danger" | "warning" | "info" | "neutral";

interface Snippet {
  label: string;
  language: string;
  code: string;
}

interface Release {
  version: string;
  date: string; // ISO
  title: string;
  summary: string;
  tags: TagKind[];
  changes: string[];
  snippet?: Snippet;
}

const TAG_META: Record<TagKind, { label: string; tone: BadgeTone }> = {
  feature: { label: "Feature", tone: "brand" },
  fix: { label: "Fix", tone: "success" },
  breaking: { label: "Breaking", tone: "danger" },
  perf: { label: "Performance", tone: "warning" },
  security: { label: "Security", tone: "info" },
  docs: { label: "Docs", tone: "neutral" },
};

const TONE_STYLES: Record<BadgeTone, { background: string; color: string; border: string }> = {
  brand: {
    background: "var(--brand-alpha-weak)",
    color: "var(--brand-on-background-strong)",
    border: "var(--brand-alpha-medium)",
  },
  success: {
    background: "var(--success-alpha-weak)",
    color: "var(--success-on-background-strong)",
    border: "var(--success-alpha-medium)",
  },
  danger: {
    background: "var(--danger-alpha-weak)",
    color: "var(--danger-on-background-strong)",
    border: "var(--danger-alpha-medium)",
  },
  warning: {
    background: "var(--warning-alpha-weak)",
    color: "var(--warning-on-background-strong)",
    border: "var(--warning-alpha-medium)",
  },
  info: {
    background: "var(--info-alpha-weak, var(--brand-alpha-weak))",
    color: "var(--info-on-background-strong, var(--brand-on-background-strong))",
    border: "var(--info-alpha-medium, var(--brand-alpha-medium))",
  },
  neutral: {
    background: "var(--neutral-alpha-weak)",
    color: "var(--neutral-on-background-strong)",
    border: "var(--neutral-alpha-medium)",
  },
};

function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  const s = TONE_STYLES[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        lineHeight: 1.6,
        whiteSpace: "nowrap",
        background: s.background,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {children}
    </span>
  );
}

const RELEASES: Release[] = [
  {
    version: "3.0.0",
    date: "2025-06-17",
    title: "Streaming pipelines and a new config format",
    summary:
      "Pipelines can now stream partial results to clients as they are produced. The configuration file moved to a typed TypeScript module, and a few long-deprecated options were removed.",
    tags: ["feature", "breaking"],
    changes: [
      "Added `stream()` to pipeline runs for incremental delivery over SSE.",
      "Replaced `relay.config.json` with `relay.config.ts` and a typed `defineConfig` helper.",
      "Removed the `legacyRetry` option. Use `retry.strategy` instead.",
      "Minimum supported Node.js version is now 20.11.",
    ],
    snippet: {
      label: "relay.config.ts",
      language: "ts",
      code: `import { defineConfig } from "relay";

export default defineConfig({
  retry: { strategy: "exponential", maxAttempts: 5 },
  stream: { transport: "sse", heartbeatMs: 15000 },
});`,
    },
  },
  {
    version: "2.8.3",
    date: "2025-05-29",
    title: "Patch: webhook signature validation",
    summary:
      "Fixes a timing issue in webhook signature comparison and tightens default header size limits.",
    tags: ["security", "fix"],
    changes: [
      "Signature comparison now uses a constant-time check.",
      "Default maximum header size reduced from 32 KB to 16 KB.",
      "Fixed a crash when the `X-Relay-Timestamp` header was missing.",
    ],
    snippet: {
      label: "Upgrade",
      language: "bash",
      code: "npm install relay@2.8.3 --save-exact",
    },
  },
  {
    version: "2.8.0",
    date: "2025-05-06",
    title: "Faster cold starts",
    summary:
      "Lazy-loaded adapters and a smaller dependency graph cut cold start time by roughly 40% on serverless platforms.",
    tags: ["perf", "feature"],
    changes: [
      "Adapters are now loaded on first use rather than at import time.",
      "Dropped three transitive dependencies, shrinking the install by 1.8 MB.",
      "Added `relay doctor` to diagnose slow startup in your project.",
    ],
    snippet: {
      label: "Run the diagnostic",
      language: "bash",
      code: "npx relay doctor --profile startup",
    },
  },
  {
    version: "2.7.2",
    date: "2025-04-11",
    title: "Patch: scheduler and timezone fixes",
    summary: "Resolves two scheduling bugs reported around daylight saving transitions.",
    tags: ["fix"],
    changes: [
      "Cron jobs no longer fire twice when clocks move back.",
      "Fixed `nextRun()` returning a past date for jobs scheduled at 02:30 local time.",
    ],
  },
  {
    version: "2.7.0",
    date: "2025-03-18",
    title: "Typed events and a rewritten guide",
    summary:
      "Event handlers now infer payload types from the event name, and the getting started guide was rewritten from scratch.",
    tags: ["feature", "docs"],
    changes: [
      "Added `EventMap` interface so `on('job.done', ...)` infers its payload.",
      "New getting started guide with a working example repository.",
      "Added a migration checklist for teams moving from 1.x.",
    ],
    snippet: {
      label: "Typed event handler",
      language: "ts",
      code: `relay.on("job.done", (event) => {
  // event.durationMs is typed as number
  console.log(\`Finished \${event.jobId} in \${event.durationMs}ms\`);
});`,
    },
  },
];

const ALL_TAGS = Object.keys(TAG_META) as TagKind[];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

function CodeSnippet({ snippet, id }: { snippet: Snippet; id: string }) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      addToast({ variant: "success", message: `Copied ${snippet.label} to clipboard` });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast({ variant: "danger", message: "Could not access the clipboard" });
    }
  }, [snippet, addToast]);

  return (
    <Column
      fillWidth
      radius="m"
      border="neutral-alpha-medium"
      background="neutral-alpha-weak"
      overflow="hidden"
    >
      <Row
        fillWidth
        horizontal="between"
        vertical="center"
        paddingX="12"
        paddingY="8"
        gap="8"
        borderBottom="neutral-alpha-weak"
      >
        <Text variant="label-default-s" onBackground="neutral-weak" id={id}>
          {snippet.label} · {snippet.language}
        </Text>
        <Button
          size="s"
          variant="secondary"
          prefixIcon={copied ? "check" : "clipboard"}
          onClick={handleCopy}
          aria-label={`Copy ${snippet.label} snippet`}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </Row>
      <pre
        tabIndex={0}
        aria-labelledby={id}
        style={{
          margin: 0,
          padding: "16px",
          overflowX: "auto",
          fontFamily: "var(--font-code)",
          fontSize: "0.8125rem",
          lineHeight: 1.6,
          color: "var(--neutral-on-background-strong)",
          whiteSpace: "pre",
        }}
      >
        <code>{snippet.code}</code>
      </pre>
    </Column>
  );
}

function ReleaseEntry({ release, isLatest }: { release: Release; isLatest: boolean }) {
  const headingId = `release-${release.version.replace(/\./g, "-")}`;

  return (
    <li
      style={{
        listStyle: "none",
        position: "relative",
        paddingLeft: "40px",
        paddingBottom: "40px",
      }}
    >
      {/* timeline rail segment */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "11px",
          top: "28px",
          bottom: "-4px",
          width: "2px",
          background: "var(--neutral-alpha-medium)",
        }}
      />
      {/* timeline node */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: "6px",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: isLatest ? "var(--brand-solid-strong)" : "var(--page-background)",
          border: `2px solid ${isLatest ? "var(--brand-solid-strong)" : "var(--neutral-alpha-strong)"}`,
          boxShadow: isLatest ? "0 0 0 4px var(--brand-alpha-weak)" : "none",
        }}
      />

      <Column
        as="article"
        aria-labelledby={headingId}
        fillWidth
        gap="16"
        padding="l"
        radius="l"
        border="neutral-alpha-medium"
        background="surface"
      >
        <Row gap="12" vertical="center" wrap>
          <Heading as="h2" variant="heading-strong-l" id={headingId}>
            v{release.version}
          </Heading>
          {isLatest && <Badge tone="brand">Latest</Badge>}
          <time dateTime={release.date} style={{ color: "var(--neutral-on-background-weak)", fontSize: "0.875rem" }}>
            {formatDate(release.date)}
          </time>
        </Row>

        <Column gap="8">
          <Heading as="h3" variant="heading-default-m">
            {release.title}
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {release.summary}
          </Text>
        </Column>

        <ul
          aria-label={`Tags for version ${release.version}`}
          style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexWrap: "wrap", gap: "8px" }}
        >
          {release.tags.map((t) => (
            <li key={t} style={{ listStyle: "none" }}>
              <Badge tone={TAG_META[t].tone}>{TAG_META[t].label}</Badge>
            </li>
          ))}
        </ul>

        <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {release.changes.map((c) => (
            <li key={c} style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: "var(--neutral-on-background-strong)" }}>
              {c}
            </li>
          ))}
        </ul>

        {release.snippet && <CodeSnippet snippet={release.snippet} id={`${headingId}-snippet`} />}
      </Column>
    </li>
  );
}

export default function Page() {
  const [active, setActive] = useState<TagKind | "all">("all");

  const visible = useMemo(
    () => (active === "all" ? RELEASES : RELEASES.filter((r) => r.tags.includes(active))),
    [active],
  );

  return (
    <Flex as="main" fillWidth horizontal="center" paddingX="m" paddingY="xl">
      <Column fillWidth maxWidth={40} gap="32">
        <Column as="header" gap="12">
          <div style={{ alignSelf: "flex-start" }}>
            <Badge tone="neutral">Relay · Changelog</Badge>
          </div>
          <Heading as="h1" variant="display-strong-s">
            What&apos;s new in Relay
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Every release of the Relay job pipeline toolkit, newest first. Filter by tag to find
            features, fixes and breaking changes.
          </Text>
        </Column>

        <Column as="section" gap="12" aria-label="Filter releases by tag">
          <Row gap="8" wrap>
            <Button
              size="s"
              variant={active === "all" ? "primary" : "secondary"}
              aria-pressed={active === "all"}
              onClick={() => setActive("all")}
            >
              All
            </Button>
            {ALL_TAGS.map((t) => (
              <Button
                key={t}
                size="s"
                variant={active === t ? "primary" : "secondary"}
                aria-pressed={active === t}
                onClick={() => setActive(t)}
              >
                {TAG_META[t].label}
              </Button>
            ))}
          </Row>
          <Text variant="label-default-s" onBackground="neutral-weak" role="status" aria-live="polite">
            Showing {visible.length} of {RELEASES.length} releases
          </Text>
        </Column>

        {visible.length > 0 ? (
          <ol style={{ margin: 0, padding: 0 }}>
            {visible.map((r) => (
              <ReleaseEntry key={r.version} release={r} isLatest={r.version === RELEASES[0].version} />
            ))}
          </ol>
        ) : (
          <Column padding="l" radius="l" border="neutral-alpha-medium" horizontal="center" gap="8">
            <Text variant="body-default-m" onBackground="neutral-weak">
              No releases match this tag yet.
            </Text>
          </Column>
        )}
      </Column>
    </Flex>
  );
}
```