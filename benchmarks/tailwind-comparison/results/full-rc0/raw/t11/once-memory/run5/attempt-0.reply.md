Not installed locally, so I'll rely on well-known APIs only and keep Once UI prop usage conservative.

```tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Column, Row, Flex, Heading, Text, Tag } from "@once-ui-system/core";

type TagKind = "feature" | "fix" | "breaking" | "perf" | "security" | "docs";

type Snippet = {
  label: string;
  language: string;
  code: string;
};

type Release = {
  version: string;
  date: string; // ISO
  title: string;
  summary: string;
  tags: TagKind[];
  changes: string[];
  snippet?: Snippet;
};

const TAG_META: Record<TagKind, { label: string; variant: "brand" | "success" | "danger" | "warning" | "info" | "neutral" }> = {
  feature: { label: "Feature", variant: "brand" },
  fix: { label: "Fix", variant: "success" },
  breaking: { label: "Breaking", variant: "danger" },
  perf: { label: "Performance", variant: "warning" },
  security: { label: "Security", variant: "info" },
  docs: { label: "Docs", variant: "neutral" },
};

const RELEASES: Release[] = [
  {
    version: "3.0.0",
    date: "2025-06-10",
    title: "Streaming pipelines and a new config format",
    summary:
      "Pipelines can now stream partial results to subscribers as each stage completes. The configuration file moved to a typed, single-export format.",
    tags: ["feature", "breaking"],
    changes: [
      "Added pipeline.stream() for incremental delivery of stage output.",
      "Replaced pulse.config.json with a typed pulse.config.ts default export.",
      "Removed the deprecated onComplete callback; use the returned promise instead.",
      "Node.js 18 is no longer supported. Minimum version is Node.js 20.",
    ],
    snippet: {
      label: "Migrate your config",
      language: "ts",
      code: `// pulse.config.ts
import { defineConfig } from "@pulse/core";

