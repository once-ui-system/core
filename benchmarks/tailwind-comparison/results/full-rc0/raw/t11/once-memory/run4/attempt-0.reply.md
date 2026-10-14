The package isn't installed locally, so I'll stick to Once UI components and props I'm confident about (Flex, Column, Row, Heading, Text, Tag, Button, Line, Background-free). I'll use plain elements for the semantic list and the copy button, so the types stay safe.

I'll use Once UI layout primitives with conservative props, native `<ol>`, `<button>`, and `<pre>` for semantics, and CSS variables from the Once UI tokens for styling.

```tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Column, Flex, Heading, Row, Text } from "@once-ui-system/core";

type TagKind = "feature" | "fix" | "breaking" | "perf" | "security" | "docs";

interface Snippet {
  label: string;
  language: string;
  code: string;
}

interface Release {
  version: string;
  date: string;
  iso: string;
  title: string;
  summary: string;
  tags: TagKind[];
  changes: string[];
  snippet?: Snippet;
}

const TAG_META: Record<TagKind, { label: string; color: string }> = {
  feature: { label: "Feature", color: "var(--brand-on-background-strong)" },
  fix: { label: "Fix", color: "var(--success-on-background-strong)" },
  breaking: { label: "Breaking", color: "var(--danger-on-background-strong)" },
  perf: { label: "Performance", color: "var(--accent-on-background-strong)" },
  security: { label: "Security", color: "var(--warning-on-background-strong)" },
  docs: { label: "Docs", color: "var(--neutral-on-background-strong)" },
};

const RELEASES: Release[] = [
  {
    version: "3.0.0",
    date: "March 18, 2025",
    iso: "2025-03-18",
    title: "Streaming pipelines and a new config format",
    summary:
      "Pipelines can now stream partial results to clients as stages complete. The configuration file moves to a typed TypeScript format, and the legacy YAML loader has been removed.",
    tags: ["feature", "breaking"],
    changes: [
      "Added `stream()` to the pipeline runner for incremental results.",
      "Replaced `harbor.yaml` with `harbor.config.ts` and a typed `defineConfig` helper.",
      "Removed the deprecated YAML loader and the `--legacy-config` flag.",
      "Minimum supported Node.js version is now 20.11.",
    ],
    snippet: {
      label: "harbor.config.ts",
      language: "typescript",
      code: `import { defineConfig } from "@harbor/core";

export default defineConfig({
  pipeline: {
    concurrency: 8,
    stream: true,
  },
  retries: { attempts: 3, backoffMs: 250 },
});`,
    },
  },
  {
    version: "2.8.0",
    date: "January 29, 2025",
    iso: "2025-01-29",
    title: "Faster cold starts",
    summary:
      "Module graph caching and lazy plugin loading cut cold start time on large workspaces by roughly half.",
    tags: ["perf", "feature"],
    changes: [
      "Persistent module graph cache stored in `.harbor/cache`.",
      "Plugins are now loaded on first use instead of at startup.",
      "New `harbor doctor` command reports slow plugins and cache hit rate.",
    ],
    snippet: {
      label: "Terminal",
      language: "bash",
      code: `npm install @harbor/core@2.8.0
npx harbor doctor --verbose`,
    },
  },
  {
    version: "2.7.3",
    date: "December 11, 2024",
    iso: "2024-12-11",
    title: "Security patch for artifact uploads",
    summary:
      "Fixes a path traversal issue in artifact uploads when filenames contained encoded separators. All users on 2.x should upgrade.",
    tags: ["security", "fix"],
    changes: [
      "Normalize and validate artifact paths before writing to disk.",
      "Reject filenames containing encoded path separators.",
      "Fixed a race condition when two uploads shared the same temporary directory.",
    ],
    snippet: {
      label: "Terminal",
      language: "bash",
      code: `npm install @harbor/core@2.7.3 --save-exact`,
    },
  },
  {
    version: "2.7.0",
    date: "November 4, 2024",
    iso: "2024-11-04",
    title: "Workspace filters and watch mode",
    summary:
      "Target a subset of packages with filters, and rerun only what changed with the new watch mode.",
    tags: ["feature", "docs"],
    changes: [
      "Added `--filter` with glob and dependency-graph selectors.",
      "Added `harbor watch` with debounced, incremental reruns.",
      "Rewrote the getting started guide with a monorepo walkthrough.",
    ],
    snippet: {
      label: "Terminal",
      language: "bash",
      code: `harbor run build --filter "./packages/ui..."
