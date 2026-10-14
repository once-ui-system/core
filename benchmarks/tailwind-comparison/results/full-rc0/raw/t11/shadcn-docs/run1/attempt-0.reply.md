```tsx
"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type TagKey =
  | "feature"
  | "improvement"
  | "fix"
  | "breaking"
  | "security"
  | "performance";

interface TagMeta {
  label: string;
  icon: LucideIcon;
  className: string;
}

const TAGS: Record<TagKey, TagMeta> = {
  feature: {
    label: "Feature",
    icon: Sparkles,
    className:
      "border-emerald-600/30 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  improvement: {
    label: "Improvement",
    icon: Wrench,
    className:
      "border-sky-600/30 bg-sky-50 text-sky-800 dark:border-sky-400/30 dark:bg-sky-950/50 dark:text-sky-300",
  },
  fix: {
    label: "Fix",
    icon: Bug,
    className:
      "border-amber-600/30 bg-amber-50 text-amber-900 dark:border-amber-400/30 dark:bg-amber-950/50 dark:text-amber-300",
  },
  breaking: {
    label: "Breaking",
    icon: TriangleAlert,
    className:
      "border-red-600/30 bg-red-50 text-red-800 dark:border-red-400/30 dark:bg-red-950/50 dark:text-red-300",
  },
  security: {
    label: "Security",
    icon: ShieldAlert,
    className:
      "border-violet-600/30 bg-violet-50 text-violet-800 dark:border-violet-400/30 dark:bg-violet-950/50 dark:text-violet-300",
  },
  performance: {
    label: "Performance",
    icon: Zap,
    className:
      "border-orange-600/30 bg-orange-50 text-orange-900 dark:border-orange-400/30 dark:bg-orange-950/50 dark:text-orange-300",
  },
};

interface Snippet {
  title: string;
  language: string;
  code: string;
}

interface Release {
  version: string;
  date: string; // ISO yyyy-mm-dd
  title: string;
  summary: string;
  tags: TagKey[];
  latest?: boolean;
  changes: { tag: TagKey; text: string }[];
  snippet?: Snippet;
}

const RELEASES: Release[] = [
  {
    version: "3.0.0",
    date: "2025-06-17",
    title: "Streaming queries and a new client",
    summary:
      "A ground-up rewrite of the client with first-class streaming, typed errors and a smaller footprint. Read the migration notes before upgrading.",
    tags: ["feature", "breaking", "performance"],
    latest: true,
    changes: [
      {
        tag: "feature",
        text: "Added `client.stream()` for server-sent result sets with automatic back-pressure.",
      },
      {
        tag: "breaking",
        text: "The default export has been replaced by the named `createClient` factory.",
      },
      {
        tag: "breaking",
        text: "Dropped Node 16 and 18. Node 20.11 or newer is now required.",
      },
      {
        tag: "performance",
        text: "Cold-start time reduced by 38% after removing the legacy polyfill bundle.",
      },
    ],
    snippet: {
      title: "Migrating to createClient",
      language: "ts",
      code: `import { createClient } from "@orbit/client";

const client = createClient({
  apiKey: process.env.ORBIT_API_KEY!,
  region: "eu-west-1",
});

