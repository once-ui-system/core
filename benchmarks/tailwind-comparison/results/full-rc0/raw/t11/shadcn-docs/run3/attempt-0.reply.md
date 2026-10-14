```tsx
"use client";

import * as React from "react";
import {
  AlertTriangle,
  Bug,
  Check,
  Copy,
  Rocket,
  Search,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type Tag = "feature" | "improvement" | "fix" | "breaking" | "performance";

interface Snippet {
  title: string;
  language: string;
  code: string;
}

interface Release {
  version: string;
  date: string; // ISO date
  title: string;
  summary: string;
  tags: Tag[];
  changes: string[];
  snippet?: Snippet;
  latest?: boolean;
}

const TAG_META: Record<
  Tag,
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  feature: {
    label: "Feature",
    icon: Sparkles,
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900",
  },
  improvement: {
    label: "Improvement",
    icon: Wrench,
    className:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900",
  },
  fix: {
    label: "Fix",
    icon: Bug,
    className:
      "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900",
  },
  breaking: {
    label: "Breaking",
    icon: AlertTriangle,
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900",
  },
  performance: {
    label: "Performance",
    icon: Zap,
    className:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-900",
  },
};

const RELEASES: Release[] = [
  {
    version: "3.2.0",
    date: "2025-06-17",
    title: "Streaming exports and workspace webhooks",
    summary:
      "Large exports no longer need to fit in memory, and workspaces can now subscribe to events with signed webhooks.",
    tags: ["feature", "performance"],
    latest: true,
    changes: [
      "Added `client.exports.stream()` which yields rows as they are produced, keeping memory flat for multi-million row exports.",
      "Workspace webhooks with HMAC-SHA256 signatures and automatic retries with exponential backoff.",
      "Export jobs now start up to 4× faster thanks to lazy schema resolution.",
      "New `--format ndjson` flag for the CLI export command.",
    ],
    snippet: {
      title: "Stream an export",
      language: "ts",
      code: `import { createClient } from "@acme/sdk";

const client = createClient({ apiKey: process.env.ACME_API_KEY! });

for await (const row of client.exports.stream({ table: "orders" })) {
  process.stdout.write(JSON.stringify(row) + "\\n");
}`,
    },
  },
  {
    version: "3.1.2",
    date: "2025-05-29",
    title: "Reliability patch",
    summary:
      "A small round of fixes for retry handling and timezone edge cases reported by the community.",
    tags: ["fix"],
    changes: [
      "Fixed duplicate requests when a retry coincided with a token refresh.",
      "Dates at DST boundaries are now serialized in UTC instead of local time.",
      "Resolved an unhandled rejection when the network drops during pagination.",
    ],
  },
  {
    version: "3.1.0",
    date: "2025-05-06",
    title: "Typed query builder",
    summary:
      "Queries are now fully typed from your schema, catching bad column names at compile time instead of in production.",
    tags: ["feature", "improvement"],
    changes: [
      "Generated types for every table, including relations and JSON columns.",
      "`where()` accepts nested conditions with full autocomplete.",
      "Improved error messages that point at the exact field that failed validation.",
    ],
    snippet: {
      title: "Typed filtering",
      language: "ts",
      code: `const paid = await client.orders
  .where({ status: "paid", total: { gte: 100 } })
  .orderBy("createdAt", "desc")
  .limit(25);`,
    },
  },
  {
    version: "3.0.0",
    date: "2025-03-18",
    title: "Version 3: ESM-only and a new config format",
    summary:
      "The SDK is now published as ES modules only and reads configuration from a single file. Read the migration notes before upgrading.",
    tags: ["breaking", "improvement"],
    changes: [
      "Dropped CommonJS builds. Node 18 or newer is required.",
      "`acme.config.json` replaces the legacy `.acmerc` file.",
      "Renamed `client.fetchAll()` to `client.list()` and removed the callback overloads.",
      "Bundle size reduced from 48 kB to 31 kB (gzipped) by removing the bundled polyfills.",
    ],
    snippet: {
      title: "Upgrade and migrate config",
      language: "bash",
      code: `npm install @acme/sdk@3
npx acme migrate-config --from .acmerc --to acme.config.json`,
    },
  },
  {
    version: "2.9.4",
    date: "2025-02-11",
    title: "Faster cold starts",
    summary:
      "Serverless users should see noticeably quicker first requests after this release.",
    tags: ["performance", "fix"],
    changes: [
      "Deferred loading of the schema validator until the first request that needs it.",
      "Fixed a memory leak in long-lived connections that used keep-alive.",
    ],
  },
  {
    version: "2.9.0",
    date: "2025-01-14",
    title: "Request tracing",
    summary:
      "Every request now carries a trace id, making it easier to follow a call across your services.",
    tags: ["feature"],
    changes: [
      "Automatic `x-acme-trace-id` header on outgoing requests.",
      "Optional OpenTelemetry integration via `@acme/sdk/otel`.",
    ],
    snippet: {
      title: "Enable tracing",
      language: "ts",
      code: `import { createClient } from "@acme/sdk";
import { withTracing } from "@acme/sdk/otel";

