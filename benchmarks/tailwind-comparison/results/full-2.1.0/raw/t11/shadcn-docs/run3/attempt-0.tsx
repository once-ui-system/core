"use client";

import { useMemo, useState } from "react";
import {
  Bug,
  Check,
  Copy,
  Rocket,
  Search,
  ShieldAlert,
  Sparkles,
  Wrench,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Tag = "feature" | "improvement" | "fix" | "security" | "breaking";

type Snippet = {
  label: string;
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
  latest?: boolean;
  tags: Tag[];
  changes: Change[];
  snippet?: Snippet;
};

const TAG_META: Record<
  Tag,
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
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
  security: {
    label: "Security",
    icon: ShieldAlert,
    className:
      "border-violet-600/30 bg-violet-50 text-violet-800 dark:border-violet-400/30 dark:bg-violet-950/50 dark:text-violet-300",
  },
  breaking: {
    label: "Breaking",
    icon: AlertTriangle,
    className:
      "border-red-600/30 bg-red-50 text-red-800 dark:border-red-400/30 dark:bg-red-950/50 dark:text-red-300",
  },
};

const ALL_TAGS: Tag[] = ["feature", "improvement", "fix", "security", "breaking"];

const RELEASES: Release[] = [
  {
    version: "3.2.0",
    date: "2025-06-10",
    title: "Streaming queries and a faster client",
    summary:
      "Large result sets can now be consumed as an async stream, and the client bundle is 38% smaller thanks to a rewritten transport layer.",
    latest: true,
    tags: ["feature", "improvement"],
    changes: [
      {
        tag: "feature",
        text: "Added `client.stream()` for consuming large result sets as an async iterator without buffering.",
      },
      {
        tag: "feature",
        text: "New `onRetry` hook lets you observe and cancel automatic retries.",
      },
      {
        tag: "improvement",
        text: "Rewrote the transport layer; gzipped bundle size dropped from 21.4 kB to 13.2 kB.",
      },
      {
        tag: "improvement",
        text: "Error messages now include the request ID and the failing endpoint.",
      },
    ],
    snippet: {
      label: "Stream a large query",
      language: "ts",
      code: `import { createClient } from "@acme/sdk";

const client = createClient({ apiKey: process.env.ACME_API_KEY! });

for await (const row of client.stream("SELECT * FROM events")) {
  console.log(row.id, row.createdAt);
}`,
    },
  },
  {
    version: "3.1.2",
    date: "2025-05-27",
    title: "Patch: pagination and timezone fixes",
    summary:
      "Fixes two regressions reported after 3.1.0 and closes a low-severity token leak in debug logs.",
    tags: ["fix", "security"],
    changes: [
      {
        tag: "fix",
        text: "Cursor pagination no longer skips the last item when the page size equals the total count.",
      },
      {
        tag: "fix",
        text: "Date filters now respect the `timeZone` option instead of defaulting to UTC.",
      },
      {
        tag: "security",
        text: "Authorization headers are redacted from debug logs (CVE-2025-31842).",
      },
    ],
    snippet: {
      label: "Upgrade to the patched version",
      language: "bash",
      code: "npm install @acme/sdk@3.1.2",
    },
  },
  {
    version: "3.1.0",
    date: "2025-05-06",
    title: "Typed webhooks and edge runtime support",
    summary:
      "Webhook payloads are now fully typed, and the SDK runs on edge runtimes with no polyfills.",
    tags: ["feature", "improvement"],
    changes: [
      {
        tag: "feature",
        text: "Added `verifyWebhook()` with typed event payloads and constant-time signature checks.",
      },
      {
        tag: "feature",
        text: "First-class support for Vercel Edge and Cloudflare Workers runtimes.",
      },
      {
        tag: "improvement",
        text: "Reduced cold-start time by lazy-loading the retry and batching modules.",
      },
    ],
    snippet: {
      label: "Verify a webhook",
      language: "ts",
      code: `import { verifyWebhook } from "@acme/sdk/webhooks";

export async function POST(req: Request) {
  const event = await verifyWebhook(req, process.env.ACME_WEBHOOK_SECRET!);

  if (event.type === "invoice.paid") {
    await markPaid(event.data.invoiceId);
  }
  return new Response("ok");
}`,
    },
  },
  {
    version: "3.0.0",
    date: "2025-03-18",
    title: "Version 3: ESM only, new configuration",
    summary:
      "A major release that drops CommonJS and Node 16, and consolidates configuration into a single `createClient` call.",
    tags: ["breaking", "feature", "improvement"],
    changes: [
      {
        tag: "breaking",
        text: "Dropped CommonJS builds and Node 16 support. The minimum supported version is Node 18.17.",
      },
      {
        tag: "breaking",
        text: "Replaced `new Acme(options)` with `createClient(options)`. The class export has been removed.",
      },
      {
        tag: "feature",
        text: "Built-in request batching with configurable window and max batch size.",
      },
      {
        tag: "improvement",
        text: "Full TypeScript inference for query results based on your schema file.",
      },
    ],
    snippet: {
      label: "Migrate from v2",
      language: "diff",
      code: `- import Acme from "@acme/sdk";
- const client = new Acme({ apiKey });
+ import { createClient } from "@acme/sdk";
+ const client = createClient({ apiKey });`,
    },
  },
  {
    version: "2.9.4",
    date: "2025-01-29",
    title: "Reliability fixes",
    summary: "A small round of fixes for connection handling under flaky networks.",
    tags: ["fix"],
    changes: [
      {
        tag: "fix",
        text: "Idle keep-alive sockets are now closed correctly, resolving rare `ECONNRESET` errors.",
      },
      {
        tag: "fix",
        text: "Exponential backoff now applies jitter so concurrent clients no longer retry in lockstep.",
      },
    ],
  },
];