for await (const row of client.stream("SELECT * FROM events")) {
  console.log(row.id, row.type);
}`,
    },
  },
  {
    version: "2.8.0",
    date: "2025-04-29",
    title: "Scoped API tokens",
    summary:
      "Tokens can now be limited to a single project and a set of permissions, with optional expiry.",
    tags: ["feature", "security"],
    changes: [
      {
        tag: "feature",
        text: "Create tokens limited to read-only, write or admin scopes per project.",
      },
      {
        tag: "security",
        text: "Tokens are now hashed at rest and only displayed once at creation.",
      },
      {
        tag: "improvement",
        text: "The dashboard shows the last-used timestamp and IP range for every token.",
      },
    ],
    snippet: {
      title: "Create a scoped token",
      language: "bash",
      code: `orbit tokens create \\
  --project billing-api \\
  --scope read \\
  --expires-in 30d`,
    },
  },
  {
    version: "2.7.3",
    date: "2025-03-18",
    title: "Reliability fixes",
    summary:
      "A patch release focused on retry behaviour and webhook delivery under heavy load.",
    tags: ["fix", "improvement"],
    changes: [
      {
        tag: "fix",
        text: "Fixed duplicate webhook deliveries when a retry overlapped with a slow acknowledgement.",
      },
      {
        tag: "fix",
        text: "Pagination cursors no longer expire early for queries that run longer than 60 seconds.",
      },
      {
        tag: "improvement",
        text: "Retry back-off now uses decorrelated jitter to avoid thundering herds.",
      },
    ],
  },
  {
    version: "2.7.0",
    date: "2025-02-04",
    title: "Faster aggregations",
    summary:
      "Aggregation pipelines now push down filters to the storage layer, cutting latency on large datasets.",
    tags: ["performance", "feature"],
    changes: [
      {
        tag: "performance",
        text: "p95 latency for grouped aggregations dropped from 840 ms to 310 ms on 50M-row tables.",
      },
      {
        tag: "feature",
        text: "New `approxDistinct()` helper backed by HyperLogLog++.",
      },
      {
        tag: "improvement",
        text: "Query plans are included in error responses to simplify debugging.",
      },
    ],
    snippet: {
      title: "Approximate distinct counts",
      language: "ts",
      code: `const { count } = await client
  .from("page_views")
  .approxDistinct("user_id")
  .where("day", ">=", "2025-01-01");`,
    },
  },
  {
    version: "2.6.1",
    date: "2024-12-10",
    title: "Security patch",
    summary:
      "Resolves a request-signing issue affecting self-hosted deployments behind a proxy.",
    tags: ["security", "fix"],
    changes: [
      {
        tag: "security",
        text: "Signature verification now uses constant-time comparison and rejects clock skew over 5 minutes.",
      },
      {
        tag: "fix",
        text: "The `X-Forwarded-Proto` header is respected when generating callback URLs.",
      },
    ],
  },
  {
    version: "2.6.0",
    date: "2024-11-12",
    title: "Webhooks, redesigned",
    summary:
      "Manage endpoints, inspect deliveries and replay failed events from a single screen.",
    tags: ["feature", "improvement"],
    changes: [
      {
        tag: "feature",
        text: "Replay any failed delivery from the last 30 days with one click or via the CLI.",
      },
      {
        tag: "improvement",
        text: "Delivery logs support filtering by status code, endpoint and event type.",
      },
    ],
    snippet: {
      title: "Replay a failed delivery",
      language: "bash",
      code: `orbit webhooks replay evt_01HZX9K3M2 --endpoint https://example.com/hooks`,
    },
  },
];

