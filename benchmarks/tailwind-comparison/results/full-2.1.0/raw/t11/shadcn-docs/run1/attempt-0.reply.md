I have what I need. I'll build a timeline with a tag filter (toggle group), a version jump nav, and copyable code blocks with a clipboard fallback.

```tsx
"use client";

import * as React from "react";
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
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type Tag = "feature" | "improvement" | "fix" | "security" | "breaking";

type Snippet = {
  title: string;
  language: string;
  code: string;
};

type Change = {
  tag: Tag;
  text: string;
};

type Release = {
  version: string;
  date: string; // ISO date
  title: string;
  summary: string;
  tags: Tag[];
  latest?: boolean;
  changes: Change[];
  snippets?: Snippet[];
};

const TAG_META: Record<
  Tag,
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  feature: {
    label: "Feature",
    icon: Sparkles,
    className:
      "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900",
  },
  improvement: {
    label: "Improvement",
    icon: Zap,
    className:
      "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900",
  },
  fix: {
    label: "Fix",
    icon: Bug,
    className:
      "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900",
  },
  security: {
    label: "Security",
    icon: ShieldAlert,
    className:
      "bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-900",
  },
  breaking: {
    label: "Breaking",
    icon: TriangleAlert,
    className:
      "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900",
  },
};

const TAG_ORDER: Tag[] = ["feature", "improvement", "fix", "security", "breaking"];

const RELEASES: Release[] = [
  {
    version: "3.2.0",
    date: "2025-06-10",
    title: "Streaming exports and scoped API tokens",
    summary:
      "Export millions of rows without timeouts, and give each integration only the access it needs.",
    tags: ["feature", "improvement", "fix"],
    latest: true,
    changes: [
      {
        tag: "feature",
        text: "Streaming CSV and NDJSON exports with resumable downloads for datasets up to 50 million rows.",
      },
      {
        tag: "feature",
        text: "Scoped API tokens: restrict a token to specific projects and read-only or read-write access.",
      },
      {
        tag: "improvement",
        text: "Dashboard charts render up to 3x faster on workspaces with more than 200 saved views.",
      },
      {
        tag: "fix",
        text: "Webhook retries no longer fire twice when the first attempt times out at exactly 10 seconds.",
      },
    ],
    snippets: [
      {
        title: "Create a scoped token",
        language: "bash",
        code: `curl -X POST https://api.example.com/v3/tokens \\
  -H "Authorization: Bearer $ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "reporting-service",
    "scopes": ["projects:read", "exports:write"],
    "projects": ["prj_8fd21a"]
  }'`,
      },
      {
        title: "Stream an export",
        language: "ts",
        code: `import { createClient } from "@acme/sdk";

const acme = createClient({ token: process.env.ACME_TOKEN! });

for await (const row of acme.exports.stream("orders", { format: "ndjson" })) {
  console.log(row.id, row.total);
}`,
      },
    ],
  },
  {
    version: "3.1.2",
    date: "2025-05-22",
    title: "Security patch for invitation links",
    summary: "A recommended update for all self-hosted installations.",
    tags: ["security", "fix"],
    changes: [
      {
        tag: "security",
        text: "Invitation links now expire after 72 hours and are invalidated once accepted.",
      },
      {
        tag: "security",
        text: "Rate limit added to the password reset endpoint (5 requests per minute per IP).",
      },
      {
        tag: "fix",
        text: "Fixed a crash when importing workspaces whose names contain emoji.",
      },
    ],
    snippets: [
      {
        title: "Upgrade a self-hosted install",
        language: "bash",
        code: `docker pull acme/server:3.1.2
docker compose up -d --no-deps server`,
      },
    ],
  },
  {
    version: "3.1.0",
    date: "2025-04-29",
    title: "Saved filters and keyboard shortcuts",
    summary: "Faster navigation for power users, plus smarter defaults for new teams.",
    tags: ["feature", "improvement"],
    changes: [
      {
        tag: "feature",
        text: "Saved filters can be shared with your team and pinned to the sidebar.",
      },
      {
        tag: "feature",
        text: "Press ? anywhere to open the new keyboard shortcut reference.",
      },
      {
        tag: "improvement",
        text: "Search now matches partial words and ignores diacritics, so \"cafe\" finds \"café\".",
      },
      {
        tag: "improvement",
        text: "Empty states include links to the most relevant guide instead of a generic message.",
      },
    ],
  },
  {
    version: "3.0.0",
    date: "2025-03-18",
    title: "The v3 platform",
    summary:
      "A new data model, a rewritten SDK, and a cleaner API. Read the migration notes before upgrading.",
    tags: ["feature", "breaking", "improvement"],
    changes: [
      {
        tag: "breaking",
        text: "The /v2 REST endpoints are removed. Use /v3, which returns cursor-based pagination.",
      },
      {
        tag: "breaking",
        text: "SDK initialization now takes a single options object instead of positional arguments.",
      },
      {
        tag: "feature",
        text: "Workspaces can contain multiple projects, each with its own members and billing tags.",
      },
      {
        tag: "improvement",
        text: "Cold start time for the CLI dropped from 1.8s to 0.4s.",
      },
    ],
    snippets: [
      {
        title: "Migrate SDK initialization",
        language: "diff",
        code: `- const acme = new Acme("sk_live_123", "eu-west");
+ const acme = createClient({
+   token: process.env.ACME_TOKEN!,
+   region: "eu-west",
+ });`,
      },
      {
        title: "Cursor-based pagination",
        language: "ts",
        code: `let cursor: string | undefined;

do {
  const page = await acme.orders.list({ limit: 100, cursor });
  process(page.items);
  cursor = page.nextCursor;
} while (cursor);`,
      },
    ],
  },
  {
    version: "2.9.4",
    date: "2025-02-06",
    title: "Reliability fixes",
    summary: "Small but important fixes collected from support tickets.",
    tags: ["fix"],
    changes: [
      {
        tag: "fix",
        text: "Scheduled reports respect the workspace time zone across daylight saving changes.",
      },
      {
        tag: "fix",
        text: "Avatar uploads larger than 4 MB now show a clear error instead of failing silently.",
      },
      {
        tag: "fix",
        text: "Resolved a rare deadlock when two members reordered the same board at once.",
      },
    ],
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

function versionId(version: string): string {
  return `v${version.replace(/\./g, "-")}`;
}

async function writeToClipboard(text: string): Promise<boolean> {
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

function CodeSnippet({ snippet }: { snippet: Snippet }) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleCopy = async () => {
    const ok = await writeToClipboard(snippet.code);
    if (ok) {
      setCopied(true);
      toast.success("Copied to clipboard", { description: snippet.title });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Couldn't copy", {
        description: "Select the snippet and copy it manually.",
      });
    }
  };

  return (
    <figure className="overflow-hidden rounded-lg border bg-muted/40">
      <figcaption className="flex items-center justify-between gap-2 border-b bg-muted/60 py-1.5 pr-1.5 pl-3">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-xs font-medium">{snippet.title}</span>
          <span className="shrink-0 rounded bg-background px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
            {snippet.language}
          </span>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          aria-label={`Copy snippet: ${snippet.title}`}
          className="h-7 shrink-0 gap-1.5 px-2 text-xs"
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
        className="overflow-x-auto p-3 font-mono text-[13px] leading-relaxed focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <code>{snippet.code}</code>
      </pre>
    </figure>
  );
}