const client = withTracing(createClient({ apiKey: "…" }));`,
    },
  },
];

const ALL_TAGS = Object.keys(TAG_META) as Tag[];

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** Renders text with `inline code` segments. */
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
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

function TagBadge({ tag }: { tag: Tag }) {
  const meta = TAG_META[tag];
  const Icon = meta.icon;
  return (
    <Badge variant="outline" className={cn("gap-1", meta.className)}>
      <Icon aria-hidden="true" />
      {meta.label}
    </Badge>
  );
}

function CodeSnippet({ snippet, version }: { snippet: Snippet; version: string }) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      toast.success("Copied to clipboard", { description: snippet.title });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy", {
        description: "Select the code and copy it manually.",
      });
    }
  };

  return (
    <figure className="overflow-hidden rounded-lg border bg-muted/40">
      <figcaption className="flex items-center justify-between gap-2 border-b bg-muted/60 py-1.5 pr-1.5 pl-3">
        <span className="flex min-w-0 items-center gap-2 text-xs">
          <span className="truncate font-medium">{snippet.title}</span>
          <span className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
            {snippet.language}
          </span>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          aria-label={`Copy ${snippet.title} snippet for version ${version}`}
          className="h-7 gap-1.5 px-2 text-xs"
        >
          {copied ? (
            <Check aria-hidden="true" className="text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy aria-hidden="true" />
          )}
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </figcaption>
      <pre
        tabIndex={0}
        className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
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
      {/* Timeline marker */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1.5 left-0 flex size-5 items-center justify-center rounded-full border-2 bg-background sm:size-6",
          release.latest ? "border-primary" : "border-border",
        )}
      >
        <span
          className={cn(
            "size-2 rounded-full sm:size-2.5",
            release.latest ? "bg-primary" : "bg-muted-foreground/40",
          )}
        />
      </span>

      <article aria-labelledby={headingId}>
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 id={headingId} className="font-mono text-xl font-semibold tracking-tight">
            v{release.version}
          </h2>
          {release.latest && (
            <Badge>
              <Rocket aria-hidden="true" />
              Latest
            </Badge>
          )}
          <time dateTime={release.date} className="text-sm text-muted-foreground">
            {formatDate(release.date)}
          </time>
        </div>

        <Card className="gap-4 py-5">
          <CardContent className="flex flex-col gap-4 px-5">
            <div>
              <h3 className="text-base font-semibold">{release.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                <RichText text={release.summary} />
              </p>
            </div>

            <ul aria-label={`Tags for version ${release.version}`} className="flex flex-wrap gap-1.5">
              {release.tags.map((tag) => (
                <li key={tag}>
                  <TagBadge tag={tag} />
                </li>
              ))}
            </ul>

            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm marker:text-muted-foreground">
              {release.changes.map((change) => (
                <li key={change} className="pl-1">
                  <RichText text={change} />
                </li>
              ))}
            </ul>

            {release.snippet && (
              <CodeSnippet snippet={release.snippet} version={release.version} />
            )}
          </CardContent>
        </Card>
      </article>
    </li>
  );
}

export default function ChangelogPage() {
  const [query, setQuery] = React.useState("");
  const [activeTag, setActiveTag] = React.useState<Tag | "all">("all");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return RELEASES.filter((r) => {
      if (activeTag !== "all" && !r.tags.includes(activeTag)) return false;
      if (!q) return true;
      const haystack = [r.version, r.title, r.summary, ...r.changes].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [query, activeTag]);

  const installCommand = "npm install @acme/sdk@latest";
  const [installCopied, setInstallCopied] = React.useState(false);

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(installCommand);
      setInstallCopied(true);
      toast.success("Copied to clipboard", { description: installCommand });
      setTimeout(() => setInstallCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy", {
        description: "Select the command and copy it manually.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#changelog"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to changelog
      </a>

      <header className="border-b bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <Badge variant="secondary" className="mb-4">
            Acme SDK
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Changelog
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground text-pretty">
            New features, improvements and fixes for the Acme SDK. Subscribe to releases on your
            package registry to be notified of every update.
          </p>

          <div className="mt-6 flex max-w-md items-center gap-2 rounded-lg border bg-background py-1.5 pr-1.5 pl-3">
            <span aria-hidden="true" className="font-mono text-sm text-muted-foreground">
              $
            </span>
            <code className="min-w-0 flex-1 truncate font-mono text-sm">{installCommand}</code>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={copyInstall}
              aria-label="Copy install command"
              className="h-7 gap-1.5 px-2 text-xs"
            >
              {installCopied ? (
                <Check aria-hidden="true" className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy aria-hidden="true" />
              )}
              {installCopied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      </header>

      <main id="changelog" className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <section aria-label="Filter releases" className="mb-10 flex flex-col gap-4">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search versions and changes…"
              aria-label="Search releases"
              className="pl-9"
            />
          </div>

          <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              spacing={2}
              value={activeTag}
              onValueChange={(v) => setActiveTag(v ? (v as Tag | "all") : "all")}
              aria-label="Filter by tag"
            >
              <ToggleGroupItem value="all" aria-label="Show all releases">
                All
              </ToggleGroupItem>
              {ALL_TAGS.map((tag) => (
                <ToggleGroupItem key={tag} value={tag} aria-label={`Show ${TAG_META[tag].label} releases`}>
                  {TAG_META[tag].label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
            Showing {filtered.length} of {RELEASES.length} releases
          </p>
        </section>

        {filtered.length > 0 ? (
          <div className="relative">
            {/* Vertical timeline line */}
            <div
              aria-hidden="true"
              className="absolute top-2 bottom-2 left-[9px] w-px bg-border sm:left-[11px]"
            />
            <ol className="flex flex-col gap-10">
              {filtered.map((release) => (
                <ReleaseEntry key={release.version} release={release} />
              ))}
            </ol>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="font-medium">No releases match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search term or clear the tag filter.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setQuery("");
                setActiveTag("all");
              }}
            >
              Reset filters
            </Button>
          </div>
        )}
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-3xl px-4 py-6 text-sm text-muted-foreground sm:px-6">
          Older releases are available in the repository's release archive.
        </div>
      </footer>
    </div>
  );
}
```