const FILTER_ORDER: TagKey[] = [
  "feature",
  "improvement",
  "fix",
  "performance",
  "security",
  "breaking",
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

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

function TagBadge({ tag }: { tag: TagKey }) {
  const meta = TAGS[tag];
  const Icon = meta.icon;
  return (
    <Badge variant="outline" className={cn("gap-1", meta.className)}>
      <Icon aria-hidden="true" />
      {meta.label}
    </Badge>
  );
}

/** Renders text containing `inline code` segments. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code
            key={i}
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function CodeSnippet({ snippet }: { snippet: Snippet }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyText(snippet.code);
    if (ok) {
      setCopied(true);
      toast.success("Copied to clipboard", { description: snippet.title });
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Couldn't copy", {
        description: "Select the code and copy it manually.",
      });
    }
  }

  return (
    <figure className="overflow-hidden rounded-lg border bg-muted/40">
      <figcaption className="flex items-center justify-between gap-2 border-b bg-muted/60 py-1.5 pr-1.5 pl-3">
        <span className="flex min-w-0 items-center gap-2 text-xs">
          <span className="truncate font-medium text-foreground">
            {snippet.title}
          </span>
          <span className="rounded border bg-background px-1.5 py-px font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
            {snippet.language}
          </span>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          aria-label={`Copy code: ${snippet.title}`}
          className="shrink-0"
        >
          {copied ? (
            <Check aria-hidden="true" className="text-emerald-600" />
          ) : (
            <Copy aria-hidden="true" />
          )}
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </figcaption>
      <pre
        tabIndex={0}
        className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset"
        aria-label={`${snippet.title} (${snippet.language})`}
      >
        <code>{snippet.code}</code>
      </pre>
    </figure>
  );
}

function ReleaseEntry({ release }: { release: Release }) {
  const headingId = `release-${release.version.replace(/\./g, "-")}`;

  return (
    <li className="relative pl-8 sm:pl-10">
      {/* timeline node */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1.5 left-0 flex size-6 items-center justify-center rounded-full border-2 bg-background",
          release.latest
            ? "border-primary text-primary"
            : "border-border text-muted-foreground",
        )}
      >
        {release.latest ? (
          <Rocket className="size-3" />
        ) : (
          <span className="size-1.5 rounded-full bg-current" />
        )}
      </span>

      <article aria-labelledby={headingId} className="pb-12">
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2
              id={headingId}
              className="font-mono text-xl font-semibold tracking-tight"
            >
              v{release.version}
            </h2>
            {release.latest && <Badge>Latest</Badge>}
            <time
              dateTime={release.date}
              className="text-sm text-muted-foreground"
            >
              {formatDate(release.date)}
            </time>
          </div>
          <p className="text-base font-medium">{release.title}</p>
          <ul
            aria-label={`Tags for version ${release.version}`}
            className="flex flex-wrap gap-1.5"
          >
            {release.tags.map((tag) => (
              <li key={tag}>
                <TagBadge tag={tag} />
              </li>
            ))}
          </ul>
        </header>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {release.summary}
        </p>

        <ul className="mt-4 flex flex-col gap-2.5">
          {release.changes.map((change, i) => {
            const meta = TAGS[change.tag];
            const Icon = meta.icon;
            return (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <Icon
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <span className="leading-relaxed">
                  <span className="sr-only">{meta.label}: </span>
                  <RichText text={change.text} />
                </span>
              </li>
            );
          })}
        </ul>

        {release.snippet && (
          <div className="mt-5">
            <CodeSnippet snippet={release.snippet} />
          </div>
        )}
      </article>
    </li>
  );
}

export default function ChangelogPage() {
  const [filters, setFilters] = useState<string[]>([]);

  const visible = useMemo(() => {
    if (filters.length === 0) return RELEASES;
    return RELEASES.filter((r) =>
      r.tags.some((t) => filters.includes(t)),
    );
  }, [filters]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="flex flex-col gap-4">
          <Badge variant="secondary" className="w-fit">
            Orbit SDK
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Changelog
          </h1>
          <p className="max-w-xl text-base text-muted-foreground text-pretty">
            Every release of the Orbit client and CLI, newest first. Filter by
            tag to focus on what matters to you, and copy upgrade snippets
            straight into your project.
          </p>
        </header>

        <Separator className="my-8" />

        <section aria-labelledby="filter-heading" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2
              id="filter-heading"
              className="text-sm font-medium text-muted-foreground"
            >
              Filter by tag
            </h2>
            {filters.length > 0 && (
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setFilters([])}
              >
                Clear filters
              </Button>
            )}
          </div>
          <ToggleGroup
            type="multiple"
            variant="outline"
            size="sm"
            spacing={2}
            value={filters}
            onValueChange={setFilters}
            aria-labelledby="filter-heading"
            className="flex-wrap"
          >
            {FILTER_ORDER.map((key) => {
              const Icon = TAGS[key].icon;
              return (
                <ToggleGroupItem
                  key={key}
                  value={key}
                  aria-label={`Filter by ${TAGS[key].label}`}
                >
                  <Icon aria-hidden="true" />
                  {TAGS[key].label}
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
          <p
            role="status"
            aria-live="polite"
            className="text-xs text-muted-foreground"
          >
            Showing {visible.length} of {RELEASES.length} releases
          </p>
        </section>

        <div className="mt-10">
          {visible.length > 0 ? (
            <ol className="relative">
              {/* vertical timeline rail */}
              <span
                aria-hidden="true"
                className="absolute top-3 bottom-0 left-3 w-px -translate-x-1/2 bg-border"
              />
              {visible.map((release) => (
                <ReleaseEntry key={release.version} release={release} />
              ))}
            </ol>
          ) : (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <p className="font-medium">No releases match these tags</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try removing a filter to see more of the history.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setFilters([])}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>

        <Separator className="my-8" />

        <footer className="text-center text-sm text-muted-foreground">
          Looking for older versions? Releases before 2.6.0 are archived in the
          legacy docs.
        </footer>
      </main>
    </div>
  );
}
```