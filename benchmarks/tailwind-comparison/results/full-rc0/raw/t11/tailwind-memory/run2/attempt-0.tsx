"use client";

import { useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  Bug,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Rss,
  X,
} from "lucide-react";
import type { ComponentType } from "react";

type Tag = "feature" | "improvement" | "fix" | "security" | "breaking";

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
  tags: Tag[];
  changes: string[];
  snippet?: Snippet;
}

const TAG_META: Record<
  Tag,
  {
    label: string;
    icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
    badge: string;
    active: string;
  }
> = {
  feature: {
    label: "Feature",
    icon: Sparkles,
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    active: "bg-indigo-600 text-white ring-indigo-600",
  },
  improvement: {
    label: "Improvement",
    icon: Zap,
    badge: "bg-sky-50 text-sky-700 ring-sky-200",
    active: "bg-sky-600 text-white ring-sky-600",
  },
  fix: {
    label: "Fix",
    icon: Bug,
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    active: "bg-emerald-600 text-white ring-emerald-600",
  },
  security: {
    label: "Security",
    icon: ShieldAlert,
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
    active: "bg-amber-600 text-white ring-amber-600",
  },
  breaking: {
    label: "Breaking",
    icon: AlertTriangle,
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    active: "bg-rose-600 text-white ring-rose-600",
  },
};

const ALL_TAGS: Tag[] = ["feature", "improvement", "fix", "security", "breaking"];

const RELEASES: Release[] = [
  {
    version: "3.2.0",
    date: "2025-06-17",
    title: "Streaming exports and scoped API tokens",
    summary:
      "Large exports no longer block your workspace. Export jobs now stream to disk, and tokens can be limited to a single project.",
    tags: ["feature", "improvement"],
    changes: [
      "Streaming CSV and NDJSON exports handle datasets beyond 5 million rows without timing out.",
      "API tokens can be scoped to individual projects with read-only or read-write access.",
      "The audit log now records the token name alongside the actor for every API request.",
      "Dashboard filters remember their last-used state per browser.",
    ],
    snippet: {
      label: "Create a scoped token",
      language: "bash",
      code: `curl -X POST https://api.example.com/v3/tokens \\
  -H "Authorization: Bearer $ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "ci-readonly",
    "project": "prj_8f21c",
    "access": "read"
  }'`,
    },
  },
  {
    version: "3.1.2",
    date: "2025-05-29",
    title: "Webhook retry and timezone fixes",
    summary:
      "A patch release focused on reliability for webhook consumers and scheduled reports.",
    tags: ["fix"],
    changes: [
      "Webhook deliveries now retry with exponential backoff for up to 24 hours.",
      "Scheduled reports respect the workspace timezone across daylight saving changes.",
      "Fixed a crash when importing files with a byte-order mark.",
    ],
  },
  {
    version: "3.1.0",
    date: "2025-05-06",
    title: "Typed client and faster search",
    summary:
      "The official TypeScript client ships with generated types, and workspace search is about three times faster.",
    tags: ["feature", "improvement"],
    changes: [
      "New @example/client package with fully generated request and response types.",
      "Search indexes are now built incrementally, cutting median query time from 240ms to 80ms.",
      "Keyboard shortcut Cmd/Ctrl + K opens the command palette from anywhere.",
    ],
    snippet: {
      label: "Install and initialise the client",
      language: "ts",
      code: `import { createClient } from "@example/client";

const client = createClient({
  token: process.env.EXAMPLE_TOKEN!,
  retries: 3,
});

const { data } = await client.projects.list({ limit: 20 });`,
    },
  },
  {
    version: "3.0.1",
    date: "2025-04-14",
    title: "Session hardening",
    summary:
      "Security update that tightens session handling. We recommend all self-hosted installs upgrade.",
    tags: ["security", "fix"],
    changes: [
      "Session cookies are now rotated on privilege changes.",
      "Rate limits applied to password reset endpoints.",
      "Resolved an open redirect in the SSO callback (CVE-2025-31842).",
    ],
  },
  {
    version: "3.0.0",
    date: "2025-03-25",
    title: "Version 3: new permissions model",
    summary:
      "Roles are replaced by granular permissions. Review the migration guide before upgrading existing workspaces.",
    tags: ["breaking", "feature"],
    changes: [
      "The legacy `role` field is removed from the members API in favour of `permissions[]`.",
      "Node 18 is no longer supported; Node 20 or newer is required.",
      "Custom roles can be composed from over 40 permissions.",
      "Automatic migration converts existing roles on first sign-in.",
    ],
    snippet: {
      label: "Migrate member roles",
      language: "bash",
      code: `npx @example/cli migrate permissions --workspace acme --dry-run
npx @example/cli migrate permissions --workspace acme`,
    },
  },
  {
    version: "2.9.4",
    date: "2025-02-18",
    title: "Accessibility and performance polish",
    summary: "Smaller improvements gathered from community feedback.",
    tags: ["improvement", "fix"],
    changes: [
      "All dialogs now trap focus and restore it on close.",
      "Table views virtualise rows, improving scroll performance on large lists.",
      "Fixed incorrect contrast on disabled buttons in dark mode.",
    ],
  },
];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