harbor watch test --filter "@acme/api"`,
    },
  },
  {
    version: "2.6.2",
    date: "September 19, 2024",
    iso: "2024-09-19",
    title: "Stability fixes",
    summary: "A round of fixes for Windows path handling and noisy log output.",
    tags: ["fix"],
    changes: [
      "Fixed drive letter casing mismatches on Windows.",
      "Silenced duplicate warnings when multiple reporters are enabled.",
      "Corrected exit codes when a stage is cancelled by the user.",
    ],
  },
];

const FILTERS: Array<{ id: "all" | TagKind; label: string }> = [
  { id: "all", label: "All" },
  { id: "feature", label: "Features" },
  { id: "fix", label: "Fixes" },
  { id: "breaking", label: "Breaking" },
  { id: "perf", label: "Performance" },
  { id: "security", label: "Security" },
  { id: "docs", label: "Docs" },
];

const styles = `
.cl-wrap { width: 100%; max-width: 860px; margin: 0 auto; padding: 48px 20px 96px; box-sizing: border-box; }
.cl-skip { position: absolute; left: -9999px; top: 8px; z-index: 10; padding: 8px 12px; border-radius: 8px;
  background: var(--surface-background); color: var(--neutral-on-background-strong); border: 1px solid var(--neutral-alpha-medium); }
.cl-skip:focus { left: 8px; }
.cl-filters { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; list-style: none; }
.cl-chip { font: inherit; font-size: 14px; cursor: pointer; padding: 6px 14px; border-radius: 999px;
  border: 1px solid var(--neutral-alpha-medium); background: var(--surface-background);
  color: var(--neutral-on-background-strong); min-height: 36px; transition: background .15s, border-color .15s; }
.cl-chip:hover { background: var(--neutral-alpha-weak); }
.cl-chip[aria-pressed="true"] { background: var(--brand-solid-strong); color: var(--brand-on-solid-strong);
  border-color: var(--brand-solid-strong); }
.cl-chip:focus-visible, .cl-copy:focus-visible, .cl-skip:focus-visible, .cl-anchor:focus-visible {
  outline: 2px solid var(--brand-solid-strong); outline-offset: 2px; }
.cl-list { list-style: none; margin: 0; padding: 0; position: relative; }
.cl-list::before { content: ""; position: absolute; top: 8px; bottom: 8px; left: 7px; width: 2px;
  background: var(--neutral-alpha-medium); }
.cl-item { position: relative; padding: 0 0 40px 40px; }
.cl-item:last-child { padding-bottom: 0; }
.cl-dot { position: absolute; left: 0; top: 6px; width: 16px; height: 16px; border-radius: 50%;
  background: var(--page-background); border: 3px solid var(--brand-solid-strong); box-sizing: border-box; }
.cl-item[data-latest="true"] .cl-dot { background: var(--brand-solid-strong); }
.cl-card { border: 1px solid var(--neutral-alpha-medium); border-radius: 16px; padding: 20px;
  background: var(--surface-background); }
.cl-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-bottom: 8px; }
.cl-version { font-family: var(--font-code); font-size: 14px; font-weight: 600; padding: 2px 10px;
  border-radius: 8px; background: var(--neutral-alpha-weak); color: var(--neutral-on-background-strong); }
.cl-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 0; padding: 0; list-style: none; }
.cl-tag { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600;
  padding: 3px 10px; border-radius: 999px; border: 1px solid var(--neutral-alpha-medium);
  color: var(--neutral-on-background-strong); background: var(--page-background); }
