"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bug,
  Check,
  Copy,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type TagKey =
  | "feature"
  | "improvement"
  | "fix"
  | "security"
  | "breaking"
  | "performance";

type TagMeta = {
  label: string;
  icon: LucideIcon;
  className: string;
};

const TAGS: Record<TagKey, TagMeta> = {
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
  security: {
    label: "Security",
    icon: ShieldCheck,
    className:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-900",
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
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-900",
  },
};

type Snippet = {
  title: string;
  language: string;
  code: string;
};

type Release = {
  version: string;
  date: string; // ISO
  title: string;
  summary: string;
  tags: TagKey[];
  changes: string[];
  snippet?: Snippet;
  latest?: boolean;
};

const RELEASES: Release[] = [
  {
    version: "3.2.0",
    date: "2025-06-12",
    title: "Streaming exports and scoped API tokens",
    summary:
      "Large exports no longer need to fit in memory, and tokens can now be limited to the exact resources an integration needs.",
    tags: ["feature", "security", "performance"],
    latest: true,
    changes: [
      "Stream CSV and NDJSON exports directly to disk, with constant memory usage up to 50 GB.",
      "Scoped API tokens: restrict a token to specific projects and read-only or write access.",
      "Audit log entries now include the token ID that performed each action.",
      "Export jobs resume automatically after a transient network failure.",
    ],
    snippet: {
      title: "Create a scoped token",
      language: "bash",
      code: `curl -X POST https://api.example.com/v3/tokens \\
  -H "Authorization: Bearer $ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "ci-readonly",
    "scopes": ["projects:read"],
    "projects": ["prj_8fa21c"],
    "expiresIn": "30d"
  }'`,
    },
  },
  {
    version: "3.1.4",
    date: "2025-05-28",
    title: "Webhook delivery reliability",
    summary:
      "A round of fixes for edge cases where webhook deliveries were duplicated or silently dropped.",
    tags: ["fix"],
    changes: [
      "Fixed duplicate webhook deliveries when a retry overlapped with a slow first attempt.",
      "Fixed a race condition that dropped events emitted in the same millisecond.",
      "The dashboard now shows the last response body for failed deliveries.",
    ],
  },
  {
    version: "3.1.0",
    date: "2025-05-06",
    title: "TypeScript SDK with typed events",
    summary:
      "The SDK now ships generated types for every event payload, so handlers are checked at compile time.",
    tags: ["feature", "improvement"],
    changes: [
      "New generated types for all 42 event payloads, updated on every API release.",
      "Client methods accept an optional AbortSignal for cancellation.",
      "Reduced the SDK bundle size from 38 kB to 21 kB gzipped by removing the polyfill layer.",
    ],
    snippet: {
      title: "Handle a typed event",
      language: "ts",
      code: `import { createClient } from "@example/sdk";

const client = createClient({ token: process.env.EXAMPLE_TOKEN! });

client.on("invoice.paid", (event) => {
  // event.data is fully typed: Invoice
  console.log(event.data.id, event.data.amountPaid);
});`,
    },
  },
  {
    version: "3.0.0",
    date: "2025-04-15",
    title: "API v3 is generally available",
    summary:
      "A cleaner, more consistent API surface. Version 2 endpoints remain available until December 31, 2025.",
    tags: ["breaking", "feature", "improvement"],
    changes: [
      "Cursor-based pagination replaces page numbers on every list endpoint.",
      "Timestamps are always returned as ISO 8601 strings in UTC.",
      "Error responses follow RFC 9457 problem details with stable error codes.",
      "Removed the deprecated `/v2/search` endpoint. Use `/v3/query` instead.",
    ],
    snippet: {
      title: "Migrate to cursor pagination",
      language: "ts",
      code: `// Before (v2)
const page = await api.get("/v2/projects", { params: { page: 3 } });

// After (v3)
let cursor: string | undefined;
do {
  const res = await api.get("/v3/projects", { params: { cursor, limit: 50 } });
  handle(res.data);
  cursor = res.nextCursor;
} while (cursor);`,
    },
  },
  {
    version: "2.9.2",
    date: "2025-03-20",
    title: "Security hardening",
    summary:
      "Recommended update for all self-hosted installations. No action is required for cloud customers.",
    tags: ["security", "fix"],
    changes: [
      "Rotated signing keys are now invalidated immediately instead of after the cache TTL.",
      "Fixed an open redirect in the OAuth callback when the state parameter was malformed.",
      "Upgraded the bundled image processor to address two upstream CVEs.",
    ],
  },
  {
    version: "2.9.0",
    date: "2025-02-24",
    title: "Faster search and saved views",
    summary:
      "Search got a new index that makes common queries noticeably quicker, and teams can share filtered views.",
    tags: ["performance", "feature"],
    changes: [
      "Median search latency dropped from 340 ms to 85 ms on workspaces with over 1M records.",
      "Saved views can be shared with a link or pinned to the sidebar for the whole team.",
      "Keyboard shortcut ⌘K now opens the command palette from any page.",
    ],
    snippet: {
      title: "Enable the new search index",
      language: "yaml",
      code: `# config/search.yaml
search:
  engine: v2
  reindex_on_start: true
  shards: 4`,
    },
  },
];

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
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