function ReleaseEntry({ release, isLast }: { release: Release; isLast: boolean }) {
  const id = versionId(release.version);
  const headingId = `${id}-heading`;

  return (
    <li className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-4 sm:gap-x-6 md:grid-cols-[9rem_1.5rem_minmax(0,1fr)]">
      {/* Date column (desktop) */}
      <div className="hidden pt-1 text-right md:block">
        <time
          dateTime={release.date}
          className="text-sm font-medium text-muted-foreground"
        >
          {formatDate(release.date)}
        </time>
      </div>

      {/* Rail */}
      <div className="relative flex justify-center" aria-hidden="true">
        {!isLast && (
          <span className="absolute top-3 -bottom-10 w-px bg-border" />
        )}
        <span
          className={cn(
            "relative z-10 mt-1.5 flex size-3 items-center justify-center rounded-full border-2 bg-background",
            release.latest
              ? "border-primary ring-4 ring-primary/15"
              : "border-muted-foreground/50"
          )}
        />
      </div>

      {/* Content */}
      <article
        id={id}
        aria-labelledby={headingId}
        className="min-w-0 scroll-mt-24 pb-12"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2
            id={headingId}
            className="font-mono text-xl font-semibold tracking-tight"
          >
            v{release.version}
          </h2>
          {release.latest && (
            <Badge className="gap-1">
              <Rocket aria-hidden="true" />
              Latest
            </Badge>
          )}
          <time
            dateTime={release.date}
            className="text-sm text-muted-foreground md:hidden"
          >
            {formatDate(release.date)}
          </time>
        </div>

        <p className="mt-1 text-base font-medium">{release.title}</p>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          {release.summary}
        </p>

        <ul
          className="mt-3 flex flex-wrap gap-1.5"
          aria-label={`Tags for version ${release.version}`}
        >
          {release.tags.map((tag) => (
            <li key={tag}>
              <TagBadge tag={tag} />
            </li>
          ))}
        </ul>

        <ul className="mt-5 space-y-3">
          {release.changes.map((change, i) => {
            const meta = TAG_META[change.tag];
            const Icon = meta.icon;
            return (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border",
                    meta.className
                  )}
                >
                  <Icon aria-hidden="true" className="size-3" />
                  <span className="sr-only">{meta.label}: </span>
                </span>
                <span className="min-w-0">{change.text}</span>
              </li>
            );
          })}
        </ul>

        {release.snippets && release.snippets.length > 0 && (
          <div className="mt-6 space-y-4">
            {release.snippets.map((snippet) => (
              <CodeSnippet key={snippet.title} snippet={snippet} />
            ))}
          </div>
        )}
      </article>
    </li>
  );
}

