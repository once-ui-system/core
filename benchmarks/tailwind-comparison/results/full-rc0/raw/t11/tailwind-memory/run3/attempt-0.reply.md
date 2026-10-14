The layout is minimal with no dark-mode setup, so I'll build a self-contained light design with tag filtering and copy-to-clipboard snippets.

```tsx
"use client";

import { useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  Sparkles,
  Wrench,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Rss,
  type LucideIcon,
} from "lucide-react";

type Tag = "Feature" | "Fix" | "Security" | "Breaking" | "Performance";

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
  latest?: boolean;
}

const TAG_STYLES: Record<Tag, { classes: string; icon: LucideIcon }> = {
  Feature: { classes: "bg-indigo-50 text-indigo-700 ring-indigo-600/20", icon: Sparkles },
  Fix: { classes: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", icon: Wrench },
  Security: { classes: "bg-rose-50 text-rose-700 ring-rose-600/20", icon: ShieldAlert },
  Breaking: { classes: "bg-amber-50 text-amber-800 ring-amber-600/30", icon: AlertTriangle },
  Performance: { classes: "bg-sky-50 text-sky-700 ring-sky-600/20", icon: Zap },
};

const ALL_TAGS: Tag[] = ["Feature", "Fix", "Security", "Breaking", "Performance"];

const RELEASES: Release[] = [
  {
    version: "v2.4.0",
    date: "2025-06-10",
    title: "Streaming responses and typed webhooks",
    summary:
      "Large exports can now be consumed as a stream, and webhook payloads ship with generated TypeScript types so handlers are checked at compile time.",
    tags: ["Feature", "Performance"],
    latest: true,
    changes: [
      "Added client.exports.stream() which yields rows as they are produced instead of buffering the full result.",
      "Webhook payload types are now exported from @relay/sdk/webhooks.",
      "Reduced median cold-start time of the CLI from 480ms to 190ms.",
    ],
    snippet: {
      label: "Stream an export",
      language: "ts",
      code: `import { Relay } from "@relay/sdk";

const client = new Relay({ apiKey: process.env.RELAY_KEY! });

for await (const row of client.exports.stream({ table: "events" })) {
  console.log(row.id, row.createdAt);
}`,
    },
  },
  {
    version: "v2.3.2",
    date: "2025-05-27",
    title: "Patch for token refresh race condition",
    summary:
      "Fixes an issue where two concurrent requests could both attempt a token refresh, invalidating the session.",
    tags: ["Fix", "Security"],
    changes: [
      "Token refresh is now serialized behind a single in-flight promise.",
      "Rotated refresh tokens are no longer written to debug logs.",
      "Fixed a crash when the system clock moved backwards during a request.",
    ],
  },
  {
    version: "v2.3.0",
    date: "2025-05-06",
    title: "Retry policies you can configure",
    summary:
      "Retries are now configurable per client or per request, with exponential backoff and jitter enabled by default.",
    tags: ["Feature"],
    changes: [
      "New retry option accepting maxAttempts, baseDelayMs and a custom shouldRetry predicate.",
      "Requests that fail with 429 now honor the Retry-After header.",
      "Added a request-level AbortSignal option.",
    ],
    snippet: {
      label: "Configure retries",
      language: "ts",
      code: `const client = new Relay({
  apiKey: process.env.RELAY_KEY!,
  retry: {
    maxAttempts: 5,
    baseDelayMs: 250,
    shouldRetry: (err) => err.status >= 500,
  },
});`,
    },
  },
  {
    version: "v2.0.0",
    date: "2025-03-18",
    title: "A new, ESM-only package",
    summary:
      "Version 2 drops CommonJS builds and Node 16 support. The public API is otherwise unchanged, so most projects only need to update their import style.",
    tags: ["Breaking", "Performance"],
    changes: [
      "Removed CommonJS entry points. Use import or a dynamic import() instead of require().",
      "Minimum supported Node.js version is now 18.17.",
      "Bundle size reduced by 38% after removing legacy polyfills.",
      "Renamed client.send() to client.request(); the old name was removed.",
    ],
    snippet: {
      label: "Upgrade to v2",
      language: "bash",
      code: `npm install @relay/sdk@2
