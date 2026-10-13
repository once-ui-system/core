"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bug,
  Check,
  Copy,
  Package,
  Rocket,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type Tag = "Feature" | "Fix" | "Performance" | "Security" | "Breaking";

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
};

const ALL_TAGS: Tag[] = ["Feature", "Fix", "Performance", "Security", "Breaking"];

const TAG_STYLES: Record<Tag, string> = {
  Feature:
    "border-transparent bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200",
  Fix: "border-transparent bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200",
  Performance:
    "border-transparent bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
  Security:
    "border-transparent bg-violet-100 text-violet-900 dark:bg-violet-500/20 dark:text-violet-200",
  Breaking:
    "border-transparent bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-200",
};

const TAG_ICONS: Record<Tag, React.ComponentType<{ className?: string }>> = {
  Feature: Sparkles,
  Fix: Bug,
  Performance: Zap,
  Security: ShieldCheck,
  Breaking: AlertTriangle,
};

const RELEASES: Release[] = [
  {
    version: "3.0.0",
    date: "2025-06-10",
    title: "Streaming pipelines and a new client",
    summary:
      "Harbor 3 rebuilds the client around async iterators and ships first-class streaming for long-running jobs.",
    tags: ["Feature", "Breaking"],
    changes: [
      "New `client.jobs.stream()` returns an async iterator of progress events.",
      "The client now uses native `fetch`; the `axios` peer dependency is removed.",
      "Dropped support for Node 16 and 18. Node 20 or newer is required.",
      "`createClient({ token })` replaces the old `new Harbor(token)` constructor.",
    ],
    snippet: {
      label: "Upgrade and stream a job",
      language: "ts",
      code: `import { createClient } from "@harbor/sdk";

const client = createClient({ token: process.env.HARBOR_TOKEN! });

const job = await client.jobs.create({ pipeline: "nightly-export" });

for await (const event of client.jobs.stream(job.id)) {
  console.log(event.status, event.progress);
}`,
    },
  },
  {
    version: "2.8.3",
    date: "2025-05-22",
    title: "Webhook signature hardening",
    summary:
      "A security-focused patch that tightens webhook verification and fixes two retry edge cases.",
    tags: ["Security", "Fix"],
    changes: [
      "Webhook signatures are now compared in constant time.",
      "Reject webhook payloads with timestamps older than five minutes.",
      "Fixed a retry loop that could fire twice after a 429 response.",
      "Fixed incorrect `nextCursor` value on empty result pages.",
    ],
    snippet: {
      label: "Verify a webhook",
      language: "ts",
      code: `import { verifyWebhook } from "@harbor/sdk/webhooks";

export async function POST(req: Request) {
  const body = await req.text();
  const event = verifyWebhook(body, req.headers.get("harbor-signature"), {
    secret: process.env.HARBOR_WEBHOOK_SECRET!,
    toleranceSeconds: 300,
  });
  return Response.json({ received: event.type });
}`,
    },
  },
  {
    version: "2.8.0",
    date: "2025-04-29",
    title: "Faster list endpoints",
    summary:
      "Pagination got a big speed-up and the SDK now batches concurrent reads automatically.",
    tags: ["Performance", "Feature"],
    changes: [
      "List endpoints are up to 3x faster thanks to keyset pagination.",
      "Concurrent `get()` calls in the same tick are batched into one request.",
      "Added `client.projects.listAll()` helper that handles cursors for you.",
    ],
    snippet: {
      label: "Iterate every project",
      language: "ts",
      code: `for await (const project of client.projects.listAll({ pageSize: 100 })) {
  console.log(project.id, project.name);
}`,
    },
  },
  {
    version: "2.7.2",
    date: "2025-04-04",
    title: "Timezone and retry fixes",
    summary: "Small but important corrections reported by the community.",
    tags: ["Fix"],
    changes: [
      "Scheduled jobs now respect the project timezone across DST changes.",
      "`retry.backoff` accepts fractional seconds again.",
      "Corrected TypeScript types for `Job['finishedAt']` (now `string | null`).",
    ],
  },
  {
    version: "2.7.0",
    date: "2025-03-11",
    title: "Environments and CLI improvements",
    summary:
      "Manage staging and production side by side and script everything from the command line.",
    tags: ["Feature"],
    changes: [
      "Introduced named environments with per-environment secrets.",
      "New `harbor env pull` command writes a `.env.local` file for you.",
      "The CLI prints colored diffs when a pipeline definition changes.",
      "Added `--json` output to every CLI command.",
    ],
    snippet: {
      label: "Pull environment variables",
      language: "bash",
      code: `npm install -g @harbor/cli@2.7
harbor login
harbor env pull --environment staging --out .env.local`,
    },
  },
  {
    version: "2.6.1",
    date: "2025-02-18",
    title: "Memory usage reduction",
    summary: "Long-lived workers now use significantly less memory.",
    tags: ["Performance", "Fix"],
    changes: [
      "Fixed a listener leak in the event stream that grew memory over days.",
      "Reduced baseline worker memory by roughly 40%.",
      "Upgraded the bundled JSON parser for faster large payload handling.",
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

function CodeSnippet({ snippet, id }: { snippet: Snippet; id: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      toast.success("Copied to clipboard", { description: snippet.label });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy", {
        description: "Select the code and copy it manually.",
      });
    }
  }

  return (
    <figure className="mt-4 overflow-hidden rounded-lg border bg-muted/40">
      <figcaption className="flex items-center justify-between gap-2 border-b bg-muted/60 py-1.5 pr-1.5 pl-3">
        <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide">
            {snippet.language}
          </span>
          <span className="truncate" id={`${id}-label`}>
            {snippet.label}
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
            <Check className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          ) : (
            <Copy aria-hidden="true" />
          )}
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </figcaption>
      <pre
        className="overflow-x-auto p-4 text-xs leading-relaxed sm:text-[13px]"
        tabIndex={0}
        aria-labelledby={`${id}-label`}
      >
        <code className="font-mono">{snippet.code}</code>
      </pre>
    </figure>
  );
}