function formatDate(iso: string): string {
  // Fixed locale + UTC to avoid server/client hydration mismatches.
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
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

function CodeSnippet({ snippet, id }: { snippet: Snippet; id: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      toast.success("Copied to clipboard", { description: snippet.label });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy to clipboard", {
        description: "Select the code and copy it manually.",
      });
    }
  }

  return (
    <figure className="overflow-hidden rounded-lg border bg-muted/40">
      <figcaption
        id={`${id}-caption`}
        className="flex items-center justify-between gap-2 border-b bg-muted/60 py-1.5 pr-1.5 pl-3"
      >
        <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate font-medium text-foreground">{snippet.label}</span>
          <span aria-hidden="true" className="font-mono uppercase">
            {snippet.language}
          </span>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          aria-label={`Copy code: ${snippet.label}`}
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
        aria-labelledby={`${id}-caption`}
        className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <code>{snippet.code}</code>
      </pre>
    </figure>
  );
}

function renderInline(text: string) {
  // Render `code` spans inside change descriptions.
  return text.split(/(`[^`]+`)/g).map((part, i) =>
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
  );
}

export default function ChangelogPage() {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<Tag[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RELEASES.filter((r) => {
      const matchesTag =
        activeTags.length === 0 || r.tags.some((t) => activeTags.includes(t));
      if (!matchesTag) return false;
      if (!q) return true;
      const haystack = [
        r.version,
        r.title,
        r.summary,
        ...r.changes.map((c) => c.text),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, activeTags]);

  function toggleTag(tag: Tag) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  const hasFilters = query.trim() !== "" || activeTags.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#releases"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:absolute focus:top-3 focus:left-3"
      >
        Skip to releases
      </a>

      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <header className="mb-10 sm:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Rocket aria-hidden="true" className="size-3.5" />
            @acme/sdk
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Changelog
          </h1>
          <p className="mt-3 max-w-prose text-base text-muted-foreground text-pretty">
            New features, improvements and fixes for the Acme SDK. Subscribe to the
            release feed or pin a version to keep upgrades predictable.
          </p>
        </header>

        <section aria-label="Filter releases" className="mb-10 space-y-4">
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

          <div
            role="group"
            aria-label="Filter by tag"
            className="flex flex-wrap items-center gap-2"
          >
            {ALL_TAGS.map((tag) => {
              const meta = TAG_META[tag];
              const Icon = meta.icon;
              const pressed = activeTags.includes(tag);
              return (
                <Button
                  key={tag}
                  type="button"
                  size="sm"
                  variant={pressed ? "default" : "outline"}
                  aria-pressed={pressed}
                  onClick={() => toggleTag(tag)}
                  className="rounded-full"
                >
                  <Icon aria-hidden="true" />
                  {meta.label}
                </Button>
              );
            })}
            {hasFilters && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setQuery("");
                  setActiveTags([]);
                }}
              >
                <X aria-hidden="true" />
                Clear
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
            Showing {filtered.length} of {RELEASES.length} releases
          </p>
        </section>

        <section id="releases" aria-label="Releases" tabIndex={-1} className="outline-none">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <p className="font-medium">No releases match your filters</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search term or clear the selected tags.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setQuery("");
                  setActiveTags([]);
                }}
              >
                Reset filters
              </Button>
            </div>
          ) : (
            <ol className="relative">
              {filtered.map((release, index) => {
                const id = `release-${release.version.replaceAll(".", "-")}`;
                const isLast = index === filtered.length - 1;
                return (
                  <li key={release.version} className="relative pb-12 pl-8 last:pb-0 sm:pl-10">
                    {/* timeline rail */}
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className="absolute top-3 bottom-0 left-[7px] w-px bg-border sm:left-[9px]"
                      />
                    )}
                    {/* timeline node */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute top-1.5 left-0 size-[15px] rounded-full border-2 bg-background sm:size-[19px]",
                        release.latest
                          ? "border-primary ring-4 ring-primary/15"
                          : "border-muted-foreground/40",
                      )}
                    />

                    <article aria-labelledby={`${id}-title`}>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <h2
                          id={`${id}-title`}
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

                      <p className="mt-2 text-lg font-medium text-balance">
                        {release.title}
                      </p>

                      <ul
                        aria-label={`Tags for version ${release.version}`}
                        className="mt-3 flex flex-wrap gap-1.5"
                      >
                        {release.tags.map((tag) => (
                          <li key={tag}>
                            <TagBadge tag={tag} />
                          </li>
                        ))}
                      </ul>

                      <p className="mt-4 text-muted-foreground text-pretty">
                        {release.summary}
                      </p>

                      <Separator className="my-5" />

                      <ul className="space-y-3">
                        {release.changes.map((change, i) => {
                          const meta = TAG_META[change.tag];
                          const Icon = meta.icon;
                          return (
                            <li key={i} className="flex gap-3 text-sm leading-relaxed">
                              <span
                                className={cn(
                                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border",
                                  meta.className,
                                )}
                              >
                                <Icon aria-hidden="true" className="size-3" />
                                <span className="sr-only">{meta.label}:</span>
                              </span>
                              <span className="min-w-0 break-words">
                                {renderInline(change.text)}
                              </span>
                            </li>
                          );
                        })}
                      </ul>

                      {release.snippet && (
                        <div className="mt-5">
                          <CodeSnippet snippet={release.snippet} id={id} />
                        </div>
                      )}
                    </article>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <footer className="mt-16 border-t pt-6 text-sm text-muted-foreground">
          Looking for older releases? Versions before 2.9 are listed in the archived
          v2 documentation.
        </footer>
      </main>
    </div>
  );
}