npx relay-codemod rename-send ./src`,
    },
  },
  {
    version: "v1.9.1",
    date: "2025-01-29",
    title: "Pagination and error message fixes",
    summary: "A small maintenance release focused on list endpoints and clearer errors.",
    tags: ["Fix"],
    changes: [
      "Cursor pagination no longer skips the final page when the result count equals the page size.",
      "Validation errors now include the offending field path.",
    ],
  },
];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function TagBadge({ tag }: { tag: Tag }) {
  const { classes, icon: Icon } = TAG_STYLES[tag];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${classes}`}
    >
      <Icon className="size-3" aria-hidden="true" />
      {tag}
    </span>
  );
}

function CodeSnippet({ snippet, id }: { snippet: Snippet; id: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setFailed(false);
    } catch {
      setCopied(false);
      setFailed(true);
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 2000);
  };

  return (
    <figure className="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
      <figcaption className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-4 py-2">
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
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-400" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
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
  const [active, setActive] = useState<Tag | "All">("All");

  const visible = useMemo(
    () => (active === "All" ? RELEASES : RELEASES.filter((r) => r.tags.includes(active))),
    [active],
  );

  const filters: (Tag | "All")[] = ["All", ...ALL_TAGS];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#releases"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to releases
      </a>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Relay SDK
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Changelog</h1>
          <p className="mt-3 max-w-xl text-base text-slate-600">
            New features, fixes and breaking changes for every release of the Relay SDK. Subscribe
            to stay up to date.
          </p>
          <a
            href="#releases"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Rss className="size-4" aria-hidden="true" />
            Latest: {RELEASES[0].version}
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div role="group" aria-label="Filter releases by tag" className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const selected = active === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(f)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  selected
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-100"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
        <p role="status" className="mt-3 text-sm text-slate-500">
          Showing {visible.length} of {RELEASES.length} releases
        </p>

        <ol id="releases" className="mt-8 scroll-mt-8">
          {visible.map((release, i) => {
            const isLast = i === visible.length - 1;
            const id = `release-${release.version.replace(/\./g, "-")}`;
            return (
              <li key={release.version} className="relative flex gap-4 sm:gap-6">
                {/* Timeline rail */}
                <div className="flex flex-col items-center" aria-hidden="true">
                  <span
                    className={`mt-1.5 size-3.5 shrink-0 rounded-full border-2 ${
                      release.latest
                        ? "border-indigo-600 bg-indigo-600 ring-4 ring-indigo-100"
                        : "border-slate-400 bg-white"
                    }`}
                  />
                  {!isLast && <span className="mt-1 w-px flex-1 bg-slate-300" />}
                </div>

                <article
                  aria-labelledby={id}
                  className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-12"}`}
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 id={id} className="font-mono text-xl font-bold tracking-tight">
                      {release.version}
                    </h2>
                    {release.latest && (
                      <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">
                        Latest
                      </span>
                    )}
                    <time dateTime={release.date} className="text-sm text-slate-500">
                      {formatDate(release.date)}
                    </time>
                  </div>

                  <p className="mt-2 text-lg font-semibold text-slate-900">{release.title}</p>

                  <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tags">
                    {release.tags.map((t) => (
                      <li key={t}>
                        <TagBadge tag={t} />
                      </li>
                    ))}
                  </ul>

                  <p className="mt-4 text-slate-600">{release.summary}</p>

                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {release.changes.map((c) => (
                      <li key={c} className="flex gap-2.5">
                        <span
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-400"
                          aria-hidden="true"
                        />
                        <span className="min-w-0">{c}</span>
                      </li>
                    ))}
                  </ul>

                  {release.snippet && <CodeSnippet snippet={release.snippet} id={id} />}
                </article>
              </li>
            );
          })}
        </ol>

        {visible.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            No releases match this tag.
          </p>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6 text-sm text-slate-500 sm:px-6">
          Relay SDK is released under the MIT license.
        </div>
      </footer>
    </div>
  );
}
```