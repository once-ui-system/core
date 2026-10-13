```tsx
"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import {
  Check,
  Copy,
  Sparkles,
  Bug,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Rocket,
  Search,
  type LucideIcon,
} from "lucide-react";

type Tag = "feature" | "fix" | "security" | "breaking" | "performance";

type Snippet = {
  label: string;
  language: string;
  code: string;
};

type Release = {
  version: string;
  date: string; // ISO date
  title: string;
  summary: string;
  tags: Tag[];
  changes: string[];
  snippet?: Snippet;
  latest?: boolean;
};

const TAG_META: Record<
  Tag,
  { label: string; icon: LucideIcon; classes: string; dot: string }
> = {
  feature: {
    label: "Feature",
    icon: Sparkles,
    classes:
      "bg-indigo-50 text-indigo-800 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/30",
    dot: "bg-indigo-500",
  },
  fix: {
    label: "Fix",
    icon: Bug,
    classes:
      "bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30",
    dot: "bg-emerald-500",
  },
  security: {
    label: "Security",
    icon: ShieldAlert,
    classes:
      "bg-rose-50 text-rose-800 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/30",
    dot: "bg-rose-500",
  },
  breaking: {
    label: "Breaking",
    icon: AlertTriangle,
    classes:
      "bg-amber-50 text-amber-900 ring-amber-600/30 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30",
    dot: "bg-amber-500",
  },
  performance: {
    label: "Performance",
    icon: Zap,
    classes:
      "bg-sky-50 text-sky-800 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/30",
    dot: "bg-sky-500",
  },
};

const ALL_TAGS = Object.keys(TAG_META) as Tag[];

const RELEASES: Release[] = [
  {
    version: "3.2.0",
    date: "2025-06-10",
    title: "Streaming exports and workspace webhooks",
    summary:
      "Large exports no longer block the dashboard, and workspaces can now push events to your own services as they happen.",
    tags: ["feature", "performance"],
    latest: true,
    changes: [
      "Exports stream to disk in chunks, so a 2 GB audit log now finishes without hitting the 60-second request limit.",
      "New workspace webhooks with signed payloads, automatic retries and a delivery log kept for 14 days.",
      "The activity feed loads 40% faster on workspaces with more than 10,000 events.",
    ],
    snippet: {
      label: "Verify a webhook signature",
      language: "ts",
      code: `import { createHmac, timingSafeEqual } from "node:crypto";

export function verifySignature(
  body: string,
  header: string,
  secret: string,
): boolean {
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(header.replace("sha256=", ""));
  return a.length === b.length && timingSafeEqual(a, b);
}`,
    },
  },
  {
    version: "3.1.2",
    date: "2025-05-27",
    title: "Patch: session expiry and CSV encoding",
    summary:
      "A small round of fixes for issues reported by customers over the past two weeks.",
    tags: ["fix", "security"],
    changes: [
      "Sessions are now invalidated on every device after a password reset (CVE-2025-31184).",
      "CSV exports encode non-ASCII characters as UTF-8 with a byte-order mark so Excel opens them correctly.",
      "Fixed a crash in the date picker when the locale uses a non-Gregorian calendar.",
    ],
  },
  {
    version: "3.1.0",
    date: "2025-05-06",
    title: "Saved views and keyboard shortcuts",
    summary:
      "Pin the filters you use every day and move around the app without touching the mouse.",
    tags: ["feature"],
    changes: [
      "Saved views remember filters, sort order and visible columns, and can be shared with your team.",
      "Press ? anywhere to open the shortcut sheet; G then D jumps to the dashboard.",
      "Tables now support multi-column sorting with Shift + click.",
    ],
    snippet: {
      label: "Create a saved view with the CLI",
      language: "bash",
      code: `northbeam views create \\
  --name "Failed payments this week" \\
  --filter "status=failed" \\
  --filter "created>=-7d" \\
  --sort "-created" \\
  --share team`,
    },
  },
  {
    version: "3.0.0",
    date: "2025-04-01",
    title: "Northbeam 3: new API and a faster core",
    summary:
      "Our biggest release this year. The v3 API replaces cursor tokens with opaque page handles and drops several deprecated endpoints.",
    tags: ["breaking", "feature", "performance"],
    changes: [
      "The /v1 REST endpoints are removed. Migrate to /v3 before upgrading the SDK.",
      "Pagination now uses `page.next` handles instead of numeric offsets.",
      "Rewritten query engine cuts median p95 latency from 480 ms to 190 ms.",
      "Node 18 is no longer supported; the SDK requires Node 20 or newer.",
    ],
    snippet: {
      label: "Migrate pagination",
      language: "ts",
      code: `// Before (v2)
const page = await client.events.list({ offset: 100, limit: 50 });

