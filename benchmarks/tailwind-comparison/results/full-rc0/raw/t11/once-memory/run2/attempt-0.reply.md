```tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Column, Flex, Heading, Row, Text } from "@once-ui-system/core";

type TagKind = "feature" | "fix" | "breaking" | "perf" | "security" | "docs";

type Snippet = {
  label: string;
  language: string;
  code: string;
};

type Release = {
  version: string;
  date: string;
  title: string;
  summary: string;
  tags: TagKind[];
  highlights: string[];
  snippet?: Snippet;
};

const TAG_META: Record<TagKind, { label: string; color: string }> = {
  feature: { label: "Feature", color: "#2f9e6b" },
  fix: { label: "Fix", color: "#3b82d6" },
  breaking: { label: "Breaking", color: "#d6453b" },
  perf: { label: "Performance", color: "#c98a0b" },
  security: { label: "Security", color: "#8b5cd6" },
  docs: { label: "Docs", color: "#6b7280" },
};

const RELEASES: Release[] = [
  {
    version: "3.0.0",
    date: "2025-03-18",
    title: "Streaming pipelines and a new config format",
    summary:
      "Pipelines can now stream partial results to clients as steps complete. The config file moves to a typed TypeScript format, and several long-deprecated options are removed.",
    tags: ["feature", "breaking"],
    highlights: [
      "Stream step output with the new onProgress hook.",
      "Config is now defined with defineConfig() for full type inference.",
      "Removed the legacy `workers` option; use `concurrency` instead.",
      "Minimum supported Node.js version is now 20.",
    ],
    snippet: {
      label: "Migrate your config",
      language: "ts",
      code: `import { defineConfig } from "relay-cli";

export default defineConfig({
  concurrency: 4,
  stream: true,
  onProgress(step) {
    console.log(\`\${step.name}: \${step.percent}%\`);
  },
});`,
    },
  },
  {
    version: "2.8.2",
    date: "2025-02-27",
    title: "Retry fixes and safer defaults",
    summary:
      "A patch release addressing retry storms under network partitions and tightening default TLS settings.",
    tags: ["fix", "security"],
    highlights: [
      "Exponential backoff now caps at 30 seconds with jitter.",
      "TLS 1.0 and 1.1 are no longer negotiated by default.",
      "Fixed a crash when a step returned `undefined` during dry runs.",
    ],
  },
  {
    version: "2.8.0",
    date: "2025-02-04",
    title: "Faster cold starts",
    summary:
      "Lazy-loading of plugins and a rewritten module resolver cut cold start time by more than half on large projects.",
    tags: ["perf", "feature"],
    highlights: [
      "Plugins load on first use instead of at startup.",
      "Resolver cache persists between runs in `.relay/cache`.",
      "New `relay doctor` command diagnoses slow plugins.",
    ],
    snippet: {
      label: "Profile startup time",
      language: "bash",
      code: `npx relay doctor --profile
# Plugin load times
#   @relay/git      12ms
#   @relay/docker   48ms`,
    },
  },
  {
    version: "2.7.1",
    date: "2025-01-15",
    title: "Documentation overhaul",
    summary:
      "Every command now has a reference page with runnable examples, plus a searchable recipes section.",
    tags: ["docs"],
    highlights: [
      "Added 24 recipes covering CI, monorepos and caching.",
      "Command reference includes exit codes and environment variables.",
    ],
  },
  {
    version: "2.7.0",
    date: "2024-12-09",
    title: "Remote caching",
    summary:
      "Share build artifacts across machines with an S3-compatible remote cache, now generally available.",
    tags: ["feature", "perf"],
    highlights: [
      "Supports any S3-compatible storage endpoint.",
      "Cache entries are content-addressed and verified on download.",
      "Fixed an issue where symlinks were dereferenced on restore.",
    ],
    snippet: {
      label: "Enable remote cache",
      language: "bash",
      code: `relay config set cache.remote s3://team-builds/relay
relay config set cache.readOnly false`,
    },
  },
];

const ALL = "all" as const;
type Filter = TagKind | typeof ALL;

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function TagBadge({ kind }: { kind: TagKind }) {
  const meta = TAG_META[kind];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: "20px",
        color: meta.color,
        border: `1px solid ${meta.color}`,
        background: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
      }}
    >
      <span
        aria-hidden="true"
        style={{ width: 6, height: 6, borderRadius: 999, background: meta.color }}
      />
      {meta.label}
    </span>
  );
}

