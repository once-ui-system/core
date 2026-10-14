"use client";

import { useMemo, useState } from "react";
import { Column, Heading, Text, Button } from "@once-ui-system/core";

type TagKind = "feature" | "fix" | "breaking" | "perf" | "security" | "docs";
type ToneName = "brand" | "success" | "danger" | "warning" | "info" | "neutral";

interface Snippet {
  label: string;
  language: string;
  code: string;
}

interface Release {
  version: string;
  date: string; // ISO date
  title: string;
  summary: string;
  tags: TagKind[];
  changes: string[];
  snippet?: Snippet;
}

const TAG_META: Record<TagKind, { label: string; tone: ToneName }> = {
  feature: { label: "Feature", tone: "brand" },
  fix: { label: "Fix", tone: "success" },
  breaking: { label: "Breaking", tone: "danger" },
  perf: { label: "Performance", tone: "warning" },
  security: { label: "Security", tone: "info" },
  docs: { label: "Docs", tone: "neutral" },
};

const TONE_STYLES: Record<ToneName, { bg: string; border: string }> = {
  brand: { bg: "var(--brand-alpha-weak)", border: "var(--brand-alpha-medium)" },
  success: { bg: "var(--success-alpha-weak)", border: "var(--success-alpha-medium)" },
  danger: { bg: "var(--danger-alpha-weak)", border: "var(--danger-alpha-medium)" },
  warning: { bg: "var(--warning-alpha-weak)", border: "var(--warning-alpha-medium)" },
  info: { bg: "var(--info-alpha-weak, var(--brand-alpha-weak))", border: "var(--info-alpha-medium, var(--brand-alpha-medium))" },
  neutral: { bg: "var(--neutral-alpha-weak)", border: "var(--neutral-alpha-medium)" },
};

const RELEASES: Release[] = [
  {
    version: "3.0.0",
    date: "2025-06-17",
    title: "Streaming pipelines and a new config format",
    summary:
      "Pipelines can now stream results as they are produced, and configuration moves to a single typed file. This release contains breaking changes; see the migration snippet below.",
    tags: ["feature", "breaking"],
    changes: [
      "Added createPipeline() with first-class async iterator support.",
      "Replaced .relayrc.json with a typed relay.config.ts file.",
      "Removed the deprecated onComplete callback in favour of the done event.",
      "Minimum supported Node.js version is now 20.11.",
    ],
    snippet: {
      label: "Migrate your config",
      language: "ts",
      code: `// relay.config.ts
import { defineConfig } from "relay-kit";

export default defineConfig({
  concurrency: 8,
  retries: { attempts: 3, backoff: "exponential" },
  stream: true,
});`,
    },
  },
  {
    version: "2.8.3",
    date: "2025-05-29",
    title: "Retry jitter and timeout fixes",
    summary: "A patch release addressing two reports of stalled jobs under heavy load.",
    tags: ["fix", "perf"],
    changes: [
      "Fixed a race where timed-out jobs were retried twice.",
      "Added randomized jitter to exponential backoff to avoid thundering herds.",
      "Reduced memory use of the in-flight job registry by roughly 18%.",
    ],
  },
  {
    version: "2.8.0",
    date: "2025-05-06",
    title: "Observability hooks",
    summary: "Tap into every stage of a job with lightweight, zero-overhead hooks when unused.",
    tags: ["feature", "docs"],
    changes: [
      "New hooks API: onStart, onRetry, onSuccess and onFailure.",
      "OpenTelemetry exporter available as relay-kit/otel.",
      "Rewrote the Troubleshooting guide with common failure patterns.",
    ],
    snippet: {
      label: "Register a hook",
      language: "ts",
      code: `import { createPipeline } from "relay-kit";

const pipeline = createPipeline({ name: "invoices" });

pipeline.on("onRetry", ({ jobId, attempt, error }) => {
  console.warn(\`Job \${jobId} retry #\${attempt}: \${error.message}\`);
});`,
    },
  },
  {
    version: "2.7.2",
    date: "2025-04-14",
    title: "Security hardening",
    summary: "Upgrades dependencies and tightens payload validation on the webhook receiver.",
    tags: ["security", "fix"],
    changes: [
      "Webhook signatures are now verified using constant-time comparison.",
      "Rejected payloads larger than 1 MB by default (configurable).",
      "Updated transitive dependencies to resolve two moderate advisories.",
    ],
  },
  {
    version: "2.7.0",
    date: "2025-03-03",
    title: "Faster cold starts",
    summary: "Lazy-loads optional adapters so serverless deployments start noticeably quicker.",
    tags: ["perf", "feature"],
    changes: [
      "Adapters are loaded on first use rather than at import time.",
      "Cold start on a 256 MB function dropped from 410 ms to 190 ms.",
      "Added the relay doctor command to diagnose environment issues.",
    ],
    snippet: {
      label: "Run diagnostics",
      language: "bash",
      code: `npx relay-kit doctor --verbose`,
    },
  },
];