function CodeSnippet({ snippet }: { snippet: Snippet }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      toast.success("Copied to clipboard", { description: snippet.title });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy", {
        description: "Select the code and copy it manually.",
      });
    }
  }

  return (
    <figure className="overflow-hidden rounded-lg border bg-muted/40">
      <figcaption className="flex items-center justify-between gap-2 border-b bg-muted/60 py-1.5 pr-1.5 pl-3">
        <span className="flex min-w-0 items-center gap-2 text-xs">
          <span className="truncate font-medium">{snippet.title}</span>
          <span className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
            {snippet.language}
          </span>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          aria-label={`Copy code: ${snippet.title}`}
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
        className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label={`${snippet.title} (${snippet.language})`}
      >
        <code>{snippet.code}</code>
      </pre>
    </figure>
  );
}

function ReleaseEntry({ release }: { release: Release }) {
  const headingId = `release-${release.version}`;
  return (
    <li className="relative pl-8 sm:pl-10">
      {/* Timeline node */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1.5 left-0 flex size-6 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-background",
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
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
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
          <h3 className="text-lg leading-snug font-medium">{release.title}</h3>
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

        <p className="mt-4 text-muted-foreground">{release.summary}</p>

        <ul className="mt-4 flex flex-col gap-2 text-sm leading-relaxed">
          {release.changes.map((change) => (
            <li key={change} className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/60"
              />
              <span>{change}</span>
            </li>
          ))}
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

type Filter = "all" | TagKey;

export default function ChangelogPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(
    () =>
      filter === "all"
        ? RELEASES
        : RELEASES.filter((r) => r.tags.includes(filter)),
    [filter],
  );

  const filterOptions: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    ...(Object.keys(TAGS) as TagKey[]).map((key) => ({
      value: key as Filter,
      label: TAGS[key].label,
    })),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <header className="flex flex-col gap-4">
          <Badge variant="secondary" className="w-fit">
            <Rocket aria-hidden="true" />
            Product updates
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Changelog
          </h1>
          <p className="max-w-xl text-muted-foreground text-pretty">
            New features, improvements and fixes for the Example platform and
            SDK. Every release is versioned, tagged and dated, with snippets you
            can copy straight into your project.
          </p>
        </header>

        <Separator className="my-8" />

        <section aria-labelledby="filter-label" className="mb-10">
          <p id="filter-label" className="mb-3 text-sm font-medium">
            Filter by tag
          </p>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            spacing={2}
            value={filter}
            onValueChange={(value) => {
              // Radix emits "" when the active item is clicked again; keep a selection.
              if (value) setFilter(value as Filter);
            }}
            aria-labelledby="filter-label"
            className="flex-wrap"
          >
            {filterOptions.map((opt) => (
              <ToggleGroupItem key={opt.value} value={opt.value}>
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="sr-only" role="status" aria-live="polite">
            Showing {visible.length} of {RELEASES.length} releases
          </p>
        </section>

        {visible.length > 0 ? (
          <ol className="relative ml-3 border-l-2 border-border sm:ml-4">
            {visible.map((release) => (
              <ReleaseEntry key={release.version} release={release} />
            ))}
          </ol>
        ) : (
          <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            No releases match this tag.
          </p>
        )}

        <footer className="mt-4 text-center text-sm text-muted-foreground">
          You&apos;ve reached the beginning of the changelog.
        </footer>
      </main>
    </div>
  );
}