.cl-tag i { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.cl-changes { margin: 16px 0 0; padding-left: 20px; color: var(--neutral-on-background-medium); line-height: 1.6; }
.cl-changes li + li { margin-top: 6px; }
.cl-changes code { font-family: var(--font-code); font-size: 0.9em; padding: 1px 6px; border-radius: 6px;
  background: var(--neutral-alpha-weak); color: var(--neutral-on-background-strong); }
.cl-code { margin-top: 16px; border: 1px solid var(--neutral-alpha-medium); border-radius: 12px; overflow: hidden;
  background: var(--page-background); }
.cl-code-head { display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 6px 8px 6px 14px; border-bottom: 1px solid var(--neutral-alpha-medium); background: var(--neutral-alpha-weak); }
.cl-code-label { font-family: var(--font-code); font-size: 12px; color: var(--neutral-on-background-medium); }
.cl-copy { font: inherit; font-size: 13px; cursor: pointer; min-height: 32px; padding: 4px 12px; border-radius: 8px;
  border: 1px solid var(--neutral-alpha-medium); background: var(--surface-background);
  color: var(--neutral-on-background-strong); }
.cl-copy:hover { background: var(--neutral-alpha-weak); }
.cl-pre { margin: 0; padding: 14px; overflow-x: auto; font-family: var(--font-code); font-size: 13px; line-height: 1.6;
  color: var(--neutral-on-background-strong); tab-size: 2; }
.cl-pre:focus-visible { outline: 2px solid var(--brand-solid-strong); outline-offset: -2px; }
.cl-anchor { color: inherit; text-decoration: none; }
.cl-anchor:hover { text-decoration: underline; }
.cl-empty { padding: 32px; text-align: center; border: 1px dashed var(--neutral-alpha-medium); border-radius: 16px;
  color: var(--neutral-on-background-medium); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
@media (min-width: 720px) {
  .cl-wrap { padding: 72px 32px 120px; }
  .cl-card { padding: 28px; }
  .cl-list::before { left: 8px; }
  .cl-item { padding-left: 56px; padding-bottom: 48px; }
  .cl-dot { width: 18px; height: 18px; top: 8px; }
  .cl-list::before { left: 8px; }
}
@media (prefers-reduced-motion: reduce) {
  .cl-chip { transition: none; }
}
`;

/** Render a string, turning `backtick` segments into <code>. */
function renderInline(text: string) {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith("`") && part.endsWith("`") && part.length > 1 ? (
      <code key={i}>{part.slice(1, -1)}</code>
    ) : (
      <span key={i}>{part}</span>
    ),
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
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }, [snippet.code]);

  return (
    <div className="cl-code">
      <div className="cl-code-head">
        <span className="cl-code-label" id={`${id}-label`}>
          {snippet.label}
        </span>
        <button
          type="button"
          className="cl-copy"
          onClick={onCopy}
          aria-describedby={`${id}-label`}
        >
          {copied ? "Copied!" : "Copy"}
          <span className="sr-only"> {snippet.label} snippet to clipboard</span>
        </button>
      </div>
      <pre className="cl-pre" tabIndex={0} aria-labelledby={`${id}-label`}>
        <code className={`language-${snippet.language}`}>{snippet.code}</code>
      </pre>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
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
    <Flex fillWidth horizontal="center">
      <style>{styles}</style>
      <a className="cl-skip" href="#releases">
        Skip to releases
      </a>
      <main className="cl-wrap">
        <Column gap="16" as="header" marginBottom="32">
          <Text variant="label-default-s" onBackground="brand-weak">
            Harbor · Release notes
          </Text>
          <Heading as="h1" variant="display-strong-m" wrap="balance">
            Changelog
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            Every release of Harbor, newest first. Filter by type to find what changed, and copy
            upgrade commands or config straight from each entry.
          </Text>
        </Column>

        <Column gap="12" marginBottom="40" as="section" aria-labelledby="filter-heading">
          <h2 id="filter-heading" className="sr-only">
            Filter releases by tag
          </h2>
          <ul className="cl-filters">
            {FILTERS.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  className="cl-chip"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              </li>
            ))}
          </ul>
          <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
            Showing {visible.length} of {RELEASES.length} releases
          </Text>
        </Column>

        <section id="releases" aria-label="Releases">
          {visible.length === 0 ? (
            <div className="cl-empty">No releases match this filter.</div>
          ) : (
            <ol className="cl-list">
              {visible.map((release) => {
                const id = `v${release.version.replace(/\./g, "-")}`;
                const isLatest = release.version === RELEASES[0].version;
                return (
                  <li key={release.version} className="cl-item" data-latest={isLatest}>
                    <span className="cl-dot" aria-hidden="true" />
                    <article className="cl-card" aria-labelledby={`${id}-title`}>
                      <div className="cl-meta">
                        <span className="cl-version">v{release.version}</span>
                        <time dateTime={release.iso}>
                          <Text variant="body-default-s" onBackground="neutral-weak">
                            {release.date}
                          </Text>
                        </time>
                        {isLatest && (
                          <Text variant="label-strong-s" onBackground="brand-strong">
                            Latest
                          </Text>
                        )}
                      </div>
                      <Heading as="h2" variant="heading-strong-l" id={`${id}-title`}>
                        <a className="cl-anchor" href={`#${id}-title`}>
                          {release.title}
                        </a>
                      </Heading>
                      <Row marginTop="8">
                        <Text variant="body-default-m" onBackground="neutral-medium">
                          {release.summary}
                        </Text>
                      </Row>

                      <ul className="cl-tags" aria-label={`Tags for version ${release.version}`}>
                        {release.tags.map((t) => (
                          <li key={t} className="cl-tag">
                            <i aria-hidden="true" style={{ background: TAG_META[t].color }} />
                            {TAG_META[t].label}
                          </li>
                        ))}
                      </ul>

                      <ul className="cl-changes">
                        {release.changes.map((c) => (
                          <li key={c}>{renderInline(c)}</li>
                        ))}
                      </ul>

                      {release.snippet && <CodeSnippet snippet={release.snippet} id={id} />}
                    </article>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </main>
    </Flex>
  );
}
```