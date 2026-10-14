```tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import {
  AlertTriangle,
  Bug,
  Check,
  Copy,
  Rocket,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";

type TagKey = "feature" | "fix" | "security" | "breaking" | "performance";

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
  tags: TagKey[];
  highlights: string[];
  snippet?: Snippet;
  latest?: boolean;
};

type IconType = ComponentType<
  SVGProps<SVGSVGElement> & { size?: number | string }
>;

const TAGS: Record<
  TagKey,
  { label: string; icon: IconType; chip: string; active: string }
> = {
  feature: {
    label: "Feature",
    icon: Sparkles,
    chip: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    active: "bg-indigo-600 text-white ring-indigo-600",
  },
  fix: {
    label: "Fix",
    icon: Bug,
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    active: "bg-emerald-600 text-white ring-emerald-600",
  },
  security: {
    label: "Security",
    icon: ShieldAlert,
    chip: "bg-rose-50 text-rose-700 ring-rose-200",
    active: "bg-rose-600 text-white ring-rose-600",
  },
  breaking: {
    label: "Breaking",
    icon: AlertTriangle,
    chip: "bg-amber-50 text-amber-800 ring-amber-300",
    active: "bg-amber-600 text-white ring-amber-600",
  },
  performance: {
    label: "Performance",
    icon: Zap,
    chip: "bg-sky-50 text-sky-700 ring-sky-200",
    active: "bg-sky-600 text-white ring-sky-600",
  },
};

const TAG_ORDER: TagKey[] = [
  "feature",
  "fix",
  "security",
  "breaking",
  "performance",
];

const RELEASES: Release[] = [
  {
    version: "3.2.0",
    date: "2025-06-24",
    title: "Streaming exports and workspace webhooks",
    summary:
      "Large exports no longer block the dashboard, and workspaces can now push events to your own services as they happen.",
    tags: ["feature", "performance"],
    latest: true,
    highlights: [
      "CSV and Parquet exports stream in chunks, so a 2M-row export starts downloading in under a second.",
      "New workspace webhooks with signed payloads and automatic retries with exponential backoff.",
      "Audit log search is now 4x faster on workspaces with more than a year of history.",
    ],
    snippet: {
      label: "Verify a webhook signature",
      language: "typescript",
      code: `import { createHmac, timingSafeEqual } from "node:crypto";

export function verifySignature(body: string, header: string, secret: string) {
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(header);
  return a.length === b.length && timingSafeEqual(a, b);
}`,
    },
  },
  {
    version: "3.1.2",
    date: "2025-06-03",
    title: "Session handling hardening",
    summary:
      "A security-focused patch that tightens how refresh tokens are rotated and invalidated.",
    tags: ["security", "fix"],
    highlights: [
      "Refresh tokens are now single-use and rotate on every exchange.",
      "Fixed a race condition that could leave a stale session active after sign-out on a second device.",
      "Corrected the timezone shown on invoice PDFs for accounts in UTC+13.",
    ],
  },
  {
    version: "3.1.0",
    date: "2025-05-12",
    title: "Typed client and saved views",
    summary:
      "The SDK now ships generated types for every endpoint, and teams can save filtered table views.",
    tags: ["feature"],
    highlights: [
      "Generated TypeScript types for all 86 API endpoints, kept in sync on every release.",
      "Saved views let you pin filters, sort order and column layout, and share them by link.",
      "Keyboard shortcut palette opens with Cmd/Ctrl + K from anywhere in the app.",
    ],
    snippet: {
      label: "Install and initialise the client",
      language: "bash",
      code: `npm install @northwind/client@3.1.0

# then, in your app
import { createClient } from "@northwind/client";
const api = createClient({ token: process.env.NORTHWIND_TOKEN });`,
    },
  },
  {
    version: "3.0.0",
    date: "2025-04-01",
    title: "Version 3: new permissions model",
    summary:
      "Roles are replaced by fine-grained permissions. Review the migration notes before upgrading self-hosted installs.",
    tags: ["breaking", "feature", "security"],
    highlights: [
      "Roles are now collections of permissions; custom roles can be created per project.",
      "The legacy /v1 REST endpoints have been removed. Use /v2, which is now the default.",
      "Minimum supported Node.js version is now 20.",
    ],
    snippet: {
      label: "Run the permissions migration",
      language: "bash",
      code: `npx northwind migrate permissions --dry-run