const FILTERS: Array<"all" | TagKind> = ["all", "feature", "fix", "breaking", "perf", "security", "docs"];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function TagPill({ kind }: { kind: TagKind }) {
  const meta = TAG_META[kind];
  const tone = TONE_STYLES[meta.tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: "var(--radius-full, 999px)",
        border: `1px solid ${tone.border}`,
        background: tone.bg,
        color: "var(--neutral-on-background-strong)",
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.6,
        whiteSpace: "nowrap",
      }}
    >
      {meta.label}
    </span>
  );
}

function CodeSnippet({ snippet, id }: { snippet: Snippet; id: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setFailed(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setFailed(true);
      window.setTimeout(() => setFailed(false), 2500);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        border: "1px solid var(--neutral-alpha-medium)",
        borderRadius: "var(--radius-m)",
        overflow: "hidden",
        background: "var(--surface-background)",
        maxWidth: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "8px 8px 8px 16px",
          borderBottom: "1px solid var(--neutral-alpha-medium)",
          background: "var(--neutral-alpha-weak)",
        }}
      >
        <span id={`${id}-label`}>
          <Text variant="label-default-s" onBackground="neutral-medium">
            {snippet.label} · {snippet.language}
          </Text>
        </span>
        <Button size="s" variant="secondary" onClick={handleCopy}>
          {copied ? "Copied" : failed ? "Copy failed" : "Copy"}
        </Button>
        <span
          role="status"
          aria-live="polite"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
          }}
        >
          {copied ? "Code copied to clipboard" : failed ? "Could not copy code" : ""}
        </span>
      </div>
      <pre
        tabIndex={0}
        role="region"
        aria-labelledby={`${id}-label`}
        style={{
          margin: 0,
          padding: 16,
          overflowX: "auto",
          fontFamily: "var(--font-code)",
          fontSize: 13,
          lineHeight: 1.6,
          color: "var(--neutral-on-background-strong)",
          whiteSpace: "pre",
        }}
      >
        <code>{snippet.code}</code>
      </pre>
    </div>
  );
}

export default function ChangelogPage() {
  const [filter, setFilter] = useState<"all" | TagKind>("all");

  const visible = useMemo(
    () => (filter === "all" ? RELEASES : RELEASES.filter((r) => r.tags.includes(filter))),
    [filter],
  );

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="l" paddingY="xl" gap="xl">
      <Column maxWidth={48} fillWidth gap="32">
        <Column gap="12" as="header">
          <Text variant="label-default-s" onBackground="brand-weak">
            relay-kit
          </Text>
          <Heading as="h1" variant="display-strong-m">
            Changelog
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Every release of relay-kit, newest first. Filter by type to find what changed, and copy
            snippets straight into your project.
          </Text>
        </Column>

        <div role="group" aria-label="Filter releases by tag" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {FILTERS.map((f) => (
            <Button
              key={f}
              size="s"
              variant={filter === f ? "primary" : "secondary"}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : TAG_META[f].label}
            </Button>
          ))}
        </div>

        <div role="status" aria-live="polite">
          <Text variant="body-default-s" onBackground="neutral-weak">
            Showing {visible.length} of {RELEASES.length} releases
          </Text>
        </div>

        {visible.length === 0 ? (
          <Text variant="body-default-m" onBackground="neutral-weak">
            No releases match this filter.
          </Text>
        ) : (
          <ol
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 40,
            }}
          >
            {visible.map((release, index) => {
              const headingId = `release-${release.version.replace(/\./g, "-")}`;
              const isLast = index === visible.length - 1;
              return (
                <li
                  key={release.version}
                  style={{ position: "relative", paddingLeft: 32, minWidth: 0 }}
                >
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        left: 5,
                        top: 18,
                        bottom: -40,
                        width: 2,
                        background: "var(--neutral-alpha-medium)",
                      }}
                    />
                  )}
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 6,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: index === 0 ? "var(--brand-solid-strong)" : "var(--neutral-solid-medium)",
                      boxShadow: "0 0 0 4px var(--page-background)",
                    }}
                  />
                  <article aria-labelledby={headingId}>
                    <Column gap="16">
                      <Column gap="8">
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px 12px" }}>
                          <Heading as="h2" variant="heading-strong-xl" id={headingId}>
                            v{release.version}
                          </Heading>
                          <time dateTime={release.date}>
                            <Text variant="body-default-s" onBackground="neutral-weak">
                              {formatDate(release.date)}
                            </Text>
                          </time>
                        </div>
                        <Heading as="h3" variant="heading-default-m">
                          {release.title}
                        </Heading>
                        <ul
                          aria-label={`Tags for version ${release.version}`}
                          style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}
                        >
                          {release.tags.map((t) => (
                            <li key={t}>
                              <TagPill kind={t} />
                            </li>
                          ))}
                        </ul>
                      </Column>

                      <Text variant="body-default-m" onBackground="neutral-medium">
                        {release.summary}
                      </Text>

                      <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                        {release.changes.map((c) => (
                          <li key={c}>
                            <Text variant="body-default-m">{c}</Text>
                          </li>
                        ))}
                      </ul>

                      {release.snippet && <CodeSnippet snippet={release.snippet} id={`${headingId}-snippet`} />}
                    </Column>
                  </article>
                </li>
              );
            })}
          </ol>
        )}
      </Column>
    </Column>
  );
}