// After (v3)
let page = await client.events.list({ limit: 50 });
while (page.next) {
  for (const event of page.items) handle(event);
  page = await client.events.list({ handle: page.next });
}`,
    },
  },
  {
    version: "2.9.4",
    date: "2025-02-18",
    title: "Patch: rate limit headers and SSO redirects",
    summary: "Stability fixes ahead of the 3.0 release.",
    tags: ["fix"],
    changes: [
      "Rate limit responses now include an accurate Retry-After header.",
      "SSO sign-in no longer loops when the return URL contains an encoded hash.",
      "Webhook test events display the correct timestamp in the workspace time zone.",
    ],
  },
  {
    version: "2.9.0",
    date: "2025-01-14",
    title: "Role-based access control",
    summary:
      "Custom roles let you grant exactly the access each teammate needs, nothing more.",
    tags: ["feature", "security"],
    changes: [
      "Create custom roles with per-resource read, write and admin permissions.",
      "Audit log entries now record the role used for each action.",
      "API keys can be scoped to a single role instead of inheriting the creator's access.",
    ],
    snippet: {
      label: "Define a custom role",
      language: "json",
      code: `{
  "name": "billing-analyst",
  "permissions": [
    { "resource": "invoices", "access": "read" },
    { "resource": "reports", "access": "write" }
  ]
}`,
    },
  },
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}

function TagBadge({ tag }: { tag: Tag }) {
  const meta = TAG_META[tag];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.classes}`}
    >
      <Icon className="size-3" aria-hidden="true" />
      {meta.label}
    </span>
  );
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

  const handleCopy = useCallback(async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(snippet.code);
      ok = true;
    } catch {
      // Fallback for insecure contexts or denied permissions.
      try {
        const area = document.createElement("textarea");
        area.value = snippet.code;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        ok = document.execCommand("copy");
        document.body.removeChild(area);
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
    <figure className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-700">
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
          <span className="sr-only"> {snippet.label} to clipboard</span>
        </button>
        <span id={`${id}-status`} role="status" aria-live="polite" className="sr-only">
          {copied ? "Code copied to clipboard" : failed ? "Could not copy code" : ""}
        </span>
      </figcaption>
      <pre
        tabIndex={0}
        aria-label={`${snippet.label} code`}
        className="overflow-x-auto p-4 text-[13px] leading-relaxed text-slate-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-400"
      >
        <code className="font-mono">{snippet.code}</code>
      </pre>
    </figure>
  );
}

export default function Page() {
  const [active, setActive] = useState<Tag | "all">("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RELEASES.filter((r) => {
      if (active !== "all" && !r.tags.includes(active)) return false;
      if (!q) return true;
      const haystack = [r.version, r.title, r.summary, ...r.changes]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [active, query]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a
        href="#releases"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-slate-900 focus:shadow-lg"
      >
        Skip to releases
      </a>

      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
            <Rocket className="size-4" aria-hidden="true" />
            Northbeam
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Changelog
          </h1>
          <p className="mt-3 max-w-xl text-base text-slate-600 text-pretty dark:text-slate-400">
            New features, fixes and breaking changes for the Northbeam platform
            and SDK. Every release is listed newest first.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <div className="relative">
              <label htmlFor="changelog-search" className="sr-only">
                Search releases
              </label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="changelog-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search versions and changes"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
            </div>

            <div role="group" aria-label="Filter by tag" className="flex flex-wrap gap-2">
              {(["all", ...ALL_TAGS] as const).map((t) => {
                const selected = active === t;
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setActive(t)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                      selected
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {t === "all" ? "All" : TAG_META[t].label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <main id="releases" className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p role="status" aria-live="polite" className="mb-8 text-sm text-slate-600 dark:text-slate-400">
          Showing {visible.length} of {RELEASES.length} releases
        </p>

        {visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
            <p className="font-medium">No releases match your filters.</p>
            <button
              type="button"
              onClick={() => {
                setActive("all");
                setQuery("");
              }}
              className="mt-3 text-sm font-medium text-indigo-600 underline underline-offset-4 hover:text-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-indigo-400"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ol className="relative">
            {/* Vertical timeline line */}
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-[7px] top-2 w-px bg-slate-300 dark:bg-slate-700 sm:left-[calc(9rem+7px)]"
            />
            {visible.map((release) => {
              const id = `release-${release.version.replace(/\./g, "-")}`;
              return (
                <li key={release.version} className="relative pb-12 last:pb-0">
                  <article
                    aria-labelledby={`${id}-title`}
                    className="grid gap-3 pl-8 sm:grid-cols-[9rem_1fr] sm:gap-0 sm:pl-0"
                  >
                    {/* Marker */}
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 top-1.5 size-4 rounded-full border-4 border-slate-50 dark:border-slate-950 sm:left-[9rem] ${
                        release.latest
                          ? "bg-indigo-500 ring-2 ring-indigo-500/40"
                          : "bg-slate-400 dark:bg-slate-500"
                      }`}
                    />

                    <div className="sm:pr-8 sm:pt-0.5 sm:text-right">
                      <p className="font-mono text-lg font-semibold">
                        <span className="sr-only">Version </span>v{release.version}
                      </p>
                      <time
                        dateTime={release.date}
                        className="text-sm text-slate-600 dark:text-slate-400"
                      >
                        {formatDate(release.date)}
                      </time>
                    </div>

                    <div className="min-w-0 sm:pl-8">
                      <div className="flex flex-wrap items-center gap-2">
                        {release.latest && (
                          <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                            Latest
                          </span>
                        )}
                        <h2
                          id={`${id}-title`}
                          className="text-xl font-semibold tracking-tight text-balance"
                        >
                          {release.title}
                        </h2>
                      </div>

                      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tags">
                        {release.tags.map((tag) => (
                          <li key={tag}>
                            <TagBadge tag={tag} />
                          </li>
                        ))}
                      </ul>

                      <p className="mt-4 text-slate-700 text-pretty dark:text-slate-300">
                        {release.summary}
                      </p>

                      <ul className="mt-4 space-y-2.5">
                        {release.changes.map((change) => (
                          <li
                            key={change}
                            className="flex gap-3 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300"
                          >
                            <span
                              aria-hidden="true"
                              className={`mt-2 size-1.5 shrink-0 rounded-full ${TAG_META[release.tags[0]].dot}`}
                            />
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>

                      {release.snippet && (
                        <CodeSnippet snippet={release.snippet} id={id} />
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        )}
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
        Northbeam &middot; Questions about an upgrade? Email support@northbeam.example
      </footer>
    </div>
  );
}
```