npx northwind migrate permissions --apply`,
    },
  },
  {
    version: "2.9.4",
    date: "2025-02-18",
    title: "Faster cold starts",
    summary:
      "Under-the-hood work that cuts first-load time for large projects.",
    tags: ["performance", "fix"],
    highlights: [
      "Project bootstrap reads are batched, reducing cold start from 3.1s to 1.4s on average.",
      "Fixed an issue where drag-and-drop reordering could drop the last item in a list.",
    ],
  },
  {
    version: "2.9.0",
    date: "2025-01-14",
    title: "Dark mode and CSV import improvements",
    summary:
      "A long-requested theme option and a much friendlier importer.",
    tags: ["feature"],
    highlights: [
      "System-aware dark mode with a manual override in profile settings.",
      "The CSV importer now previews the first 50 rows and highlights columns it could not map.",
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

function TagChip({ tag }: { tag: TagKey }) {
  const { label, icon: Icon, chip } = TAGS[tag];
  return (
    <li
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${chip}`}
    >
      <Icon size={12} aria-hidden="true" />
      {label}
    </li>
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
      // Fallback for insecure contexts or denied permissions
      const ta = document.createElement("textarea");
      ta.value = snippet.code;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      document.body.removeChild(ta);
    }
    if (ok) {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    }
  }, [snippet.code]);

  return (
    <figure className="mt-5 overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
      <figcaption className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/60 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-300">
            {snippet.language}
          </span>
          <span id={id} className="truncate text-xs text-slate-300">
            {snippet.label}
          </span>
        </div>
        <button
          type="button"
          onClick={copy}
          aria-describedby={id}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          {copied ? (
            <Check size={14} aria-hidden="true" className="text-emerald-400" />
          ) : (
            <Copy size={14} aria-hidden="true" />
          )}
          <span>{copied ? "Copied" : "Copy"}</span>
          <span role="status" aria-live="polite" className="sr-only">
            {copied ? "Code copied to clipboard" : ""}
          </span>
        </button>
      </figcaption>
      <pre
        tabIndex={0}
        aria-labelledby={id}
        className="overflow-x-auto p-4 text-[13px] leading-relaxed text-slate-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-400"
      >
        <code className="font-mono">{snippet.code}</code>
      </pre>
    </figure>
  );
}

export default function Page() {
  const [selected, setSelected] = useState<TagKey[]>([]);

  const toggle = (tag: TagKey) =>
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const visible = useMemo(
    () =>
      selected.length === 0
        ? RELEASES
        : RELEASES.filter((r) => r.tags.some((t) => selected.includes(t))),
    [selected],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700">
            <Rocket size={16} aria-hidden="true" />
            Northwind
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Changelog
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
            New features, improvements and fixes, newest first. Breaking
            changes are always labelled so you can plan upgrades with
            confidence.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <section aria-labelledby="filter-heading" className="mb-10">
          <h2
            id="filter-heading"
            className="text-sm font-semibold text-slate-700"
          >
            Filter by tag
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {TAG_ORDER.map((tag) => {
              const { label, icon: Icon, chip, active } = TAGS[tag];
              const on = selected.includes(tag);
              return (
                <li key={tag}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(tag)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      on ? active : `${chip} hover:brightness-95`
                    }`}
                  >
                    <Icon size={14} aria-hidden="true" />
                    {label}
                  </button>
                </li>
              );
            })}
            {selected.length > 0 && (
              <li>
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Clear filters
                </button>
              </li>
            )}
          </ul>
          <p
            role="status"
            aria-live="polite"
            className="mt-3 text-sm text-slate-500"
          >
            Showing {visible.length} of {RELEASES.length} releases
          </p>
        </section>

        {visible.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No releases match the selected tags.
          </p>
        ) : (
          <ol className="relative">
            {/* Vertical line */}
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-[7px] top-2 w-px bg-slate-300 sm:left-[8px]"
            />
            {visible.map((release) => {
              const headingId = `release-${release.version}`;
              return (
                <li key={release.version} className="relative pb-12 pl-8 last:pb-0 sm:pl-10">
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-2 h-4 w-4 rounded-full border-2 bg-slate-50 ${
                      release.latest
                        ? "border-indigo-600 ring-4 ring-indigo-100"
                        : "border-slate-400"
                    }`}
                  />
                  <article aria-labelledby={headingId}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-sm font-semibold text-white">
                        v{release.version}
                      </span>
                      {release.latest && (
                        <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                          Latest
                        </span>
                      )}
                      <time
                        dateTime={release.date}
                        className="text-sm text-slate-500"
                      >
                        {formatDate(release.date)}
                      </time>
                    </div>

                    <h2
                      id={headingId}
                      className="mt-3 text-xl font-semibold tracking-tight text-slate-900"
                    >
                      {release.title}
                    </h2>

                    <ul
                      aria-label={`Tags for version ${release.version}`}
                      className="mt-3 flex flex-wrap gap-1.5"
                    >
                      {release.tags.map((t) => (
                        <TagChip key={t} tag={t} />
                      ))}
                    </ul>

                    <p className="mt-4 leading-relaxed text-slate-700">
                      {release.summary}
                    </p>

                    <ul className="mt-4 space-y-2">
                      {release.highlights.map((h) => (
                        <li
                          key={h}
                          className="flex gap-3 text-[15px] leading-relaxed text-slate-700"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"
                          />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>

                    {release.snippet && (
                      <CodeSnippet
                        snippet={release.snippet}
                        id={`snippet-${release.version}`}
                      />
                    )}
                  </article>
                </li>
              );
            })}
          </ol>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-slate-500 sm:px-6">
          Questions about an upgrade? Contact support@northwind.example and
          we&apos;ll help you plan it.
        </div>
      </footer>
    </div>
  );
}
```