function TagBadge({ tag }: { tag: Tag }) {
  const meta = TAG_META[tag];
  const Icon = meta.icon;
  return (
    <li
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.badge}`}
    >
      <Icon className="size-3" aria-hidden />
      {meta.label}
    </li>
  );
}

function CodeSnippet({ snippet, id }: { snippet: Snippet; id: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setFailed(false);
    } catch {
      setCopied(false);
      setFailed(true);
    }
    timer.current = setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 2000);
  };

  return (
    <figure className="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
      <figcaption className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/60 px-4 py-2">
        <span className="min-w-0 truncate text-xs font-medium text-slate-300">
          {snippet.label}
          <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-slate-400">
            {snippet.language}
          </span>
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-describedby={`${id}-status`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-400" aria-hidden />
          ) : (
            <Copy className="size-3.5" aria-hidden />
          )}
          <span>{copied ? "Copied" : failed ? "Copy failed" : "Copy"}</span>
          <span className="sr-only"> {snippet.label} code</span>
        </button>
        <span id={`${id}-status`} role="status" className="sr-only">
          {copied ? "Code copied to clipboard" : failed ? "Could not copy code" : ""}
        </span>
      </figcaption>
      <pre
        tabIndex={0}
        className="overflow-x-auto p-4 text-[13px] leading-relaxed text-slate-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-400"
      >
        <code className="font-mono">{snippet.code}</code>
      </pre>
    </figure>
  );
}

export default function Page() {
  const [activeTags, setActiveTags] = useState<Tag[]>([]);

  const toggleTag = (tag: Tag) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const visible = useMemo(
    () =>
      activeTags.length === 0
        ? RELEASES
        : RELEASES.filter((r) => r.tags.some((t) => activeTags.includes(t))),
    [activeTags],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#releases"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow-lg"
      >
        Skip to releases
      </a>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Northwind API
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Changelog
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
            New features, improvements and fixes for every release. Current stable version is{" "}
            <span className="font-mono font-medium text-slate-900">{RELEASES[0].version}</span>.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-sm text-slate-500">
            <Rss className="size-4" aria-hidden />
            <span>Releases ship roughly every three weeks.</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <section aria-labelledby="filter-heading" className="mb-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="filter-heading" className="text-sm font-semibold text-slate-700">
              Filter by tag
            </h2>
            {activeTags.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTags([])}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <X className="size-3.5" aria-hidden />
                Clear filters
              </button>
            )}
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => {
              const meta = TAG_META[tag];
              const Icon = meta.icon;
              const pressed = activeTags.includes(tag);
              return (
                <li key={tag}>
                  <button
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      pressed
                        ? meta.active
                        : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {meta.label}
                  </button>
                </li>
              );
            })}
          </ul>
          <p role="status" className="mt-3 text-sm text-slate-500">
            Showing {visible.length} of {RELEASES.length} releases
          </p>
        </section>

        <div id="releases" className="scroll-mt-6">
          {visible.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-medium text-slate-900">No releases match these tags.</p>
              <button
                type="button"
                onClick={() => setActiveTags([])}
                className="mt-3 rounded-md text-sm font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ol className="relative">
              {visible.map((release, index) => {
                const headingId = `release-${release.version.replace(/\./g, "-")}`;
                const isLast = index === visible.length - 1;
                return (
                  <li key={release.version} className="relative pb-10 pl-8 last:pb-0 sm:pl-10">
                    {!isLast && (
                      <span
                        aria-hidden
                        className="absolute left-[7px] top-4 h-full w-px bg-slate-200 sm:left-[9px]"
                      />
                    )}
                    <span
                      aria-hidden
                      className={`absolute left-0 top-1.5 size-4 rounded-full border-2 sm:size-5 ${
                        index === 0
                          ? "border-indigo-600 bg-indigo-600 ring-4 ring-indigo-100"
                          : "border-slate-300 bg-white"
                      }`}
                    />
                    <article
                      aria-labelledby={headingId}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-sm font-semibold text-white">
                          v{release.version}
                        </span>
                        <time
                          dateTime={release.date}
                          className="text-sm text-slate-500"
                        >
                          {formatDate(release.date)}
                        </time>
                        {index === 0 && activeTags.length === 0 && (
                          <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">
                            Latest
                          </span>
                        )}
                      </div>

                      <h2
                        id={headingId}
                        className="mt-3 text-xl font-semibold tracking-tight text-slate-900"
                      >
                        {release.title}
                      </h2>
                      <p className="mt-2 leading-relaxed text-slate-600">{release.summary}</p>

                      <ul
                        aria-label={`Tags for version ${release.version}`}
                        className="mt-4 flex flex-wrap gap-2"
                      >
                        {release.tags.map((tag) => (
                          <TagBadge key={tag} tag={tag} />
                        ))}
                      </ul>

                      <ul className="mt-5 space-y-2.5 text-[15px] leading-relaxed text-slate-700">
                        {release.changes.map((change) => (
                          <li key={change} className="flex gap-3">
                            <span
                              aria-hidden
                              className="mt-2.5 size-1.5 shrink-0 rounded-full bg-slate-400"
                            />
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>

                      {release.snippet && (
                        <CodeSnippet snippet={release.snippet} id={`${headingId}-snippet`} />
                      )}
                    </article>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-slate-500 sm:px-6">
          Looking for older releases? Versions before 2.9 are archived in the migration guide.
        </div>
      </footer>
    </div>
  );
}
