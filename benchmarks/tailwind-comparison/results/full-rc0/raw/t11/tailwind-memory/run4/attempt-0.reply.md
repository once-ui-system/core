```tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Bug,
  Check,
  Copy,
  Rocket,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
  Wrench,
  Zap,
} from "lucide-react";

type Tag = "feature" | "improvement" | "fix" | "security" | "breaking" | "performance";

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
  tags: Tag[];
  changes: string[];
  snippet?: Snippet;
  latest?: boolean;
};

const TAG_META: Record<Tag, { label: string; classes: string; icon: ReactNode }> = {
  feature: {
    label: "Feature",
    classes: "bg-emerald-50 text-emerald-800 ring-emerald-600/25",
    icon: <Sparkles aria-hidden="true" className="size-3.5" />,
  },
  improvement: {
    label: "Improvement",
    classes: "bg-sky-50 text-sky-800 ring-sky-600/25",
    icon: <Wrench aria-hidden="true" className="size-3.5" />,
  },
  fix: {
    label: "Fix",
    classes: "bg-amber-50 text-amber-900 ring-amber-600/25",
    icon: <Bug aria-hidden="true" className="size-3.5" />,
  },
  security: {
    label: "Security",
    classes: "bg-violet-50 text-violet-800 ring-violet-600/25",
    icon: <ShieldAlert aria-hidden="true" className="size-3.5" />,
  },
  breaking: {
    label: "Breaking",
    classes: "bg-rose-50 text-rose-800 ring-rose-600/25",
    icon: <TriangleAlert aria-hidden="true" className="size-3.5" />,
  },
  performance: {
    label: "Performance",
    classes: "bg-orange-50 text-orange-900 ring-orange-600/25",
    icon: <Zap aria-hidden="true" className="size-3.5" />,
  },
};

const ALL_TAGS = Object.keys(TAG_META) as Tag[];

const RELEASES: Release[] = [
  {
    version: "3.2.0",
    date: "2025-06-10",
    title: "Streaming exports and scoped API tokens",
    summary:
      "Large exports no longer need to fit in memory, and tokens can now be limited to the exact resources an integration needs.",
    tags: ["feature", "security", "performance"],
    latest: true,
    changes: [
      "Export datasets of any size as NDJSON streams with automatic backpressure.",
      "Scoped API tokens: restrict a token to specific projects and read-only or read-write access.",
      "Audit log entries now include the token ID that performed each action.",
      "Dashboard charts render roughly 40% faster on datasets over 100k rows.",
    ],
    snippet: {
      label: "Create a scoped token",
      language: "bash",
      code: `curl -X POST https://api.example.com/v3/tokens \\
  -H "Authorization: Bearer $ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "ci-readonly",
    "scopes": ["projects:read"],
    "projects": ["proj_8fK2a"]
  }'`,
    },
  },
  {
    version: "3.1.2",
    date: "2025-05-22",
    title: "Webhook retry and timezone fixes",
    summary: "A small patch release focused on reliability for webhook consumers and scheduled reports.",
    tags: ["fix"],
    changes: [
      "Webhook deliveries that time out are now retried with exponential backoff, up to 6 attempts.",
      "Scheduled reports respect the workspace timezone across daylight saving changes.",
      "Fixed a crash when importing CSV files with a byte-order mark.",
    ],
  },
  {
    version: "3.1.0",
    date: "2025-05-06",
    title: "Typed client SDK",
    summary:
      "The JavaScript SDK now ships generated types for every endpoint, so request and response shapes are checked at compile time.",
    tags: ["feature", "improvement"],
    changes: [
      "Generated TypeScript types for all 112 public endpoints.",
      "New client.paginate() helper that returns an async iterator over list endpoints.",
      "Improved error messages that include the request ID and a link to the relevant docs page.",
    ],
    snippet: {
      label: "Paginate through results",
      language: "ts",
      code: `import { createClient } from "@example/sdk";

const client = createClient({ token: process.env.EXAMPLE_TOKEN! });

for await (const invoice of client.paginate("invoices.list", { status: "open" })) {
  console.log(invoice.id, invoice.total);
}`,
    },
  },
  {
    version: "3.0.0",
    date: "2025-03-18",
    title: "Version 3: new permissions model",
    summary:
      "Roles are now defined per project instead of per workspace. Existing roles are migrated automatically, but custom integrations may need updating.",
    tags: ["breaking", "feature", "security"],
    changes: [
      "Per-project roles replace workspace-wide roles. Existing members keep equivalent access.",
      "The /v2/members endpoints are removed. Use /v3/projects/{id}/members instead.",
      "Minimum supported Node.js version is now 20.",
      "Single sign-on can be enforced for all members from the security settings page.",
    ],
    snippet: {
      label: "Upgrade the SDK",
      language: "bash",
      code: `npm install @example/sdk@3
npx example-migrate --from 2 --to 3 --dry-run`,
    },
  },
  {
    version: "2.9.4",
    date: "2025-02-27",
    title: "Faster search indexing",
    summary: "Reworked the indexing pipeline so new records show up in search within seconds.",
    tags: ["performance", "improvement"],
    changes: [
      "Median time from write to searchable dropped from 14s to under 2s.",
      "Search results now highlight matched terms in titles and descriptions.",
      "Reduced memory use of the background indexer by 30%.",
    ],
  },
  {
    version: "2.9.0",
    date: "2025-01-30",
    title: "Saved views and keyboard shortcuts",
    summary: "Teams can now save filtered table layouts and jump around the app without touching the mouse.",
    tags: ["feature"],
    changes: [
      "Saved views: store filters, sort order and visible columns, and share them with your team.",
      "Press ? anywhere to see the full list of keyboard shortcuts.",
      "Added a command palette, opened with Ctrl/Cmd + K.",
    ],
  },
];