export default defineConfig({
  concurrency: 8,
  retries: { attempts: 3, backoffMs: 250 },
  stages: ["ingest", "transform", "publish"],
});`,
    },
  },
  {
    version: "2.8.0",
    date: "2025-04-22",
    title: "Faster cold starts",
    summary:
      "Lazy-loaded stage runners cut cold start time by roughly 40% on typical workloads, and the scheduler now batches idle wakeups.",
    tags: ["perf", "feature"],
    changes: [
      "Stage runners load on first use instead of at boot.",
      "Scheduler coalesces timers that fire within the same 5 ms window.",
      "Added --trace flag to the CLI to print per-stage timing.",
    ],
    snippet: {
      label: "Try the trace flag",
      language: "bash",
      code: `npx pulse run ./pipelines/daily.ts --trace`,
    },
  },
  {
    version: "2.7.3",
    date: "2025-03-18",
    title: "Security patch for webhook signatures",
    summary:
      "Webhook signature verification now uses constant-time comparison. All users of the webhook trigger should upgrade.",
    tags: ["security", "fix"],
    changes: [
      "Use constant-time comparison when verifying HMAC signatures.",
      "Reject webhook payloads with timestamps older than five minutes.",
      "Fixed a race that could deliver the same event twice after a retry.",
    ],
    snippet: {
      label: "Upgrade",
      language: "bash",
      code: `npm install @pulse/core@2.7.3`,
    },
  },
  {
    version: "2.7.0",
    date: "2025-02-04",
    title: "Retry policies per stage",
    summary:
      "Each stage can now declare its own retry policy, overriding the pipeline default.",
    tags: ["feature"],
    changes: [
      "New retries option on stage definitions.",
      "Exponential backoff with optional jitter.",
      "Failed attempts are now included in run history with their error messages.",
    ],
    snippet: {
      label: "Per-stage retries",
      language: "ts",
      code: `stage("publish", publishFn, {
  retries: { attempts: 5, backoffMs: 500, jitter: true },
});`,
    },
  },
  {
    version: "2.6.2",
    date: "2025-01-15",
    title: "Stability fixes",
    summary: "A round of fixes for edge cases reported after the 2.6 release.",
    tags: ["fix"],
    changes: [
      "Fixed memory growth in long-running watchers.",
      "CLI no longer exits with code 0 when a stage throws during shutdown.",
      "Corrected the type of RunResult.durationMs from string to number.",
    ],
  },
  {
    version: "2.6.0",
    date: "2024-12-02",
    title: "Documentation overhaul",
    summary:
      "A rewritten guide, a searchable API reference and runnable examples for every public function.",
    tags: ["docs", "feature"],
    changes: [
      "New getting-started guide that takes about ten minutes.",
      "Every API entry now includes a runnable example.",
      "Added a troubleshooting section covering the most common errors.",
    ],
  },
];

const FILTERS: Array<"all" | TagKind> = ["all", "feature", "fix", "breaking", "perf", "security", "docs"];

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

function CodeSnippet({ snippet, id }: { snippet: Snippet; id: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const onCopy = useCallback(async () => {
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
    setFailed(!ok);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 2000);
  }, [snippet.code]);

  return (
    <div className="cl-snippet">
      <div className="cl-snippet-head">
        <span className="cl-snippet-label" id={`${id}-label`}>
          {snippet.label}
          <span className="cl-lang">{snippet.language}</span>
        </span>
        <button type="button" className="cl-copy" onClick={onCopy} aria-describedby={`${id}-label`}>
          {copied ? "Copied" : failed ? "Copy failed" : "Copy"}
          <span className="cl-sr">{copied ? " to clipboard" : failed ? ", select the text manually" : " code"}</span>
        </button>
      </div>
      <pre className="cl-pre" tabIndex={0} aria-labelledby={`${id}-label`}>
        <code>{snippet.code}</code>
      </pre>
      <span className="cl-sr" role="status" aria-live="polite">
        {copied ? "Code copied to clipboard" : failed ? "Copy failed" : ""}
      </span>
    </div>
  );
}

export default function Page() {
  const [filter, setFilter] = useState<"all" | TagKind>("all");

  const visible = useMemo(
    () => (filter === "all" ? RELEASES : RELEASES.filter((r) => r.tags.includes(filter))),
    [filter],
  );

  return (
    <Column fillWidth horizontal="center" paddingX="m" paddingY="xl">
      <style>{`
        .cl-wrap { width: 100%; max-width: 52rem; }
        .cl-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        .cl-filters { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0; padding: 0; list-style: none; }
        .cl-filter {
          font: inherit; font-size: 0.875rem; cursor: pointer;
          padding: 0.375rem 0.875rem; border-radius: 999px;
          border: 1px solid var(--neutral-alpha-medium); background: transparent; color: var(--neutral-on-background-strong);
          min-height: 2.25rem;
        }
        .cl-filter:hover { background: var(--neutral-alpha-weak); }
        .cl-filter[aria-pressed="true"] { background: var(--brand-solid-strong); border-color: var(--brand-solid-strong); color: var(--brand-on-solid-strong); }
        .cl-filter:focus-visible, .cl-copy:focus-visible, .cl-pre:focus-visible { outline: 2px solid var(--brand-solid-strong); outline-offset: 2px; }
        .cl-list { list-style: none; margin: 0; padding: 0; position: relative; }
        .cl-item { position: relative; padding-left: 2rem; padding-bottom: 2.5rem; }
        .cl-item:last-child { padding-bottom: 0; }
        .cl-item::before {
          content: ""; position: absolute; left: 0.4375rem; top: 1.25rem; bottom: -0.25rem; width: 2px;
          background: var(--neutral-alpha-medium);
        }
        .cl-item:last-child::before { display: none; }
        .cl-dot {
          position: absolute; left: 0; top: 0.3rem; width: 1rem; height: 1rem; border-radius: 50%;
          background: var(--page-background, #fff); border: 3px solid var(--brand-solid-strong);
          box-sizing: border-box;
        }
        .cl-card {
          border: 1px solid var(--neutral-alpha-medium); border-radius: 0.75rem;
          background: var(--surface-background); padding: 1.25rem; min-width: 0;
        }
        .cl-meta { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.5rem 1rem; }
        .cl-version { font-family: var(--font-code); font-weight: 700; font-size: 1.125rem; color: var(--neutral-on-background-strong); }
        .cl-tags { display: flex; flex-wrap: wrap; gap: 0.375rem; margin: 0.75rem 0 0; padding: 0; list-style: none; }
        .cl-changes { margin: 0.75rem 0 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.375rem; color: var(--neutral-on-background-medium); line-height: 1.5; }
        .cl-snippet { margin-top: 1rem; border: 1px solid var(--neutral-alpha-medium); border-radius: 0.5rem; overflow: hidden; background: var(--neutral-alpha-weak); }
        .cl-snippet-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.375rem 0.5rem 0.375rem 0.75rem; border-bottom: 1px solid var(--neutral-alpha-medium); }
        .cl-snippet-label { font-size: 0.8125rem; color: var(--neutral-on-background-medium); display: flex; align-items: center; gap: 0.5rem; min-width: 0; }
        .cl-lang { font-family: var(--font-code); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.04em; padding: 0.0625rem 0.375rem; border-radius: 0.25rem; background: var(--neutral-alpha-medium); }
        .cl-copy {
          font: inherit; font-size: 0.8125rem; cursor: pointer; flex-shrink: 0;
          min-height: 2rem; padding: 0.25rem 0.75rem; border-radius: 0.375rem;
          border: 1px solid var(--neutral-alpha-medium); background: var(--surface-background); color: var(--neutral-on-background-strong);
        }
        .cl-copy:hover { background: var(--neutral-alpha-weak); }
        .cl-pre { margin: 0; padding: 0.875rem 1rem; overflow-x: auto; font-family: var(--font-code); font-size: 0.8125rem; line-height: 1.6; color: var(--neutral-on-background-strong); tab-size: 2; }
        .cl-empty { padding: 2rem 1rem; text-align: center; border: 1px dashed var(--neutral-alpha-medium); border-radius: 0.75rem; }
        @media (min-width: 40rem) {
          .cl-item { padding-left: 2.75rem; }
          .cl-item::before { left: 0.4375rem; }
          .cl-card { padding: 1.5rem; }
        }
      `}</style>

      <div className="cl-wrap">
        <Column as="header" gap="12" paddingBottom="32">
          <Text variant="label-default-s" onBackground="brand-weak">
            Pulse · Release notes
          </Text>
          <Heading as="h1" variant="display-strong-s">
            Changelog
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Every release of Pulse, newest first. Filter by type to find what changed and how to adopt it.
          </Text>
        </Column>

        <Column as="section" gap="8" paddingBottom="32" aria-labelledby="cl-filter-heading">
          <Text as="h2" id="cl-filter-heading" variant="label-default-s" onBackground="neutral-weak">
            Filter by tag
          </Text>
          <ul className="cl-filters">
            {FILTERS.map((f) => (
              <li key={f}>
                <button
                  type="button"
                  className="cl-filter"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "All releases" : TAG_META[f].label}
                </button>
              </li>
            ))}
          </ul>
          <span className="cl-sr" role="status" aria-live="polite">
            Showing {visible.length} {visible.length === 1 ? "release" : "releases"}
          </span>
        </Column>

        {visible.length === 0 ? (
          <div className="cl-empty">
            <Text variant="body-default-m" onBackground="neutral-weak">
              No releases match this filter.
            </Text>
          </div>
        ) : (
          <ol className="cl-list" aria-label="Releases">
            {visible.map((r) => {
              const id = `rel-${r.version.replace(/\./g, "-")}`;
              return (
                <li key={r.version} className="cl-item">
                  <span className="cl-dot" aria-hidden="true" />
                  <article className="cl-card" aria-labelledby={`${id}-title`}>
                    <div className="cl-meta">
                      <span className="cl-version">v{r.version}</span>
                      <time dateTime={r.date}>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          {formatDate(r.date)}
                        </Text>
                      </time>
                    </div>
                    <Heading as="h2" variant="heading-strong-l" id={`${id}-title`} marginTop="8">
                      {r.title}
                    </Heading>
                    <Text as="p" variant="body-default-m" onBackground="neutral-medium" marginTop="8">
                      {r.summary}
                    </Text>
                    <ul className="cl-tags" aria-label={`Tags for version ${r.version}`}>
                      {r.tags.map((t) => (
                        <li key={t}>
                          <Tag variant={TAG_META[t].variant} size="m">
                            {TAG_META[t].label}
                          </Tag>
                        </li>
                      ))}
                    </ul>
                    <ul className="cl-changes">
                      {r.changes.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                    {r.snippet ? <CodeSnippet snippet={r.snippet} id={`${id}-snip`} /> : null}
                  </article>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </Column>
  );
}
```