export default function ChangelogPage() {
  const [activeTags, setActiveTags] = React.useState<Tag[]>([]);

  const visibleReleases = React.useMemo(() => {
    if (activeTags.length === 0) return RELEASES;
    return RELEASES.filter((r) => r.tags.some((t) => activeTags.includes(t)));
  }, [activeTags]);

  const tagCounts = React.useMemo(() => {
    const counts = {} as Record<Tag, number>;
    for (const tag of TAG_ORDER) {
      counts[tag] = RELEASES.filter((r) => r.tags.includes(tag)).length;
    }
    return counts;
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#timeline"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to changelog
      </a>

      <header className="border-b bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <Badge variant="secondary" className="mb-4 gap-1">
            <Wrench aria-hidden="true" />
            Acme Platform
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Changelog
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground text-pretty">
            New features, improvements and fixes shipped to Acme. Every release
            is versioned, tagged, and includes code you can copy straight into
            your project.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Latest release:{" "}
            <a
              href={`#${versionId(RELEASES[0].version)}`}
              className="rounded font-mono font-medium text-foreground underline underline-offset-4 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              v{RELEASES[0].version}
            </a>{" "}
            · {formatDate(RELEASES[0].date)}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <section aria-labelledby="filter-heading" className="mb-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="filter-heading" className="text-sm font-medium">
              Filter by tag
            </h2>
            {activeTags.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveTags([])}
                className="self-start sm:self-auto"
              >
                Clear filters
              </Button>
            )}
          </div>

          <ToggleGroup
            type="multiple"
            variant="outline"
            spacing={2}
            value={activeTags}
            onValueChange={(value) => setActiveTags(value as Tag[])}
            aria-label="Filter releases by tag"
            className="mt-3 flex-wrap"
          >
            {TAG_ORDER.map((tag) => {
              const meta = TAG_META[tag];
              const Icon = meta.icon;
              return (
                <ToggleGroupItem
                  key={tag}
                  value={tag}
                  size="sm"
                  aria-label={`${meta.label} (${tagCounts[tag]} releases)`}
                  className="gap-1.5"
                >
                  <Icon aria-hidden="true" className="size-3.5" />
                  {meta.label}
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {tagCounts[tag]}
                  </span>
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>

          <p className="sr-only" role="status" aria-live="polite">
            Showing {visibleReleases.length} of {RELEASES.length} releases
          </p>
        </section>

        <Separator className="mb-10" />

        <div id="timeline" tabIndex={-1} className="outline-none">
          {visibleReleases.length > 0 ? (
            <ol className="list-none">
              {visibleReleases.map((release, i) => (
                <ReleaseEntry
                  key={release.version}
                  release={release}
                  isLast={i === visibleReleases.length - 1}
                />
              ))}
            </ol>
          ) : (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <p className="font-medium">No releases match these tags</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try removing a filter to see more of the changelog.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setActiveTags([])}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          You&apos;ve reached the beginning of the changelog.
        </p>
      </main>
    </div>
  );
}
```