function TagBadge({ tag }: { tag: Tag }) {
  const Icon = TAG_ICONS[tag];
  return (
    <Badge className={cn(TAG_STYLES[tag])}>
      <Icon aria-hidden="true" />
      {tag}
    </Badge>
  );
}

export default function ChangelogPage() {
  const [filter, setFilter] = useState<Tag[]>([]);

  const visible = useMemo(
    () =>
      filter.length === 0
        ? RELEASES
        : RELEASES.filter((r) => r.tags.some((t) => filter.includes(t))),
    [filter],
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <header className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Package className="size-3.5" aria-hidden="true" />
            @harbor/sdk
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Changelog
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-muted-foreground">
            Every release of the Harbor SDK, newest first. Filter by tag to find
            new features, fixes, or anything that might break your build.
          </p>
        </header>

        <section aria-labelledby="filter-heading" className="mb-10">
          <h2
            id="filter-heading"
            className="mb-3 text-sm font-medium text-muted-foreground"
          >
            Filter by tag
          </h2>
          <ToggleGroup
            type="multiple"
            variant="outline"
            size="sm"
            spacing={2}
            value={filter}
            onValueChange={(v) => setFilter(v as Tag[])}
            aria-label="Filter releases by tag"
            className="flex-wrap"
          >
            {ALL_TAGS.map((tag) => {
              const Icon = TAG_ICONS[tag];
              return (
                <ToggleGroupItem
                  key={tag}
                  value={tag}
                  aria-label={`Show ${tag} releases`}
                  className="gap-1.5"
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {tag}
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
          <div className="mt-3 flex min-h-8 items-center gap-3 text-sm text-muted-foreground">
            <p role="status">
              Showing {visible.length} of {RELEASES.length} releases
            </p>
            {filter.length > 0 && (
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setFilter([])}
              >
                Clear filters
              </Button>
            )}
          </div>
        </section>

        {visible.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            No releases match the selected tags.
          </div>
        ) : (
          <ol className="relative space-y-10 border-l border-border pl-6 sm:pl-8">
            {visible.map((release, index) => {
              const isLatest = release.version === RELEASES[0].version;
              const id = `release-${release.version.replace(/\./g, "-")}`;
              return (
                <li key={release.version} className="relative">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-1 -left-[calc(1.5rem+5px)] flex size-2.5 items-center justify-center rounded-full ring-4 ring-background sm:-left-[calc(2rem+5px)]",
                      index === 0 ? "bg-primary" : "bg-muted-foreground/50",
                    )}
                  />
                  <article aria-labelledby={`${id}-title`}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2 py-0.5 font-mono text-sm font-semibold text-primary-foreground">
                        v{release.version}
                      </span>
                      {isLatest && (
                        <Badge variant="outline">
                          <Rocket aria-hidden="true" />
                          Latest
                        </Badge>
                      )}
                      <time
                        dateTime={release.date}
                        className="text-sm text-muted-foreground"
                      >
                        {formatDate(release.date)}
                      </time>
                    </div>

                    <h3
                      id={`${id}-title`}
                      className="mt-3 text-xl font-semibold tracking-tight text-balance"
                    >
                      {release.title}
                    </h3>
                    <p className="mt-1.5 text-pretty text-muted-foreground">
                      {release.summary}
                    </p>

                    <ul
                      className="mt-3 flex flex-wrap gap-2"
                      aria-label={`Tags for version ${release.version}`}
                    >
                      {release.tags.map((tag) => (
                        <li key={tag}>
                          <TagBadge tag={tag} />
                        </li>
                      ))}
                    </ul>

                    <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm marker:text-muted-foreground">
                      {release.changes.map((change) => (
                        <li key={change} className="text-pretty">
                          {change}
                        </li>
                      ))}
                    </ul>

                    {release.snippet && (
                      <CodeSnippet snippet={release.snippet} id={id} />
                    )}
                  </article>
                </li>
              );
            })}
          </ol>
        )}

        <footer className="mt-16 border-t pt-6 text-sm text-muted-foreground">
          Looking for older versions? Releases before 2.6 are archived in the
          legacy documentation.
        </footer>
      </main>
    </div>
  );
}