function formatDate(iso: string): string {
  // Parse manually and format in UTC so server and client output always match.
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
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.classes}`}
    >
      {meta.icon}
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

  const handleCopy = useCallback(async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(snippet.code);
      ok = true;
    } catch {
      // Fallback for insecure contexts or denied permissions.
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
    if (ok) {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    }
  }, [snippet.code]);

  return (
    <figure className="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
      <figcaption className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/60 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wide text-slate-300">
            {snippet.language}
          </span>
          <span id={`${id}-label`} className="truncate text-xs text-slate-300">
            {snippet.label}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-describedby={`${id}-label`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
        >
          {copied ? (
            <Check aria-hidden="true" className="size-3.5 text-emerald-400" />
          ) : (
            <Copy aria-hidden="true" className="size-3.5" />
          )}
          <span>{copied ? "Copied" : "Copy"}</span>
          <span className="sr-only" role="status" aria-live="polite">
            {copied ? "Code copied to clipboard" : ""}
          </span>
        </button>
      </figcaption>
      <pre
        tabIndex={0}
        aria-labelledby={`${id}-label`}
        className="overflow-x-auto p-4 text-[13px] leading-relaxed text-slate-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-400"
      >
        <code className="font-mono">{snippet.code}</code>
      </pre>
    </figure>
  );
}

function ReleaseEntry({ release }: { release: Release }) {
  const id = `release-${release.version.replaceAll(".", "-")}`;
  return (
    <li className="relative pl-8 sm:pl-10 lg:grid lg:grid-cols-[11rem_1fr] lg:gap-10 lg:pl-0">
      {/* Date column (desktop) */}
      <div className="hidden pt-1.5 text-right lg:block">
        <time dateTime={release.date} className="text-sm font-medium text-slate-600">
          {formatDate(release.date)}
        </time>
      </div>

      {/* Timeline dot */}
      <span
        aria-hidden="true"
        className={`absolute left-0 top-2 flex size-4 items-center justify-center rounded-full ring-4 ring-slate-50 sm:left-0 lg:left-[11rem] lg:ml-[-0.5rem] lg:translate-x-[-1.25rem] ${
          release.latest ? "bg-indigo-600" : "bg-slate-400"
        }`}
      >
        {release.latest && <span className="size-1.5 rounded-full bg-white" />}
      </span>

      <article
        aria-labelledby={id}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <header>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-sm font-semibold text-white">
              v{release.version}
            </span>
            {release.latest && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                <Rocket aria-hidden="true" className="size-3.5" />
                Latest
              </span>
            )}
            <time dateTime={release.date} className="text-sm text-slate-600 lg:hidden">
              {formatDate(release.date)}
            </time>
          </div>
          <h3 id={id} className="mt-3 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            {release.title}
          </h3>
          <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{release.summary}</p>
          <ul aria-label="Tags" className="mt-3 flex flex-wrap gap-2">
            {release.tags.map((t) => (
              <li key={t}>
                <TagBadge tag={t} />
              </li>
            ))}
          </ul>
        </header>

        <ul className="mt-5 space-y-2.5 text-[15px] leading-relaxed text-slate-700">
          {release.changes.map((c) => (
            <li key={c} className="flex gap-3">
              <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-slate-400" />
              <span>{c}</span>
            </li>
          ))}
        </ul>

        {release.snippet && <CodeSnippet snippet={release.snippet} id={`${id}-snippet`} />}
      </article>
    </li>
  );
}

export default function Page() {
  const [active, setActive] = useState<Tag[]>([]);

  const visible = useMemo(
    () => (active.length === 0 ? RELEASES : RELEASES.filter((r) => r.tags.some((t) => active.includes(t)))),
    [active],
  );

  const toggle = (tag: Tag) =>
    setActive((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#releases"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow focus:outline-2 focus:outline-indigo-600"
      >
        Skip to releases
      </a>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <header className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">Changelog</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            What's new in Relay
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Every release of the Relay API, SDK and dashboard, newest first. Breaking changes are always called
            out with a migration snippet.
          </p>
        </header>

        <section aria-labelledby="filter-heading" className="mt-8">
          <h2 id="filter-heading" className="sr-only">
            Filter releases by tag
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {ALL_TAGS.map((tag) => {
              const pressed = active.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => toggle(tag)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    pressed
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {TAG_META[tag].label}
                </button>
              );
            })}
            {active.length > 0 && (
              <button
                type="button"
                onClick={() => setActive([])}
                className="rounded-md px-2 py-1.5 text-sm font-medium text-indigo-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Clear filters
              </button>
            )}
          </div>
          <p role="status" aria-live="polite" className="mt-3 text-sm text-slate-600">
            Showing {visible.length} of {RELEASES.length} releases
          </p>
        </section>

        <section id="releases" aria-label="Releases" className="mt-10 scroll-mt-8">
          {visible.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              No releases match the selected tags.
            </p>
          ) : (
            <div className="relative">
              {/* Timeline rail */}
              <div
                aria-hidden="true"
                className="absolute bottom-0 left-[7px] top-2 w-px bg-slate-300 lg:left-[calc(11rem+2.5rem-0.0625rem)] lg:translate-x-[-1.25rem]"
              />
              <ol className="space-y-10">
                {visible.map((r) => (
                  <ReleaseEntry key={r.version} release={r} />
                ))}
              </ol>
            </div>
          )}
        </section>

        <footer className="mt-16 border-t border-slate-200 pt-6 text-sm text-slate-600">
          Looking for older releases? Versions before 2.9 are archived in the legacy changelog.
        </footer>
      </main>
    </div>
  );
}
```