function CodeSnippet({ snippet, id }: { snippet: Snippet; id: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = useCallback(async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(snippet.code);
      ok = true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = snippet.code;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    setCopied(ok);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }, [snippet.code]);

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid var(--neutral-alpha-medium)",
        background: "var(--surface-background)",
        overflow: "hidden",
        width: "100%",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "8px 8px 8px 14px",
          borderBottom: "1px solid var(--neutral-alpha-medium)",
        }}
      >
        <span id={`${id}-label`} style={{ fontSize: 13, fontWeight: 600 }}>
          {snippet.label}
          <span
            style={{
              marginLeft: 8,
              fontSize: 11,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              opacity: 0.6,
            }}
          >
            {snippet.language}
          </span>
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy code: ${snippet.label}`}
          className="cl-copy"
          style={{
            cursor: "pointer",
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
            color: "inherit",
            background: "var(--neutral-alpha-weak)",
            border: "1px solid var(--neutral-alpha-medium)",
            minHeight: 32,
          }}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre
        tabIndex={0}
        aria-labelledby={`${id}-label`}
        style={{
          margin: 0,
          padding: 14,
          overflowX: "auto",
          fontFamily: "var(--font-code)",
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        <code>{snippet.code}</code>
      </pre>
      <span role="status" aria-live="polite" style={SR_ONLY}>
        {copied ? "Code copied to clipboard" : ""}
      </span>
    </div>
  );
}

const SR_ONLY: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};

export default function Page() {
  const [filter, setFilter] = useState<Filter>(ALL);

  const filters = useMemo<Filter[]>(() => {
    const used = new Set<TagKind>();
    RELEASES.forEach((r) => r.tags.forEach((t) => used.add(t)));
    return [ALL, ...(Object.keys(TAG_META) as TagKind[]).filter((t) => used.has(t))];
  }, []);

  const visible = useMemo(
    () => (filter === ALL ? RELEASES : RELEASES.filter((r) => r.tags.includes(filter))),
    [filter],
  );

  return (
    <Flex fillWidth horizontal="center" paddingX="m" paddingY="xl">
      <style>{`
        .cl-copy:hover { background: var(--neutral-alpha-medium) !important; }
        .cl-copy:focus-visible,
        .cl-filter:focus-visible,
        .cl-code-focus:focus-visible,
        pre:focus-visible { outline: 2px solid var(--brand-solid-strong, #3b82d6); outline-offset: 2px; }
        .cl-filter:hover { background: var(--neutral-alpha-medium) !important; }
        .cl-timeline { list-style: none; margin: 0; padding: 0; position: relative; }
        .cl-item { position: relative; padding-left: 32px; padding-bottom: 40px; }
        .cl-item:last-child { padding-bottom: 0; }
        .cl-item::before {
          content: ""; position: absolute; left: 6px; top: 20px; bottom: -4px;
          width: 2px; background: var(--neutral-alpha-medium);
        }
        .cl-item:last-child::before { display: none; }
        .cl-dot {
          position: absolute; left: 0; top: 6px; width: 14px; height: 14px; border-radius: 999px;
          background: var(--page-background, #fff); border: 3px solid var(--brand-solid-strong, #3b82d6);
          box-sizing: border-box;
        }
        .cl-card {
          border: 1px solid var(--neutral-alpha-medium); border-radius: 16px;
          padding: 20px; background: var(--surface-background); min-width: 0;
        }
        @media (min-width: 768px) {
          .cl-item { padding-left: 48px; }
          .cl-item::before { left: 8px; }
          .cl-dot { width: 18px; height: 18px; left: -1px; top: 4px; }
          .cl-card { padding: 28px; }
        }
        @media (prefers-reduced-motion: no-preference) {
          .cl-copy, .cl-filter { transition: background 0.15s ease; }
        }
      `}</style>

      <Column fillWidth maxWidth={40} gap="32" style={{ minWidth: 0 }}>
        <Column as="header" gap="12">
          <Text variant="label-default-s" onBackground="neutral-weak">
            RELAY CLI
          </Text>
          <Heading as="h1" variant="display-strong-s" wrap="balance">
            Changelog
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            Every release of Relay, newest first. Filter by tag to find new features, fixes and
            breaking changes.
          </Text>
        </Column>

        <nav aria-label="Filter releases by tag">
          <div role="group" aria-label="Tags" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {filters.map((f) => {
              const active = f === filter;
              return (
                <button
                  key={f}
                  type="button"
                  className="cl-filter"
                  aria-pressed={active}
                  onClick={() => setFilter(f)}
                  style={{
                    cursor: "pointer",
                    padding: "6px 14px",
                    minHeight: 36,
                    borderRadius: 999,
                    fontFamily: "inherit",
                    fontSize: 13,
                    fontWeight: 600,
                    color: active ? "var(--page-background, #fff)" : "inherit",
                    background: active ? "var(--neutral-solid-strong, #222)" : "var(--neutral-alpha-weak)",
                    border: "1px solid var(--neutral-alpha-medium)",
                  }}
                >
                  {f === ALL ? "All releases" : TAG_META[f].label}
                </button>
              );
            })}
          </div>
          <span role="status" aria-live="polite" style={SR_ONLY}>
            Showing {visible.length} of {RELEASES.length} releases
          </span>
        </nav>

        <ol className="cl-timeline" aria-label="Release timeline">
          {visible.map((release) => {
            const id = `v${release.version.replace(/\./g, "-")}`;
            return (
              <li key={release.version} className="cl-item">
                <span className="cl-dot" aria-hidden="true" />
                <article className="cl-card" aria-labelledby={`${id}-title`}>
                  <Column gap="16" style={{ minWidth: 0 }}>
                    <Row gap="12" vertical="center" wrap>
                      <span
                        style={{
                          fontFamily: "var(--font-code)",
                          fontSize: 14,
                          fontWeight: 700,
                          padding: "2px 10px",
                          borderRadius: 8,
                          background: "var(--neutral-alpha-weak)",
                          border: "1px solid var(--neutral-alpha-medium)",
                        }}
                      >
                        v{release.version}
                      </span>
                      <time dateTime={release.date} style={{ fontSize: 14, opacity: 0.7 }}>
                        {formatDate(release.date)}
                      </time>
                    </Row>

                    <Heading as="h2" id={`${id}-title`} variant="heading-strong-l" wrap="balance">
                      {release.title}
                    </Heading>

                    <ul
                      aria-label={`Tags for version ${release.version}`}
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        listStyle: "none",
                        margin: 0,
                        padding: 0,
                      }}
                    >
                      {release.tags.map((t) => (
                        <li key={t}>
                          <TagBadge kind={t} />
                        </li>
                      ))}
                    </ul>

                    <Text variant="body-default-m" onBackground="neutral-weak">
                      {release.summary}
                    </Text>

                    <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>
                      {release.highlights.map((h) => (
                        <li key={h} style={{ fontSize: 15, lineHeight: 1.5 }}>
                          {h}
                        </li>
                      ))}
                    </ul>

                    {release.snippet && <CodeSnippet snippet={release.snippet} id={`${id}-code`} />}
                  </Column>
                </article>
              </li>
            );
          })}
        </ol>

        {visible.length === 0 && (
          <Text variant="body-default-m" onBackground="neutral-weak">
            No releases match this tag.
          </Text>
        )}
      </Column>
    </Flex>
  );
}
```